# Git Flow Automation Guide

## Overview

This project uses automated Git Flow with semantic versioning for organized development and releases.

## Branch Strategy

### Protected Branches

- **`main`** - Production releases only (v1.0.0, v1.1.0)
- **`develop`** - Integration branch for ongoing development (v1.1.0-beta.1)

### Feature Branches

- **`feature/*`** - New features, created from `develop`
- **`bugfix/*`** - Bug fixes, created from `develop`
- **`docs/*`** - Documentation updates, created from `develop`

### Release Branches

- **`release/*`** - Release preparation, merged to `main`
- **`hotfix/*`** - Emergency fixes, merged to `main`

## Automated Workflows

### 1. Feature Development (Automated)

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/auth/user-registration

# Make changes and commit with conventional format
git commit -m "feat(auth): implement user registration form"

# Create PR with auto-merge (targets develop by default)
npm run pr:create "feat(auth): implement user registration" "Add user registration functionality"
```

**What happens automatically:**

- ✅ Branch pushed to remote
- ✅ PR created targeting `develop`
- ✅ Code review workflow runs (lint, test, security)
- ✅ SonarCloud analysis
- ✅ Auto-merge when approved + checks pass
- ✅ Beta release generated on develop

### 2. Production Release (Semi-automated)

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Make final adjustments
git commit -m "chore(release): prepare v1.2.0"

# Create PR to main (manual approval required)
npm run pr:create "Release v1.2.0" "Production release" main
```

**What happens automatically:**

- ✅ PR created targeting `main`
- ✅ Enhanced code review (all quality gates)
- ⚠️ Manual approval required for production
- ✅ Production release generated on main merge
- ✅ CHANGELOG.md updated
- ✅ GitHub release created

### 3. Hotfix (Fast-track)

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/auth/session-timeout

# Make critical fix
git commit -m "fix(auth): resolve session timeout issue"

# Create PR to main
npm run pr:create "Hotfix: session timeout" "Fix critical auth issue" main
```

**What happens automatically:**

- ✅ Fast-track review for critical fixes
- ⚠️ Manual approval required
- ✅ Immediate hotfix release
- ✅ Auto-merge back to develop

## Quality Gates

### Automated Checks (All PRs)

- ✅ **ESLint** - Code style and quality
- ✅ **TypeScript** - Type checking
- ✅ **Tests** - Unit and integration tests
- ✅ **Security** - Vulnerability scanning
- ✅ **SonarCloud** - Code quality analysis
- ✅ **Bundle size** - Performance monitoring

### Release Requirements

- ✅ All quality checks pass
- ✅ Test coverage > 85%
- ✅ SonarCloud quality gate pass
- ✅ Security audit clean
- ✅ Build successful

## Semantic Versioning

### Commit Types → Version Bumps

| Commit Type        | Version Change        | Example                  |
| ------------------ | --------------------- | ------------------------ |
| `feat:`            | Minor (1.0.0 → 1.1.0) | New features             |
| `fix:`             | Patch (1.0.0 → 1.0.1) | Bug fixes                |
| `perf:`            | Patch                 | Performance improvements |
| `refactor:`        | Patch                 | Code refactoring         |
| `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | Breaking changes         |

### Branch → Release Type

| Branch      | Release Type      | Version Format   |
| ----------- | ----------------- | ---------------- |
| `main`      | Production        | `1.2.0`          |
| `develop`   | Beta              | `1.2.0-beta.1`   |
| `release/*` | Release Candidate | `1.2.0-rc.1`     |
| `hotfix/*`  | Hotfix            | `1.0.1-hotfix.1` |

## Commands

### Quick Commands

```bash
# Feature development
npm run pr:create "feat: feature title" "Description"

# Bug fixes
npm run pr:create "fix: bug title" "Description"

# Documentation
npm run pr:create "docs: update title" "Description"

# Hotfix (to main)
npm run pr:create "fix: critical issue" "Description" main

# Check Git Flow status
npm run flow:status
```

### Manual Release Commands

```bash
# Dry run to test release
npm run release:dry-run

# Force manual release (use carefully)
npm run release
```

## Approval Requirements

### Auto-merge (develop)

- ✅ 1+ approval
- ✅ All checks pass
- ✅ No changes requested
- ✅ Non-draft PR

### Manual approval (main)

- ⚠️ 1+ approval required
- ⚠️ Manual merge required
- ✅ All quality gates must pass
- ✅ Production-ready verification

## Generated Artifacts

### Automatic Generation

- 📄 **CHANGELOG.md** - Semantic release notes
- 🏷️ **Git tags** - Semantic version tags
- 📦 **GitHub releases** - Release pages with notes
- 📊 **Quality reports** - SonarCloud, test coverage

### Manual Artifacts

- 📝 **Release documentation** - Major release guides
- 🚀 **Deployment notes** - Production deployment steps

## Troubleshooting

### Common Issues

#### "PR not auto-merging"

```bash
# Check PR status
gh pr view --json state,mergeable,reviews,statusCheckRollup

# Common causes:
# - Checks still running
# - Changes requested
# - Merge conflicts
# - Auto-merge not enabled
```

#### "Release not generated"

```bash
# Check commit format
git log --oneline -5

# Must use conventional commits:
# ✅ feat(scope): description
# ✅ fix(scope): description
# ❌ "fixed stuff"
# ❌ "update code"
```

#### "Quality gate failed"

```bash
# Run local checks
npm run quality:check

# Common fixes:
npm run lint:fix
npm run format
npm run test
```

### Emergency Procedures

#### Skip automation (emergency only)

```bash
# Skip CI for emergency
git commit -m "fix: emergency patch [skip ci]"

# Manual merge (avoid if possible)
git checkout main
git merge --no-ff feature-branch
git push origin main
```

## Best Practices

### ✅ Do This

- Always branch from `develop` for features
- Use conventional commit messages
- Let automation handle routine tasks
- Review PRs even if auto-merge enabled
- Test locally before pushing

### ❌ Avoid This

- Direct commits to `main` or `develop`
- Bypassing quality checks
- Manual release creation
- Force pushing to shared branches
- Skipping conventional commit format

---

**Git Flow Automation Status**: ✅ **Fully Configured**  
**Auto-merge**: Enabled for develop PRs  
**Auto-release**: Configured for main and develop  
**Quality Gates**: Comprehensive validation pipeline

Transform your development workflow with automated Git Flow - maintain quality while accelerating delivery.
