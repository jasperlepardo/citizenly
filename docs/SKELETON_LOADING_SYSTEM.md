# Skeleton Loading System Documentation

## Overview

This document outlines the design and implementation of an enhanced skeleton loading system that displays the actual form structure with real labels and headings while showing skeleton placeholders only for data fields. This approach provides immediate context to users about what content is loading, rather than showing generic placeholder blocks.

## Architecture

### Design Philosophy

**Traditional Approach:**
- Generic skeleton blocks that don't reveal content structure
- Users have no context about what's loading
- Jarring transition from skeleton to real content

**Enhanced Approach:**
- Show real form structure (labels, headings, layout)
- Skeleton placeholders only for dynamic data
- Users immediately understand what form they're viewing
- Smooth transition from loading to loaded state
- **Field-level loading states** for granular feedback
- **Progressive data loading** as information becomes available

## Component Architecture

### 1. Skeleton Atoms (`src/components/atoms/Skeleton/`)

Base skeleton building blocks that can be composed into complex loading states.

```typescript
// Skeleton.tsx
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
}

// Skeleton variants for common use cases
export const SkeletonText = ({ width = "w-full" }: { width?: string }) => (
  <Skeleton className={`h-4 ${width}`} />
);

export const SkeletonInput = () => (
  <Skeleton className="h-10 w-full rounded-md" />
);

export const SkeletonButton = ({ width = "w-24" }: { width?: string }) => (
  <Skeleton className={`h-10 ${width} rounded-md`} />
);

export const SkeletonAvatar = ({ size = "h-12 w-12" }: { size?: string }) => (
  <Skeleton className={`${size} rounded-full`} />
);

export const SkeletonCard = ({ height = "h-32" }: { height?: string }) => (
  <Skeleton className={`w-full ${height} rounded-lg`} />
);
```

### 2. Enhanced Field Components

Field components that can display in loading state while preserving their labels and structure.

```typescript
// InputField.tsx
interface InputFieldProps {
  label: string;
  value?: string;
  loading?: boolean;
  helperText?: string;
  error?: string;
  required?: boolean;
  // ... other input props
}

export function InputField({
  label,
  value,
  loading = false,
  helperText,
  error,
  required,
  ...inputProps
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      {/* Always show the label */}
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Show skeleton or actual input */}
      {loading ? (
        <SkeletonInput />
      ) : (
        <input
          value={value || ""}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
          {...inputProps}
        />
      )}

      {/* Always show helper text and errors if they exist */}
      {helperText && !loading && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && !loading && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
```

```typescript
// SelectField.tsx
interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value?: string;
  loading?: boolean;
  placeholder?: string;
  // ... other select props
}

export function SelectField({
  label,
  options,
  value,
  loading = false,
  placeholder = "Select an option...",
  ...selectProps
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {loading ? (
        <SkeletonInput />
      ) : (
        <select
          value={value || ""}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 px-3 py-2"
          {...selectProps}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
```

### 2.5. Field-Level Loading States

Individual fields can have their own loading states for granular feedback during async operations like API lookups, validations, or dependent field loading.

```typescript
// Enhanced InputField.tsx - With individual field loading
interface InputFieldProps {
  label: string;
  value?: string;
  loading?: boolean;        // Individual field loading state
  globalLoading?: boolean;  // Page/form level loading state
  loadingText?: string;     // Custom loading message
  helperText?: string;
  error?: string;
  required?: boolean;
  // ... other props
}

export function InputField({
  label,
  value,
  loading = false,
  globalLoading = false,
  loadingText = "Loading...",
  helperText,
  error,
  required,
  ...inputProps
}: InputFieldProps) {
  const isLoading = loading || globalLoading;

  return (
    <div className="space-y-2">
      {/* Always show the label */}
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {loading && (
          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
            {loadingText}
          </span>
        )}
      </label>

      {/* Show skeleton, loading input, or actual input */}
      {isLoading ? (
        <div className="relative">
          <SkeletonInput />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Spinner size="sm" />
                <span>{loadingText}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <input
          value={value || ""}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 px-3 py-2"
          {...inputProps}
        />
      )}

      {/* Helper text and errors */}
      {helperText && !isLoading && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && !isLoading && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
```

```typescript
// Enhanced SelectField.tsx - With async options loading
interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value?: string;
  loading?: boolean;           // Field data loading
  optionsLoading?: boolean;    // Options list loading
  globalLoading?: boolean;
  placeholder?: string;
  onSearch?: (query: string) => void;
  // ... other props
}

export function SelectField({
  label,
  options,
  value,
  loading = false,
  optionsLoading = false,
  globalLoading = false,
  placeholder = "Select an option...",
  onSearch,
  ...selectProps
}: SelectFieldProps) {
  const isLoading = loading || globalLoading;
  const hasOptions = options.length > 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {optionsLoading && (
          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
            Loading options...
          </span>
        )}
      </label>

      {isLoading ? (
        <SkeletonInput />
      ) : (
        <div className="relative">
          <select
            value={value || ""}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 px-3 py-2"
            disabled={optionsLoading}
            {...selectProps}
          >
            <option value="">
              {optionsLoading ? "Loading options..." : placeholder}
            </option>
            {hasOptions && options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {optionsLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

```typescript
// Custom hook for managing field loading states
interface FieldLoadingState {
  [fieldName: string]: boolean;
}

interface UseFieldLoadingReturn {
  loadingStates: FieldLoadingState;
  setFieldLoading: (field: string, loading: boolean) => void;
  setMultipleFieldsLoading: (fields: string[], loading: boolean) => void;
  isAnyFieldLoading: boolean;
  clearAllLoading: () => void;
}

export function useFieldLoading(initialState: FieldLoadingState = {}): UseFieldLoadingReturn {
  const [loadingStates, setLoadingStates] = useState<FieldLoadingState>(initialState);

  const setFieldLoading = useCallback((field: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [field]: loading
    }));
  }, []);

  const setMultipleFieldsLoading = useCallback((fields: string[], loading: boolean) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      fields.forEach(field => {
        newState[field] = loading;
      });
      return newState;
    });
  }, []);

  const isAnyFieldLoading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setFieldLoading,
    setMultipleFieldsLoading,
    isAnyFieldLoading,
    clearAllLoading
  };
}
```

### 3. Form Section Components

Form sections that preserve their structure and headings while showing loading states for individual fields.

```typescript
// PersonalInformation.tsx - Enhanced with field-level loading
interface PersonalInformationProps {
  loading?: boolean;  // Global form loading
  formData: PersonalInformationFormData;
  loadingStates?: {   // Individual field loading states
    first_name?: boolean;
    last_name?: boolean;
    birthdate?: boolean;
    birth_place?: boolean;
    occupation?: boolean;
    // ... other fields
  };
  onChange?: (data: PersonalInformationFormData) => void;
  errors?: Record<string, string>;
  mode?: FormMode;
}

export function PersonalInformation({
  loading = false,
  formData,
  loadingStates = {},
  onChange,
  errors = {},
  mode = 'view'
}: PersonalInformationProps) {
  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 p-6 shadow-xs">
      <div className="space-y-6">
        {/* Always show section header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Basic personal details, birth information, and educational/employment background.
          </p>
        </div>

        {/* Form fields with loading states */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField
            label="First Name"
            value={formData.first_name}
            loading={loadingStates.first_name}
            globalLoading={loading}
            error={errors.first_name}
            required
            onChange={(e) => onChange?.({ ...formData, first_name: e.target.value })}
            disabled={mode === 'view' || loading || loadingStates.first_name}
          />

          <InputField
            label="Last Name"
            value={formData.last_name}
            loading={loadingStates.last_name}
            globalLoading={loading}
            error={errors.last_name}
            required
            onChange={(e) => onChange?.({ ...formData, last_name: e.target.value })}
            disabled={mode === 'view' || loading || loadingStates.last_name}
          />

          {/* Birth Place with async loading */}
          <SelectField
            label="Birth Place"
            options={birthPlaceOptions}
            value={formData.birth_place_code}
            loading={loadingStates.birth_place}
            optionsLoading={birthPlaceOptionsLoading}
            globalLoading={loading}
            placeholder="Search birth place..."
            onSearch={handleBirthPlaceSearch}
            onChange={(value) => onChange?.({ ...formData, birth_place_code: value })}
            disabled={mode === 'view'}
          />

          {/* Occupation with async PSOC lookup */}
          <SelectField
            label="Occupation"
            options={occupationOptions}
            value={formData.occupation_code}
            loading={loadingStates.occupation}
            optionsLoading={occupationOptionsLoading}
            globalLoading={loading}
            placeholder="Search occupation..."
            loadingText="Looking up occupation..."
            onSearch={handleOccupationSearch}
            onChange={(value) => onChange?.({ ...formData, occupation_code: value })}
            disabled={mode === 'view'}
          />

          {/* ... other fields */}
        </div>
      </div>
    </div>
  );
}
```

### 4. Main Form Component

The main form component that orchestrates loading states across all sections.

```typescript
// ResidentForm.tsx - Enhanced with field-level loading support
interface ResidentFormProps {
  loading?: boolean;
  loadingStates?: Record<string, boolean>; // Field-level loading states
  mode?: FormMode;
  initialData?: Partial<ResidentFormData>;
  onSubmit?: (data: ResidentFormData) => void;
  onCancel?: () => void;
  onChange?: (data: ResidentFormData) => void;
  onOccupationSearch?: (query: string) => void;
  onBirthPlaceSearch?: (query: string) => void;
}

export function ResidentForm({
  loading = false,
  loadingStates = {},
  mode = 'view',
  initialData = {},
  onSubmit,
  onCancel,
  onChange,
  onOccupationSearch,
  onBirthPlaceSearch
}: ResidentFormProps) {
  const [formData, setFormData] = useState<ResidentFormData>({
    ...defaultFormData,
    ...initialData
  });

  return (
    <div className="space-y-8">
      {/* Form Header - always visible */}
      <FormHeader
        mode={mode}
        loading={loading}
        onModeChange={onModeChange}
      />

      {/* Form Sections */}
      <PersonalInformationForm
        loading={loading}
        loadingStates={loadingStates}
        formData={formData.personal}
        onChange={(data) => setFormData(prev => ({ ...prev, personal: data }))}
        errors={validationErrors.personal}
        mode={mode}
        onOccupationSearch={onOccupationSearch}
        onBirthPlaceSearch={onBirthPlaceSearch}
      />

      <ContactInformationForm
        loading={loading}
        formData={formData.contact}
        onChange={(data) => setFormData(prev => ({ ...prev, contact: data }))}
        errors={validationErrors.contact}
        mode={mode}
      />

      <PhysicalDetailsForm
        loading={loading}
        formData={formData.physical}
        onChange={(data) => setFormData(prev => ({ ...prev, physical: data }))}
        errors={validationErrors.physical}
        mode={mode}
      />

      <SectoralInformationForm
        loading={loading}
        formData={formData.sectoral}
        onChange={(data) => setFormData(prev => ({ ...prev, sectoral: data }))}
        errors={validationErrors.sectoral}
        mode={mode}
      />

      <MigrationInformationForm
        loading={loading}
        formData={formData.migration}
        onChange={(data) => setFormData(prev => ({ ...prev, migration: data }))}
        errors={validationErrors.migration}
        mode={mode}
      />

      {/* Form Actions */}
      <FormActions
        loading={loading}
        mode={mode}
        onSubmit={() => onSubmit?.(formData)}
        onCancel={onCancel}
      />
    </div>
  );
}
```

### 5. Page Implementation

How the loading system integrates at the page level.

```typescript
// ResidentDetailPage.tsx
export default function ResidentDetailPage() {
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loading state - show form structure with skeletons
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          {/* Page Header with skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/residents" className="btn-secondary">
                ← Back to Residents
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  <SkeletonText width="w-48" />
                </h1>
                <p className="text-sm text-gray-600">Resident Details</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content - Form with loading states */}
            <div className="lg:col-span-2">
              <ResidentForm
                loading={true}
                initialData={{}}
                mode="view"
              />
            </div>

            {/* Sidebar with skeleton actions */}
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 p-6 shadow-sm">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  <SkeletonButton width="w-full" />
                  <SkeletonButton width="w-full" />
                  <SkeletonButton width="w-full" />
                  <SkeletonButton width="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !resident) {
    return <ErrorState error={error} />;
  }

  // Loaded state - same structure, real data
  return (
    <div className="min-h-screen">
      <div className="p-6">
        {/* Page Header with real data */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/residents" className="btn-secondary">
              ← Back to Residents
            </Link>
            <div>
              <h1 className="text-xl font-semibold">
                {resident.first_name} {resident.last_name}
              </h1>
              <p className="text-sm text-gray-600">Resident Details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content - Form with real data */}
          <div className="lg:col-span-2">
            <ResidentForm
              loading={false}
              initialData={resident}
              mode={formMode}
              onSubmit={handleSave}
              onChange={handleFormChange}
            />
          </div>

          {/* Sidebar with real actions */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700
                          bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button className="btn-primary w-full">
                  {formMode === 'view' ? '✏️ Edit' : '💾 Save'}
                </button>
                <button className="btn-secondary w-full">
                  Generate Certificate
                </button>
                <button className="btn-secondary w-full">
                  Export Data
                </button>
                <button className="btn-danger w-full">
                  🗑️ Delete Resident
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Implementation Benefits

### User Experience
- **Immediate Context**: Users see form labels and structure immediately
- **No Confusion**: Clear understanding of what's loading
- **Smooth Transitions**: Seamless shift from loading to loaded state
- **Progressive Loading**: Can show partial data as it becomes available
- **Granular Feedback**: Users know exactly which fields are still loading
- **Non-blocking Interface**: Slow API calls don't freeze the entire form
- **Better Perceived Performance**: Users can interact with loaded fields while others load

### Developer Experience
- **Reusable Components**: Skeleton atoms can be used throughout the app
- **Consistent API**: All form components follow the same loading pattern
- **Easy Maintenance**: Single source of truth for loading states
- **Type Safety**: TypeScript ensures proper loading prop usage
- **Flexible Loading Management**: `useFieldLoading` hook simplifies state management
- **Async Operation Support**: Built-in patterns for dependent fields and API calls

### Performance
- **Perceived Performance**: Users see immediate feedback
- **Layout Stability**: No content jumping or layout shifts
- **Efficient Rendering**: Only data fields re-render when loading completes

## Dark Mode Support

All skeleton components include dark mode variants:

```typescript
// Light mode: bg-gray-200, bg-gray-100
// Dark mode: dark:bg-gray-700, dark:bg-gray-600

const skeletonClasses = "bg-gray-200 dark:bg-gray-700 animate-pulse";
```

## Accessibility

- Labels remain visible and readable during loading
- Screen readers can announce form structure immediately
- Focus management preserved between loading and loaded states
- Proper ARIA attributes maintained

## Testing Strategy

### Unit Tests
```typescript
describe('InputField with loading', () => {
  it('shows skeleton when loading=true', () => {
    render(<InputField label="Name" loading={true} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-input')).toBeInTheDocument();
  });

  it('shows input when loading=false', () => {
    render(<InputField label="Name" value="John" loading={false} />);
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
describe('ResidentForm loading states', () => {
  it('shows all section headers while loading', () => {
    render(<ResidentForm loading={true} />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Physical Details')).toBeInTheDocument();
  });
});
```

## Field-Level Loading Use Cases

### 1. Dependent Field Loading
When one field selection triggers loading in related fields:

```typescript
// When province changes, load cities and barangays
const handleProvinceChange = async (provinceCode: string) => {
  setFieldLoading('city_municipality_code', true);
  setFieldLoading('barangay_code', true);

  try {
    const cities = await fetchCitiesByProvince(provinceCode);
    setCityOptions(cities);

    // Clear dependent fields
    onChange({
      ...formData,
      city_municipality_code: '',
      barangay_code: ''
    });
  } finally {
    setFieldLoading('city_municipality_code', false);
    setFieldLoading('barangay_code', false);
  }
};
```

### 2. External API Validation
Validating field data with external services:

```typescript
// Validate PhilSys number with government service
const validatePhilSysNumber = async (philsysNumber: string) => {
  setFieldLoading('philsys_card_number', true);

  try {
    const validation = await validateWithGovernmentAPI(philsysNumber);
    if (!validation.isValid) {
      setErrors({
        ...errors,
        philsys_card_number: validation.error
      });
    }
  } catch (error) {
    setErrors({
      ...errors,
      philsys_card_number: 'Validation service unavailable'
    });
  } finally {
    setFieldLoading('philsys_card_number', false);
  }
};
```

### 3. Async Search/Lookup Operations
For searchable select fields with API lookups:

```typescript
// PSOC occupation search
const handleOccupationSearch = async (query: string) => {
  setFieldLoading('occupation_code', true);

  try {
    const results = await searchPSOCOccupations(query);
    setOccupationOptions(results);
  } catch (error) {
    console.error('PSOC search failed:', error);
    setOccupationOptions([]);
  } finally {
    setFieldLoading('occupation_code', false);
  }
};
```

### 4. Progressive Data Enhancement
Loading basic data first, then enhancing with detailed information:

```typescript
// Page-level progressive loading
const loadResidentWithEnhancements = async () => {
  // 1. Load basic resident data (fast)
  const basicData = await fetchBasicResident(id);
  setResident(basicData);
  setGlobalLoading(false);

  // 2. Load sectoral calculations (medium speed)
  setFieldLoading('sectoral_classifications', true);
  const sectoralData = await calculateSectoralClassifications(basicData);
  setResident(prev => ({ ...prev, sectoral: sectoralData }));
  setFieldLoading('sectoral_classifications', false);

  // 3. Load external integrations (slow)
  setMultipleFieldsLoading(['occupation_details', 'address_validation'], true);
  const [occupationDetails, addressValidation] = await Promise.all([
    fetchDetailedOccupationInfo(basicData.occupation_code),
    validateAddressWithPostal(basicData.address)
  ]);
  setResident(prev => ({
    ...prev,
    occupation_details: occupationDetails,
    address_validation: addressValidation
  }));
  setMultipleFieldsLoading(['occupation_details', 'address_validation'], false);
};
```

### 5. Real-time Field Updates
For fields that update based on calculations or external changes:

```typescript
// Auto-calculate age when birthdate changes
const handleBirthdateChange = async (birthdate: string) => {
  onChange({ ...formData, birthdate });

  // Show loading while calculating dependent data
  setFieldLoading('age', true);
  setFieldLoading('sectoral_classifications', true);

  try {
    const age = calculateAge(birthdate);
    const sectoralFlags = await calculateSectoralFlags({
      ...formData,
      birthdate,
      age
    });

    onChange({
      ...formData,
      birthdate,
      age,
      ...sectoralFlags
    });
  } finally {
    setFieldLoading('age', false);
    setFieldLoading('sectoral_classifications', false);
  }
};
```

## Migration Path

1. **Phase 1**: Implement skeleton atoms
2. **Phase 2**: Update field components with loading props
3. **Phase 3**: Update form sections with loading support
4. **Phase 4**: Update main form component
5. **Phase 5**: Replace page-level skeleton with loading form
6. **Phase 6**: Apply pattern to other forms throughout the app

This approach provides a much more informative and professional loading experience while maintaining the exact same form structure between loading and loaded states.