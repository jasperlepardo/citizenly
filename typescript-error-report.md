# TypeScript Error Report

## Summary
Total errors found: **488 TypeScript errors** across **115+ files**

### Top Error Files (High Priority):
- `src/lib/security/threatDetection.ts` (25 errors)
- `src/services/domain/residents/residentDataProcessingService.ts` (20 errors)
- `src/services/domain/geography/geographicDomainService.ts` (15 errors)
- `src/components/templates/Form/Resident/ResidentForm.tsx` (14 errors)
- `src/hooks/utilities/useAddressResolution.ts` (13 errors)

### Error Categories:
- **Import/Export Issues**: ~120 errors (missing default exports, module not found)
- **Type Annotations**: ~150 errors (implicit any types)
- **Type Mismatches**: ~80 errors (string/number/boolean mismatches)
- **Missing Properties**: ~60 errors (properties don't exist on types)
- **Module Resolution**: ~78 errors (cannot find modules)

---

## Complete File-by-File Error Analysis

### Critical Security Files (25+ errors)

#### `src/lib/security/threatDetection.ts` (25 errors)
- **Line 8**: No exported member 'ThreatDetectionEvent' from auditStorage
- **Line 10**: Cannot find module '@/types/security'
- **Line 142-185**: Multiple parameters implicitly have 'any' type
- **Fix**: Add proper type definitions for security types and function parameters

### High-Error Service Files (15-20 errors)

#### `src/services/domain/residents/residentDataProcessingService.ts` (20 errors)
- Multiple type mismatches in data processing functions
- Missing type annotations for processing parameters
- **Fix**: Add proper types for resident data processing

#### `src/services/domain/geography/geographicDomainService.ts` (15 errors)
- Geographic data type mismatches
- Missing module imports for geographic types
- **Fix**: Add geographic data type definitions

### Component Files (10-15 errors)

#### `src/components/templates/Form/Resident/ResidentForm.tsx` (14 errors)
- **Line 19**: Cannot find module '@/types'
- **Line 146-147**: Cannot assign number to string
- **Line 727-742**: Multiple null/undefined assignment issues
- **Fix**: Add proper form data types and null checks

#### `src/hooks/utilities/useAddressResolution.ts` (13 errors)
- Address resolution type mismatches
- Missing geographic type imports
- **Fix**: Add address resolution types

#### `src/hooks/command-menu/useCommandMenu.ts` (12 errors)
- **Line 6**: No exported member 'CommandMenuItemType'
- **Line 21-52**: Multiple implicit 'any' parameters
- **Fix**: Add command menu types and parameter annotations

#### `src/components/organisms/FormSection/Resident/PersonalInformation/FormField/BirthInformation.tsx` (12 errors)
- **Line 5**: Cannot find module '@/components'
- **Line 56**: Variable used before declaration
- **Line 169**: Symbol to string conversion issue
- **Fix**: Fix imports and variable declarations

### Test Files

#### `src/app/api/residents/__tests__/security.rls.test.ts` (5 errors)
- **Line 113**: Property 'barangay_code' does not exist on array type
- **Line 135**: Property 'city_municipality_code' does not exist on array type
- **Line 183**: Property 'barangay_code' does not exist on array type
- **Line 184**: Property 'barangay_code' does not exist on array type
- **Line 209**: Property 'code' does not exist on array type

**Fix**: Add proper type annotations for test data arrays

---

### Component Files

#### `src/components/organisms/CreateHouseholdModal/CreateHouseholdModal.tsx` (3 errors)
- **Line 7**: Missing default export for SelectField module
- **Line 575**: Parameter 'option' implicitly has 'any' type
- **Line 594**: Parameter 'option' implicitly has 'any' type

**Fix**: Update imports to named imports and add type annotations

#### `src/components/organisms/FormSection/Household/HouseholdDetails/FormField/HouseholdTypeInformation.tsx` (4 errors)
- **Line 3**: Missing default export for InputField module
- **Line 4**: Missing default export for SelectField module
- **Line 127**: Parameter 'e' implicitly has 'any' type
- **Line 159**: Parameter 'e' implicitly has 'any' type

**Fix**: Update imports and add event handler type annotations

#### `src/components/organisms/FormSection/Household/HouseholdDetails/FormField/IncomeAndHeadInformation.tsx` (3 errors)
- **Line 3**: Missing default export for InputField module
- **Line 4**: Missing default export for SelectField module
- **Line 84**: Parameter 'e' implicitly has 'any' type

**Fix**: Update imports and add event handler types

#### `src/components/organisms/FormSection/Household/HouseholdForm.tsx` (1 error)
- **Line 7**: Cannot find module './HouseholdDetails'

**Fix**: Update import path or create missing module

#### `src/components/organisms/FormSection/Household/LocationAndDemographics/FormField/AddressInformation.tsx` (3 errors)
- **Line 4**: Missing default export for InputField module
- **Line 5**: Missing default export for SelectField module
- **Line 233**: Parameter 'e' implicitly has 'any' type

**Fix**: Update imports and add event handler types

#### `src/components/organisms/FormSection/Household/LocationAndDemographics/FormField/DemographicsInformation.tsx` (4 errors)
- **Line 3**: Missing default export for InputField module
- **Line 54**: Parameter 'e' implicitly has 'any' type
- **Line 71**: Parameter 'e' implicitly has 'any' type
- **Line 87**: Parameter 'e' implicitly has 'any' type

**Fix**: Update imports and add event handler types

#### `src/components/organisms/FormSection/Household/LocationAndDemographics/LocationAndDemographics.tsx` (5 errors)
- **Line 4**: No exported member 'AddressInformationData'
- **Line 7**: No exported member 'DemographicsInformationData'
- **Line 10**: Cannot find module '@/types'
- **Line 91**: Cannot assign 'string | number | symbol' to 'string'
- **Line 98**: Cannot assign 'string | number | symbol' to 'string'

**Fix**: Update imports and add proper type constraints

---

### Resident Form Components

#### `src/components/organisms/FormSection/Resident/ContactInformation/ContactInformation.tsx` (2 errors)
- **Line 11**: Cannot find module '@/types'
- **Line 70**: Cannot assign 'string | number | symbol' to 'string'

#### `src/components/organisms/FormSection/Resident/ContactInformation/FormField/ContactDetails.tsx` (5 errors)
- **Line 3**: Cannot find module '@/components'
- **Line 6**: Cannot find module '@/types'
- **Line 60**: Parameter 'e' implicitly has 'any' type
- **Line 77**: Parameter 'e' implicitly has 'any' type
- **Line 94**: Parameter 'e' implicitly has 'any' type

#### `src/components/organisms/FormSection/Resident/MigrationInformation/MigrationInformation.tsx` (8 errors)
- **Line 3**: Cannot find module '@/components'
- **Line 9**: Cannot find module '@/types'
- **Line 129**: Parameter 'option' implicitly has 'any' type
- **Line 204**: Parameter 'e' implicitly has 'any' type
- **Line 222**: Parameter 'e' implicitly has 'any' type
- **Line 236**: Parameter 'e' implicitly has 'any' type
- **Line 248**: Parameter 'e' implicitly has 'any' type
- **Line 261**: Parameter 'e' implicitly has 'any' type

#### `src/components/organisms/FormSection/Resident/PersonalInformation/FormField/BasicInformation.tsx` (7 errors)
- **Line 3**: Cannot find module '@/components'
- **Line 10**: Cannot find module '@/types'
- **Line 107**: Parameter 'e' implicitly has 'any' type
- **Line 120**: Parameter 'e' implicitly has 'any' type
- **Line 134**: Parameter 'e' implicitly has 'any' type
- **Line 147**: Parameter 'e' implicitly has 'any' type
- **Line 210**: Parameter 'e' implicitly has 'any' type

#### `src/components/organisms/FormSection/Resident/PersonalInformation/FormField/BirthInformation.tsx` (11 errors)
- **Line 5**: Cannot find module '@/components'
- **Line 9**: Cannot find module '@/types'
- **Line 56**: Variable 'isLookingUpPsgc' used before declaration
- **Line 56**: Variable 'isLookingUpPsgc' used before being assigned
- **Line 169**: Implicit conversion of symbol to string
- **Line 183**: Parameter 'place' implicitly has 'any' type
- **Line 194**: Parameter 'place' implicitly has 'any' type
- **Line 271**: Parameter 'opt' implicitly has 'any' type
- **Line 275**: Parameter 'opt' implicitly has 'any' type
- **Line 310**: Parameter 'opt' implicitly has 'any' type
- **Line 337**: Parameter 'e' implicitly has 'any' type
- **Line 355**: Parameter 'option' implicitly has 'any' type

---

### Service Files

#### `src/services/infrastructure/api/responseService.ts` (4 errors)
- **Line 213**: Object literal 'requestId' property doesn't exist
- **Line 216**: Object literal 'requestId' property doesn't exist
- **Line 221**: Object literal 'requestId' property doesn't exist
- **Line 233**: Object literal 'timestamp' property doesn't exist

#### `src/services/infrastructure/repositories/SupabaseHouseholdRepository.ts` (4 errors)
- **Line 23**: Cannot assign 'service' to boolean parameter
- **Line 34**: No overload matches for insert call
- **Line 61**: Cannot assign Partial<HouseholdData> to 'never'
- **Line 185**: Cannot assign object to 'never'

#### `src/services/infrastructure/ui/commandMenuService.ts` (1 error)
- **Line 60**: Missing properties 'data' and 'score' from CommandMenuSearchResult

#### `src/services/shared/cache/cacheService.ts` (3 errors)
- **Line 232**: Cannot find name 'cacheService'
- **Line 243**: Cannot find name 'cacheService'
- **Line 272**: Cannot find name 'cacheService'

#### `src/services/shared/tests/residentMapper.test.ts` (5 errors)
- **Line 48**: Cannot assign number to string
- **Line 49**: Cannot assign number to string
- **Line 109**: Cannot assign undefined to string
- **Line 125**: Cannot assign number to string
- **Line 126**: Cannot assign number to string

---

### Type Definition Files

#### `src/types/app/ui/components.ts` (12 errors)
- **Line 258**: Duplicate identifier 'name'
- **Line 266**: Duplicate identifier 'name'
- **Line 276**: Cannot find name 'ComponentWithChildren'
- **Line 290**: Cannot find name 'ComponentWithChildren'
- **Line 318**: Cannot find name 'BaseComponentProps'
- **Line 348**: Cannot find name 'BaseComponentProps'
- **Line 399**: Cannot find name 'ComponentSize'
- **Line 412**: Cannot find name 'BaseComponentProps'
- **Line 420**: Cannot find name 'ComponentSize'
- **Line 438**: Cannot find name 'BaseComponentProps'
- **Line 594**: Cannot find name 'BaseComponentProps'

#### `src/types/domain/households/households.ts` (2 errors)
- **Line 319**: Cannot find module '../../../constants/householdFormOptions'
- **Line 326**: Cannot find module '../../../constants/householdFormOptions'

---

### Hook Files

#### `src/hooks/api/useGeographicData.ts` (7 errors)
- **Line 10**: Cannot find module '@/types'
- **Line 37**: Object literal 'regions' property doesn't exist
- **Line 407**: Object literal 'regions' property doesn't exist
- **Line 441-446**: Properties don't exist on GeographicState type

#### `src/hooks/command-menu/useCommandMenu.ts` (14 errors)
- **Line 6**: No exported member 'CommandMenuItemType'
- **Line 21**: Parameter 'item' implicitly has 'any' type
- **Line 23**: Parameter 'item' implicitly has 'any' type
- **Line 30**: Parameter 'item' implicitly has 'any' type
- **Line 49**: Binding element 'score' implicitly has 'any' type
- **Line 50**: Parameters 'a' and 'b' implicitly have 'any' type
- **Line 52**: Binding element 'item' implicitly has 'any' type
- **Line 63**: Expected 1 argument, but got 2
- **Line 69**: Type mismatch in object assignment

---

### Template Files

#### `src/components/templates/Form/Resident/ResidentForm.tsx` (14 errors)
- **Line 19**: Cannot find module '@/types'
- **Line 146**: Cannot assign number to string
- **Line 147**: Cannot assign number to string
- **Line 727-742**: Multiple type mismatches with null/undefined assignments

#### `src/components/templates/MainLayout/MainLayout.tsx` (1 error)
- **Line 8**: No exported member 'Header'

---

### Constants Files

#### `src/constants/residentFormDefaults.ts` (2 errors)
- **Line 28**: Cannot assign number to string
- **Line 29**: Cannot assign number to string

#### `src/constants/apiLimits.ts` (1 error)
- **Line 15**: Cannot find module '@/types/shared/constants'

---

## Priority Fixes Needed

### High Priority (Blocking compilation):
1. **Module Resolution**: Fix @/types, @/components imports across 40+ files
2. **Missing Default Exports**: Update InputField, SelectField, and other component exports
3. **Type Definitions**: Fix missing base types (ComponentWithChildren, BaseComponentProps)

### Medium Priority (Type Safety):
1. **Event Handler Types**: Add proper typing for 76+ implicit any parameters
2. **Service Layer Types**: Fix repository and API service type mismatches
3. **Test Types**: Fix test file type assertions

### Low Priority (Cleanup):
1. **Duplicate Identifiers**: Remove duplicate 'name' properties
2. **Unused Variables**: Clean up variables used before declaration
3. **String Conversions**: Handle symbol to string conversions

---

### Complete File List with Error Counts

```
25 errors: src/lib/security/threatDetection.ts
20 errors: src/services/domain/residents/residentDataProcessingService.ts
15 errors: src/services/domain/geography/geographicDomainService.ts
14 errors: src/components/templates/Form/Resident/ResidentForm.tsx
13 errors: src/hooks/utilities/useAddressResolution.ts
12 errors: src/hooks/command-menu/useCommandMenu.ts
12 errors: src/components/organisms/FormSection/Resident/PersonalInformation/FormField/BirthInformation.tsx
11 errors: src/types/app/ui/components.ts
10 errors: src/services/domain/residents/residentMapper.ts
10 errors: src/lib/data/query-utils.ts
10 errors: src/components/organisms/FormSection/Resident/PhysicalPersonalDetails/FormField/PhysicalCharacteristics.tsx
9 errors: src/services/domain/households/householdDomainService.ts
9 errors: src/services/domain/auth/authDomainService.ts
9 errors: src/hooks/api/useGeographicData.ts
8 errors: src/hooks/search/useGenericPaginatedSearch.ts
8 errors: src/hooks/dashboard/useDashboardApi.ts
8 errors: src/components/organisms/FormSection/Resident/MigrationInformation/MigrationInformation.tsx
7 errors: src/lib/security/comprehensiveAudit.ts
7 errors: src/hooks/utilities/useHouseholdCodeGeneration.ts
7 errors: src/hooks/search/useGenericSearch.ts
7 errors: src/components/organisms/FormSection/Resident/PersonalInformation/FormField/BasicInformation.tsx
6+ errors: 60+ additional files
```

## Recommended Action Plan

### Phase 1: Critical Infrastructure (Week 1)
1. **Security Types**: Fix `src/lib/security/threatDetection.ts` (25 errors)
2. **Core Services**: Fix resident and geography domain services (35 errors)
3. **Base Types**: Add missing `@/types` module definitions

### Phase 2: Component Infrastructure (Week 2)
1. **Form Components**: Fix resident form templates (14+ errors)
2. **Field Components**: Fix InputField/SelectField exports
3. **Hook Types**: Fix utility hooks (13+ errors per file)

### Phase 3: Type Safety (Week 3)
1. **Event Handlers**: Add types to 150+ implicit 'any' parameters
2. **Command Menu**: Fix command menu types and interfaces
3. **Geographic Data**: Fix geographic type definitions

### Phase 4: Service Layer (Week 4)
1. **Repository Types**: Fix Supabase repository type mismatches
2. **API Response Types**: Fix response service type issues
3. **Cache Service**: Fix cache service naming conflicts

### Phase 5: Testing & Cleanup (Week 5)
1. **Test Types**: Fix all test file type assertions
2. **Duplicate Identifiers**: Remove duplicate type definitions
3. **Final Validation**: Ensure 0 TypeScript errors

**Critical**: The codebase has 488 TypeScript errors that need systematic resolution. Focus on infrastructure files first as they affect multiple dependent files.