#!/bin/bash

# Smart Commit Script with Conventional Commits
# Usage: ./scripts/commit.sh [type] [description]

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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check for staged changes
if git diff --cached --quiet; then
    print_warning "No staged changes found!"
    echo "Would you like to:"
    echo "1. Stage all changes (git add .)"
    echo "2. Stage specific files interactively"
    echo "3. Cancel"
    read -p "Choose option (1/2/3): " choice
    
    case $choice in
        1)
            print_status "Staging all changes..."
            git add .
            ;;
        2)
            print_status "Opening interactive staging..."
            git add -i
            ;;
        3)
            print_status "Cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid option."
            exit 1
            ;;
    esac
fi

# Get commit type and description
if [ $# -ge 2 ]; then
    COMMIT_TYPE="$1"
    COMMIT_DESC="$2"
else
    echo "Conventional Commit Types:"
    echo "  feat     - New feature"
    echo "  fix      - Bug fix"
    echo "  docs     - Documentation"
    echo "  style    - Code style changes"
    echo "  refactor - Code refactoring"
    echo "  test     - Adding tests"
    echo "  chore    - Maintenance tasks"
    echo ""
    read -p "Enter commit type: " COMMIT_TYPE
    read -p "Enter commit description: " COMMIT_DESC
fi

# Validate commit type
case $COMMIT_TYPE in
    feat|fix|docs|style|refactor|test|chore)
        ;;
    *)
        print_error "Invalid commit type: $COMMIT_TYPE"
        print_error "Valid types: feat, fix, docs, style, refactor, test, chore"
        exit 1
        ;;
esac

# Get current branch name for context
BRANCH_NAME=$(git branch --show-current)
FEATURE_CONTEXT=""
if [[ $BRANCH_NAME == feature/* ]]; then
    FEATURE_CONTEXT=$(echo $BRANCH_NAME | sed 's/feature\///' | tr '-' ' ')
fi

# Create detailed commit message
print_status "Creating commit message..."

# Get list of changed files for context
CHANGED_FILES=$(git diff --cached --name-only | head -5)
FILE_LIST=""
while IFS= read -r file; do
    if [[ -n "$file" ]]; then
        FILE_LIST="$FILE_LIST- Update $file\n"
    fi
done <<< "$CHANGED_FILES"

# Build commit message
COMMIT_MESSAGE="$COMMIT_TYPE: $COMMIT_DESC

$(echo -e "$FILE_LIST")
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

print_status "Commit message preview:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$COMMIT_MESSAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Proceed with commit? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    print_status "Commit cancelled."
    exit 0
fi

# Create the commit
print_status "Creating commit..."
git commit -m "$COMMIT_MESSAGE"

print_success "Commit created successfully!"
print_status "Recent commits:"
git log --oneline -3

# Ask about pushing
if git rev-parse --abbrev-ref --symbolic-full-name @{u} > /dev/null 2>&1; then
    read -p "Push to remote? (y/N): " push_confirm
    if [[ $push_confirm == [yY] ]]; then
        print_status "Pushing to remote..."
        git push
        print_success "Pushed to remote successfully!"
    fi
else
    print_warning "No upstream branch set. Use 'git push -u origin $BRANCH_NAME' to push and set upstream."
fi