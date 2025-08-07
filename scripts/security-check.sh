#!/bin/bash
# Security Check Script - Environment-aware security validation
# Runs appropriate security checks based on detected environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Environment-Aware Security Check${NC}"
echo "======================================"

# Detect environment
ENV_TYPE=${NODE_ENV:-development}
IS_CI=${CI:-false}
IS_PRODUCTION=${VERCEL_ENV:-false}

echo -e "${BLUE}Environment: ${ENV_TYPE}${NC}"
echo -e "${BLUE}CI Environment: ${IS_CI}${NC}"

# Function to run command with status check
run_check() {
    local name=$1
    local command=$2
    
    echo -e "\n${BLUE}Running: ${name}${NC}"
    echo "Command: ${command}"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ ${name} - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ ${name} - FAILED${NC}"
        return 1
    fi
}

# Track overall status
OVERALL_STATUS=0

# Tier 1: Development (Fast checks)
if [[ "$ENV_TYPE" == "development" && "$IS_CI" != "true" ]]; then
    echo -e "\n${YELLOW}Running Tier 1 (Development) Security Checks${NC}"
    
    run_check "NPM Audit (High/Critical only)" "npm audit --audit-level=high" || OVERALL_STATUS=1
    run_check "Basic dependency check" "npm ls --depth=0 >/dev/null" || OVERALL_STATUS=1

# Tier 2: CI/CD (Standard checks)
elif [[ "$IS_CI" == "true" && "$IS_PRODUCTION" != "production" ]]; then
    echo -e "\n${YELLOW}Running Tier 2 (CI/CD) Security Checks${NC}"
    
    run_check "NPM Audit (Moderate+)" "npm audit --audit-level=moderate" || OVERALL_STATUS=1
    run_check "Audit CI" "npx audit-ci --config audit-ci.json" || OVERALL_STATUS=1
    run_check "Dependency analysis" "npm run analyze:deps" || OVERALL_STATUS=1
    
    # Snyk scan if available
    if command -v snyk &> /dev/null; then
        run_check "Snyk vulnerability scan" "npx snyk test --severity-threshold=medium" || OVERALL_STATUS=1
    else
        echo -e "${YELLOW}⚠️ Snyk not available, skipping advanced vulnerability scan${NC}"
    fi

# Tier 3: Staging (Enhanced checks)
elif [[ "$ENV_TYPE" == "staging" ]]; then
    echo -e "\n${YELLOW}Running Tier 3 (Staging) Security Checks${NC}"
    
    run_check "Full NPM Audit" "npm audit" || OVERALL_STATUS=1
    run_check "Audit CI (All levels)" "npx audit-ci --config audit-ci.json" || OVERALL_STATUS=1
    run_check "Snyk comprehensive scan" "npx snyk test" || OVERALL_STATUS=1
    run_check "License check" "npx license-checker --summary" || echo -e "${YELLOW}⚠️ License checker not available${NC}"

# Tier 4: Production (Critical checks)
elif [[ "$IS_PRODUCTION" == "production" ]]; then
    echo -e "\n${YELLOW}Running Tier 4 (Production) Critical Security Checks${NC}"
    
    run_check "Production NPM Audit" "npm audit --production --audit-level=critical" || OVERALL_STATUS=1
    run_check "Critical vulnerability scan" "npx audit-ci --config audit-ci.json --skip-dev --moderate" || OVERALL_STATUS=1
    
    if command -v snyk &> /dev/null; then
        run_check "Snyk production scan" "npx snyk test --severity-threshold=high --prod" || OVERALL_STATUS=1
        run_check "Snyk monitor (reporting)" "npx snyk monitor" || echo -e "${YELLOW}⚠️ Snyk monitor failed (non-critical)${NC}"
    fi
    
    # Additional production-specific checks
    run_check "Validate build integrity" "[[ -f .next/BUILD_ID ]] && [[ -d .next/static ]]" || OVERALL_STATUS=1

# Fallback: Default comprehensive check
else
    echo -e "\n${YELLOW}Running Default Comprehensive Security Checks${NC}"
    
    run_check "NPM Audit" "npm audit --audit-level=moderate" || OVERALL_STATUS=1
    run_check "Audit CI" "npx audit-ci --config audit-ci.json" || OVERALL_STATUS=1
fi

# Additional universal checks (all environments)
echo -e "\n${BLUE}Running Universal Security Checks${NC}"

# Check for common security issues in code
run_check "No hardcoded secrets (basic)" "! grep -r --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' 'password.*=.*['\''\"]\|api.*key.*=.*['\''\"]\|secret.*=.*['\''\"]\|token.*=.*['\''\"']' src/ || true" || OVERALL_STATUS=1

# Check for dangerous packages (if any)
DANGEROUS_PACKAGES=("event-stream" "flatmap-stream" "eslint-scope")
for package in "${DANGEROUS_PACKAGES[@]}"; do
    if npm ls "$package" &>/dev/null; then
        echo -e "${RED}❌ Dangerous package detected: $package${NC}"
        OVERALL_STATUS=1
    fi
done

# Check package.json for security best practices
run_check "Package.json security check" "[[ -f package.json ]] && ! grep -q '\"\\*\"' package.json" || OVERALL_STATUS=1

# Summary
echo -e "\n======================================"
if [[ $OVERALL_STATUS -eq 0 ]]; then
    echo -e "${GREEN}🎉 All security checks PASSED!${NC}"
    echo -e "${GREEN}Environment: $ENV_TYPE security validation completed successfully${NC}"
else
    echo -e "${RED}💥 Some security checks FAILED!${NC}"
    echo -e "${RED}Environment: $ENV_TYPE security validation needs attention${NC}"
    echo -e "${YELLOW}Review the failed checks above and address security issues${NC}"
fi

exit $OVERALL_STATUS