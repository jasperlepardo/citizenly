#!/bin/bash

# Comprehensive Backup Script - Don't Lose Anything!
# This script creates multiple layers of backup before reorganization

set -e

echo "🛡️  COMPREHENSIVE BACKUP CREATION"
echo "================================="
echo "Priority #1: Don't lose anything!"
echo ""

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_BRANCH="backup-complete-codebase-$TIMESTAMP"

# Ensure we're in a clean state
echo "🔍 Checking current state..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Committing them first..."
    git add -A
    git commit -m "Pre-backup commit: preserve current state - $TIMESTAMP"
fi

# 1. Git backup (Primary safety net)
echo ""
echo "📦 STEP 1: Creating git backup branch"
echo "Branch: $BACKUP_BRANCH"
git checkout -b "$BACKUP_BRANCH"
git add -A
git commit -m "🛡️  Complete codebase backup before reorganization - $TIMESTAMP" --allow-empty
echo "   Pushing to remote repository..."
git push -u origin "$BACKUP_BRANCH"
echo "   ✅ Git backup created and pushed!"

# Return to original branch
git checkout -

# 2. File system backup (Secondary safety net)
echo ""
echo "💾 STEP 2: Creating file system backup"
mkdir -p backups
echo "   Creating compressed archive..."
tar -czf "backups/src-backup-$TIMESTAMP.tar.gz" src/
echo "   Archive size: $(du -sh "backups/src-backup-$TIMESTAMP.tar.gz" | cut -f1)"
echo "   ✅ File system backup created!"

# 3. Documentation generation (Tertiary safety net)
echo ""
echo "📋 STEP 3: Generating comprehensive documentation"
mkdir -p docs/backups

echo "   📁 Documenting file inventory..."
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | sort > "docs/backups/file-inventory-$TIMESTAMP.txt"
echo "      → $(cat "docs/backups/file-inventory-$TIMESTAMP.txt" | wc -l) files documented"

echo "   🌳 Documenting directory structure..."
if command -v tree >/dev/null 2>&1; then
    tree src -I 'node_modules|.git|__tests__' > "docs/backups/directory-structure-$TIMESTAMP.txt" 2>/dev/null || echo "src/" > "docs/backups/directory-structure-$TIMESTAMP.txt"
else
    find src -type d | sort > "docs/backups/directory-structure-$TIMESTAMP.txt"
fi

echo "   🔢 Documenting file counts..."
echo "Total files: $(find src -type f | wc -l)" > "docs/backups/file-count-$TIMESTAMP.txt"
echo "TypeScript files: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)" >> "docs/backups/file-count-$TIMESTAMP.txt"
echo "JavaScript files: $(find src -name "*.js" -o -name "*.jsx" | wc -l)" >> "docs/backups/file-count-$TIMESTAMP.txt"
echo "Component files: $(find src -name "*.tsx" | wc -l)" >> "docs/backups/file-count-$TIMESTAMP.txt"

echo "   📊 Documenting directory sizes..."
du -sh src/* 2>/dev/null | sort -hr > "docs/backups/directory-sizes-$TIMESTAMP.txt" || echo "Could not calculate directory sizes" > "docs/backups/directory-sizes-$TIMESTAMP.txt"

echo "   ✅ Documentation generated!"

# 4. Import mapping (Critical for reorganization)
echo ""
echo "🔗 STEP 4: Mapping import dependencies"
echo "   Analyzing import statements..."
find src -name "*.ts" -o -name "*.tsx" | xargs grep -H "^import.*from" > "docs/backups/import-dependencies-$TIMESTAMP.txt" 2>/dev/null || echo "No imports found" > "docs/backups/import-dependencies-$TIMESTAMP.txt"
echo "      → $(cat "docs/backups/import-dependencies-$TIMESTAMP.txt" | wc -l) import statements mapped"

echo "   Analyzing component imports..."
find src -name "*.tsx" | xargs grep -H "import.*from.*components\|import.*Component" > "docs/backups/component-imports-$TIMESTAMP.txt" 2>/dev/null || echo "No component imports found" > "docs/backups/component-imports-$TIMESTAMP.txt"

echo "   Analyzing type imports..."
find src -name "*.ts" -o -name "*.tsx" | xargs grep -H "import.*type\|import.*from.*types" > "docs/backups/type-imports-$TIMESTAMP.txt" 2>/dev/null || echo "No type imports found" > "docs/backups/type-imports-$TIMESTAMP.txt"

echo "   ✅ Import mapping complete!"

# 5. Current state verification
echo ""
echo "🧪 STEP 5: Verifying current state integrity"
echo "   Running TypeScript check..."
if npm run type-check --silent; then
    echo "   ✅ TypeScript check passed"
else
    echo "   ❌ TypeScript check failed - documenting errors"
    npm run type-check > "docs/backups/typescript-errors-$TIMESTAMP.txt" 2>&1 || true
fi

echo "   Running tests..."
if npm test --silent --passWithNoTests; then
    echo "   ✅ Tests passed"
else
    echo "   ❌ Tests failed - documenting errors"
    npm test > "docs/backups/test-errors-$TIMESTAMP.txt" 2>&1 || true
fi

echo "   Testing build..."
if npm run build --silent; then
    echo "   ✅ Build successful"
    # Clean up build files
    rm -rf .next 2>/dev/null || true
else
    echo "   ❌ Build failed - documenting errors"
    npm run build > "docs/backups/build-errors-$TIMESTAMP.txt" 2>&1 || true
fi

# 6. Create recovery documentation
echo ""
echo "📝 STEP 6: Creating recovery documentation"
cat > "docs/backups/RECOVERY-INSTRUCTIONS-$TIMESTAMP.md" << EOF
# Recovery Instructions for Backup $TIMESTAMP

## Created: $(date)
## Git Branch: $BACKUP_BRANCH
## File Backup: backups/src-backup-$TIMESTAMP.tar.gz

## Quick Recovery Commands

### Option 1: Git Recovery (Recommended)
\`\`\`bash
git fetch origin
git checkout $BACKUP_BRANCH
git checkout -b recovery-from-backup-$TIMESTAMP
# Work from this recovery branch
\`\`\`

### Option 2: File System Recovery
\`\`\`bash
# Backup current state first
mv src src-broken-$(date +%Y%m%d_%H%M%S)
# Restore from backup
tar -xzf backups/src-backup-$TIMESTAMP.tar.gz
\`\`\`

### Option 3: Selective Recovery
\`\`\`bash
# Recover specific files
git show $BACKUP_BRANCH:src/path/to/file.ts > src/path/to/file.ts
\`\`\`

## State at Backup Time
- Total files: $(find src -type f | wc -l)
- TypeScript files: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)
- JavaScript files: $(find src -name "*.js" -o -name "*.jsx" | wc -l)
- Git commit: $(git rev-parse HEAD)
- Git branch: $(git branch --show-current)

## Verification After Recovery
\`\`\`bash
npm run type-check  # Should pass
npm test           # Should pass
npm run build      # Should pass
npm run dev        # Should start
\`\`\`

## Recovery Verification Checklist
- [ ] All original files present
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Application builds successfully  
- [ ] Development server starts
- [ ] Key functionality works (manual test)
- [ ] Git history preserved
EOF

echo "   ✅ Recovery documentation created!"

# 7. Summary and next steps
echo ""
echo "🎉 BACKUP COMPLETE!"
echo "=================="
echo ""
echo "📦 GIT BACKUP:"
echo "   Branch: $BACKUP_BRANCH"
echo "   Remote: origin/$BACKUP_BRANCH"
echo "   Commit: $(git rev-parse $BACKUP_BRANCH)"
echo ""
echo "💾 FILE BACKUP:"
echo "   Archive: backups/src-backup-$TIMESTAMP.tar.gz"
echo "   Size: $(du -sh "backups/src-backup-$TIMESTAMP.tar.gz" | cut -f1)"
echo ""
echo "📋 DOCUMENTATION:"
echo "   Location: docs/backups/"
echo "   Files documented: $(cat "docs/backups/file-inventory-$TIMESTAMP.txt" | wc -l)"
echo "   Imports mapped: $(cat "docs/backups/import-dependencies-$TIMESTAMP.txt" | wc -l)"
echo ""
echo "🛡️  SAFETY GUARANTEED:"
echo "   ✅ Multiple backup layers created"
echo "   ✅ Remote backup available"  
echo "   ✅ Complete state documented"
echo "   ✅ Recovery instructions ready"
echo ""
echo "🚨 EMERGENCY RECOVERY COMMANDS:"
echo "   git checkout $BACKUP_BRANCH"
echo "   tar -xzf backups/src-backup-$TIMESTAMP.tar.gz"
echo ""
echo "📖 Recovery Guide: docs/backups/RECOVERY-INSTRUCTIONS-$TIMESTAMP.md"
echo ""
echo "✅ Ready to proceed with reorganization safely!"
echo "   Next: Review docs/REORGANIZATION_PLAN.md"
echo "   Then: Follow docs/REORGANIZATION_CHECKLIST.md"