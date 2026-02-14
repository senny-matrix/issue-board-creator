#!/usr/bin/env node
import dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import prompts from "prompts";

dotenv.config();

type Config = {
  github: {
    owner: string;
    repo: string;
    token: string;
  };
  data: {
    epicsDir: string;
    storiesDir: string;
    priorityFile: string;
  };
};

// Check if ./data directory exists
function checkDefaultDataDir(): string | null {
  const defaultDataDir = join(process.cwd(), "data");
  if (existsSync(defaultDataDir)) {
    return defaultDataDir;
  }
  return null;
}

// Load configuration from file
function loadConfigFile(): Config | null {
  const configPaths = [
    join(process.cwd(), ".issue-board-creator.json"),
    join(process.cwd(), ".issue-board-creator.config.json"),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const configContent = readFileSync(configPath, "utf-8");
        return JSON.parse(configContent);
      }
      catch {
        console.warn(`Warning: Could not parse config file ${configPath}`);
      }
    }
  }
  return null;
}

// Get configuration with priority: ./data → env vars → prompts
async function getConfig(): Promise<Config> {
  let config: Partial<Config> = {};

  // 1. Check for default ./data directory
  const defaultDataDir = checkDefaultDataDir();
  if (defaultDataDir) {
    console.log("Found default ./data directory");
    config.data = {
      epicsDir: join(defaultDataDir, "epics"),
      storiesDir: join(defaultDataDir, "stories"),
      priorityFile: join(defaultDataDir, "priority.json"),
    };
  }

  // 2. Check for config file
  const configFile = loadConfigFile();
  if (configFile) {
    console.log("Loaded configuration from .issue-board-creator.json");
    config = { ...config, ...configFile };
  }

  // 3. Check environment variables
  const envOwner = process.env.GITHUB_OWNER;
  const envRepo = process.env.GITHUB_REPO;
  const envToken = process.env.GITHUB_TOKEN;

  if (envOwner || envRepo || envToken) {
    console.log("Using environment variables for GitHub configuration");
    config.github = {
      owner: envOwner || config.github?.owner || "",
      repo: envRepo || config.github?.repo || "",
      token: envToken || config.github?.token || "",
    };
  }

  // 4. Prompt for missing values
  const needGithubConfig = !config.github?.owner || !config.github?.repo || !config.github?.token;
  const needDataConfig = !config.data?.epicsDir || !config.data?.storiesDir || !config.data?.priorityFile;

  if (needGithubConfig || needDataConfig) {
    console.log("\\nPlease provide the following information:");

    if (needGithubConfig) {
      const githubPrompts = await prompts([
        {
          type: "text",
          name: "owner",
          message: "GitHub username/organization:",
          initial: config.github?.owner,
        },
        {
          type: "text",
          name: "repo",
          message: "GitHub repository name:",
          initial: config.github?.repo,
        },
        {
          type: "password",
          name: "token",
          message: "GitHub personal access token (repo + project scopes):",
          initial: config.github?.token,
        },
      ]);

      config.github = {
        owner: githubPrompts.owner || config.github?.owner || "",
        repo: githubPrompts.repo || config.github?.repo || "",
        token: githubPrompts.token || config.github?.token || "",
      };
    }

    if (needDataConfig) {
      const dataPrompts = await prompts([
        {
          type: "text",
          name: "epicsDir",
          message: "Epics directory path:",
          initial: config.data?.epicsDir || "./data/epics",
        },
        {
          type: "text",
          name: "storiesDir",
          message: "Stories directory path:",
          initial: config.data?.storiesDir || "./data/stories",
        },
        {
          type: "text",
          name: "priorityFile",
          message: "Priority file path:",
          initial: config.data?.priorityFile || "./data/priority.json",
        },
      ]);

      config.data = {
        epicsDir: dataPrompts.epicsDir || config.data?.epicsDir || "",
        storiesDir: dataPrompts.storiesDir || config.data?.storiesDir || "",
        priorityFile: dataPrompts.priorityFile || config.data?.priorityFile || "",
      };
    }
  }

  // Validate configuration
  if (!config.github?.owner || !config.github?.repo || !config.github?.token) {
    throw new Error("Missing required GitHub configuration (owner, repo, token)");
  }

  if (!config.data?.epicsDir || !config.data?.storiesDir || !config.data?.priorityFile) {
    throw new Error("Missing required data configuration (epicsDir, storiesDir, priorityFile)");
  }

  return config as Config;
}

// Main CLI function
export async function main() {
  try {
    console.log("🚀 Issue Board Creator\\n");

    const config = await getConfig();

    console.log("\\nConfiguration:");
    console.log(`  GitHub: ${config.github.owner}/${config.github.repo}`);
    console.log(`  Epics: ${config.data.epicsDir}`);
    console.log(`  Stories: ${config.data.storiesDir}`);
    console.log(`  Priority: ${config.data.priorityFile}`);

    // Import and run the main logic with config
    const { createIssues } = await import("./index.js");
    await createIssues(config);

    console.log("\\n✅ Successfully created GitHub issues and project cards!");
  }
  catch (error) {
    console.error("\\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the CLI
main();
