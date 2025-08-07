# Branch Protection & Workflow Rules

This document outlines the strict branching workflow, naming conventions, and protection rules for the Citizenly project.

## 🌊 Branching Flow

```
Feature Branches → develop → staging → main
      ↓              ↓         ↓        ↓
   [Workflows]  [Workflows] [All✓]  [All✓+Deploy✓]
```

## 📛 Naming Conventions

### 🌿 Branch Names

#### Feature Branches

**Format**: `feature/<ticket-id>-<short-description>`

- `feature/AUTH-123-user-login`
- `feature/DASH-456-environment-indicator`
- `feature/UI-789-dark-mode-toggle`

#### Bug Fix Branches

**Format**: `fix/<ticket-id>-<short-description>`

- `fix/BUG-101-csrf-secret-validation`
- `fix/BUG-202-storybook-deployment`
- `fix/BUG-303-navigation-breadcrumbs`

#### Hotfix Branches (Production Issues)

**Format**: `hotfix/<ticket-id>-<critical-issue>`

- `hotfix/CRIT-001-security-vulnerability`
- `hotfix/CRIT-002-payment-gateway-down`

#### Chore/Maintenance Branches

**Format**: `chore/<description>`

- `chore/update-dependencies`
- `chore/setup-ci-pipeline`
- `chore/cleanup-unused-components`

#### Documentation Branches

**Format**: `docs/<description>`

- `docs/update-readme`
- `docs/api-documentation`
- `docs/deployment-guide`

### 🏷️ PR Naming Conventions

#### Develop → Staging PRs

**Format**: `Release: v<version> - <sprint/milestone>`

- `Release: v1.2.0 - Sprint 23 Features`
- `Release: v1.1.5 - Bug Fixes and Improvements`
- `Release: v1.3.0 - Dashboard Enhancement Milestone`

#### Staging → Main PRs

**Format**: `Production Release: v<version>`

- `Production Release: v1.2.0`
- `Production Release: v1.1.5`
- `Production Release: v1.3.0`

#### Feature → Develop PRs

**Format**: `feat: <description>` or `fix: <description>`

- `feat: implement environment indicator in dashboard`
- `fix: resolve CSRF secret validation error`
- `chore: update TypeScript configuration`

### 🏗️ Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format**: `<type>(<scope>): <description>`

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Examples**:

```
feat(auth): implement user login with OAuth
fix(dashboard): resolve environment indicator display issue
docs(readme): update installation instructions
chore(deps): update Next.js to v14.2.0
```

### 📦 Release Naming Convention

#### Version Numbers

Follow [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., `1.2.3`)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### Release Tags

**Format**: `v<version>`

- `v1.0.0` - Initial release
- `v1.1.0` - Feature release
- `v1.1.1` - Patch release
- `v2.0.0` - Major release with breaking changes

#### Pre-release Tags

**Format**: `v<version>-<stage>.<number>`

- `v1.2.0-alpha.1` - Alpha release
- `v1.2.0-beta.2` - Beta release
- `v1.2.0-rc.1` - Release candidate

## 🛡️ Branch Protection Rules

### 🌿 DEVELOP Branch

**Purpose**: Integration branch for all feature development

**Naming**: Always `develop` (never `dev`, `development`, etc.)

**Protection Rules**:

- ✅ **Source**: All feature/fix branches must target develop
- ✅ **PR Required**: No direct pushes allowed
- ✅ **Reviews**: Minimum 1 approving review required
- ✅ **Status Checks**: Required workflows must pass:
  - `build-and-test`
  - `lint-and-typecheck`
  - `security-scan`
- ✅ **Up-to-date**: Branches must be current with develop
- ✅ **Conversation Resolution**: All conversations must be resolved
- ❌ **Force Push**: Not allowed
- ❌ **Deletions**: Not allowed

### 🚀 STAGING Branch

**Purpose**: Pre-production testing and validation

**Naming**: Always `staging` (never `stage`, `pre-prod`, etc.)

**Protection Rules**:

- ✅ **Source**: ONLY develop can merge to staging
- ✅ **PR Required**: No direct pushes allowed
- ✅ **Reviews**: Minimum 1 approving review required
- ✅ **Status Checks**: All workflows must pass:
  - `build-and-test`
  - `lint-and-typecheck`
  - `security-scan`
  - `e2e-tests`
  - `performance-tests`
- ✅ **Up-to-date**: Must be current with target branch
- ✅ **Admin Enforcement**: Applies to administrators
- ❌ **Direct from Features**: Feature branches cannot go directly to staging

### 🏭 MAIN Branch (Production)

**Purpose**: Production-ready stable releases

**Naming**: Always `main` (not `master`, `production`, etc.)

**Protection Rules**:

- ✅ **Source**: ONLY staging can merge to main
- ✅ **PR Required**: No direct pushes allowed
- ✅ **Reviews**: Minimum 2 approving reviews required
- ✅ **Code Owner Reviews**: Required if CODEOWNERS defined
- ✅ **Status Checks**: ALL workflows must pass:
  - `build-and-test`
  - `lint-and-typecheck`
  - `security-scan`
  - `e2e-tests`
  - `performance-tests`
  - `accessibility-tests`
  - `staging-deployment-check`
- ✅ **Branch Locked**: Maximum protection enabled
- ✅ **Admin Enforcement**: No exceptions for administrators
- ❌ **Direct from Develop**: develop cannot go directly to main

## 🚫 Forbidden Operations & Anti-Patterns

### ❌ Forbidden Branch Names:

- `dev` (use `develop`)
- `stage` (use `staging`)
- `master` (use `main`)
- `prod` (use `main`)
- `feature-something` (use `feature/something`)
- `bugfix-something` (use `fix/something`)

### ❌ Forbidden Workflows:

1. **Direct pushes** to any protected branch
2. **Feature branches** → staging (must go through develop)
3. **Feature branches** → main (must go through develop → staging)
4. **develop** → main (must go through staging)
5. **Force pushes** to any protected branch

### ❌ Bad PR Names:

- ❌ "Updates" (too vague)
- ❌ "Bug fixes" (not specific)
- ❌ "WIP" (work in progress shouldn't be merged)
- ❌ "Quick fix" (not descriptive)

## 🔄 Workflow Examples

### ✅ Correct Feature Development:

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/AUTH-123-user-login

# 2. Develop and commit with conventional commits
git commit -m "feat(auth): implement OAuth login component"
git commit -m "feat(auth): add user session management"
git commit -m "test(auth): add login component tests"

# 3. Push and create PR
git push origin feature/AUTH-123-user-login

# 4. PR Title: "feat: implement user authentication with OAuth"
# 5. Target: develop
```

### ✅ Correct Release Process:

```bash
# 1. Develop → Staging
PR Title: "Release: v1.2.0 - Authentication Features Sprint"
Source: develop → Target: staging

# 2. Staging → Main
PR Title: "Production Release: v1.2.0"
Source: staging → Target: main

# 3. Tag the release
git tag -a v1.2.0 -m "Release v1.2.0: Authentication Features"
git push origin v1.2.0
```

## 📋 Required Status Checks

### For DEVELOP merges:

- ✅ `build-and-test`
- ✅ `lint-and-typecheck`
- ✅ `security-scan`

### For STAGING merges:

- ✅ `build-and-test`
- ✅ `lint-and-typecheck`
- ✅ `security-scan`
- ✅ `e2e-tests`
- ✅ `performance-tests`

### For MAIN merges:

- ✅ `build-and-test`
- ✅ `lint-and-typecheck`
- ✅ `security-scan`
- ✅ `e2e-tests`
- ✅ `performance-tests`
- ✅ `accessibility-tests`
- ✅ `staging-deployment-check`

## 🛠️ Setup Instructions

### 1. Apply Branch Protection Rules

```bash
# Set your GitHub Personal Access Token
export GITHUB_TOKEN=your_github_token_here

# Run the branch protection setup script
./scripts/setup-branch-protection.sh
```

### 2. Update Repository Settings

- Set **default branch** to `develop`
- Update PR default target to `develop`
- Configure branch naming patterns in repository rules

### 3. Team Guidelines

- Train team on naming conventions
- Set up PR templates with naming guidelines
- Configure IDE/tools to suggest conventional commit formats

## ⚠️ Important Notes

1. **Consistency**: Always use exact naming conventions
2. **No Shortcuts**: Follow the full workflow path even for small changes
3. **Descriptive Names**: Branch and PR names should clearly describe the work
4. **Semantic Versioning**: Increment versions appropriately based on changes
5. **Documentation**: Update version numbers in relevant files during releases

## 🔧 Maintenance

### Regular Tasks:

- Review and clean up old feature branches
- Update version numbers before releases
- Maintain consistent naming across all repositories
- Audit branch protection rules quarterly

### Branch Cleanup:

```bash
# Delete merged feature branches
git branch -d feature/completed-feature
git push origin --delete feature/completed-feature

# List merged branches for cleanup
git branch --merged develop | grep -E "feature/|fix/" | xargs -n 1 git branch -d
```
