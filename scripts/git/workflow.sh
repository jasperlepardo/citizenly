#!/bin/bash

# Complete Git Workflow Automation
# Usage: ./scripts/workflow.sh [command] [args...]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

show_help() {
    print_header "Git Workflow Automation"
    echo ""
    echo "Usage: $0 [command] [args...]"
    echo ""
    echo "Commands:"
    echo "  feature <name> [desc]    Create feature branch and setup"
    echo "  commit [type] [desc]     Smart commit with conventional format"
    echo "  pr [base]               Create pull request"
    echo "  complete <name> [desc]   Complete workflow: feature -> commit -> pr"
    echo "  status                  Show current workflow status"
    echo "  cleanup                 Clean up merged branches"
    echo ""
    echo "Examples:"
    echo "  $0 feature dark-mode 'Add dark mode support'"
    echo "  $0 commit feat 'Add login dark mode'"
    echo "  $0 pr develop"
    echo "  $0 complete user-profile 'Add user profile page'"
    echo ""
    echo "Workflow Steps:"
    echo "  1. feature - Creates branch, stashes changes if needed"
    echo "  2. commit  - Stages changes, creates conventional commit"
    echo "  3. pr      - Pushes branch, creates GitHub PR"
}

show_status() {
    print_header "Current Workflow Status"
    
    CURRENT_BRANCH=$(git branch --show-current)
    print_status "Current branch: $CURRENT_BRANCH"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "Uncommitted changes detected"
        git status --porcelain
    else
        print_success "Working directory clean"
    fi
    
    # Check if on feature branch
    if [[ $CURRENT_BRANCH == feature/* ]]; then
        print_status "On feature branch - ready for development"
        
        # Check if branch exists on remote
        if git ls-remote --exit-code --heads origin $CURRENT_BRANCH > /dev/null 2>&1; then
            print_status "Branch exists on remote"
            
            # Check if PR exists
            if command -v gh &> /dev/null; then
                if gh pr list --head $CURRENT_BRANCH --json number | grep -q "number"; then
                    PR_URL=$(gh pr list --head $CURRENT_BRANCH --json url -q '.[0].url')
                    print_status "PR exists: $PR_URL"
                else
                    print_warning "No PR found for this branch"
                fi
            fi
        else
            print_warning "Branch not pushed to remote yet"
        fi
    else
        print_warning "Not on a feature branch - consider creating one"
    fi
    
    # Show recent commits
    echo ""
    print_status "Recent commits:"
    git log --oneline -3
}

cleanup_branches() {
    print_header "Cleaning Up Merged Branches"
    
    # Fetch latest from remote
    print_status "Fetching latest changes..."
    git fetch origin
    
    # Switch to develop if on feature branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ $CURRENT_BRANCH == feature/* ]]; then
        print_status "Switching to develop branch..."
        git checkout develop
    fi
    
    # Update develop
    print_status "Updating develop branch..."
    git pull origin develop
    
    # Find merged branches
    MERGED_BRANCHES=$(git branch --merged develop | grep -E "feature/|fix/|chore/" | grep -v "*" || true)
    
    if [[ -z "$MERGED_BRANCHES" ]]; then
        print_success "No merged feature branches to clean up"
        return
    fi
    
    print_status "Found merged branches:"
    echo "$MERGED_BRANCHES"
    
    read -p "Delete these local branches? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        while IFS= read -r branch; do
            if [[ -n "$branch" ]]; then
                branch=$(echo "$branch" | xargs) # trim whitespace
                print_status "Deleting branch: $branch"
                git branch -d "$branch"
            fi
        done <<< "$MERGED_BRANCHES"
        print_success "Local branches cleaned up"
    fi
}

complete_workflow() {
    if [ $# -lt 1 ]; then
        print_error "Usage: $0 complete <feature-name> [description]"
        exit 1
    fi
    
    FEATURE_NAME="$1"
    DESCRIPTION="${2:-$FEATURE_NAME}"
    
    print_header "Complete Workflow: $FEATURE_NAME"
    
    # Step 1: Create feature branch
    print_status "Step 1: Creating feature branch..."
    ./scripts/create-feature.sh "$FEATURE_NAME" "$DESCRIPTION"
    
    print_status "Feature branch created. Make your changes now..."
    read -p "Press Enter when you're ready to commit..."
    
    # Step 2: Commit changes
    print_status "Step 2: Committing changes..."
    ./scripts/commit.sh "feat" "$DESCRIPTION"
    
    # Step 3: Create PR
    print_status "Step 3: Creating pull request..."
    ./scripts/create-pr.sh
    
    print_success "Complete workflow finished!"
}

# Make scripts executable
chmod +x scripts/*.sh

# Main command handling
case "${1:-help}" in
    feature)
        shift
        print_header "Creating Feature Branch"
        ./scripts/create-feature.sh "$@"
        ;;
    commit)
        shift
        print_header "Creating Commit"
        ./scripts/commit.sh "$@"
        ;;
    pr)
        shift
        print_header "Creating Pull Request"
        ./scripts/create-pr.sh "$@"
        ;;
    complete)
        shift
        complete_workflow "$@"
        ;;
    status)
        show_status
        ;;
    cleanup)
        cleanup_branches
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac