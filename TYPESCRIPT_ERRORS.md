# TypeScript Error Resolution Plan

## Summary

- **Total Errors**: 113
- **Status**: Blocking pre-commit hooks
- **Priority**: High - preventing clean commits

## Error Categories

### 1. Test File Errors (High Priority)

**Files Affected**:

- `src/app/residents/page.test.tsx` - Mock function type issues
- `src/lib/__tests__/api-responses.test.ts` - NODE_ENV assignment issues

**Common Issues**:

- `mockResolvedValue` not recognized on typed functions
- Cannot assign to readonly `NODE_ENV`
- Missing properties in test contexts

**Solution**: Update test mocks with proper Jest types

### 2. Supabase Query Type Errors (Critical)

**Files Affected**:

- `src/app/api/auth/test-profile/route.ts`
- `src/app/api/user/geographic-location/route.ts`
- `src/lib/public-search.ts`

**Common Issues**:

- Properties don't exist on Supabase query results (arrays vs objects)
- Nested relationship properties not typed

**Solution**: Add type assertions or fix query structure

### 3. Component Export Issues (Medium)

**Files Affected**:

- `src/components/lazy/LazyComponents.tsx`
- Various organism components

**Common Issues**:

- Missing `default` export from index files
- Import/export mismatch

**Solution**: Fix component export patterns

### 4. Missing Module Dependencies (High)

**Files Affected**:

- `src/components/organisms/CreateHouseholdModal/HouseholdAddressForm.tsx`

**Common Issues**:

- Missing StreetSelector and SubdivisionSelector components

**Solution**: Create missing components or remove imports

### 5. Type Mismatches (Medium)

**Files Affected**:

- `src/app/residents/[id]/edit/page.tsx`
- `src/lib/api-auth.ts`
- `src/providers/ErrorBoundary.tsx`

**Common Issues**:

- String passed where Error expected
- Wrong argument types

**Solution**: Fix type usage in function calls

## Resolution Strategy

### Phase 1: Quick Fixes (1 hour)

1. Fix test mock types
2. Add type assertions for Supabase queries
3. Fix component exports

### Phase 2: Structural Fixes (2 hours)

1. Create missing components
2. Fix Error vs string usage
3. Update API response types

### Phase 3: Type Safety (2 hours)

1. Replace all `any` types
2. Add proper interfaces for API responses
3. Fix remaining type mismatches

## Commands to Run After Fixes

```bash
# Check TypeScript errors
npm run typecheck

# Run tests
npm test

# Run linter
npm run lint

# If all pass, commit
git add -A && git commit -m "fix: resolve TypeScript compilation errors"
```

## Files to Prioritize

1. **Most Critical** (blocking functionality):
   - `src/app/api/auth/test-profile/route.ts`
   - `src/app/api/user/geographic-location/route.ts`

2. **High Impact** (affecting tests):
   - `src/app/residents/page.test.tsx`
   - `src/lib/__tests__/api-responses.test.ts`

3. **User Facing** (components):
   - `src/components/lazy/LazyComponents.tsx`
   - `src/app/residents/[id]/edit/page.tsx`

## Next Steps

1. Start with Phase 1 quick fixes
2. Test each fix incrementally
3. Document any architectural decisions
4. Consider adding stricter TypeScript rules after cleanup
