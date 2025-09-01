# Types Reorganization Plan - Domain-First Structure

## Current Structure Issues
- 12 top-level directories with inconsistent grouping logic
- Feature-based, layer-based, and functional mixing
- Redundancy and overlap between directories

## Target Structure

```
src/types/
├── domain/
│   ├── residents/           # All resident-related types
│   │   ├── core.ts         # (move from residents/core.ts)
│   │   ├── forms.ts        # (move from residents/forms.ts) 
│   │   ├── api.ts          # (move from residents/api.ts)
│   │   ├── residents.ts    # (move from residents/residents.ts)
│   │   ├── detail.ts       # (move from residents/resident-detail.ts)
│   │   ├── listing.ts      # (move from residents/resident-listing.ts)
│   │   ├── table.ts        # (move from residents/table.ts)
│   │   └── index.ts        # (move from residents/index.ts)
│   ├── households/          # All household-related types
│   │   ├── households.ts   # (move from households/households.ts)
│   │   ├── forms.ts        # (move from households/forms.ts)
│   │   └── index.ts        # (move from households/index.ts)
│   └── addresses/           # Geographic/PSGC types
│       ├── addresses.ts    # (move from data/addresses.ts)
│       └── index.ts
├── app/
│   ├── api/                # API request/response types
│   │   ├── requests.ts     # (move from api/api-requests.ts)
│   │   ├── responses.ts    # (move from api/api-consolidated.ts)
│   │   └── index.ts
│   ├── auth/               # Authentication & authorization
│   │   ├── auth.ts         # (move from auth/auth.ts)
│   │   ├── security.ts     # (move from auth/security.ts)
│   │   └── index.ts
│   ├── ui/                 # Components, forms, charts
│   │   ├── components.ts   # (move from ui/components.ts)
│   │   ├── forms.ts        # (move from ui/forms.ts)
│   │   ├── charts.ts       # (move from ui/charts.ts)
│   │   ├── contexts.ts     # (move from ui/contexts.ts)
│   │   └── index.ts
│   └── pages/              # Page props and routing
│       ├── page-props.ts   # (move from core/page-props.ts)
│       └── index.ts
├── infrastructure/
│   ├── database/           # Database schema types
│   │   ├── database.ts     # (move from data/database.ts)
│   │   ├── relationships.ts # (move from data/relationships.ts)
│   │   └── index.ts
│   ├── cache/              # Caching types
│   │   ├── cache.ts        # (move from data/cache.ts)
│   │   └── index.ts
│   └── services/           # Service layer types
│       ├── services.ts     # (move from lib/services.ts)
│       ├── repositories.ts # (move from data/repositories.ts)
│       └── index.ts
├── shared/
│   ├── utilities/          # Utility types and helpers
│   │   ├── utilities.ts    # (move from core/utilities.ts)
│   │   ├── performance.ts  # (move from core/performance.ts)
│   │   └── index.ts
│   ├── constants/          # App constants
│   │   ├── constants.ts    # (move from core/constants.ts)
│   │   └── index.ts
│   ├── errors/             # Error types
│   │   ├── errors.ts       # (move from errors/errors.ts)
│   │   ├── error-types.ts  # (move from errors/error-types.ts)
│   │   └── index.ts
│   ├── validation/         # Validation schemas
│   │   ├── validation.ts   # (move from validation/validation.ts)
│   │   ├── lib-validation-types.ts # (move from validation/lib-validation-types.ts)
│   │   └── index.ts
│   └── hooks/              # Hook types (special case - widely used)
│       ├── accessibility-hooks.ts # (move from hooks/accessibility-hooks.ts)
│       ├── api-hooks.ts    # (move from hooks/api-hooks.ts)
│       ├── command-menu-hooks.ts # (move from hooks/command-menu-hooks.ts)
│       ├── crud-hooks.ts   # (move from hooks/crud-hooks.ts)
│       ├── dashboard-hooks.ts # (move from hooks/dashboard-hooks.ts)
│       ├── search-hooks.ts # (move from hooks/search-hooks.ts)
│       ├── utility-hooks.ts # (move from hooks/utility-hooks.ts)
│       ├── validation-hooks.ts # (move from hooks/validation-hooks.ts)
│       ├── workflow-hooks.ts # (move from hooks/workflow-hooks.ts)
│       └── index.ts        # (move from hooks/index.ts)
└── index.ts                # Main barrel export (update imports)
```

## Migration Steps

### Phase 1: Create Structure
1. Create new directory structure
2. Copy files to new locations
3. Update internal imports within moved files

### Phase 2: Update Imports
1. Update all import paths across the codebase (estimated 100+ files)
2. Update main index.ts barrel exports
3. Update tsconfig paths if needed

### Phase 3: Cleanup
1. Remove old directories
2. Verify no broken imports
3. Test build and TypeScript compilation

## Benefits
- **Domain-driven**: Resident and household types grouped together
- **Clear separation**: App layer vs infrastructure vs shared concerns
- **Scalable**: Easy to add new domains (users, reports, etc.)
- **Maintainable**: Related types are co-located
- **Import clarity**: Import paths indicate the concern level

## Estimated Impact
- **Files to move**: 37 TypeScript files
- **Imports to update**: 100+ import statements across the codebase
- **Risk level**: Medium (comprehensive change but well-planned)
- **Time estimate**: 2-3 hours for complete migration

## Validation Strategy
1. TypeScript compilation success
2. No broken imports
3. All tests pass
4. Build succeeds