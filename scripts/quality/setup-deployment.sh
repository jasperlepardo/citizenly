#!/bin/bash

# Deployment Setup Script
# Helps configure automated deployment for both main app and Storybook

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
    print_header "Deployment Setup Helper"
    echo ""
    echo "This script helps you set up automated deployment for:"
    echo "  • Main Next.js app (citizenly.co)"
    echo "  • Storybook component library"
    echo ""
    echo "Commands:"
    echo "  setup     - Interactive setup of deployment configuration"
    echo "  secrets   - Display GitHub secrets that need to be configured"
    echo "  status    - Check current deployment status"
    echo "  test      - Test deployment configurations"
    echo ""
}

get_vercel_info() {
    print_header "Gathering Vercel Information"
    
    # Check if user is logged in to Vercel
    if ! vercel whoami > /dev/null 2>&1; then
        print_warning "Not logged in to Vercel CLI"
        echo "Please run: vercel login"
        return 1
    fi
    
    print_success "Logged in to Vercel as: $(vercel whoami)"
    
    # Get organization ID
    if [ -f ".vercel/project.json" ]; then
        ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
        PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
        print_status "Main project ID: $PROJECT_ID"
        print_status "Organization ID: $ORG_ID"
    else
        print_warning "No .vercel/project.json found. Please link your project first."
        echo "Run: vercel link"
        return 1
    fi
    
    # List projects to find Storybook project
    print_status "Finding Storybook project..."
    vercel projects list | grep -E "(citizenly-storybook|storybook)"
    
    echo ""
    print_status "To get your Vercel token:"
    echo "  1. Go to: https://vercel.com/account/tokens"
    echo "  2. Create a new token"
    echo "  3. Copy the token value"
}

show_secrets() {
    print_header "Required GitHub Secrets"
    
    get_vercel_info
    
    echo ""
    print_status "Add these secrets to your GitHub repository:"
    echo "  Repository → Settings → Secrets and Variables → Actions"
    echo ""
    echo "Required secrets:"
    echo "  VERCEL_TOKEN              = <your-vercel-token>"
    echo "  VERCEL_ORG_ID             = $ORG_ID"
    echo "  VERCEL_STORYBOOK_PROJECT_ID = <storybook-project-id>"
    echo ""
    print_warning "You need to find the Storybook project ID from the projects list above"
}

check_status() {
    print_header "Deployment Status Check"
    
    # Check GitHub Actions
    if command -v gh &> /dev/null; then
        print_status "Recent workflow runs:"
        gh run list --limit 5
        echo ""
    else
        print_warning "GitHub CLI not installed. Install with: brew install gh"
    fi
    
    # Check Vercel deployments
    print_status "Recent Vercel deployments:"
    vercel ls | head -10
    echo ""
    
    # Check project linking
    if [ -f ".vercel/project.json" ]; then
        PROJECT_NAME=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*' | cut -d'"' -f4)
        print_success "Linked to Vercel project: $PROJECT_NAME"
    else
        print_error "Not linked to Vercel project"
    fi
    
    # Check configuration files
    print_status "Configuration files:"
    if [ -f "vercel.json" ]; then
        print_success "✓ vercel.json (main app config)"
    else
        print_error "✗ vercel.json missing"
    fi
    
    if [ -f "vercel-storybook.json" ]; then
        print_success "✓ vercel-storybook.json (storybook config)"
    else
        print_error "✗ vercel-storybook.json missing"
    fi
    
    if [ -f ".github/workflows/deploy-storybook.yml" ]; then
        print_success "✓ Storybook deployment workflow"
    else
        print_error "✗ Storybook deployment workflow missing"
    fi
}

test_configs() {
    print_header "Testing Deployment Configurations"
    
    # Test main app build
    print_status "Testing main app build..."
    if npm run build > /dev/null 2>&1; then
        print_success "✓ Main app builds successfully"
    else
        print_error "✗ Main app build failed"
        echo "Run 'npm run build' to see detailed errors"
    fi
    
    # Test Storybook build
    print_status "Testing Storybook build..."
    if npm run build-storybook > /dev/null 2>&1; then
        print_success "✓ Storybook builds successfully"
    else
        print_error "✗ Storybook build failed"
        echo "Run 'npm run build-storybook' to see detailed errors"
    fi
    
    # Test Vercel configurations
    print_status "Validating Vercel configurations..."
    
    if vercel --local-config vercel.json --confirm > /dev/null 2>&1; then
        print_success "✓ Main app Vercel config valid"
    else
        print_error "✗ Main app Vercel config invalid"
    fi
    
    if vercel --local-config vercel-storybook.json --confirm > /dev/null 2>&1; then
        print_success "✓ Storybook Vercel config valid"
    else
        print_error "✗ Storybook Vercel config invalid"
    fi
}

interactive_setup() {
    print_header "Interactive Deployment Setup"
    
    echo "This will guide you through setting up automated deployment."
    echo ""
    
    # Step 1: Check prerequisites
    print_status "Step 1: Checking prerequisites..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not installed. Install with: npm i -g vercel"
        return 1
    fi
    
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI not installed. Some features will be limited."
        echo "Install with: brew install gh"
    fi
    
    # Step 2: Vercel setup
    print_status "Step 2: Vercel setup..."
    get_vercel_info
    
    # Step 3: GitHub secrets
    print_status "Step 3: GitHub secrets setup..."
    show_secrets
    
    echo ""
    read -p "Have you added the GitHub secrets? (y/N): " secrets_added
    if [[ $secrets_added != [yY] ]]; then
        print_warning "Please add the GitHub secrets before proceeding."
        echo "Rerun this script when ready."
        return 0
    fi
    
    # Step 4: Test configurations
    print_status "Step 4: Testing configurations..."
    test_configs
    
    # Step 5: Deploy test
    echo ""
    read -p "Would you like to trigger a test deployment? (y/N): " test_deploy
    if [[ $test_deploy == [yY] ]]; then
        print_status "Triggering test deployment..."
        if command -v gh &> /dev/null; then
            gh workflow run deploy-storybook.yml
            print_success "Storybook deployment triggered!"
            echo "Check: https://github.com/$(gh repo view --json owner,name -q '.owner.login + \"/\" + .name')/actions"
        else
            print_warning "GitHub CLI not available. Please manually trigger the deployment workflow."
        fi
    fi
    
    print_success "Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Monitor the deployment in GitHub Actions"
    echo "  2. Check that both sites are accessible"
    echo "  3. Test automatic deployment by making component changes"
}

# Main command handling
case "${1:-help}" in
    setup)
        interactive_setup
        ;;
    secrets)
        show_secrets
        ;;
    status)
        check_status
        ;;
    test)
        test_configs
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