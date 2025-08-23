#!/bin/bash

# Migration Script: Phase 1 - Type Consolidation
# This script helps migrate scattered type definitions to src/types/

set -e

echo "🚀 Starting Phase 1: Type Consolidation"
echo "========================================"

# Create backup
echo "📦 Creating backup branch..."
git checkout -b backup-before-type-migration-$(date +%Y%m%d_%H%M%S)
git checkout -

# Create new types directory structure
echo "📁 Creating new types directory structure..."
mkdir -p src/types

# Files to migrate from lib/types/
echo "📋 Phase 1a: Migrating from src/lib/types/"
if [ -d "src/lib/types" ]; then
  echo "  → Moving database.ts"
  [ -f "src/lib/types/database.ts" ] && mv src/lib/types/database.ts src/types/database.ts
  
  echo "  → Moving forms.ts" 
  [ -f "src/lib/types/forms.ts" ] && mv src/lib/types/forms.ts src/types/forms.ts
  
  echo "  → Moving resident files to residents.ts"
  # Note: These need manual consolidation
  [ -f "src/lib/types/resident-detail.ts" ] && echo "    📝 TODO: Consolidate resident-detail.ts into residents.ts"
  [ -f "src/lib/types/resident-listing.ts" ] && echo "    📝 TODO: Consolidate resident-listing.ts into residents.ts"
  [ -f "src/lib/types/resident.ts" ] && echo "    📝 TODO: Consolidate resident.ts into residents.ts"
fi

# Files to migrate from components/types/
echo "📋 Phase 1b: Migrating from src/components/types/"
if [ -d "src/components/types" ]; then
  echo "  → Moving component types"
  [ -f "src/components/types/form-field.ts" ] && echo "    📝 TODO: Consolidate form-field.ts into components.ts"
  [ -f "src/components/types/index.ts" ] && echo "    📝 TODO: Merge into components.ts"
fi

# Create barrel export
echo "📋 Creating barrel export..."
cat > src/types/index.ts << 'EOF'
// Barrel export for all types
// This file is auto-generated - do not edit manually

export * from './api';
export * from './auth';
export * from './components';
export * from './database';
export * from './forms';
export * from './households';
export * from './residents';
export * from './ui';
EOF

echo "✅ Phase 1 preparation complete!"
echo ""
echo "📝 Manual steps required:"
echo "1. Consolidate resident type files into src/types/residents.ts"
echo "2. Move component types to src/types/components.ts"
echo "3. Create missing type files (api.ts, auth.ts, households.ts, ui.ts)"
echo "4. Update import statements"
echo "5. Test compilation with: npm run type-check"
echo ""
echo "📚 See docs/REORGANIZATION_PLAN.md for detailed instructions"