#!/bin/bash

# Script to create PR with auto-merge enabled following Git Flow
# Usage: ./scripts/create-pr.sh "PR Title" "PR Description" [target-branch]

set -e

TITLE="$1"
DESCRIPTION="$2"
TARGET_BRANCH="${3:-develop}"  # Default to develop for Git Flow
CURRENT_BRANCH=$(git branch --show-current)

# Validate we're not on protected branches
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "develop" ]; then
    echo "❌ Cannot create PR from $CURRENT_BRANCH branch"
    echo "Please create a feature branch first:"
    echo ""
    echo "  git checkout develop"
    echo "  git checkout -b feature/scope/description"
    echo ""
    echo "Branch naming examples:"
    echo "  - feature/auth/user-registration"
    echo "  - bugfix/forms/validation-errors"
    echo "  - docs/api/endpoint-documentation"
    exit 1
fi

if [ -z "$TITLE" ]; then
    echo "❌ PR title is required"
    echo "Usage: $0 \"PR Title\" \"PR Description\" [target-branch]"
    echo ""
    echo "Examples:"
    echo "  $0 \"feat: add user authentication\" \"Implement login/logout functionality\""
    echo "  $0 \"fix: resolve form validation\" \"Fix validation errors\" main"
    exit 1
fi

# Validate target branch for Git Flow
if [ "$TARGET_BRANCH" = "main" ]; then
    echo "⚠️  Creating PR to main branch"
    echo "Git Flow recommends:"
    echo "  - Features → develop"
    echo "  - Releases → main"
    echo "  - Hotfixes → main"
    echo ""
    read -p "Continue with main as target? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled. Use 'develop' as target or specify explicitly:"
        echo "  $0 \"$TITLE\" \"$DESCRIPTION\" develop"
        exit 1
    fi
fi

# Ensure branch is pushed
echo "📤 Pushing current branch..."
git push -u origin "$CURRENT_BRANCH"

# Create PR using GitHub CLI
echo "📋 Creating pull request..."
if command -v gh &> /dev/null; then
    # Use GitHub CLI if available
    PR_URL=$(gh pr create \
        --title "$TITLE" \
        --body "$DESCRIPTION" \
        --base "$TARGET_BRANCH" \
        --head "$CURRENT_BRANCH")
    
    echo "✅ PR created: $PR_URL"
    
    # Enable auto-merge if targeting develop (Git Flow)
    if [ "$TARGET_BRANCH" = "develop" ]; then
        echo "🤖 Enabling auto-merge for Git Flow..."
        gh pr merge --auto --squash
        
        echo "✅ Auto-merge enabled - PR will merge automatically when:"
        echo "   - All status checks pass"
        echo "   - Required approvals received" 
        echo "   - No changes requested"
        echo "   - Targeting develop branch (Git Flow)"
    else
        echo "ℹ️  Auto-merge not enabled for $TARGET_BRANCH"
        echo "Manual merge required for production releases"
    fi
    
else
    echo "⚠️  GitHub CLI not installed"
    echo "Please create PR manually at:"
    echo "https://github.com/jasperlepardo/citizenly/compare/$TARGET_BRANCH...$CURRENT_BRANCH"
    echo ""
    echo "PR Title: $TITLE"
    echo "PR Description: $DESCRIPTION"
    echo "Target Branch: $TARGET_BRANCH"
fi