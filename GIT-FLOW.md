# Git Flow Guide

This project uses **Git Flow** branching strategy with automated semantic versioning for organized, secure development.

## 🌳 Branch Structure

### Production Branches

- **`main`** - Production releases (v1.0.0, v1.1.0, v2.0.0)
- **`develop`** - Integration branch for beta releases (v1.1.0-beta.1)

### Supporting Branches

- **`feature/*`** - New features (`feature/user-authentication`)
- **`release/*`** - Release preparation (`release/1.2.0`)
- **`hotfix/*`** - Emergency fixes (`hotfix/1.1.1`)

## 🚀 Automated Releases

Each branch type triggers different release versions:

| Branch      | Release Type      | Example Version  |
| ----------- | ----------------- | ---------------- |
| `main`      | Production        | `1.2.0`          |
| `develop`   | Beta              | `1.2.0-beta.1`   |
| `release/*` | Release Candidate | `1.2.0-rc.1`     |
| `hotfix/*`  | Hotfix            | `1.1.1-hotfix.1` |

## 📋 Quick Commands

```bash
# Feature development
npm run feature:start user-auth
npm run feature:finish

# Release management
npm run release:start 1.2.0
npm run release:finish

# Emergency fixes
npm run hotfix:start 1.1.1

# Check status
npm run flow:status
```

## 🔄 Workflows

### 1. Feature Development

```bash
# Start feature
git checkout develop
npm run feature:start user-authentication

# Develop feature
git add . && git commit -m "feat: add user login system"
git push

# Finish feature (creates PR template)
npm run feature:finish
```

**Result:** `feature/user-authentication` → PR to `develop` → `1.2.0-beta.1`

### 2. Release Process

```bash
# Start release
git checkout develop
npm run release:start 1.2.0

# Final testing and bug fixes
git commit -m "fix: resolve login redirect issue"

# Finish release
npm run release:finish
```

**Result:**

- `release/1.2.0` → PR to `main` → `1.2.0`
- `release/1.2.0` → PR to `develop` (merge back)

### 3. Hotfix Process

```bash
# Start hotfix
git checkout main
npm run hotfix:start 1.1.1

# Fix critical issue
git commit -m "fix: resolve security vulnerability"
git push

# Create PRs to main and develop
```

**Result:** `1.1.1-hotfix.1` then `1.1.1` on main

## 🔐 Security Integration

All branches run security checks before release:

- 🛡️ Vulnerability scanning
- 🔍 Secret detection
- 🧪 Test suite execution
- 📝 Type checking
- 🎨 Code linting

## 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add user authentication system
fix: resolve login redirect issue
docs: update API documentation
refactor: improve database queries
perf: optimize image loading
test: add user registration tests
```

## 🔀 Pull Request Strategy

**🚨 CRITICAL RULE: All pull requests MUST follow this flow - NO EXCEPTIONS**

```
feature/* → develop → staging → main
```

### ❌ NEVER DO THIS

- Direct PRs to `main` branch
- Skip `develop` integration
- Bypass code review process

### ✅ ALWAYS DO THIS

- Create feature branches from `develop`
- PR feature branches to `develop` only
- Let `develop` → `staging` → `main` happen via controlled releases

### Feature → Develop (REQUIRED)

```markdown
🚀 **Feature: User Authentication**

## Changes

- Add login/logout functionality
- Implement JWT token handling
- Add user profile management

## Testing

- [x] Unit tests pass
- [x] Integration tests pass
- [x] Security checks pass
- [x] Manual testing completed
```

### Develop → Staging (Controlled Release)

```markdown
🧪 **Staging Deploy: v1.2.0-beta**

## Features Ready for Testing

- User authentication system
- Profile management
- Dashboard improvements

## Testing Checklist

- [ ] Feature testing complete
- [ ] Integration testing complete
- [ ] Security review complete
- [ ] Performance testing complete
```

### Staging → Main (Production Release)

```markdown
🎯 **Production Release: v1.2.0**

## Features

- User authentication system
- Profile management
- Dashboard improvements

## Bug Fixes

- Login redirect issue
- Form validation errors

## Security

- All security checks passed
- No vulnerabilities detected
- Staging validation complete
```

## 🛡️ Branch Protection Rules

**🔒 MANDATORY: Configure these branch protection rules in GitHub Settings**

### Main Branch (PRODUCTION)

- ✅ **Require pull request reviews (2+ reviewers)**
- ✅ **Require status checks (ALL CI/CD must pass)**
- ✅ **Require branches to be up to date before merging**
- ✅ **Restrict pushes to repository admins only**
- ✅ **Only allow PRs from `staging` branch (CRITICAL)**
- ✅ **Require linear history**
- ✅ **Do not allow bypassing the above settings**

### Staging Branch (TESTING)

- ✅ **Require pull request reviews (1+ reviewer)**
- ✅ **Require status checks (ALL CI/CD must pass)**
- ✅ **Only allow PRs from `develop` branch**
- ✅ **Require branches to be up to date before merging**
- ✅ **Do not allow force pushes**

### Develop Branch (INTEGRATION)

- ✅ **Require pull request reviews (1+ reviewer)**
- ✅ **Require status checks (ALL CI/CD must pass)**
- ✅ **Only allow PRs from `feature/*`, `hotfix/*`, `release/*` branches**
- ✅ **Allow squash merging for cleaner history**
- ✅ **Do not allow force pushes**

## 🏗️ Three-Environment Deployment Strategy

```
ENVIRONMENTS:
develop  → dev.citizenly.co     (Development)
staging  → staging.citizenly.co (Testing)
main     → app.citizenly.co     (Production)

FLOW:
feature/* → develop → staging → main
```

### Environment Purposes

| Environment     | Branch    | URL                  | Purpose                                 |
| --------------- | --------- | -------------------- | --------------------------------------- |
| **Development** | `develop` | dev.citizenly.co     | Feature integration, continuous testing |
| **Staging**     | `staging` | staging.citizenly.co | Pre-production testing, QA validation   |
| **Production**  | `main`    | app.citizenly.co     | Live production application             |

### Deployment Triggers

- **Merge to `develop`** → Auto-deploy to Development
- **Merge to `staging`** → Auto-deploy to Staging
- **Merge to `main`** → Auto-deploy to Production

## 📊 Release Timeline

```
develop    ●─●─●─────●─●─●─────●  (dev.citizenly.co)
            \       /   \       /
feature/*    ●─●─●─●     ●─●─●─●

staging                ●─────●─────●  (staging.citizenly.co)
                      /       \       \
develop              ●─────────●─────●

main                           ●─────●  (app.citizenly.co)
                              /       \
staging                      ●─────────●
```

## 🎯 Best Practices

### DO ✅

- Create feature branches from `develop`
- Use conventional commit messages
- Run security checks before PRs
- Keep feature branches small and focused
- Merge release branches to both `main` and `develop`

### DON'T ❌

- Push directly to `main` or `develop`
- Skip security checks
- Create long-lived feature branches
- Mix multiple features in one branch
- Forget to merge releases back to `develop`

## 🚨 Emergency Procedures

### Critical Production Bug

1. `npm run hotfix:start 1.1.1`
2. Fix the issue with `fix:` commit
3. Create PR to `main`
4. Create PR to `develop`
5. Deploy hotfix immediately

### Rollback Production

```bash
git checkout main
git revert <commit-hash>
git push origin main
# Triggers automatic rollback release
```

## 📈 Monitoring

- **GitHub Actions**: Automated testing and releases
- **Security Checks**: Pre-push vulnerability scanning
- **Release Notes**: Auto-generated from commits
- **Version Tags**: Semantic versioning tags

---

**Quick Start:** `npm run flow:status` to see current state and available commands.
