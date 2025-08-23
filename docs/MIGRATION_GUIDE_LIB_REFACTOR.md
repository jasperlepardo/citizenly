# 🔄 Migration Guide: lib/ Directory Refactor

**Version**: v2.0.0 → v3.0.0  
**Date**: January 2025  
**Status**: Backward compatibility maintained until v3.0.0

## 📋 Overview

The `src/lib/` directory has been refactored for better organization, performance, and maintainability. All changes are backward compatible with deprecation warnings in development mode.

## 🚨 Deprecated Import Paths

### Replace These Imports:

| ❌ Old Import | ✅ New Import | Notes |
|---------------|---------------|-------|
| `@/lib/supabase` | `@/lib/data/supabase` | Supabase client moved to data layer |
| `@/lib/storage` | `@/lib/data` | Storage utilities consolidated |
| `@/lib/charts` | `@/lib/ui` | Chart utilities moved to UI layer |
| `@/lib/api` | `@/lib/authentication` | API auth utilities consolidated |
| `@/lib/auth` | `@/lib/authentication` | Auth utilities consolidated |
| `@/lib/database` | `@/lib/data` | Database utilities moved to data layer |

### Removed Functions:

| ❌ Deprecated Function | ✅ Replacement | Migration |
|------------------------|----------------|-----------|
| `mergeClassNames` | `cn` | Direct replacement - same functionality |
| `CHARTJS_COLOR_PALETTE` | `SEMANTIC_CHART_PALETTE` | Direct replacement - same colors |

## 🛠️ Migration Steps

### Step 1: Update Import Statements

```typescript
// BEFORE
import { supabase } from '@/lib/supabase';
import { syncQueue } from '@/lib/storage';
import { ChartType } from '@/lib/charts';
import { withAuth } from '@/lib/api/authUtils';

// AFTER  
import { supabase } from '@/lib/data/supabase';
import { syncQueue } from '@/lib/data';
import { ChartType } from '@/lib/ui';
import { withAuth } from '@/lib/authentication/authUtils';
```

### Step 2: Replace Deprecated Functions

```typescript
// BEFORE
import { mergeClassNames, CHARTJS_COLOR_PALETTE } from '@/lib/utils';

const className = mergeClassNames('base', 'modifier');
const colors = CHARTJS_COLOR_PALETTE;

// AFTER
import { cn, SEMANTIC_CHART_PALETTE } from '@/lib/ui';

const className = cn('base', 'modifier');
const colors = SEMANTIC_CHART_PALETTE;
```

## 🔍 Find & Replace Commands

Use these commands to update your codebase:

```bash
# Update supabase imports
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/@\/lib\/supabase/@\/lib\/data\/supabase/g"

# Update storage imports  
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/@\/lib\/storage/@\/lib\/data/g"

# Update charts imports
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/@\/lib\/charts/@\/lib\/ui/g"

# Update API imports
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/@\/lib\/api/@\/lib\/authentication/g"

# Update auth imports
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/@\/lib\/auth'/@\/lib\/authentication'/g"

# Update deprecated functions
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/mergeClassNames/cn/g"
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/CHARTJS_COLOR_PALETTE/SEMANTIC_CHART_PALETTE/g"
```

## ⚠️ Breaking Changes Timeline

### v2.0.0 (Current)
- ✅ All old imports work with deprecation warnings
- ✅ Compatibility layers provide seamless migration
- ✅ New import paths available

### v2.5.0 (Future)  
- ⚠️ Console warnings for deprecated imports
- ⚠️ ESLint rules to flag old imports
- ⚠️ Migration scripts provided

### v3.0.0 (Breaking Changes)
- ❌ All compatibility layers removed
- ❌ Old import paths will fail
- ❌ Deprecated functions removed

## 🧪 Testing Your Migration

After updating imports, run these commands to verify:

```bash
# Check for remaining deprecated imports
grep -r "@/lib/supabase\|@/lib/storage\|@/lib/charts\|@/lib/api\|@/lib/auth" src/ --include="*.ts" --include="*.tsx"

# Check for deprecated functions
grep -r "mergeClassNames\|CHARTJS_COLOR_PALETTE" src/ --include="*.ts" --include="*.tsx"

# Run tests to ensure compatibility
npm test
npm run build
npm run type-check
```

## 📦 New Directory Structure

```
src/lib/
├── core/                    # Core utilities (string, data, async utils)
├── validation/              # Validation logic and schemas  
├── forms/                   # Form handling utilities
├── authentication/          # Auth & API utilities (was auth/ + api/)
├── security/                # Security utilities  
├── data/                    # Database, supabase, storage (was database/ + supabase/ + storage/)
├── ui/                      # UI utilities and charts (was charts/ + graphics/)
├── business-rules/          # Domain-specific logic
├── command-menu/           # Command menu system
├── config/                 # Configuration utilities
├── performance/            # Performance monitoring
└── index.ts                # Clean main exports
```

## 🆘 Help & Support

- **Migration Issues**: Check console warnings in development mode
- **Type Errors**: Ensure you're importing from the correct new paths
- **Build Failures**: Run `npm run type-check` to identify import issues
- **Questions**: Refer to the updated documentation in each module

## 📚 Additional Resources

- [Architecture Overview](./reference/ARCHITECTURE_OVERVIEW.md)
- [Coding Standards](./reference/CODING_STANDARDS.md)  
- [TypeScript Guidelines](./reference/TYPESCRIPT_GUIDELINES.md)
- [Component Library](./reference/COMPONENT_LIBRARY.md)

---

**Remember**: All changes are backward compatible until v3.0.0. Take your time to migrate systematically! 🚀