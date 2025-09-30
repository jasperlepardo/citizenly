# Git Workflow Conventions

> **Complete Git workflow naming and process guide for the Citizenly project**
> 
> This document covers all Git-related naming conventions, workflows, and processes. Use this as your daily reference for branches, commits, PRs, and releases.

## 📖 Table of Contents

1. [🌿 Branch Naming](#-branch-naming)
2. [🏷️ Pull Request Titles](#️-pull-request-titles)
3. [💬 Commit Messages](#-commit-messages)
4. [📦 Release Tags](#-release-tags)
5. [🔄 Workflow Rules](#-workflow-rules)
6. [🐙 GitHub Integration](#-github-integration)
7. [⚠️ Common Mistakes](#️-common-mistakes)
8. [📋 Quick Reference](#-quick-reference)
9. [🛠️ Helper Commands](#️-helper-commands)

---

## 🌿 Branch Naming

### **Format: `type/description` or `type/ticket-id-description`**

#### ✅ **Feature Branches**
```
feature/AUTH-123-user-login
feature/DASH-456-environment-indicator
feature/UI-789-dark-mode-toggle
feature/user-authentication
feature/household-creation
feature/resident-wizard
```

#### ✅ **Bug Fix Branches**
```
fix/BUG-101-csrf-secret-validation
fix/BUG-202-storybook-deployment
fix/BUG-303-navigation-breadcrumbs
fix/csrf-validation
fix/auth-loading-state
fix/dashboard-stats-display
```

#### ✅ **Hotfix Branches**
```
hotfix/CRIT-001-security-vulnerability
hotfix/CRIT-002-payment-gateway-down
hotfix/production-auth-failure
hotfix/database-connection-timeout
```

#### ✅ **Chore/Maintenance**
```
chore/update-dependencies
chore/setup-ci-pipeline
chore/cleanup-unused-components
chore/upgrade-typescript
```

#### ✅ **Documentation**
```
docs/update-readme
docs/api-documentation
docs/deployment-guide
docs/naming-conventions
```

#### ❌ **Avoid**
```
dev                    # Use: develop
stage                  # Use: staging
master                 # Use: main
feature-auth           # Use: feature/auth-implementation
user_login             # Use: feature/user-login
FeatureAuth            # Use: feature/auth-implementation
```

---

## 🏷️ Pull Request Titles

### **Feature/Fix PRs → develop**

#### ✅ **Conventional Commit Format**
```
feat: implement environment indicator in dashboard
fix: resolve CSRF secret validation error
chore: update TypeScript configuration
docs: update installation instructions
test: add unit tests for authentication service
perf: optimize dashboard data loading
style: fix component styling inconsistencies
refactor: restructure authentication flow
ci: add automated security scanning
```

### **Release PRs**

#### ✅ **develop → staging**
```
Release: v1.2.0 - Authentication Features Sprint
Release: v1.1.5 - Bug Fixes and Improvements
Release: v2.0.0 - Major Architecture Update
```

#### ✅ **staging → main**
```
Production Release: v1.2.0
Production Release: v1.1.5
Production Release: v2.0.0
```

#### ❌ **Avoid**
```
"Updates"              # Use: feat: implement user dashboard
"Bug fixes"            # Use: fix: resolve login validation error
"WIP"                  # Don't merge work in progress
"Final changes"        # Use descriptive title
"Ready for review"     # Use descriptive title
```

---

## 💬 Commit Messages

### **Format: `type(scope): description`**

#### ✅ **Types**
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements
- **ci**: CI/CD changes

#### ✅ **Examples**
```
feat(auth): implement user login with OAuth
fix(dashboard): resolve environment indicator display issue
docs(readme): update installation instructions
chore(deps): update Next.js to v14.2.0
test(api): add unit tests for authentication service
perf(queries): optimize dashboard data loading
ci(workflows): add automated security scanning
style(components): fix inconsistent button styling
refactor(auth): simplify user profile loading logic
```

#### ✅ **Scope Examples**
```
auth: Authentication-related changes
api: API endpoint changes
ui: User interface changes
db: Database changes
docs: Documentation changes
config: Configuration changes
deps: Dependency updates
test: Test-related changes
```

#### ❌ **Avoid**
```
"Updated files"        # Use: feat(api): add user endpoints
"Bug fixes"            # Use: fix(auth): resolve login validation
"WIP"                  # Use descriptive messages
"Minor changes"        # Use specific description
"Fixed stuff"          # Use specific description
```

---

## 📦 Release Tags

### **Semantic Versioning (SemVer)**

#### ✅ **Release Naming**
```
v1.0.0                 # Initial release
v1.1.0                 # Feature release
v1.1.1                 # Patch release
v2.0.0                 # Major release (breaking changes)
```

#### ✅ **Pre-releases**
```
v1.2.0-alpha.1         # Alpha release
v1.2.0-beta.2          # Beta release
v1.2.0-rc.1            # Release candidate
```

#### ❌ **Avoid**
```
release-1.0            # Use: v1.0.0
version_1.1            # Use: v1.1.0
v1                     # Use: v1.0.0 (complete version)
prod-release           # Use: v1.0.0
```

---

## 🔄 Workflow Rules

### **✅ Allowed Flows**
```
feature/fix/chore → develop    # Feature development
develop → staging              # Release preparation
staging → main                 # Production deployment
hotfix → main                  # Emergency fixes
```

### **❌ Forbidden Flows**
```
feature/fix → staging          # Must go through develop
feature/fix → main             # Must go through develop → staging
develop → main                 # Must go through staging
Direct pushes to protected branches
```

### **Branch Protection Rules**

#### **develop merges require:**
- build-and-test
- lint-and-typecheck
- security-scan

#### **staging merges require:**
- All develop checks +
- e2e-tests
- performance-tests

#### **main merges require:**
- All staging checks +
- accessibility-tests
- staging-deployment-check

---

## 🐙 GitHub Integration

### **GitHub Workflows** - kebab-case with descriptive names
```yaml
✅ Workflow files (.github/workflows/)
pull-request.yml
code-review.yml
deploy-storybook.yml
production-validation.yml
staging-validation.yml
bundle-analysis.yml
ai-review.yml
codeql.yml
sonarcloud.yml
vercel-build.yml
release.yml

❌ Avoid
pr.yml
build.yml
test.yml
workflow1.yml
```

### **GitHub Issue Labels** - kebab-case with prefixes
```
✅ Label naming
bug/critical
bug/minor
feature/enhancement
feature/new
docs/update
chore/maintenance
priority/high
priority/low
status/in-progress
status/needs-review
type/security
area/frontend
area/backend
area/database

❌ Avoid
Bug (inconsistent casing)
high priority (spaces)
front_end (snake_case)
```

### **GitHub Actions** - kebab-case for action names
```yaml
✅ Action step names
- name: "setup-node-environment"
- name: "install-dependencies"
- name: "run-type-check"
- name: "build-application"
- name: "deploy-to-vercel"
- name: "notify-deployment-status"

❌ Avoid
- name: "Setup Node"
- name: "install_deps"
- name: "TypeCheck"
```

### **GitHub Secrets and Variables** - SCREAMING_SNAKE_CASE
```yaml
✅ Repository secrets
VERCEL_TOKEN
SUPABASE_SERVICE_ROLE_KEY
SONAR_TOKEN
OPENAI_API_KEY
SLACK_WEBHOOK_URL
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL

❌ Avoid
vercelToken (camelCase)
supabase-key (kebab-case)
api_key (incomplete)
```

---

## ⚠️ Common Mistakes

### **❌ Wrong Branch Names**
```
dev                    # Use: develop
stage                  # Use: staging
master                 # Use: main
feature-auth           # Use: feature/auth-implementation
user_login_feature     # Use: feature/user-login
Feature/Auth           # Use: feature/auth (lowercase)
```

### **❌ Wrong PR Titles**
```
"Updates"              # Use: feat: implement user dashboard
"Bug fixes"            # Use: fix: resolve login validation error
"WIP"                  # Don't merge work in progress
"Ready"                # Use: feat: complete user authentication
"Final version"        # Use descriptive title
```

### **❌ Wrong Commit Messages**
```
"Updated files"        # Use: feat(api): add user endpoints
"Bug fixes"            # Use: fix(auth): resolve login validation
"WIP"                  # Use descriptive messages
"."                    # Use descriptive messages
"Fixed typo"           # Use: docs: fix typo in API documentation
```

### **❌ Wrong Workflow Flows**
```
feature → staging      # Use: feature → develop → staging
develop → main         # Use: develop → staging → main
hotfix → develop       # Use: hotfix → main (emergency fixes)
```

---

## 📋 Quick Reference

| **Context** | **Convention** | **Example** |
|-------------|----------------|-------------|
| **Feature Branch** | feature/description | `feature/user-login` |
| **Bug Fix Branch** | fix/description | `fix/auth-validation` |
| **Hotfix Branch** | hotfix/description | `hotfix/security-patch` |
| **PR Title** | type: description | `feat: implement user dashboard` |
| **Commit Message** | type(scope): description | `feat(auth): add OAuth login` |
| **Release Tag** | vX.Y.Z | `v1.2.0` |
| **Workflow File** | kebab-case.yml | `pull-request.yml` |
| **GitHub Secret** | SCREAMING_SNAKE_CASE | `VERCEL_TOKEN` |
| **GitHub Label** | kebab-case/prefix | `bug/critical` |

---

## 🛠️ Helper Commands

### **Create Branch (Using Helper Script)**
```bash
# Feature branch
npm run new-feature user-authentication "User authentication feature"

# Bug fix
npm run new-feature csrf-validation "Fix CSRF validation bug"

# Chore
npm run new-feature update-dependencies "Update project dependencies"
```

### **Manual Branch Creation**
```bash
# Ensure you're on develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/AUTH-123-user-login

# Create fix branch
git checkout -b fix/BUG-456-csrf-validation
```

### **Conventional Commits**
```bash
# Feature commit
git commit -m "feat(auth): add OAuth login component"

# Fix commit
git commit -m "fix(csrf): resolve validation error in production"

# Chore commit
git commit -m "chore(deps): update React to v18.3.0"
```

### **Creating Pull Requests**
```bash
# Push branch and create PR
git push -u origin feature/user-authentication
gh pr create --title "feat: implement user authentication" --body "Implements OAuth login with Google and GitHub providers"

# Create release PR
gh pr create --title "Release: v1.2.0 - Authentication Features" --base staging --head develop
```

### **Release Workflow**
```bash
# Create release tag
git tag -a v1.2.0 -m "Release v1.2.0 - Authentication Features"
git push origin v1.2.0

# Create GitHub release
gh release create v1.2.0 --title "v1.2.0 - Authentication Features" --notes "Release notes here"
```

---

💡 **Remember**: Use the helper commands when available, and always follow the conventional commit format for consistency across the project!

🔗 **Related Documentation**: 
- [Comprehensive Naming Conventions](./COMPREHENSIVE_NAMING_CONVENTIONS.md) for code naming
- [Coding Standards](./CODING_STANDARDS.md) for code quality guidelines