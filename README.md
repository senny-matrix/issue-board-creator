# Issue Board Creator

A general CLI tool to create GitHub labels, issues, and Kanban project cards from markdown files. Perfect for setting up project management boards from user stories and epics.

## Features

- 🎯 Creates GitHub issues from markdown files
- 📊 Supports epic/story hierarchical relationships
- 🏷️ Automatically creates and manages labels
- 🎨 Adds issues to Kanban project boards
- ⚙️ Flexible configuration (config file, env vars, or interactive prompts)
- 🚀 Works with any project format

## Installation

```sh
# Install dependencies
pnpm install
```

## Usage

The tool looks for configuration in this priority order:
1. **Default `./data` directory** - if it exists in current directory
2. **Config file** - `.issue-board-creator.json` or `.issue-board-creator.config.json`
3. **Environment variables** - `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`
4. **Interactive prompts** - asks for missing information

### Quick Start (with default ./data directory)

```sh
# If you have a ./data folder with epics/ and stories/ subdirectories
pnpm cli
```

### Using Configuration File

1. Copy the example config:
```sh
cp .issue-board-creator.json.example .issue-board-creator.json
```

2. Edit `.issue-board-creator.json` with your settings:
```json
{
  "github": {
    "owner": "your-username",
    "repo": "your-repo-name",
    "token": "your-github-token-or-set-in-env"
  },
  "data": {
    "epicsDir": "./data/epics",
    "storiesDir": "./data/stories",
    "priorityFile": "./data/priority.json"
  }
}
```

3. Run the tool:
```sh
pnpm cli
```

### Using Environment Variables

```sh
# Set environment variables
export GITHUB_OWNER="your-username"
export GITHUB_REPO="your-repo-name"
export GITHUB_TOKEN="your-github-token"

# Run the tool
pnpm cli
```

### Interactive Mode

If no configuration is found, the tool will prompt you for:
- GitHub username/organization
- Repository name
- GitHub personal access token
- Paths to epics, stories, and priority files

## Setup Requirements

### GitHub Setup

1. Create a repository on GitHub
2. Add a project to the repository and choose the "Kanban" template
3. Create a GitHub personal access token with "repo" and "project" scopes [here](https://github.com/settings/tokens/new)

### Data Directory Structure

Your project should follow this structure:

```
./data/
├── epics/
│   ├── 001-epic-one.md
│   ├── 002-epic-two.md
│   └── ...
├── stories/
│   ├── 001-001-first-story.md
│   ├── 001-002-second-story.md
│   ├── 002-001-first-story-of-epic-2.md
│   └── ...
└── priority.json
```

### Markdown File Format

**Epic file** (e.g., `001-epic-one.md`):
```markdown
---
title: Epic One
label: epic-one-label
role: user
action: perform an action
benefit: achieve a goal
---

Epic description goes here...
```

**Story file** (e.g., `001-001-first-story.md`):
```markdown
---
title: First Story
label: epic-one-label
role: user
action: do something specific
benefit: get some value
---

Story description goes here...
```

### Priority File

The `priority.json` file defines the order of stories on the board:

```json
[
  "001-001",
  "001-002",
  "002-001",
  "001-003"
]
```

## Scripts

```sh
# Run with CLI prompts
pnpm cli

# Run directly (requires .env file)
pnpm start

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Using for Other Projects

This tool is designed to work with any project. To use it for your projects:

1. Create your data directory with epics and stories as markdown files
2. Create a `priority.json` file to define story order
3. Run the tool from your project directory
4. Configure via config file, environment variables, or interactive prompts

## How It Works

The tool:
1. Reads epic files from the epics directory
2. Creates GitHub issues for each epic with an "Epic" label
3. Reads story files and creates child issues linked to their parent epic
4. Creates labels based on epic categories
5. Adds all issues to your Kanban project board in priority order
6. Maintains epic/story hierarchical relationships

## Development

```sh
# Install dependencies
pnpm install

# Run in development
tsx src/cli.ts
```
