# Branch Protection Setup Guide

Since this is a private repository, branch protection rules must be configured manually in the GitHub web interface.

## ⚠️ CRITICAL: Manual Setup Required

**You MUST configure these branch protection rules to enforce the Git Flow strategy.**

## Step-by-Step Instructions

### 1. Access Repository Settings

1. Go to https://github.com/jasperlepardo/citizenly
2. Click **Settings** tab
3. Click **Branches** in the left sidebar

### 2. Protect Main Branch (PRODUCTION)

Click **Add rule** and configure:

**Branch name pattern:** `main`

**Settings to Enable:**

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **2**
  - ✅ Dismiss stale PR reviews when new commits are pushed
  - ✅ Require review from code owners
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks required:
    - `Vercel Build Check`
    - `Pull Request Checks`
    - `SonarCloud Analysis`
    - `Bundle Analysis`
- ✅ **Require linear history**
- ✅ **Require deployments to succeed before merging**
- ✅ **Restrict pushes that create new files**
- ✅ **Do not allow bypassing the above settings**

### 3. Protect Staging Branch (TESTING)

Click **Add rule** and configure:

**Branch name pattern:** `staging`

**Settings to Enable:**

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale PR reviews when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks required:
    - `Vercel Build Check`
    - `Pull Request Checks`
    - `SonarCloud Analysis`
- ✅ **Do not allow bypassing the above settings**

### 4. Protect Develop Branch (INTEGRATION)

Click **Add rule** and configure:

**Branch name pattern:** `develop`

**Settings to Enable:**

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale PR reviews when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks required:
    - `Vercel Build Check`
    - `Pull Request Checks`
    - `SonarCloud Analysis`
- ✅ **Allow squash merging** (for cleaner history)

### 5. Verify Configuration

After setup, verify that:

1. **Main branch** shows "Protected" badge
2. **Staging branch** shows "Protected" badge
3. **Develop branch** shows "Protected" badge
4. Test creating a PR directly to main - it should be blocked or require admin override

## 🚨 Enforcement Strategy

### What These Rules Prevent

- ❌ Direct pushes to protected branches
- ❌ Merging without code review
- ❌ Merging with failing tests
- ❌ Bypassing CI/CD checks
- ❌ Force pushing to protected branches

### What These Rules Enforce

- ✅ All changes go through pull requests
- ✅ Code review requirements
- ✅ Automated testing before merge
- ✅ Clean, linear Git history
- ✅ Proper Git Flow: feature → develop → staging → main

## 🛡️ Additional Security

### Repository Settings

Also configure these in Settings → General:

- ✅ **Restrict creation of public forks**
- ✅ **Automatically delete head branches** (after PR merge)
- ✅ **Allow squash merging**
- ✅ **Allow rebase merging**
- ❌ **Allow merge commits** (disable for cleaner history)

### Required Status Checks

Make sure these GitHub Actions are configured as required checks:

- `Vercel Build Check` - Ensures builds succeed
- `Pull Request Checks` - Runs full test suite
- `SonarCloud Analysis` - Code quality and security
- `Bundle Analysis` - Performance monitoring
- `Automated Code Review` - Additional code review

## 🔍 Testing the Setup

### Test 1: Direct Push Prevention

```bash
git checkout main
git commit --allow-empty -m "test: should fail"
git push origin main
# Should be rejected
```

### Test 2: PR Review Requirement

1. Create a feature branch
2. Create PR to main
3. Try to merge without reviews
4. Should require configured number of approvals

### Test 3: Status Check Requirement

1. Create PR with failing tests
2. Try to merge
3. Should be blocked until all checks pass

## 📝 Documentation Updates

After configuring branch protection:

1. Update team documentation about the new rules
2. Inform all contributors about the Git Flow requirements
3. Update CI/CD pipelines if needed
4. Consider creating a `.github/CONTRIBUTING.md` file

## 🆘 Troubleshooting

### Common Issues

**Issue:** "Required status check not found"

- **Solution:** Ensure GitHub Actions workflow names match exactly

**Issue:** "Branch protection rule not applying"

- **Solution:** Check branch name patterns and verify rule is active

**Issue:** "Admin can bypass but shouldn't"

- **Solution:** Enable "Do not allow bypassing" for all rules

**Issue:** "PRs to main still allowed"

- **Solution:** Verify branch protection rules are saved and active

## 🎯 Success Criteria

Branch protection is properly configured when:

- ✅ No direct pushes to main/staging/develop are possible
- ✅ All PRs require appropriate reviews
- ✅ All CI/CD checks must pass before merge
- ✅ Git Flow is enforced: feature → develop → staging → main
- ✅ Administrators cannot bypass rules (unless explicitly needed)

---

**⚡ Quick Setup:** Follow steps 1-4 above, then test with step 5 to ensure everything works correctly.
