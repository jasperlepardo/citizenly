# Git Workflow Automation Scripts

This directory contains automation scripts to streamline the Git workflow for feature development, following best practices for branching, committing, and pull request creation.

## 🚀 Quick Start

```bash
# Create a new feature and complete the entire workflow
npm run complete-flow feature-name "Feature description"

# Or step by step:
npm run new-feature feature-name "Feature description"  # Create branch
npm run commit feat "Add new feature"                   # Commit changes
npm run create-pr                                       # Create PR
```

## 📋 Available Commands

### Package.json Scripts (Recommended)

| Command                 | Description                             | Example                                                |
| ----------------------- | --------------------------------------- | ------------------------------------------------------ |
| `npm run workflow`      | Show help and available commands        | -                                                      |
| `npm run new-feature`   | Create new feature branch               | `npm run new-feature dark-mode "Add dark mode"`        |
| `npm run commit`        | Smart commit with conventional format   | `npm run commit feat "Add login page"`                 |
| `npm run create-pr`     | Create GitHub pull request              | `npm run create-pr`                                    |
| `npm run complete-flow` | Complete workflow: branch → commit → PR | `npm run complete-flow user-auth "Add authentication"` |
| `npm run git-status`    | Show current workflow status            | -                                                      |
| `npm run git-cleanup`   | Clean up merged branches                | -                                                      |

### Direct Script Usage

```bash
# Main workflow script
./scripts/workflow.sh [command] [args...]

# Individual scripts
./scripts/create-feature.sh <name> [description]
./scripts/commit.sh [type] [description]
./scripts/create-pr.sh [base-branch]
```

## 🔄 Workflow Steps

### 1. Create Feature Branch

```bash
npm run new-feature user-profile "Add user profile page"
```

- Stashes uncommitted changes if needed
- Creates feature branch from current branch (usually `develop`)
- Restores stashed changes to new branch
- Sets up commit message template

### 2. Make Changes & Commit

```bash
# Make your code changes...
npm run commit feat "Add user profile component"
```

- Stages changes (interactively if needed)
- Creates conventional commit with proper format
- Includes file change context
- Prompts to push to remote

### 3. Create Pull Request

```bash
npm run create-pr
```

- Pushes branch to remote if needed
- Generates comprehensive PR description
- Creates GitHub PR with proper labels
- Opens PR in browser (optional)

## 📝 Conventional Commits

The automation enforces [Conventional Commits](https://www.conventionalcommits.org/) format:

### Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Commit Message Format

```
type: description

- Detailed change 1
- Detailed change 2

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 🛠️ Individual Scripts

### create-feature.sh

Creates a new feature branch with proper setup.

```bash
./scripts/create-feature.sh dark-mode "Add dark mode support"
```

**Features:**

- Handles uncommitted changes (stash/restore)
- Creates feature branch from current branch
- Sets up commit message template
- Provides next steps guidance

### commit.sh

Smart commit with conventional format and file context.

```bash
./scripts/commit.sh feat "Add login component"
```

**Features:**

- Interactive staging if no changes staged
- Conventional commit format validation
- Auto-generates file change context
- Preview before committing
- Optional push to remote

### create-pr.sh

Creates GitHub pull request with rich description.

```bash
./scripts/create-pr.sh develop
```

**Features:**

- Auto-pushes branch if needed
- Generates comprehensive PR description
- Includes commit history and file changes
- Creates test plan checklist
- Opens in browser (optional)

### workflow.sh

Main orchestration script combining all workflows.

```bash
./scripts/workflow.sh complete user-auth "Add user authentication"
```

**Features:**

- Unified interface for all operations
- Status checking and branch management
- Cleanup of merged branches
- Complete workflow automation

## 🔍 Status & Management

### Check Current Status

```bash
npm run git-status
```

Shows:

- Current branch and type
- Uncommitted changes
- Remote branch status
- Associated PR (if exists)
- Recent commits

### Cleanup Merged Branches

```bash
npm run git-cleanup
```

- Fetches latest changes
- Switches to develop
- Updates develop branch
- Finds and deletes merged feature branches

## 🎯 Best Practices

1. **Always start with a feature branch**

   ```bash
   npm run new-feature my-feature "Description"
   ```

2. **Use descriptive commit messages**

   ```bash
   npm run commit feat "Add user authentication with JWT tokens"
   ```

3. **Create PRs early for collaboration**

   ```bash
   npm run create-pr
   ```

4. **Clean up after merging**
   ```bash
   npm run git-cleanup
   ```

## 🔧 Requirements

- **Git** - Version control
- **GitHub CLI (`gh`)** - For PR creation
- **Node.js** - For npm scripts
- **Bash** - For script execution

### Install GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Authenticate
gh auth login
```

## 🚨 Error Handling

The scripts include comprehensive error handling:

- **Uncommitted changes** - Option to stash or commit first
- **Branch conflicts** - Prevents overwriting existing branches
- **Missing dependencies** - Checks for required tools
- **Network issues** - Graceful handling of push/PR failures
- **Invalid input** - Validation and helpful error messages

## 🔄 Integration with Existing Workflow

These scripts complement the existing git-flow setup:

- Uses existing `develop` as base branch
- Follows established branch naming conventions
- Integrates with existing pre-commit hooks
- Maintains security checks and linting

## 📚 Examples

### Complete Feature Development

```bash
# 1. Start new feature
npm run new-feature user-dashboard "Add user dashboard page"

# 2. Make your changes...
# - Edit files
# - Add components
# - Update tests

# 3. Commit changes
npm run commit feat "Add responsive user dashboard with analytics"

# 4. Create PR for review
npm run create-pr

# 5. After merge, cleanup
npm run git-cleanup
```

### Quick Fix

```bash
# Create fix branch and commit in one go
npm run complete-flow login-bug "Fix login form validation"
```

### Status Check

```bash
# Check what's happening
npm run git-status

# Results show:
# - Current branch: feature/user-dashboard
# - Status: Clean working directory
# - Remote: Pushed and up-to-date
# - PR: https://github.com/user/repo/pull/15
```

This automation significantly reduces the manual overhead of proper Git workflow while ensuring consistency and best practices across the team.
