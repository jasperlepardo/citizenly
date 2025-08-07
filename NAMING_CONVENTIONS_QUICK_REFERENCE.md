# Naming Conventions - Quick Reference

## 🌿 Branch Names

### Format: `type/ticket-id-description` or `type/description`

**Feature Branches**

- `feature/AUTH-123-user-login`
- `feature/DASH-456-environment-indicator`
- `feature/UI-789-dark-mode-toggle`

**Bug Fix Branches**

- `fix/BUG-101-csrf-secret-validation`
- `fix/BUG-202-storybook-deployment`
- `fix/BUG-303-navigation-breadcrumbs`

**Hotfix Branches**

- `hotfix/CRIT-001-security-vulnerability`
- `hotfix/CRIT-002-payment-gateway-down`

**Chore/Maintenance**

- `chore/update-dependencies`
- `chore/setup-ci-pipeline`

**Documentation**

- `docs/update-readme`
- `docs/api-documentation`

## 🏷️ PR Titles

### Feature/Fix PRs → develop

- `feat: implement environment indicator in dashboard`
- `fix: resolve CSRF secret validation error`
- `chore: update TypeScript configuration`
- `docs: update installation instructions`

### Release PRs

**develop → staging**

- `Release: v1.2.0 - Authentication Features Sprint`
- `Release: v1.1.5 - Bug Fixes and Improvements`

**staging → main**

- `Production Release: v1.2.0`
- `Production Release: v1.1.5`

## 💬 Commit Messages

### Format: `type(scope): description`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples**:

```
feat(auth): implement user login with OAuth
fix(dashboard): resolve environment indicator display issue
docs(readme): update installation instructions
chore(deps): update Next.js to v14.2.0
test(api): add unit tests for authentication service
```

## 📦 Releases & Tags

### Version Numbers (SemVer)

- `v1.0.0` - Initial release
- `v1.1.0` - Feature release
- `v1.1.1` - Patch release
- `v2.0.0` - Major release (breaking changes)

### Pre-releases

- `v1.2.0-alpha.1` - Alpha
- `v1.2.0-beta.2` - Beta
- `v1.2.0-rc.1` - Release Candidate

## 🔄 Workflow Rules

### Allowed Flows

- ✅ `feature/fix/chore` → `develop`
- ✅ `develop` → `staging`
- ✅ `staging` → `main`

### Forbidden Flows

- ❌ `feature/fix` → `staging`
- ❌ `feature/fix` → `main`
- ❌ `develop` → `main`
- ❌ Direct pushes to protected branches

## 🛠️ Helper Commands

### Create Branch (Using Helper Script)

```bash
# Feature branch
npm run new-feature user-authentication "User authentication feature"

# Bug fix
npm run new-feature csrf-validation "Fix CSRF validation bug"

# Chore
npm run new-feature update-dependencies "Update project dependencies"
```

### Manual Branch Creation

```bash
# Ensure you're on develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/AUTH-123-user-login

# Create fix branch
git checkout -b fix/BUG-456-csrf-validation
```

### Conventional Commits

```bash
# Feature commit
git commit -m "feat(auth): add OAuth login component"

# Fix commit
git commit -m "fix(csrf): resolve validation error in production"

# Chore commit
git commit -m "chore(deps): update React to v18.3.0"
```

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong Branch Names

- `dev` → Use `develop`
- `stage` → Use `staging`
- `master` → Use `main`
- `feature-auth` → Use `feature/auth-implementation`

### ❌ Wrong PR Titles

- "Updates" → Use `feat: implement user dashboard`
- "Bug fixes" → Use `fix: resolve login validation error`
- "WIP" → Don't merge work in progress

### ❌ Wrong Workflow

- Feature → Staging → Use Feature → Develop → Staging
- Develop → Main → Use Develop → Staging → Main

## 📋 Status Checks Required

### develop merges

- build-and-test
- lint-and-typecheck
- security-scan

### staging merges

- All develop checks +
- e2e-tests
- performance-tests

### main merges

- All staging checks +
- accessibility-tests
- staging-deployment-check

---

💡 **Tip**: Use `npm run new-feature <name> "<description>"` to automatically create properly named branches!
