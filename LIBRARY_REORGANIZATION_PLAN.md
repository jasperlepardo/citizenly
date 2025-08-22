# src/lib Directory Reorganization Plan

## 🎯 Objectives
1. Follow naming conventions (kebab-case for directories)
2. Reduce root-level file clutter (39 files → ~10 files)
3. Group related functionality logically
4. Maintain clean barrel exports

## 📂 Proposed New Structure

```
src/lib/
├── index.ts                    # Main barrel export
├── README.md                   # Library documentation
├── ARCHITECTURE.md             # Architecture overview
│
├── api/                        # API utilities and types
│   ├── index.ts
│   ├── auth.ts                 # api-auth.ts
│   ├── responses.ts            # api-responses.ts  
│   ├── types.ts                # api-types.ts
│   ├── validation.ts           # api-validation.ts
│   └── audit.ts                # api-audit.ts
│
├── auth/                       # Authentication utilities
│   ├── index.ts
│   ├── auth.ts                 # auth.ts
│   ├── errors.ts               # auth-errors.ts
│   └── csrf.ts                 # csrf.ts
│
├── business-rules/             ✅ Already correct
│   ├── index.ts
│   ├── resident-form-rules.ts
│   └── sectoral-classification.ts
│
├── charts/                     ✅ Already correct
│   ├── index.ts
│   └── transformers.ts
│
├── command-menu/               # Group command menu functionality
│   ├── index.ts
│   ├── analytics.ts            # command-menu-analytics.ts
│   ├── api.ts                  # command-menu-api.ts
│   └── items.ts                # command-menu-items.ts
│
├── constants/                  ✅ Already correct
│   ├── form-options.ts
│   ├── generated-enums.ts
│   ├── resident-enums.ts
│   └── resident-form-defaults.ts  # residentFormDefaults.ts (renamed)
│
├── database/                   # Database utilities
│   ├── index.ts
│   ├── database.ts             # database.ts
│   ├── fields.ts               # database-fields.ts
│   ├── setup.sql               # database-setup.sql
│   └── utils.ts                # database-utils.ts
│
├── environment/                # Environment and config
│   ├── index.ts
│   ├── config.ts               # env-config.ts
│   ├── dev-config.ts           # dev-config.ts
│   └── environment.ts          # environment.ts
│
├── error-handling/             ✅ Already correct
│   ├── index.ts
│   ├── error-boundaries.ts
│   ├── error-types.ts
│   └── error-utils.ts
│
├── forms/                      ✅ Already correct
│   ├── index.ts
│   ├── field-logic.ts
│   └── handlers.ts
│
├── graphics/                   ✅ Already correct
│   ├── index.ts
│   ├── color-generator.ts
│   └── pie-chart-math.ts
│
├── logging/                    # Logging utilities
│   ├── index.ts
│   ├── client-logger.ts        # client-logger.ts
│   └── secure-logger.ts        # secure-logger.ts
│
├── mappers/                    ✅ Already correct
│   ├── index.ts
│   ├── __tests__/
│   ├── form-data-transformers.ts
│   └── resident-mapper.ts
│
├── optimizers/                 ✅ Already correct
│   ├── index.ts
│   ├── __tests__/
│   ├── household-fetcher.ts
│   └── resident-details-fetcher.ts
│
├── performance/                # Performance utilities
│   ├── index.ts
│   ├── monitor.ts              # performance-monitor.ts
│   ├── optimizations.ts        # performance-optimizations.ts
│   ├── performance.ts          # performance.ts
│   └── pwa-performance.ts      # pwa-performance.ts
│
├── repositories/               ✅ Already correct
│   ├── index.ts
│   ├── base-repository.ts
│   ├── household-repository.ts
│   ├── resident-repository.ts
│   └── user-repository.ts
│
├── security/                   # Security utilities (expanded)
│   ├── index.ts
│   ├── audit-storage.ts        ✅ Already here
│   ├── threat-detection.ts     ✅ Already here
│   ├── crypto.ts               # crypto.ts (moved)
│   ├── file-security.ts        # file-security.ts (moved)
│   └── rate-limit.ts           # rate-limit.ts (moved)
│
├── statistics/                 ✅ Already correct
│   ├── index.ts
│   └── population-pyramid.ts
│
├── storage/                    # Storage utilities
│   ├── index.ts
│   ├── offline-storage.ts      # offline-storage.ts
│   ├── query-cache.ts          # query-cache.ts
│   ├── recent-items-storage.ts # recent-items-storage.ts
│   └── sync-queue.ts           # sync-queue.ts
│
├── supabase/                   # Supabase utilities
│   ├── index.ts
│   └── supabase.ts             # supabase.ts
│
├── types/                      ✅ Already correct
│   ├── index.ts
│   └── forms.ts
│
├── ui/                         # UI utilities
│   ├── index.ts
│   ├── accessibility.ts        # accessibility.ts
│   ├── lazy-components.tsx     # lazy-components.tsx
│   └── typography.ts           # typography.ts
│
├── utilities/                  ✅ Already correct (main utils)
│   ├── index.ts
│   ├── async-utils.ts
│   ├── css-utils.ts
│   ├── data-transformers.ts
│   ├── id-generators.ts
│   └── string-utils.ts
│
├── utils/                      # Legacy utils (to be consolidated)
│   ├── index.ts
│   ├── resident-helpers.ts
│   ├── resident-detail-helpers.ts  # residentDetailHelpers.ts (renamed)
│   ├── resident-listing-helpers.ts # residentListingHelpers.ts (renamed)
│   ├── search-utilities.ts
│   └── validation-utilities.ts
│
├── validation/                 ✅ Already correct
│   ├── index.ts
│   ├── field-level-schemas.ts
│   ├── field-validators.ts
│   ├── form-validators.ts
│   ├── generated-schemas.ts
│   ├── resident-schema.ts
│   ├── sanitizers.ts
│   ├── schemas.ts
│   ├── types.ts
│   ├── utilities.ts
│   └── validation.ts           # validation.ts (moved)
│
└── __tests__/                  ✅ Test organization
    ├── api-responses.test.ts
    ├── business-rules.test.ts
    ├── crypto.test.ts
    ├── file-security.test.ts
    ├── rate-limit.test.ts
    ├── utilities.test.ts
    └── utils.test.ts
```

## 🔧 File Relocations Required

### **Files to Move:**
1. `api-auth.ts` → `api/auth.ts`
2. `api-responses.ts` → `api/responses.ts`
3. `api-types.ts` → `api/types.ts`
4. `api-validation.ts` → `api/validation.ts`
5. `api-audit.ts` → `api/audit.ts`
6. `auth.ts` → `auth/auth.ts`
7. `auth-errors.ts` → `auth/errors.ts`
8. `csrf.ts` → `auth/csrf.ts`
9. `command-menu-analytics.ts` → `command-menu/analytics.ts`
10. `command-menu-api.ts` → `command-menu/api.ts`
11. `command-menu-items.ts` → `command-menu/items.ts`
12. `crypto.ts` → `security/crypto.ts`
13. `file-security.ts` → `security/file-security.ts`
14. `rate-limit.ts` → `security/rate-limit.ts`
15. `database.ts` → `database/database.ts`
16. `database-fields.ts` → `database/fields.ts`
17. `database-setup.sql` → `database/setup.sql`
18. `database-utils.ts` → `database/utils.ts`
19. `env-config.ts` → `environment/config.ts`
20. `dev-config.ts` → `environment/dev-config.ts`
21. `environment.ts` → `environment/environment.ts`
22. `client-logger.ts` → `logging/client-logger.ts`
23. `secure-logger.ts` → `logging/secure-logger.ts`
24. `performance-monitor.ts` → `performance/monitor.ts`
25. `performance-optimizations.ts` → `performance/optimizations.ts`
26. `performance.ts` → `performance/performance.ts`
27. `pwa-performance.ts` → `performance/pwa-performance.ts`
28. `offline-storage.ts` → `storage/offline-storage.ts`
29. `query-cache.ts` → `storage/query-cache.ts`
30. `recent-items-storage.ts` → `storage/recent-items-storage.ts`
31. `sync-queue.ts` → `storage/sync-queue.ts`
32. `supabase.ts` → `supabase/supabase.ts`
33. `accessibility.ts` → `ui/accessibility.ts`
34. `lazy-components.tsx` → `ui/lazy-components.tsx`
35. `typography.ts` → `ui/typography.ts`
36. `validation.ts` → `validation/validation.ts`

### **Files to Rename:**
1. `residentFormDefaults.ts` → `resident-form-defaults.ts`
2. `residentDetailHelpers.ts` → `resident-detail-helpers.ts`
3. `residentListingHelpers.ts` → `resident-listing-helpers.ts`

### **Files to Consolidate:**
1. Merge `utils/` into `utilities/` (eliminate duplication)
2. Review `fieldUtils.ts` and `utils.ts` for consolidation

## 📈 Benefits

### **Before (Current):**
- 39 root-level files
- Mixed naming conventions
- Poor discoverability
- Duplicate utilities
- No clear organization

### **After (Proposed):**
- ~10 root-level files
- Consistent kebab-case naming
- Logical grouping by functionality
- Clear imports and exports
- Better maintainability

## 🚀 Implementation Steps

1. **Create new directory structure**
2. **Move files to new locations** 
3. **Update import statements**
4. **Update barrel exports**
5. **Run tests to verify**
6. **Update documentation**

## 🧪 Testing Strategy

1. **Automated tests** - Ensure all tests pass after moves
2. **Import verification** - Check all imports resolve correctly
3. **Build verification** - Ensure application builds successfully
4. **Runtime testing** - Verify functionality works as expected

This reorganization will significantly improve code organization, maintainability, and developer experience while following established naming conventions.