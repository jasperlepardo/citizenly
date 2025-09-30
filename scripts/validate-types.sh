#!/bin/bash
# Types Validation Script
# Validates type definitions and checks for unused exports

set -e

echo "🔍 Running Types Validation..."

# 1. TypeScript Compilation Check
echo "📝 Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck

# 2. ESLint Type-specific Rules
echo "🔧 Running ESLint with type-specific rules..."
npx eslint "src/types/**/*.ts" --config .eslintrc-types.json

# 3. Find Potentially Unused Types (helper script)
echo "🧹 Scanning for unused type exports..."
./scripts/find-unused-types.sh

echo "✅ Types validation completed!"