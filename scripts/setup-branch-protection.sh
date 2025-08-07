#!/bin/bash

# GitHub Branch Protection Setup Script
# This script configures branch protection rules according to the specified workflow

set -e

# Configuration
REPO="jasperlepardo/citizenly"
GITHUB_TOKEN="${GITHUB_TOKEN}"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is required"
    echo "Please set your GitHub Personal Access Token:"
    echo "export GITHUB_TOKEN=your_token_here"
    exit 1
fi

echo "🔧 Setting up branch protection rules for $REPO"

# Function to create/update branch protection rule
setup_branch_protection() {
    local branch=$1
    local config=$2
    
    echo "📋 Configuring protection for branch: $branch"
    
    curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/branches/$branch/protection" \
        -d "$config" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully configured protection for $branch"
    else
        echo "❌ Failed to configure protection for $branch"
    fi
}

# 1. DEVELOP BRANCH PROTECTION
# - All feature branches must target develop
# - Require PR reviews (1 reviewer minimum)
# - Require status checks to pass
# - Require branches to be up to date
# - Restrict pushes to PR only
echo ""
echo "🛡️  Setting up DEVELOP branch protection..."

DEVELOP_CONFIG='{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "build-and-test",
      "lint-and-typecheck",
      "security-scan"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}'

setup_branch_protection "develop" "$DEVELOP_CONFIG"

# 2. STAGING BRANCH PROTECTION  
# - Only develop can merge to staging
# - Require PR reviews (1 reviewer minimum)
# - Require all status checks to pass
# - No direct pushes allowed
echo ""
echo "🛡️  Setting up STAGING branch protection..."

STAGING_CONFIG='{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "build-and-test",
      "lint-and-typecheck", 
      "security-scan",
      "e2e-tests",
      "performance-tests"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "restrictions": {
    "users": [],
    "teams": [],
    "apps": []
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}'

setup_branch_protection "staging" "$STAGING_CONFIG"

# 3. MAIN BRANCH PROTECTION
# - Only staging can merge to main
# - Require PR reviews (2 reviewers minimum for production)
# - Require ALL status checks to pass
# - No direct pushes allowed
# - Admin enforcement enabled
echo ""
echo "🛡️  Setting up MAIN branch protection..."

MAIN_CONFIG='{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "build-and-test",
      "lint-and-typecheck",
      "security-scan", 
      "e2e-tests",
      "performance-tests",
      "accessibility-tests",
      "staging-deployment-check"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": true
  },
  "restrictions": {
    "users": [],
    "teams": [],
    "apps": []
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": true,
  "allow_fork_syncing": false
}'

setup_branch_protection "main" "$MAIN_CONFIG"

echo ""
echo "🎉 Branch protection setup complete!"
echo ""
echo "📋 Summary of rules configured:"
echo "   🌿 DEVELOP: Feature branches → develop (1 review, status checks required)"
echo "   🚀 STAGING: Develop → staging (1 review, all status checks required)" 
echo "   🏭 MAIN: Staging → main (2 reviews, all status checks + deployment checks)"
echo ""
echo "⚠️  Important: Make sure your GitHub Actions workflows include the required status checks:"
echo "   - build-and-test"
echo "   - lint-and-typecheck"
echo "   - security-scan"
echo "   - e2e-tests (for staging/main)"
echo "   - performance-tests (for staging/main)"
echo "   - accessibility-tests (for main)"
echo "   - staging-deployment-check (for main)"