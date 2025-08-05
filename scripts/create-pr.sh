#!/bin/bash

# Script to create PR with auto-merge enabled
# Usage: ./scripts/create-pr.sh "PR Title" "PR Description"

set -e

TITLE="$1"
DESCRIPTION="$2"
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "❌ Cannot create PR from main branch"
    echo "Please create a feature branch first"
    exit 1
fi

if [ -z "$TITLE" ]; then
    echo "❌ PR title is required"
    echo "Usage: $0 \"PR Title\" \"PR Description\""
    exit 1
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
        --base main \
        --head "$CURRENT_BRANCH")
    
    echo "✅ PR created: $PR_URL"
    
    # Enable auto-merge if all checks pass
    echo "🤖 Enabling auto-merge..."
    gh pr merge --auto --squash
    
    echo "✅ Auto-merge enabled - PR will merge automatically when:"
    echo "   - All status checks pass"
    echo "   - Required approvals received" 
    echo "   - No changes requested"
    
else
    echo "⚠️  GitHub CLI not installed"
    echo "Please create PR manually at:"
    echo "https://github.com/jasperlepardo/citizenly/compare/main...$CURRENT_BRANCH"
    echo ""
    echo "PR Title: $TITLE"
    echo "PR Description: $DESCRIPTION"
fi