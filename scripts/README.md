# Essential Production Scripts

This directory contains **23 essential scripts** for core development workflows and production operations. One-off migration scripts have been removed, but essential maintenance and analysis tools have been restored.

## 📁 Organization

### `git/` - Git Workflow Automation (5 scripts)
Production-ready scripts for branching, committing, and pull request creation following best practices.

### `build/` - Build & Performance (4 scripts)
- `create-build-env.mjs` - Build environment setup
- `prepare-storybook.js` - Storybook preparation  
- `analyze-bundle.js` - Bundle size analysis and optimization recommendations
- `track-bundle-size.js` - Bundle size tracking over time with budget violations

### `docs/` - Documentation Tools (2 scripts)
- `check-documentation.js` - JSDoc validation and completeness checking
- `generate-docs.js` - API documentation generation from JSDoc comments

### `security/` - Security Analysis (3 scripts)
Automated dependency vulnerability scanning and security policy enforcement.

### `quality/` - Code Quality (5 scripts)
- `refresh-stats.js` - Quality metrics tracking
- `setup-deployment.sh` - Deployment setup automation
- `setup-secrets.sh` - Secret management
- `check-complexity.js` - Cyclomatic complexity analysis 
- `analyze-imports.js` - Import structure and circular dependency detection

### **Root Level** - Core Utilities (2 scripts)
- `generate-enums.ts` - Database enum generation
- `validate-enums.ts` - Enum validation

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

### Documentation & Quality Scripts

| Command                     | Description                             | Example                                                |
| --------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `npm run docs:check`        | Check JSDoc documentation completeness  | -                                                      |
| `npm run docs:generate`     | Generate API documentation from JSDoc   | -                                                      |
| `npm run bundle:analyze`    | Analyze bundle sizes and optimization   | -                                                      |
| `npm run bundle:track`      | Track bundle size changes over time     | -                                                      |
| `npm run quality:complexity`| Check code complexity and identify issues| -                                                      |
| `npm run quality:imports`   | Analyze import patterns and circular deps| -                                                     |

### Direct Script Usage

```bash
# Main workflow script
./scripts/git/workflow.sh [command] [args...]

# Individual scripts
./scripts/git/create-feature.sh <name> [description]
./scripts/git/commit.sh [type] [description]
./scripts/git/create-pr.sh [base-branch]

# Other categories
./scripts/build/analyze-bundle.js
./scripts/quality/check-complexity.js
./scripts/security/check-security.sh
./scripts/docs/check-documentation.js
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

### git/create-feature.sh

Creates a new feature branch with proper setup.

```bash
./scripts/git/create-feature.sh dark-mode "Add dark mode support"
```

**Features:**

- Handles uncommitted changes (stash/restore)
- Creates feature branch from current branch
- Sets up commit message template
- Provides next steps guidance

### git/commit.sh

Smart commit with conventional format and file context.

```bash
./scripts/git/commit.sh feat "Add login component"
```

**Features:**

- Interactive staging if no changes staged
- Conventional commit format validation
- Auto-generates file change context
- Preview before committing
- Optional push to remote

### git/create-pr.sh

Creates GitHub pull request with rich description.

```bash
./scripts/git/create-pr.sh develop
```

**Features:**

- Auto-pushes branch if needed
- Generates comprehensive PR description
- Includes commit history and file changes
- Creates test plan checklist
- Opens in browser (optional)

### git/workflow.sh

Main orchestration script combining all workflows.

```bash
./scripts/git/workflow.sh complete user-auth "Add user authentication"
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
