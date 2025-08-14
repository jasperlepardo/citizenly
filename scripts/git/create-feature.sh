#!/bin/bash

# Feature Branch Creation Script
# Usage: ./scripts/create-feature.sh "feature-name" "Feature description"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required arguments are provided
if [ $# -lt 1 ]; then
    print_error "Usage: $0 <feature-name> [description]"
    print_error "Example: $0 dark-mode-login 'Add dark mode to login screen'"
    exit 1
fi

FEATURE_NAME="$1"
DESCRIPTION="${2:-$FEATURE_NAME}"
BRANCH_NAME="feature/$FEATURE_NAME"

print_status "Creating feature branch workflow..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes!"
    echo "Options:"
    echo "1. Stash changes and create feature branch"
    echo "2. Commit changes first"
    echo "3. Cancel"
    read -p "Choose option (1/2/3): " choice
    
    case $choice in
        1)
            print_status "Stashing changes..."
            git stash push -m "WIP: stashed before creating $BRANCH_NAME"
            ;;
        2)
            print_error "Please commit your changes first, then run this script again."
            exit 1
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

# Get current branch (usually develop)
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    print_error "Branch '$BRANCH_NAME' already exists!"
    exit 1
fi

# Create and switch to feature branch
print_status "Creating feature branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# Restore stashed changes if any
if git stash list | grep -q "WIP: stashed before creating $BRANCH_NAME"; then
    print_status "Restoring stashed changes..."
    git stash pop
fi

print_success "Feature branch '$BRANCH_NAME' created successfully!"
print_status "You're now on branch: $(git branch --show-current)"

# Create initial commit message template
cat > .git/COMMIT_EDITMSG << EOF
feat: $DESCRIPTION

- Add your changes here
- Use conventional commit format
- List specific modifications

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF

print_status "Commit message template created in .git/COMMIT_EDITMSG"
print_status "Next steps:"
echo "  1. Make your changes"
echo "  2. Run: npm run commit (or ./scripts/commit.sh)"
echo "  3. Run: npm run pr (or ./scripts/create-pr.sh)"