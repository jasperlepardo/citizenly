#!/bin/bash

# Security check script for pre-push hook
# Runs various security checks before allowing push

echo "🔒 Running security checks..."

# Check for secrets/credentials
echo "📋 Checking for hardcoded secrets..."
if grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.json" \
   -E "(api[_-]?key|apikey|secret|password|pwd|token|auth|credentials|private[_-]?key)" \
   --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
   -i . | grep -v -E "(process\.env|import.*from|require\(|\/\/|\/\*|\*|#|interface|type|export|const.*=.*process|NEXT_PUBLIC_)" | grep -E "[:=]\s*[\"'][\w\-]{20,}[\"']"; then
    echo "❌ Potential hardcoded secrets found!"
    exit 1
fi

# Check for sensitive files
echo "📋 Checking for sensitive files..."
SENSITIVE_FILES=(.env .env.local .env.production aws-credentials.json firebase-config.json service-account.json)
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ] && ! grep -q "$file" .gitignore; then
        echo "❌ Sensitive file $file is not in .gitignore!"
        exit 1
    fi
done

# Run npm audit for known vulnerabilities
echo "📋 Checking npm packages for vulnerabilities..."
npm audit --production --audit-level=high
if [ $? -ne 0 ]; then
    echo "❌ High severity vulnerabilities found in dependencies!"
    echo "Run 'npm audit fix' to attempt automatic fixes"
    exit 1
fi

# Check for console.log statements in production code
echo "📋 Checking for console.log statements..."
if grep -r "console\.\(log\|error\|warn\|info\)" \
   --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" \
   --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=__tests__ \
   --exclude-dir=.storybook --exclude="*.test.*" --exclude="*.stories.*" \
   src/app src/components/atoms src/components/molecules src/components/organisms src/components/templates | \
   grep -v "secure-logger" | grep -v "// eslint-disable-line"; then
    echo "⚠️  Console statements found in production code (consider using secure logger)"
fi

# Check TypeScript strict mode
echo "📋 Checking TypeScript configuration..."
if ! grep -q '"strict": true' tsconfig.json; then
    echo "⚠️  TypeScript strict mode is not enabled"
fi

# Check for TODO comments with security implications
echo "📋 Checking for security-related TODOs..."
if grep -r "TODO.*\(security\|auth\|encrypt\|hash\|token\|secret\)" \
   --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" \
   --exclude-dir=node_modules --exclude-dir=.next .; then
    echo "⚠️  Security-related TODOs found - please address before production"
fi

echo "✅ Security checks completed!"