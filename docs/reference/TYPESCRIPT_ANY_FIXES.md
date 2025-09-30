# TypeScript `any` Type Fixes Guide

## Overview

This guide provides step-by-step instructions to replace `any` types with proper TypeScript interfaces for better type safety and developer experience.

## 🎯 **Priority Fixes (Production Critical)**

### 1. **API Routes - Database Query Results**

**Files Affected:**
- `src/app/api/psgc/search/route.ts`
- `src/app/api/residents/route.ts` 
- `src/app/api/households/[id]/route.ts`

**Current Issue:**
```typescript
// ❌ Current (using any)
const results: any = await supabase.from('table').select('*');
const data: any = results.data;
```

**Fix:**
```typescript
// ✅ Fixed (proper types)
interface PSGCSearchResult {
  code: string;
  name: string;
  level: number;
  parent_code?: string;
  is_active: boolean;
}

const { data, error }: { data: PSGCSearchResult[] | null; error: any } = 
  await supabase.from('psgc_barangays').select('*');
```

**Implementation Steps:**
1. Create interface definitions in `src/types/database.ts`
2. Import interfaces in API routes
3. Type the Supabase query results
4. Handle error cases properly

### 2. **Form Event Handlers**

**Files Affected:**
- `src/components/organisms/Form/Resident/PersonalInformation/FormField/BasicInformation.tsx`
- `src/components/organisms/Form/Resident/PersonalInformation/FormField/BirthInformation.tsx`

**Current Issue:**
```typescript
// ❌ Current (using any)
const handleChange = (event: any) => {
  const { name, value } = event.target;
};
```

**Fix:**
```typescript
// ✅ Fixed (proper types)
import { ChangeEvent } from 'react';

const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = event.target;
};
```

### 3. **DataTable Generic Interfaces**

**File:** `src/components/organisms/DataTable/DataTable.tsx`

**Current Issue:**
```typescript
// ❌ Current (defaulting to any)
export interface TableColumn<T = any> {
  key: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}
```

**Fix:**
```typescript
// ✅ Fixed (proper generic constraints)
export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: keyof T | string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}
```

---

## 📋 **Step-by-Step Fix Implementation**

### **Phase 1: Create Type Definitions (1-2 hours)**

**✅ Good news:** Your type definitions are already comprehensive in `src/types/database.ts`! 

1. **Add Missing API Response Types:**

```typescript
// Add to src/types/database.ts

// API Event Handler Types
export interface FormChangeEvent extends ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {}

// PSGC Search Response Types  
export interface PSGCSearchResponse {
  code: string;
  name: string;
  level: number;
  parent_code?: string;
  is_active: boolean;
  type?: string;
  full_address?: string;
}

// Generic API Response Wrapper
export interface APIResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
  count?: number;
}

// Table Component Types
export interface TableRecord extends Record<string, unknown> {
  id: string | number;
}
```

### **Phase 2: Fix API Routes (2-3 hours)**

#### **Priority 1: PSGC Search Route**

**File:** `src/app/api/psgc/search/route.ts`

**Current Issues (Lines 97, 112, 146, etc.):**
```typescript
// ❌ Current
const results: any = await supabase.from('psgc_barangays').select('*');
```

**Fix:**
```typescript
// ✅ Fixed
import { PSGCBarangay, SupabaseQueryResponse } from '@/types/database';

const { data, error }: SupabaseQueryResponse<PSGCBarangay[]> = 
  await supabase.from('psgc_barangays').select('*');

if (error) {
  console.error('Database query error:', error.message);
  return Response.json({ error: 'Failed to fetch barangays' }, { status: 500 });
}

const results: PSGCBarangay[] = data || [];
```

#### **Priority 2: Residents API Route**

**File:** `src/app/api/residents/route.ts`

**Current Issues (Lines 248-250, 352, etc.):**
```typescript
// ❌ Current
const transformResident = (resident: any): any => {
  return {
    // transformation logic
  };
};
```

**Fix:**
```typescript
// ✅ Fixed
import { ResidentRecord } from '@/types/residents';
import { APIResponse } from '@/types/database';

const transformResident = (resident: ResidentRecord): ResidentRecord => {
  return {
    ...resident,
    // transformation logic with proper types
  };
};

// For API responses
const response: APIResponse<ResidentRecord[]> = {
  data: transformedResidents,
  success: true,
  count: residents.length
};
```

### **Phase 3: Fix Form Components (3-4 hours)**

#### **Priority 1: Event Handlers**

**Files:** Multiple form components

**Current Issues:**
```typescript
// ❌ Current
const handleChange = (event: any) => {
  const { name, value } = event.target;
};

const handleSubmit = (data: any) => {
  // handle form submission
};
```

**Fix:**
```typescript
// ✅ Fixed
import { ChangeEvent, FormEvent } from 'react';
import { FormChangeEvent } from '@/types/database';

const handleChange = (event: FormChangeEvent) => {
  const { name, value } = event.target;
};

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // handle form submission with proper types
};
```

#### **Priority 2: Form Field Components**

**File:** `src/components/organisms/Form/Resident/PersonalInformation/FormField/BirthInformation.tsx`

**Current Issues (Lines 92-117):**
```typescript
// ❌ Current
const regionOptions = regions?.map((region: any) => ({
  value: region.code,
  label: region.name
}));
```

**Fix:**
```typescript
// ✅ Fixed
import { PSGCRegion, PSGCProvince, PSGCCityMunicipality, PSGCBarangay } from '@/types/database';

interface SelectOption {
  value: string;
  label: string;
}

const regionOptions: SelectOption[] = regions?.map((region: PSGCRegion) => ({
  value: region.code,
  label: region.name
})) || [];
```

### **Phase 4: Fix DataTable Component (1 hour)**

**File:** `src/components/organisms/DataTable/DataTable.tsx`

**Current Issues:**
```typescript
// ❌ Current
export interface TableColumn<T = any> {
  render?: (value: any, record: T, index: number) => React.ReactNode;
}
```

**Fix:**
```typescript
// ✅ Fixed
import { TableRecord } from '@/types/database';

export interface TableColumn<T extends TableRecord = TableRecord> {
  key: keyof T | string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  dataIndex?: keyof T | ((record: T) => unknown);
}

export interface DataTableProps<T extends TableRecord = TableRecord> {
  data: T[];
  columns: TableColumn<T>[];
  // ... other props
}
```

### **Phase 5: Fix Test Files (Optional - 1 hour)**

**Note:** `any` types in test files are generally acceptable for mocking, but can be improved:

```typescript
// ✅ Better test types
interface MockResident {
  id: string;
  first_name: string;
  last_name: string;
  // ... other required fields
}

const mockResident: MockResident = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe'
};
```

---

## 🛠️ **Implementation Checklist**

### **Before Starting:**
- [ ] Backup current code
- [ ] Create feature branch: `git checkout -b fix/typescript-any-types`
- [ ] Run tests to ensure starting point: `npm test`

### **Phase 1: Type Definitions**
- [ ] Add missing types to `src/types/database.ts`
- [ ] Create `src/types/forms.ts` for form-specific types
- [ ] Export all types from `src/types/index.ts`

### **Phase 2: API Routes**
- [ ] Fix `src/app/api/psgc/search/route.ts`
- [ ] Fix `src/app/api/residents/route.ts`
- [ ] Fix `src/app/api/households/[id]/route.ts`
- [ ] Test API endpoints

### **Phase 3: Form Components**
- [ ] Fix event handlers in all form components
- [ ] Update form field components
- [ ] Test form functionality

### **Phase 4: DataTable Component**
- [ ] Update TableColumn interface
- [ ] Update DataTable props
- [ ] Test table functionality

### **Phase 5: Validation**
- [ ] Run TypeScript compiler: `npx tsc --noEmit`
- [ ] Run ESLint: `npm run lint`
- [ ] Run tests: `npm test`
- [ ] Manual testing of affected features

---

## 🧰 **Useful Commands**

```bash
# Check TypeScript errors
npx tsc --noEmit

# Check specific any type violations
npm run lint | grep "Unexpected any"

# Count remaining any types
npm run lint | grep -c "Unexpected any"

# Test specific components
npm test -- --testPathPattern="DataTable|Form"
```

---

## 📊 **Expected Results After Fixes**

### **Before:**
- ~60 `any` type violations
- Limited IDE autocomplete
- Potential runtime errors
- Reduced type safety

### **After:**
- 0-5 remaining `any` types (only in acceptable places like tests)
- Full IDE autocomplete and IntelliSense
- Better error catching at compile time
- Improved developer experience
- Production-ready type safety

### **Time Investment vs Benefits:**
- **Total Time:** 7-10 hours
- **Long-term Savings:** 20+ hours (reduced debugging, better DX)
- **Production Readiness:** Significantly improved
- **Team Onboarding:** Much faster with proper types

---

## ⚠️ **Common Pitfalls to Avoid**

1. **Don't replace `any` with `unknown` everywhere** - Use specific types
2. **Don't create overly complex union types** - Keep interfaces simple
3. **Don't ignore existing type files** - Reuse what's already defined
4. **Don't forget to update imports** - Add type imports where needed
5. **Don't skip testing** - Verify functionality after each phase

---

## 🎯 **Priority Order Summary**

1. **API Routes** (Critical) - Affects data integrity
2. **Form Components** (High) - Affects user experience  
3. **DataTable** (Medium) - Affects UI consistency
4. **Test Files** (Low) - Acceptable to keep `any` in tests

This systematic approach will eliminate production-critical `any` types while maintaining code functionality and improving the overall developer experience.