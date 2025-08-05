#!/bin/bash

# Pull Request Creation Script
# Usage: ./scripts/create-pr.sh [base-branch]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed!"
    print_error "Install it from: https://github.com/cli/cli#installation"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
BASE_BRANCH="${1:-develop}"

# Check if we're on a feature branch
if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "master" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
    print_error "Cannot create PR from main/master/develop branch!"
    print_error "Please create a feature branch first."
    exit 1
fi

print_status "Current branch: $CURRENT_BRANCH"
print_status "Target branch: $BASE_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes!"
    read -p "Commit them first? (y/N): " commit_confirm
    if [[ $commit_confirm == [yY] ]]; then
        ./scripts/commit.sh
    else
        print_error "Please commit your changes first."
        exit 1
    fi
fi

# Push branch if not already pushed
if ! git ls-remote --exit-code --heads origin $CURRENT_BRANCH > /dev/null 2>&1; then
    print_status "Pushing branch to remote..."
    git push -u origin $CURRENT_BRANCH
else
    print_status "Branch already exists on remote, checking if up to date..."
    git push
fi

# Extract feature name and type from branch
FEATURE_NAME=$(echo $CURRENT_BRANCH | sed 's/feature\///' | sed 's/fix\///' | sed 's/chore\///')
BRANCH_TYPE="feat"
if [[ $CURRENT_BRANCH == fix/* ]]; then
    BRANCH_TYPE="fix"
elif [[ $CURRENT_BRANCH == chore/* ]]; then
    BRANCH_TYPE="chore"
fi

# Get the latest commit message for PR title
LATEST_COMMIT=$(git log -1 --pretty=format:"%s")
PR_TITLE="$LATEST_COMMIT"

# Generate PR description
print_status "Generating PR description..."

# Get commit messages since branching
COMMIT_MESSAGES=$(git log --oneline $BASE_BRANCH..$CURRENT_BRANCH --pretty=format:"• %s")

# Get changed files
CHANGED_FILES=$(git diff --name-only $BASE_BRANCH..$CURRENT_BRANCH)
FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l)

# Generate file change summary
FILE_SUMMARY=""
while IFS= read -r file; do
    if [[ -n "$file" ]]; then
        if [[ $file == *.tsx ]] || [[ $file == *.jsx ]]; then
            FILE_SUMMARY="$FILE_SUMMARY- **$file**: Component updates\n"
        elif [[ $file == *.ts ]] || [[ $file == *.js ]]; then
            FILE_SUMMARY="$FILE_SUMMARY- **$file**: Logic updates\n"
        elif [[ $file == *.css ]] || [[ $file == *.scss ]]; then
            FILE_SUMMARY="$FILE_SUMMARY- **$file**: Styling changes\n"
        else
            FILE_SUMMARY="$FILE_SUMMARY- **$file**: Configuration/other changes\n"
        fi
    fi
done <<< "$CHANGED_FILES"

# Create PR body
PR_BODY="## Summary
Implementation of $FEATURE_NAME with the following changes:

$COMMIT_MESSAGES

## Changes Made ($FILE_COUNT files)
$(echo -e "$FILE_SUMMARY")

## Test Plan
- [ ] Code builds successfully
- [ ] All existing tests pass
- [ ] New functionality works as expected
- [ ] No console errors or warnings
- [ ] Responsive design maintained
- [ ] Accessibility standards met

## Review Notes
Please review the changes and test the functionality before merging.

🤖 Generated with [Claude Code](https://claude.ai/code)"

print_status "PR Details:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Title: $PR_TITLE"
echo "Base: $BASE_BRANCH <- $CURRENT_BRANCH"
echo ""
echo "Description:"
echo "$PR_BODY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Create pull request? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    print_status "PR creation cancelled."
    exit 0
fi

# Create the pull request
print_status "Creating pull request..."
PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base "$BASE_BRANCH" \
    --head "$CURRENT_BRANCH")

print_success "Pull request created successfully!"
print_success "PR URL: $PR_URL"

# Ask about opening in browser
read -p "Open PR in browser? (y/N): " open_confirm
if [[ $open_confirm == [yY] ]]; then
    gh pr view --web
fi

print_status "Next steps:"
echo "  1. Review the PR description and make any necessary edits"
echo "  2. Request reviews from team members"
echo "  3. Wait for CI/CD checks to pass"
echo "  4. Merge when approved"