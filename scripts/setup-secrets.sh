#!/bin/bash

# GitHub Secrets Setup Script
# Automates the setup of GitHub secrets for Vercel deployment

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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check GitHub CLI
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI not installed. Install with: brew install gh"
        return 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI. Run: gh auth login"
        return 1
    fi
    
    print_success "GitHub CLI is authenticated"
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not installed. Install with: npm i -g vercel"
        return 1
    fi
    
    # Check if logged into Vercel
    if ! vercel whoami &> /dev/null; then
        print_error "Not logged into Vercel CLI. Run: vercel login"
        return 1
    fi
    
    print_success "Vercel CLI is authenticated"
    
    return 0
}

# Display the values we know
show_known_values() {
    print_header "Known Values"
    
    echo "✅ Organization ID: team_ECQY2ysqMz8q0PWlhjmjOzEo"
    echo "✅ Storybook Project ID: prj_bYx8cnaZ3hxpvN6DKFnv48u38vmW"
    echo "❓ Vercel Token: Need to create"
    echo ""
}

# Guide user to create Vercel token
get_vercel_token() {
    print_header "Creating Vercel Token"
    
    echo "You need to create a Vercel API token:"
    echo ""
    echo "1. Go to: https://vercel.com/account/tokens"
    echo "2. Click 'Create Token'"
    echo "3. Name it: 'GitHub Actions - Citizenly'"
    echo "4. Select scope: 'Full Account'"
    echo "5. Click 'Create Token'"
    echo "6. Copy the token (it starts with 'vercel_')"
    echo ""
    
    read -p "Press Enter when you've created the token..."
    echo ""
    
    # Prompt for token
    while true; do
        read -s -p "Paste your Vercel token here: " VERCEL_TOKEN
        echo ""
        
        if [[ -z "$VERCEL_TOKEN" ]]; then
            print_error "Token cannot be empty. Please try again."
            continue
        fi
        
        if [[ ! "$VERCEL_TOKEN" =~ ^vercel_ ]]; then
            print_warning "Token doesn't start with 'vercel_'. Are you sure this is correct?"
            read -p "Continue anyway? (y/N): " confirm
            if [[ $confirm != [yY] ]]; then
                continue
            fi
        fi
        
        break
    done
    
    print_success "Token captured successfully"
    return 0
}

# Set GitHub secrets
set_github_secrets() {
    print_header "Setting GitHub Secrets"
    
    # Set VERCEL_TOKEN
    print_status "Setting VERCEL_TOKEN..."
    if echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN; then
        print_success "✓ VERCEL_TOKEN set"
    else
        print_error "✗ Failed to set VERCEL_TOKEN"
        return 1
    fi
    
    # Set VERCEL_ORG_ID
    print_status "Setting VERCEL_ORG_ID..."
    if echo "team_ECQY2ysqMz8q0PWlhjmjOzEo" | gh secret set VERCEL_ORG_ID; then
        print_success "✓ VERCEL_ORG_ID set"
    else
        print_error "✗ Failed to set VERCEL_ORG_ID"
        return 1
    fi
    
    # Set VERCEL_STORYBOOK_PROJECT_ID
    print_status "Setting VERCEL_STORYBOOK_PROJECT_ID..."
    if echo "prj_bYx8cnaZ3hxpvN6DKFnv48u38vmW" | gh secret set VERCEL_STORYBOOK_PROJECT_ID; then
        print_success "✓ VERCEL_STORYBOOK_PROJECT_ID set"
    else
        print_error "✗ Failed to set VERCEL_STORYBOOK_PROJECT_ID"
        return 1
    fi
    
    print_success "All GitHub secrets set successfully!"
}

# Verify secrets
verify_secrets() {
    print_header "Verifying Secrets"
    
    print_status "Listing repository secrets..."
    gh secret list
    
    echo ""
    print_success "Secrets verification complete"
}

# Test deployment
test_deployment() {
    print_header "Testing Deployment"
    
    echo "Would you like to test the Storybook deployment workflow?"
    read -p "This will trigger a deployment. Continue? (y/N): " test_confirm
    
    if [[ $test_confirm == [yY] ]]; then
        print_status "Triggering Storybook deployment workflow..."
        
        if gh workflow run deploy-storybook.yml; then
            print_success "Workflow triggered successfully!"
            echo ""
            echo "Monitor the deployment at:"
            echo "https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
            echo ""
            echo "Storybook will be available at:"
            echo "https://storybook-static-jasper-lepardos-projects.vercel.app"
        else
            print_error "Failed to trigger workflow"
            return 1
        fi
    else
        print_status "Skipping deployment test"
        echo ""
        echo "You can test later with:"
        echo "  gh workflow run deploy-storybook.yml"
        echo "  or npm run deploy:test"
    fi
}

# Main execution
main() {
    print_header "Automated Deployment Setup"
    echo "This script will set up GitHub secrets for automated Storybook deployment."
    echo ""
    
    # Check prerequisites
    if ! check_prerequisites; then
        exit 1
    fi
    
    # Show known values
    show_known_values
    
    # Get Vercel token
    if ! get_vercel_token; then
        exit 1
    fi
    
    # Set GitHub secrets
    if ! set_github_secrets; then
        exit 1
    fi
    
    # Verify secrets
    verify_secrets
    
    # Test deployment
    test_deployment
    
    print_header "Setup Complete!"
    echo ""
    echo "🎉 Your automated deployment is now configured!"
    echo ""
    echo "What happens next:"
    echo "• Storybook deploys automatically when components change"
    echo "• PR previews are created with automatic comments"
    echo "• Both main app and Storybook are properly deployed"
    echo ""
    echo "URLs to bookmark:"
    echo "• Main app: https://www.citizenly.co"
    echo "• Storybook: https://storybook-static-jasper-lepardos-projects.vercel.app"
    echo "• GitHub Actions: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
    echo ""
    print_success "All automation is now active! 🚀"
}

# Run main function
main "$@"