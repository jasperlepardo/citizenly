#!/bin/bash

# Git Branch Creation Helper Script
# Enforces naming conventions and proper workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${BLUE}Git Branch Creation Helper${NC}"
    echo ""
    echo "Usage: $0 <type> <description> [ticket-id]"
    echo ""
    echo -e "${YELLOW}Types:${NC}"
    echo "  feature  - New feature development"
    echo "  fix      - Bug fixes"
    echo "  hotfix   - Critical production fixes"
    echo "  chore    - Maintenance tasks"
    echo "  docs     - Documentation updates"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 feature user-authentication AUTH-123"
    echo "  $0 fix csrf-validation BUG-456"
    echo "  $0 hotfix security-patch CRIT-001"
    echo "  $0 chore update-dependencies"
    echo "  $0 docs update-readme"
    echo ""
    exit 1
}

# Validate inputs
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ Error: Insufficient arguments${NC}"
    show_usage
fi

TYPE=$1
DESCRIPTION=$2
TICKET_ID=$3

# Validate branch type
case $TYPE in
    feature|fix|hotfix|chore|docs)
        ;;
    *)
        echo -e "${RED}❌ Error: Invalid branch type '$TYPE'${NC}"
        echo -e "${YELLOW}Valid types: feature, fix, hotfix, chore, docs${NC}"
        exit 1
        ;;
esac

# Validate description
if [[ ! $DESCRIPTION =~ ^[a-z0-9-]+$ ]]; then
    echo -e "${RED}❌ Error: Description must contain only lowercase letters, numbers, and hyphens${NC}"
    echo -e "${YELLOW}Example: 'user-authentication', 'csrf-validation'${NC}"
    exit 1
fi

# Build branch name
if [ -n "$TICKET_ID" ]; then
    BRANCH_NAME="${TYPE}/${TICKET_ID}-${DESCRIPTION}"
else
    BRANCH_NAME="${TYPE}/${DESCRIPTION}"
fi

# Validate we're on develop branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo -e "${YELLOW}⚠️  Warning: You are not on the 'develop' branch (currently on '$CURRENT_BRANCH')${NC}"
    echo -e "${BLUE}Switching to develop and pulling latest changes...${NC}"
    git checkout develop
    git pull origin develop
fi

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo -e "${RED}❌ Error: Branch '$BRANCH_NAME' already exists locally${NC}"
    exit 1
fi

if git show-ref --verify --quiet refs/remotes/origin/$BRANCH_NAME; then
    echo -e "${RED}❌ Error: Branch '$BRANCH_NAME' already exists on remote${NC}"
    exit 1
fi

# Create the branch
echo -e "${BLUE}🌿 Creating branch: ${GREEN}$BRANCH_NAME${NC}"
git checkout -b "$BRANCH_NAME"

# Show next steps
echo ""
echo -e "${GREEN}✅ Branch created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Make your changes"
echo "  2. Commit with conventional format:"
echo -e "     ${BLUE}git commit -m \"${TYPE}: <description>\"${NC}"
echo "  3. Push the branch:"
echo -e "     ${BLUE}git push -u origin $BRANCH_NAME${NC}"
echo "  4. Create PR to develop with title:"

# Suggest PR title based on type
case $TYPE in
    feature)
        echo -e "     ${BLUE}feat: <description of the feature>${NC}"
        ;;
    fix)
        echo -e "     ${BLUE}fix: <description of the fix>${NC}"
        ;;
    hotfix)
        echo -e "     ${BLUE}fix: <critical issue description>${NC}"
        ;;
    chore)
        echo -e "     ${BLUE}chore: <maintenance task description>${NC}"
        ;;
    docs)
        echo -e "     ${BLUE}docs: <documentation change description>${NC}"
        ;;
esac

echo ""
echo -e "${YELLOW}Remember:${NC}"
echo "  - All feature/fix branches must target 'develop'"
echo "  - Follow conventional commit format"
echo "  - Ensure status checks pass before merging"
echo ""