#!/bin/bash

# Git Flow Helper Scripts for Citizenly Project
# Provides convenient commands for Git Flow operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Ensure we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Function to start a feature branch
start_feature() {
    local feature_name="$1"
    if [ -z "$feature_name" ]; then
        print_error "Feature name is required"
        echo "Usage: $0 start-feature <feature-name>"
        exit 1
    fi
    
    print_info "Starting feature: $feature_name"
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$feature_name"
    git push -u origin "feature/$feature_name"
    print_success "Feature branch 'feature/$feature_name' created and pushed"
}

# Function to finish a feature branch
finish_feature() {
    local current_branch=$(git branch --show-current)
    if [[ ! $current_branch =~ ^feature/ ]]; then
        print_error "Not on a feature branch"
        exit 1
    fi
    
    local feature_name=${current_branch#feature/}
    print_info "Finishing feature: $feature_name"
    
    # Run security checks
    if [ -f "./scripts/security-check.sh" ]; then
        print_info "Running security checks..."
        ./scripts/security-check.sh
    fi
    
    # Push current changes
    git push origin "$current_branch"
    
    # Create PR message
    echo "🚀 **Feature: $feature_name**

## Changes
- [Brief description of changes]

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass  
- [ ] Security checks pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Ready for review

This feature will be merged into \`develop\` for beta testing." > /tmp/pr_body.txt
    
    print_success "Feature ready! Create a PR from feature/$feature_name to develop"
    print_info "Suggested PR body saved to /tmp/pr_body.txt"
}

# Function to start a release branch
start_release() {
    local version="$1"
    if [ -z "$version" ]; then
        print_error "Version is required"
        echo "Usage: $0 start-release <version>"
        exit 1
    fi
    
    print_info "Starting release: $version"
    git checkout develop
    git pull origin develop
    git checkout -b "release/$version"
    git push -u origin "release/$version"
    print_success "Release branch 'release/$version' created and pushed"
}

# Function to finish a release branch
finish_release() {
    local current_branch=$(git branch --show-current)
    if [[ ! $current_branch =~ ^release/ ]]; then
        print_error "Not on a release branch"
        exit 1
    fi
    
    local version=${current_branch#release/}
    print_info "Finishing release: $version"
    
    # Run all checks
    print_info "Running full test suite..."
    npm run security:check
    npm run test:ci
    npm run type-check
    npm run lint
    npm run build
    
    print_success "Release $version is ready!"
    print_info "Create PRs:"
    print_info "1. release/$version → main (production release)"
    print_info "2. release/$version → develop (merge back)"
}

# Function to start a hotfix branch
start_hotfix() {
    local version="$1"
    if [ -z "$version" ]; then
        print_error "Hotfix version is required"
        echo "Usage: $0 start-hotfix <version>"
        exit 1
    fi
    
    print_info "Starting hotfix: $version"
    git checkout main
    git pull origin main
    git checkout -b "hotfix/$version"
    git push -u origin "hotfix/$version"
    print_success "Hotfix branch 'hotfix/$version' created and pushed"
}

# Function to show Git Flow status
status() {
    print_info "Git Flow Status"
    echo ""
    
    local current_branch=$(git branch --show-current)
    echo "Current branch: $current_branch"
    echo ""
    
    echo "Branch structure:"
    git branch -a | grep -E "(main|develop|feature/|release/|hotfix/)" | sort
    echo ""
    
    echo "Recent commits:"
    git log --oneline -5
}

# Main script logic
case "$1" in
    "start-feature")
        start_feature "$2"
        ;;
    "finish-feature")
        finish_feature
        ;;
    "start-release")
        start_release "$2"
        ;;
    "finish-release")
        finish_release
        ;;
    "start-hotfix")
        start_hotfix "$2"
        ;;
    "status")
        status
        ;;
    *)
        echo "Git Flow Helper for Citizenly"
        echo ""
        echo "Usage: $0 <command> [arguments]"
        echo ""
        echo "Commands:"
        echo "  start-feature <name>    Start a new feature branch"
        echo "  finish-feature          Finish current feature branch"
        echo "  start-release <version> Start a new release branch"
        echo "  finish-release          Finish current release branch"
        echo "  start-hotfix <version>  Start a new hotfix branch"
        echo "  status                  Show Git Flow status"
        echo ""
        echo "Examples:"
        echo "  $0 start-feature user-authentication"
        echo "  $0 start-release 1.2.0"
        echo "  $0 start-hotfix 1.1.1"
        ;;
esac