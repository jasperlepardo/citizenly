# Coding Standards

> **The Definitive Guide to Code Quality in the Citizenly Project**
> 
> This document establishes code structure, patterns, and quality standards across the entire codebase. Follow these rules for consistent, maintainable, secure code that complements our [naming conventions](./COMPREHENSIVE_NAMING_CONVENTIONS.md).

## 📖 Table of Contents

1. [🏗️ Code Structure & Organization](#️-code-structure--organization)
2. [⚡ TypeScript Standards](#-typescript-standards)
3. [⚛️ React Standards](#️-react-standards)
4. [🛡️ Security Standards](#️-security-standards)
5. [🚀 Performance Standards](#-performance-standards)
6. [📝 Documentation Standards](#-documentation-standards)
7. [🧪 Testing Standards](#-testing-standards)
8. [🔧 Code Quality Tools](#-code-quality-tools)
9. [📋 Code Review Guidelines](#-code-review-guidelines)
10. [⚠️ Common Anti-Patterns](#️-common-anti-patterns)
11. [📊 Metrics & Enforcement](#-metrics--enforcement)

---

## 🏗️ Code Structure & Organization

### **Function Size & Complexity**

#### ✅ **Keep functions small and focused**
```typescript
✅ Good - Single responsibility
function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

✅ Good - Extracted helper functions
function validateResidentData(data: ResidentFormData): ValidationResult {
  const errors: string[] = [];
  
  if (!isValidName(data.firstName)) {
    errors.push('First name is required');
  }
  
  if (!isValidBirthdate(data.birthdate)) {
    errors.push('Valid birthdate is required');
  }
  
  if (!isValidBarangayCode(data.barangayCode)) {
    errors.push('Valid barangay is required');
  }
  
  return { isValid: errors.length === 0, errors };
}

❌ Bad - Too large, multiple responsibilities
function processResidentRegistration(data: any) {
  // 50+ lines of validation, processing, API calls, error handling
  // This should be broken down into smaller functions
}
```

#### **📏 Size Guidelines:**
- **Functions**: Max 20-30 lines
- **React Components**: Max 150 lines (consider breaking into smaller components)
- **Files**: Max 300 lines (consider splitting into multiple files)
- **Cognitive Complexity**: Max 15 (SonarQube standard)

### **File Organization Patterns**

#### ✅ **One primary export per file**
```typescript
// ✅ ResidentFormWizard.tsx
export default function ResidentFormWizard({ onSubmit }: Props) {
  // Component implementation
}

// ✅ authUtils.ts
export function validateCredentials(email: string, password: string): boolean {
  // Implementation
}

export function generateAuthToken(userId: string): string {
  // Implementation
}

// Export related functions together
```

#### ✅ **Barrel exports for clean imports**
```typescript
// ✅ components/atoms/index.ts
export { default as Button } from './Button/Button';
export { default as Input } from './Input/Input';
export { default as Text } from './Text/Text';

// ✅ Usage
import { Button, Input, Text } from '@/components/atoms';
```

### **Import/Export Conventions**

#### ✅ **Import organization**
```typescript
// ✅ Import order
// 1. React/Next.js imports
import React, { useState, useEffect } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. Third-party libraries
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// 3. Internal imports (absolute paths)
import { Button, Input } from '@/components/atoms';
import { useAuth } from '@/contexts/AuthContext';
import { validateInput } from '@/lib/validation';

// 4. Types (separate from implementation)
import type { User, AuthUserProfile } from '@/types/auth';
import type { FormEvent, ChangeEvent } from 'react';
```

#### ✅ **Export conventions**
```typescript
// ✅ Default exports for main component/function
export default function ResidentForm() { }

// ✅ Named exports for utilities/types
export const ValidationRules = { };
export type ResidentFormData = { };

// ✅ Type-only exports
export type { UserProfile, AuthContextType };
```

---

## ⚡ TypeScript Standards

### **Type Definitions**

#### ✅ **Interface vs Type usage**
```typescript
// ✅ Use interfaces for object shapes that might be extended
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AdminProfile extends UserProfile {
  permissions: string[];
  lastLogin: Date;
}

// ✅ Use types for unions, primitives, and computed types
type UserRole = 'admin' | 'barangay_admin' | 'resident';
type ApiResponse<T> = {
  data: T;
  error: string | null;
  success: boolean;
};

// ✅ Use types for utility/mapped types
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

#### ✅ **Strict typing patterns**
```typescript
// ✅ Avoid 'any' - use proper types
interface ApiResidentData {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string; // ISO date string
  barangayCode: string;
}

// ✅ Use discriminated unions for complex states
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Resident[] }
  | { status: 'error'; error: string };

// ✅ Use readonly for immutable data
interface ReadonlyConfig {
  readonly apiUrl: string;
  readonly maxRetries: number;
  readonly features: readonly string[];
}

❌ // Avoid loose typing
function processData(data: any): any { }
function updateUser(user: object): void { }
```

### **Generic Patterns**

#### ✅ **Reusable generic types**
```typescript
// ✅ API response wrapper
interface ApiResponse<TData> {
  data: TData | null;
  error: string | null;
  message?: string;
}

// ✅ Form field configuration
interface FormField<TValue> {
  name: string;
  value: TValue;
  label: string;
  required: boolean;
  validator?: (value: TValue) => string | null;
}

// ✅ Database entity base
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface Resident extends BaseEntity {
  firstName: string;
  lastName: string;
  barangayCode: string;
}
```

### **Error Handling Patterns**

#### ✅ **Structured error handling**
```typescript
// ✅ Custom error types
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public table?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ✅ Result pattern for error handling
type Result<TData, TError = Error> = 
  | { success: true; data: TData }
  | { success: false; error: TError };

async function createResident(data: ResidentFormData): Promise<Result<Resident>> {
  try {
    const validationResult = validateResidentData(data);
    if (!validationResult.isValid) {
      return { 
        success: false, 
        error: new ValidationError('Invalid data', 'form', 'VALIDATION_FAILED') 
      };
    }

    const resident = await database.residents.create(data);
    return { success: true, data: resident };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}
```

---

## ⚛️ React Standards

### **Component Structure**

#### ✅ **Component organization pattern**
```typescript
// ✅ Component file structure
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input } from '@/components/atoms';
import { useAuth } from '@/contexts/AuthContext';
import type { ResidentFormData } from '@/types/residents';

// 1. Types and interfaces
interface ResidentFormProps {
  initialData?: Partial<ResidentFormData>;
  onSubmit: (data: ResidentFormData) => void;
  onCancel: () => void;
}

// 2. Constants and defaults
const DEFAULT_FORM_DATA: ResidentFormData = {
  firstName: '',
  lastName: '',
  birthdate: '',
  sex: 'male',
  civilStatus: 'single',
  barangayCode: ''
};

// 3. Component implementation
export default function ResidentForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: ResidentFormProps) {
  // 3a. Hooks (state, context, custom hooks)
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState<ResidentFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
    barangayCode: userProfile?.barangayCode || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3b. Effects
  useEffect(() => {
    if (userProfile?.barangayCode && !formData.barangayCode) {
      setFormData(prev => ({
        ...prev,
        barangayCode: userProfile.barangayCode
      }));
    }
  }, [userProfile, formData.barangayCode]);

  // 3c. Event handlers
  const handleInputChange = useCallback((field: keyof ResidentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    setIsSubmitting(true);
    try {
      const validation = validateFormData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  // 3d. Render
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form implementation */}
    </form>
  );
}

// 4. Helper functions (if component-specific)
function validateFormData(data: ResidentFormData) {
  // Validation logic
}
```

### **Hook Usage Guidelines**

#### ✅ **Custom hooks patterns**
```typescript
// ✅ Custom hook for data fetching
function useResidents(barangayCode: string) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchResidents(barangayCode);
      setResidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load residents');
    } finally {
      setLoading(false);
    }
  }, [barangayCode]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { residents, loading, error, refetch };
}

// ✅ Custom hook for form handling
function useForm<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
  }, [initialData]);

  return { data, errors, updateField, setErrors, reset };
}
```

### **State Management Patterns**

#### ✅ **State organization**
```typescript
// ✅ Group related state
function DashboardPage() {
  // Group UI state
  const [uiState, setUiState] = useState({
    loading: true,
    selectedTab: 'overview',
    isModalOpen: false
  });

  // Group data state  
  const [data, setData] = useState({
    residents: [] as Resident[],
    households: [] as Household[],
    stats: null as DashboardStats | null
  });

  // Or use useReducer for complex state
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
}

// ✅ Reducer pattern for complex state
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESIDENTS'; payload: Resident[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_DATA' };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RESIDENTS':
      return { ...state, residents: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
}
```

### **Props Interface Standards**

#### ✅ **Props patterns**
```typescript
// ✅ Clear, typed props interfaces
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

// ✅ Generic component props
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// ✅ Render props pattern
interface SearchableSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  renderOption: (option: T) => React.ReactNode;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  placeholder?: string;
}
```

---

## 🛡️ Security Standards

### **Input Validation**

#### ✅ **Validate all inputs**
```typescript
// ✅ Use Zod for runtime validation
import { z } from 'zod';

const ResidentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  birthdate: z.string().datetime('Invalid date format'),
  sex: z.enum(['male', 'female']),
  civilStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  email: z.string().email().optional().or(z.literal('')),
  mobileNumber: z.string().regex(/^09\d{9}$/, 'Invalid mobile number format')
});

// ✅ API route validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = ResidentSchema.parse(body);
    
    // Process validated data
    const result = await createResident(validatedData);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **Authentication & Authorization**

#### ✅ **Secure authentication patterns**
```typescript
// ✅ API route authentication
export async function GET(request: NextRequest) {
  try {
    // Always verify authentication first
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = await checkUserPermission(user.id, 'residents_view');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Process request with authenticated user
    const data = await getResidents(user);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ Component-level protection
function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { hasPermission } = usePermissions();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    redirect('/login');
    return null;
  }

  if (!hasPermission('residents_view')) {
    return <UnauthorizedMessage />;
  }

  return <>{children}</>;
}
```

### **Data Sanitization**

#### ✅ **Sanitize user inputs**
```typescript
// ✅ Sanitize and escape user content
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  // Remove potential script injections
  return DOMPurify.sanitize(input.trim());
}

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: []
  });
}

// ✅ Database query safety (using parameterized queries)
async function updateResident(id: string, data: ResidentUpdateData) {
  // ✅ Supabase handles parameterization automatically
  const { data: result, error } = await supabase
    .from('residents')
    .update({
      first_name: sanitizeInput(data.firstName),
      last_name: sanitizeInput(data.lastName),
      email: sanitizeInput(data.email)
    })
    .eq('id', id)
    .select();

  return { result, error };
}
```

### **Secret Management**

#### ✅ **Environment variables pattern**
```typescript
// ✅ Environment variable validation
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
] as const;

function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// ✅ Runtime environment access
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

// ✅ Never expose secrets to client
const config = {
  // ✅ Public variables (NEXT_PUBLIC_ prefix)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  
  // ✅ Server-only variables (no prefix)
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server only
  databaseUrl: process.env.DATABASE_URL! // Server only
};

❌ // Never do this - exposes secrets to client
const badConfig = {
  secretKey: process.env.SECRET_KEY // This would be exposed to browser!
};
```

---

## 🚀 Performance Standards

### **React Performance**

#### ✅ **Memoization patterns**
```typescript
// ✅ Memoize expensive calculations
function ExpensiveComponent({ data }: { data: ResidentData[] }) {
  const processedData = useMemo(() => {
    return data
      .filter(resident => resident.isActive)
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
      .map(resident => ({
        ...resident,
        fullName: `${resident.firstName} ${resident.lastName}`,
        age: calculateAge(resident.birthdate)
      }));
  }, [data]);

  const handleItemClick = useCallback((resident: ResidentData) => {
    console.log('Clicked:', resident.id);
  }, []);

  return (
    <div>
      {processedData.map(resident => (
        <ResidentCard 
          key={resident.id}
          resident={resident}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
}

// ✅ Memoize components to prevent unnecessary re-renders
const ResidentCard = React.memo(({ 
  resident, 
  onClick 
}: { 
  resident: ProcessedResident;
  onClick: (resident: ResidentData) => void;
}) => {
  return (
    <div onClick={() => onClick(resident)}>
      {resident.fullName} - {resident.age}
    </div>
  );
});
```

#### ✅ **Code splitting and lazy loading**
```typescript
// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import('@/components/organisms/HeavyChart'));
const AdminPanel = lazy(() => import('@/components/templates/AdminPanel'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <DashboardHeader />
      
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
      
      <Suspense fallback={<div>Loading admin panel...</div>}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}

// ✅ Dynamic imports for conditional features
async function loadAdvancedFeatures() {
  if (userHasAdvancedPermissions) {
    const { AdvancedDashboard } = await import('@/components/advanced/Dashboard');
    return AdvancedDashboard;
  }
  return null;
}
```

### **API Performance**

#### ✅ **Efficient database queries**
```typescript
// ✅ Select only needed columns
async function getResidentsList(barangayCode: string) {
  const { data, error } = await supabase
    .from('residents')
    .select('id, first_name, last_name, birthdate, sex')
    .eq('barangay_code', barangayCode)
    .eq('is_active', true)
    .order('last_name')
    .limit(50);

  return { data, error };
}

// ✅ Use database views for complex aggregations
async function getDashboardStats(barangayCode: string) {
  const { data, error } = await supabase
    .from('api_dashboard_stats')
    .select('*')
    .eq('barangay_code', barangayCode)
    .maybeSingle();

  return { data, error };
}

// ✅ Implement pagination for large datasets
async function getResidentsPage(
  barangayCode: string,
  page: number = 1,
  pageSize: number = 20
) {
  const offset = (page - 1) * pageSize;
  
  const { data, error, count } = await supabase
    .from('residents')
    .select('*', { count: 'exact' })
    .eq('barangay_code', barangayCode)
    .range(offset, offset + pageSize - 1)
    .order('last_name');

  return {
    data,
    error,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  };
}
```

### **Bundle Optimization**

#### ✅ **Import optimization**
```typescript
// ✅ Import only what you need
import { debounce } from 'lodash/debounce';
import { format } from 'date-fns/format';

// ❌ Avoid importing entire libraries
import _ from 'lodash'; // Imports entire library
import * as dateFns from 'date-fns'; // Imports everything
```

---

## 📝 Documentation Standards

### **Code Comments**

#### ✅ **When to comment**
```typescript
// ✅ Complex business logic
function calculateDependencyRatio(residents: Resident[]): DependencyRatio {
  // Dependency ratio calculation follows PSA standards:
  // Young dependents (0-14) + Old dependents (65+) / Working age (15-64) * 100
  const youngDependents = residents.filter(r => calculateAge(r.birthdate) <= 14).length;
  const workingAge = residents.filter(r => {
    const age = calculateAge(r.birthdate);
    return age >= 15 && age <= 64;
  }).length;
  const oldDependents = residents.filter(r => calculateAge(r.birthdate) >= 65).length;

  const ratio = workingAge > 0 ? ((youngDependents + oldDependents) / workingAge) * 100 : 0;
  
  return { youngDependents, workingAge, oldDependents, ratio };
}

// ✅ Explain non-obvious code
function generateHouseholdCode(barangayCode: string): string {
  // Format: [BarangayCode]-[Year]-[Sequential6Digit]
  // Example: 042114014-2025-000001
  const year = new Date().getFullYear();
  const sequence = getNextSequenceNumber(barangayCode, year);
  return `${barangayCode}-${year}-${sequence.toString().padStart(6, '0')}`;
}

// ✅ Document workarounds or temporary solutions
async function fetchUserProfile(userId: string) {
  // TODO: Remove this retry logic once Supabase connection pooling is stable
  // Temporary workaround for intermittent connection issues
  let retries = 3;
  while (retries > 0) {
    try {
      return await supabase.from('auth_user_profiles').select('*').eq('id', userId).single();
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

❌ // Avoid obvious comments
const age = 25; // Set age to 25
function getName() { return name; } // Returns the name
```

### **JSDoc Documentation**

#### ✅ **Document public APIs**
```typescript
/**
 * Creates a new resident record in the database
 * 
 * @param residentData - The resident information to create
 * @param options - Additional creation options
 * @returns Promise resolving to the created resident with generated ID
 * 
 * @throws {ValidationError} When resident data is invalid
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * ```typescript
 * const resident = await createResident({
 *   firstName: 'Juan',
 *   lastName: 'Dela Cruz',
 *   birthdate: '1990-01-01',
 *   barangayCode: '042114014'
 * });
 * ```
 */
async function createResident(
  residentData: ResidentFormData,
  options: CreateResidentOptions = {}
): Promise<Resident> {
  // Implementation
}

/**
 * Custom hook for managing resident data with caching and optimistic updates
 * 
 * @param barangayCode - The barangay code to filter residents
 * @returns Object containing residents data, loading state, and mutation functions
 * 
 * @example
 * ```typescript
 * function ResidentsPage() {
 *   const { residents, loading, createResident, updateResident } = useResidents('042114014');
 *   
 *   if (loading) return <LoadingSpinner />;
 *   
 *   return (
 *     <div>
 *       {residents.map(resident => (
 *         <ResidentCard key={resident.id} resident={resident} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
function useResidents(barangayCode: string) {
  // Implementation
}
```

### **README Standards**

#### ✅ **Component README template**
```markdown
# ResidentFormWizard

A multi-step form wizard for resident registration with validation and progressive disclosure.

## Usage

```tsx
import { ResidentFormWizard } from '@/components/templates';

function RegistrationPage() {
  const handleSubmit = async (data: ResidentFormData) => {
    await createResident(data);
  };

  return (
    <ResidentFormWizard
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `(data: ResidentFormData) => void` | Required | Called when form is successfully submitted |
| `onCancel` | `() => void` | Required | Called when user cancels the form |
| `initialData` | `Partial<ResidentFormData>` | `{}` | Pre-populate form fields |

## Features

- ✅ Multi-step validation
- ✅ Auto-save to localStorage  
- ✅ Geographic location auto-population
- ✅ Real-time field validation
- ✅ Responsive design
- ✅ Accessibility compliance (WCAG 2.1 AA)

## Dependencies

- React Hook Form for form management
- Zod for validation schemas
- React Query for data fetching

## Testing

```bash
npm test ResidentFormWizard
```

See `ResidentFormWizard.test.tsx` for test cases.
```

---

## 🧪 Testing Standards

### **Test Structure**

#### ✅ **Test organization**
```typescript
// ✅ ResidentFormWizard.test.tsx
describe('ResidentFormWizard', () => {
  // Setup and cleanup
  beforeEach(() => {
    // Reset mocks, clear localStorage, etc.
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the first step by default', () => {
      render(<ResidentFormWizard onSubmit={jest.fn()} onCancel={jest.fn()} />);
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    it('should show loading state when submitting', async () => {
      const mockSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<ResidentFormWizard onSubmit={mockSubmit} onCancel={jest.fn()} />);
      
      // Fill out form and submit
      await fillOutCompleteForm();
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      render(<ResidentFormWizard onSubmit={jest.fn()} onCancel={jest.fn()} />);
      
      // Try to submit without filling required fields
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      render(<ResidentFormWizard onSubmit={jest.fn()} onCancel={jest.fn()} />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur validation
      
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate between steps', async () => {
      render(<ResidentFormWizard onSubmit={jest.fn()} onCancel={jest.fn()} />);
      
      // Fill first step
      await fillOutPersonalInfo();
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByText('Geographic Location')).toBeInTheDocument();
      
      // Go back
      await user.click(screen.getByRole('button', { name: /back/i }));
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should auto-populate geographic location from user profile', () => {
      const mockUserProfile = {
        barangayCode: '042114014',
        regionCode: '04',
        provinceCode: '0421',
        cityCode: '042114'
      };
      
      jest.mocked(useAuth).mockReturnValue({
        userProfile: mockUserProfile,
        loading: false
      });
      
      render(<ResidentFormWizard onSubmit={jest.fn()} onCancel={jest.fn()} />);
      
      // Navigate to geographic step
      // ... verify auto-population
    });
  });

  // Helper functions for tests
  async function fillOutPersonalInfo() {
    await user.type(screen.getByLabelText(/first name/i), 'Juan');
    await user.type(screen.getByLabelText(/last name/i), 'Dela Cruz');
    await user.type(screen.getByLabelText(/birthdate/i), '1990-01-01');
  }

  async function fillOutCompleteForm() {
    // Fill all required fields across all steps
    await fillOutPersonalInfo();
    // ... continue for other steps
  }
});
```

### **Testing Patterns**

#### ✅ **Mock patterns**
```typescript
// ✅ Mock external dependencies
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: '1', name: 'Test User' },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

// ✅ Mock React hooks
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({
    user: { id: '1', email: 'test@example.com' },
    userProfile: { barangayCode: '042114014' },
    loading: false
  });
});
```

### **Test Coverage Standards**

#### **Coverage Requirements:**
- **Unit Tests**: 80%+ line coverage
- **Integration Tests**: All critical user paths
- **E2E Tests**: Core functionality and happy paths

#### ✅ **Test categories**
```typescript
// ✅ Unit tests - individual functions
describe('calculateAge', () => {
  it('should calculate age correctly for past birthdate', () => {
    const birthdate = '1990-01-01';
    const age = calculateAge(birthdate);
    expect(age).toBeGreaterThan(30);
  });
});

// ✅ Integration tests - component interactions
describe('ResidentRegistrationFlow', () => {
  it('should complete full registration process', async () => {
    render(<ResidentRegistrationPage />);
    
    // Fill form
    await fillOutForm();
    
    // Submit and verify API call
    await user.click(screen.getByRole('button', { name: /register/i }));
    
    expect(mockCreateResident).toHaveBeenCalledWith({
      firstName: 'Juan',
      lastName: 'Dela Cruz'
      // ... other expected data
    });
  });
});

// ✅ E2E tests - full user flows
describe('E2E: Resident Management', () => {
  it('should allow admin to create and view resident', () => {
    cy.login('admin@test.com', 'password');
    cy.visit('/residents');
    
    cy.get('[data-testid=add-resident]').click();
    cy.get('[data-testid=first-name]').type('Juan');
    cy.get('[data-testid=last-name]').type('Dela Cruz');
    cy.get('[data-testid=submit]').click();
    
    cy.contains('Resident created successfully');
    cy.contains('Juan Dela Cruz');
  });
});
```

---

## 🔧 Code Quality Tools

### **ESLint Configuration**

#### ✅ **Recommended ESLint rules**
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    // Code quality
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    
    // TypeScript specific
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // React specific
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    
    // Import organization
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external", 
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc"
      }
    }],
    
    // Security
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    
    // Performance
    "no-console": "warn", // Allow console.log in development
    "no-debugger": "error"
  }
}
```

### **Prettier Configuration**

#### ✅ **Code formatting standards**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "quoteProps": "as-needed",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### **Commit Hooks**

#### ✅ **Pre-commit validation**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{json,css,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

---

## 📋 Code Review Guidelines

### **Review Checklist**

#### ✅ **What to review**

**🔍 Code Quality:**
- [ ] Functions are small and focused (< 30 lines)
- [ ] Variables and functions have descriptive names
- [ ] No code duplication (DRY principle)
- [ ] Error handling is comprehensive
- [ ] No `console.log` statements in production code
- [ ] TypeScript types are properly used (no `any`)

**🛡️ Security:**
- [ ] User inputs are validated and sanitized
- [ ] API routes have proper authentication
- [ ] No secrets exposed in client code
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection implemented

**⚡ Performance:**
- [ ] Database queries are efficient (select only needed columns)
- [ ] Large components are code-split
- [ ] Expensive operations are memoized
- [ ] Images are optimized
- [ ] Bundle size impact is minimal

**🧪 Testing:**
- [ ] New features have tests
- [ ] Tests are meaningful and not just for coverage
- [ ] Edge cases are covered
- [ ] Test names are descriptive

**📝 Documentation:**
- [ ] Complex logic is commented
- [ ] Public APIs are documented
- [ ] README is updated if needed
- [ ] Breaking changes are documented

### **Review Process**

#### ✅ **Pull Request template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] TypeScript errors resolved

## Screenshots (if applicable)

## Additional Notes
```

---

## ⚠️ Common Anti-Patterns

### **React Anti-Patterns**

#### ❌ **What to avoid**
```typescript
// ❌ Mutating state directly
function BadComponent() {
  const [users, setUsers] = useState([]);
  
  const addUser = (user) => {
    users.push(user); // Mutating state directly
    setUsers(users);
  };
}

// ✅ Immutable state updates
function GoodComponent() {
  const [users, setUsers] = useState<User[]>([]);
  
  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };
}

// ❌ Using array index as key
function BadList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{item.name}</div>
      ))}
    </div>
  );
}

// ✅ Using stable unique keys
function GoodList({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

// ❌ Inline object creation in render
function BadComponent({ users }: { users: User[] }) {
  return (
    <UserList 
      users={users}
      config={{ showEmail: true, showPhone: false }} // New object every render
    />
  );
}

// ✅ Stable object references
function GoodComponent({ users }: { users: User[] }) {
  const config = useMemo(() => ({
    showEmail: true,
    showPhone: false
  }), []);

  return <UserList users={users} config={config} />;
}
```

### **TypeScript Anti-Patterns**

#### ❌ **Type-related mistakes**
```typescript
// ❌ Using 'any' everywhere
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ Proper typing
function processData<T extends { value: unknown }>(data: T[]): unknown[] {
  return data.map(item => item.value);
}

// ❌ Non-null assertion without good reason
function getUser(id: string) {
  const user = users.find(u => u.id === id)!; // Dangerous!
  return user.name;
}

// ✅ Proper null checking
function getUser(id: string): string | null {
  const user = users.find(u => u.id === id);
  return user?.name ?? null;
}
```

### **Performance Anti-Patterns**

#### ❌ **Performance killers**
```typescript
// ❌ Creating functions in render
function BadComponent({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onClick={() => handleClick(item)} // New function every render
        />
      ))}
    </div>
  );
}

// ✅ Stable function references
function GoodComponent({ items }: { items: Item[] }) {
  const handleClick = useCallback((item: Item) => {
    // Handle click
  }, []);

  return (
    <div>
      {items.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}

// ❌ Expensive operations in render
function BadComponent({ users }: { users: User[] }) {
  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name)); // Every render
  
  return <UserList users={sortedUsers} />;
}

// ✅ Memoized expensive operations
function GoodComponent({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => 
    users.sort((a, b) => a.name.localeCompare(b.name)), 
    [users]
  );
  
  return <UserList users={sortedUsers} />;
}
```

---

## 📊 Metrics & Enforcement

### **Code Quality Metrics**

#### **Targets:**
- **Test Coverage**: 80%+ line coverage
- **TypeScript Coverage**: 95%+ (minimal `any` usage)
- **ESLint Issues**: 0 errors, < 5 warnings per 1000 lines
- **Bundle Size**: < 1MB initial load
- **Performance**: Lighthouse score > 90

#### **Monitoring Tools:**
- **SonarQube**: Code quality and security analysis
- **Bundle Analyzer**: Bundle size monitoring  
- **Lighthouse CI**: Performance monitoring
- **CodeClimate**: Maintainability scores

### **Automated Enforcement**

#### ✅ **CI/CD Pipeline checks**
```yaml
# .github/workflows/quality-check.yml
name: Code Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint check
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test with coverage
        run: npm run test:coverage
      
      - name: Build check
        run: npm run build
      
      - name: Bundle analysis
        run: npm run analyze
```

---

💡 **Remember**: These standards should be living documents. Update them as the project evolves and new patterns emerge!