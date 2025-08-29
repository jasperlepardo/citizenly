# Codebase Naming & Organization Audit

Generated for folders: `src/utils`, `src/types`, `src/services`, `src/providers`, `src/lib`, `src/hooks`.

References:
- docs/reference/CODING_STANDARDS.md
- docs/reference/NAMING_CONVENTIONS.md

## Summary
- Directory naming violations: 6 (PascalCase or double-underscore dirs)
- Utility/Service filename violations (should be camelCase): 40
- Hook filename violations (should start with `use`): 1
- Non-component `.tsx` utilities using hyphen-case: 7
- Files exceeding 300 lines (consider splitting): 83

## Directory Renames Needed (kebab-case)
- `src/providers/components/Providers` → `src/providers/components/providers`
- `src/providers/components/ClientProviders` → `src/providers/components/client-providers`
- Replace all `__tests__` directories with `tests` under the same parent:
  - `src/utils/__tests__` → `src/utils/tests`
  - `src/services/__tests__` → `src/services/tests`
  - `src/lib/__tests__` → `src/lib/tests`
  - `src/hooks/__tests__` → `src/hooks/tests`
  - `src/hooks/utilities/__tests__` → `src/hooks/utilities/tests`

Notes:
- `index.ts` / `index.tsx` barrels are supported by Coding Standards examples; keep them.

## File Renames Needed — Utilities/Services (to camelCase)
- `src/utils/database-utils.ts` → `src/utils/databaseUtils.ts`
- `src/utils/date-utils.ts` → `src/utils/dateUtils.ts`
- `src/utils/search-utilities.ts` → `src/utils/searchUtilities.ts`
- `src/utils/error-utils.ts` → `src/utils/errorUtils.ts`
- `src/utils/async-utils.ts` → `src/utils/asyncUtils.ts`
- `src/utils/command-menu-utils.ts` → `src/utils/commandMenuUtils.ts`
- `src/utils/sanitization-utils.ts` → `src/utils/sanitizationUtils.ts`
- `src/utils/geographic-utils.ts` → `src/utils/geographicUtils.ts`
- `src/utils/security-utils.ts` → `src/utils/securityUtils.ts`
- `src/utils/color-utils.ts` → `src/utils/colorUtils.ts`
- `src/utils/address-lookup.ts` → `src/utils/addressLookup.ts`
- `src/utils/chart-utils.ts` → `src/utils/chartUtils.ts`
- `src/utils/input-sanitizer.ts` → `src/utils/inputSanitizer.ts`
- `src/utils/id-generators.ts` → `src/utils/idGenerators.ts`
- `src/utils/file-utils.ts` → `src/utils/fileUtils.ts`
- `src/utils/validation-utilities.ts` → `src/utils/validationUtilities.ts`
- `src/utils/data-transformers.ts` → `src/utils/dataTransformers.ts`
- `src/utils/string-utils.ts` → `src/utils/stringUtils.ts`
- `src/utils/css-utils.ts` → `src/utils/cssUtils.ts`
- `src/utils/validation-utils.ts` → `src/utils/validationUtils.ts`
- `src/utils/csrf-utils.ts` → `src/utils/csrfUtils.ts`
- `src/utils/resident-form-utils.ts` → `src/utils/residentFormUtils.ts`
- `src/services/security-audit-service.ts` → `src/services/securityAuditService.ts`
- `src/services/command-menu-service.ts` → `src/services/commandMenuService.ts`
- `src/services/cache-service.ts` → `src/services/cacheService.ts`
- `src/services/address-service.ts` → `src/services/addressService.ts`
- `src/services/database-service.ts` → `src/services/databaseService.ts`
- `src/services/resident-repository.ts` → `src/services/residentRepository.ts`
- `src/services/form-data-transformers.ts` → `src/services/formDataTransformers.ts`
- `src/services/sync-service.ts` → `src/services/syncService.ts`
- `src/services/user-repository.ts` → `src/services/userRepository.ts`
- `src/services/household-repository.ts` → `src/services/householdRepository.ts`
- `src/services/resident-details-fetcher.ts` → `src/services/residentDetailsFetcher.ts`
- `src/services/household-fetcher.ts` → `src/services/householdFetcher.ts`
- `src/services/base-repository.ts` → `src/services/baseRepository.ts`
- `src/services/resident-mapper.ts` → `src/services/residentMapper.ts`
- `src/services/auth-service.ts` → `src/services/authService.ts`

Associated test files (move and rename):
- `src/utils/__tests__/file-utils.test.ts` → `src/utils/tests/fileUtils.test.ts`
- `src/services/__tests__/resident-mapper.test.ts` → `src/services/tests/residentMapper.test.ts`
- `src/services/__tests__/household-fetcher.test.ts` → `src/services/tests/householdFetcher.test.ts`

## Hook Naming Issues
- `src/hooks/utilities/createValidationHook.ts` → Prefer moving to `src/lib/validation/createValidationHook.ts`. If it’s a hook, rename to `src/hooks/utilities/useCreateValidationHook.ts`.

## TSX Utilities Using Hyphen-Case (convert to camelCase)
- `src/lib/ui/lazy-components.tsx` → `src/lib/ui/lazyComponents.tsx`
- `src/lib/ui/lazy-components-alt.tsx` → `src/lib/ui/lazyComponentsAlt.tsx`
- `src/lib/ui/lazy-loading.tsx` → `src/lib/ui/lazyLoading.tsx`
- `src/lib/forms/field-renderers.tsx` → `src/lib/forms/fieldRenderers.tsx`
- `src/lib/hoc-utils.tsx` → `src/lib/hocUtils.tsx`
- `src/lib/storybook-utils.tsx` → `src/lib/storybookUtils.tsx`
- `src/lib/keyboard-utils.tsx` → `src/lib/keyboardUtils.tsx`

Rationale: These files primarily provide utilities/HOC factories, not component modules; per docs, utility files should be camelCase.

## Oversized Files (>300 lines) — Split/Refactor Recommendations

Top candidates and suggested splits (group by domain):

- `src/types/components.ts` (937)
  - Split to `src/types/components/`:
    - `common.ts`, `forms.ts`, `charts.ts`, `tables.ts`, `layout.ts`
  - Keep `src/types/components.ts` as a barrel.

- `src/types/database.ts` (912)
  - Split per table/domain under `src/types/database/`:
    - `households.ts`, `residents.ts`, `geo.ts`, `auth.ts`, `lookups.ts`
  - Export via `src/types/database/index.ts`.

- `src/lib/data/supabase.ts` (802)
  - Split to `src/lib/data/supabase/`:
    - `client.ts` (init), `queries.ts`, `mutations.ts`, `types.ts`, `helpers.ts`
  - Keep public API stable with barrel export.

- `src/types/auth.ts` (655)
  - Split to `src/types/auth/`:
    - `user.ts`, `profile.ts`, `roles.ts`, `session.ts`, `requests.ts`, `responses.ts`

- `src/lib/security/rate-limit.ts` (643)
  - Split to `src/lib/security/rate-limit/`:
    - `middleware.ts`, `stores.ts` (redis/memory), `algorithms.ts`, `types.ts`

- `src/lib/database/query-optimizer.ts` (623) and `src/lib/database/query-builders.ts` (601)
  - Split by feature:
    - `builders/select.ts`, `builders/filters.ts`, `builders/pagination.ts`, `builders/sorting.ts`
    - `optimizer/cost-model.ts`, `optimizer/rules.ts`, `optimizer/util.ts`

- `src/types/services.ts` (614)
  - Split by service domains: `cache.ts`, `logging.ts`, `audit.ts`, `api.ts`.

- `src/lib/storybook-utils.tsx` (580)
  - Split to `src/lib/storybook/`: `decorators.tsx`, `parameters.ts`, `mocks.ts`, `preview-helpers.tsx`.

- `src/types/utilities.ts` (553)
  - Split by category: `string.ts`, `date.ts`, `validation.ts`, `format.ts`.

- `src/types/hooks.ts` (546)
  - Split per hook domain: `ui.ts`, `api.ts`, `validation.ts`, `dashboard.ts`.

- `src/lib/authentication/validationUtils.ts` (533)
  - Split into `validators/` and `formatters/` modules.

- `src/services/base-repository.ts` (502)
  - Split to `src/services/repository/`:
    - `baseRepository.ts`, `queryBuilder.ts`, `filters.ts`, `pagination.ts`, `sorting.ts`

- `src/hooks/dashboard/useDashboardCalculations.ts` (500)
  - Extract heavy logic to `src/lib/dashboard/calculations.ts` and `selectors.ts`. Keep hook thin.

- `src/types/index.ts` (499)
  - Reduce to barrel-only; move concrete types to domain files.

- `src/types/api.ts` (493) and `src/types/api-requests.ts` (336)
  - Split into `api/requests.ts`, `api/responses.ts`, `api/common.ts`.

- `src/types/addresses.ts` (491)
  - Split into `addresses/core.ts`, `addresses/psgc.ts`, `addresses/forms.ts`.

- `src/lib/authentication/responseUtils.ts` (489), `src/lib/authentication/auth-helpers.ts` (432), `src/lib/authentication/auth.ts` (432)
  - Group under `src/lib/authentication/`:
    - `helpers.ts`, `responses.ts`, `sessions.ts`, `errors.ts`

- `src/lib/validation/*` (utilities.ts 487, schemas.ts 437, formValidators.ts 329, sanitizers.ts 328, validation.ts 318)
  - Split per concern: `schema/`, `sanitizers/`, `formatters/`, `executors/`, with small focused files.

- `src/services/*` (several >300)
  - `resident.service.ts`, `household.service.ts`, `address-service.ts`, etc.:
    - Extract pure helpers to `src/services/helpers/` and shared repository utils to `src/services/repository/`.

- `src/utils/*` (several >300)
  - Break large utility modules by topic and keep file names camelCase.

Remaining files over 300 lines (subset):
```
src/lib/command-menu/items-utils.ts:481
src/services/security-audit-service.ts:481
src/hooks/api/useGeographicData.ts:476
src/lib/data/offline-storage.ts:469
src/types/residents.ts:468
src/lib/authentication/auditUtils.ts:453
src/utils/sanitization-utils.ts:452
src/utils/validation-utilities.ts:438
src/services/user-repository.ts:428
src/utils/resident-form-utils.ts:428
src/lib/forms/field-renderers.tsx:422
src/lib/performance/pwaPerformanceUtils.ts:419
src/lib/security/audit-storage.ts:419
src/types/forms.ts:415
src/utils/input-sanitizer.ts:414
src/services/household-repository.ts:407
src/lib/performance/performanceMonitor.ts:405
src/services/sync-service.ts:405
src/hooks/crud/useResidents.ts:401
src/hooks/ui/useCommandMenuWithApi.ts:393
src/services/address-service.ts:393
src/lib/caching/response-cache.ts:389
src/lib/security/file-security.ts:388
src/lib/security/threat-detection.ts:387
src/lib/api/psgc-handlers.ts:379
src/types/charts.ts:375
src/lib/keyboard-utils.tsx:373
src/services/geographic.service.ts:371
src/lib/performance/performanceUtils.ts:370
src/hooks/validation/useResidentValidationCore.ts:367
src/types/validation.ts:363
src/lib/config/environment.ts:360
src/lib/form-utils.ts:357
src/lib/database/connection-pool.ts:352
src/types/households.ts:350
src/hooks/utilities/useRetryLogic.ts:348
src/utils/chart-utils.ts:347
src/hooks/utilities/useLogger.ts:345
src/providers/AppProvider.tsx:342
src/types/errors.ts:337
src/lib/types/resident-detail.ts:329
src/services/resident-repository.ts:328
src/types/page-props.ts:327
src/utils/error-utils.ts:325
src/lib/ui/accessibility.ts:321
src/hooks/search/useOptimizedHouseholdSearch.ts:314
src/hooks/validation/useResidentValidation.ts:309
src/lib/caching/redis-client.ts:306
src/lib/logging/client-logger.ts:301
```

## Additional Observations
- Import order generally follows the standard in sampled files; enforce via ESLint to ensure consistency.
- Ensure “one primary export per file” where feasible; large catch-all files should be split and re-exported via barrels.
- Keep hooks lean by offloading heavy logic to lib utils.

## Migration Plan (High-Level)
- Phase 1: Directory renames (`Providers`, `ClientProviders`) and move `__tests__` → `tests`.
- Phase 2: Batch utility/service renames to camelCase (10–15 files per PR), with codemod to update imports.
- Phase 3: TSX utility renames to camelCase; verify storybook/build.
- Phase 4: Split top 10 oversized files with barrel exports to avoid breaking external imports.
- Phase 5: Add ESLint rules for file naming (no exceptions besides what docs already imply) and line count warnings.

## Codemod (Imports Update) — Suggested Script
Run in repo root after each batch of renames:
```
rg -n --json "from '([^"]+)'|require\(([^)]+)\)" src | node scripts/renamer.js
```
Where `scripts/renamer.js` maps old → new paths from the batch and rewrites import specifiers. Alternatively, use `ts-morph` to update imports safely.

