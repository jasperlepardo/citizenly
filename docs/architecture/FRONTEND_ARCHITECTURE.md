# RBI System - Frontend Architecture Guide

## Next.js 13+ App Router with TypeScript - All Implementation Tiers

---

## 📋 **Implementation Tiers Overview**

This document covers three implementation approaches for the RBI System frontend:

| Tier                   | Purpose             | Cost        | Timeline   | Complexity |
| ---------------------- | ------------------- | ----------- | ---------- | ---------- |
| **🟢 MVP Tier**        | Free tier optimized | $0/month    | 4-6 weeks  | Simple     |
| **🟡 Standard Tier**   | Balanced features   | $25+/month  | 6-8 weeks  | Moderate   |
| **🔴 Enterprise Tier** | Full features       | $100+/month | 8-12 weeks | Complex    |

### **Quick Implementation Guide:**

- **New projects**: Start with 🟢 **MVP Tier**
- **Growing needs**: Upgrade to 🟡 **Standard Tier**
- **Enterprise use**: Implement 🔴 **Enterprise Tier**

---

## 🏗️ **Unified Project Structure**

### **Core Directory Structure** _(All Tiers)_

```
frontend/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── 📁 (auth)/                   # Route groups
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── 📁 dashboard/
│   │   │   ├── page.tsx                 # 🟢 Simple / 🟡 Enhanced / 🔴 Advanced
│   │   │   └── loading.tsx
│   │   ├── 📁 residents/
│   │   │   ├── page.tsx                 # Browse residents
│   │   │   ├── create/
│   │   │   │   └── page.tsx             # 5-step registration
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # Resident details
│   │   │       └── edit/
│   │   │           └── page.tsx         # Edit resident
│   │   ├── 📁 households/
│   │   │   ├── page.tsx                 # Browse households
│   │   │   ├── create/
│   │   │   │   └── page.tsx             # 4-step household creation
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Household details
│   │   ├── 📁 analytics/                # 🟡 Standard+ only
│   │   │   └── page.tsx
│   │   ├── 📁 reports/                  # 🔴 Enterprise only
│   │   │   └── page.tsx
│   │   ├── 📁 settings/
│   │   │   └── page.tsx
│   │   ├── layout.tsx                   # Root layout with navigation
│   │   ├── page.tsx                     # Landing/dashboard
│   │   ├── loading.tsx                  # Global loading UI
│   │   ├── error.tsx                    # Global error UI
│   │   └── not-found.tsx                # 404 page
│   │
│   ├── 📁 components/                   # UI Components (Atomic Design)
│   │   ├── 📁 atoms/                    # Basic building blocks
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   ├── Badge/
│   │   │   ├── Icon/
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 molecules/                # Simple component combinations
│   │   │   ├── SearchBar/               # 🟢 Basic / 🟡 Enhanced / 🔴 Advanced
│   │   │   ├── FormField/
│   │   │   ├── StatCard/                # 🟢 Simple / 🟡 Enhanced / 🔴 Advanced
│   │   │   ├── TableHeader/
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 organisms/                # Complex UI sections
│   │   │   ├── Navigation/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── TopNavigation/
│   │   │   ├── DataTable/               # 🟢 Client-side / 🟡 Enhanced / 🔴 Server-side
│   │   │   ├── FormWizard/
│   │   │   ├── ResidentCard/
│   │   │   ├── HouseholdSummary/
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 templates/                # Page-level layouts
│   │   │   ├── DashboardTemplate/
│   │   │   ├── ListTemplate/
│   │   │   ├── FormTemplate/
│   │   │   └── index.ts
│   │   │
│   │   └── 📁 rbi-specific/             # RBI System components
│   │       ├── PSOCSearch/              # Occupation search
│   │       ├── SectoralInfo/            # Sectoral classification
│   │       ├── HouseholdSelector/       # Household management
│   │       ├── AddressDisplay/          # PSGC address handling
│   │       ├── PhilSysNumberInput/      # PhilSys ID handling
│   │       ├── FamilyRelationshipSelector/
│   │       ├── MigrantInformation/
│   │       ├── PhysicalCharacteristics/
│   │       ├── ResidentStatusSelector/
│   │       ├── MotherMaidenName/
│   │       └── index.ts
│   │
│   ├── 📁 services/                     # Business logic layer (NEW)
│   │   ├── resident.service.ts          # Resident business logic
│   │   ├── household.service.ts         # Household business logic
│   │   ├── analytics.service.ts         # Analytics calculations
│   │   └── index.ts                     # Service exports
│   │
│   ├── 📁 hooks/                        # Custom React hooks (NEW structure)
│   │   ├── useResidentOperations.ts     # Resident data operations
│   │   ├── useHouseholdOperations.ts    # Household data operations
│   │   ├── useAnalytics.ts              # Analytics hooks
│   │   └── index.ts                     # Hook exports
│   │
│   ├── 📁 lib/                          # Utilities and configurations
│   │   ├── 📁 api/                      # API client and types
│   │   │   ├── client.ts
│   │   │   ├── residents.ts
│   │   │   ├── households.ts
│   │   │   └── types.ts
│   │   ├── 📁 utils/
│   │   │   ├── calculations.ts          # Client-side calculations
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── csrf.ts                      # CSRF protection
│   │   ├── crypto.ts                    # Encryption utilities
│   │   └── validation.ts                # Form validation
│   │
│   ├── 📁 styles/
│   │   ├── globals.css
│   │   └── components.css
│   │
│   └── 📁 types/
│       ├── resident.ts
│       ├── household.ts
│       ├── api.ts
│       └── index.ts
│
├── 📁 public/
│   ├── favicon.ico
│   └── images/
│
├── 📁 docs/
│   ├── DEPLOYMENT.md
│   └── API.md
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🟢 **MVP Tier - Free Tier Implementation**

### **Architectural Focus:**

- **Performance-first**: Optimized for Supabase free tier limits
- **Client-side heavy**: Reduce API calls through calculations
- **Essential features**: 95% core functionality with simplified UI
- **Progressive enhancement**: Easy upgrade path to higher tiers

### **Key Optimizations:**

#### **Database Strategy:**

```typescript
// Client-side calculations to reduce API calls
const calculateAge = (birthdate: string) => {
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

// Efficient data fetching
const useResidents = () => {
  return useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data } = await supabase
        .from('residents')
        .select('id, first_name, last_name, birthdate, gender')
        .limit(100); // Free tier optimization
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
```

#### **Component Simplifications:**

**SearchBar (MVP)**

```typescript
// Simple text-based search
const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onSearch(e.target.value); // Client-side filtering
      }}
      placeholder="Search residents..."
      className="w-full p-2 border rounded"
    />
  );
};
```

**Dashboard (MVP)**

```typescript
// Simple statistics with client-side calculations
const MVPDashboard = () => {
  const { data: residents } = useResidents();

  const stats = useMemo(() => ({
    total: residents?.length || 0,
    male: residents?.filter(r => r.gender === 'Male').length || 0,
    female: residents?.filter(r => r.gender === 'Female').length || 0,
    minors: residents?.filter(r => calculateAge(r.birthdate) < 18).length || 0
  }), [residents]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total Residents" value={stats.total} />
      <StatCard title="Male" value={stats.male} />
      <StatCard title="Female" value={stats.female} />
      <StatCard title="Minors" value={stats.minors} />
    </div>
  );
};
```

### **MVP Component Implementations:**

| Component      | MVP Approach                     | Trade-offs                       |
| -------------- | -------------------------------- | -------------------------------- |
| **PSOCSearch** | Simple dropdown with text filter | No fuzzy search, basic matching  |
| **DataTable**  | Client-side sorting/filtering    | Limited to 100-500 records       |
| **Analytics**  | Basic counts and percentages     | No complex queries or charts     |
| **Search**     | Text-based matching              | No full-text search capabilities |

---

## 🟡 **Standard Tier - Balanced Implementation**

### **Enhanced Features:**

- **Server-side processing**: Advanced queries and filtering
- **Enhanced UI**: Better user experience and performance
- **Moderate complexity**: Balanced features without enterprise overhead

### **Key Enhancements:**

#### **Advanced Search:**

```typescript
const EnhancedSearchBar = () => {
  const [filters, setFilters] = useState({
    name: '',
    ageRange: [0, 100],
    gender: 'all',
    barangay: 'all'
  });

  const { data } = useQuery({
    queryKey: ['residents', filters],
    queryFn: async () => {
      let query = supabase.from('residents').select('*');

      if (filters.name) {
        query = query.ilike('full_name', `%${filters.name}%`);
      }
      if (filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      return query;
    }
  });

  return (
    <div className="space-y-4">
      <input /> {/* Name search */}
      <select /> {/* Gender filter */}
      <RangeSlider /> {/* Age range */}
    </div>
  );
};
```

#### **Enhanced Analytics:**

```typescript
const StandardDashboard = () => {
  const { data: analytics } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      // Server-side analytics with views
      const { data } = await supabase
        .from('resident_analytics_view')
        .select('*');
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <StatsGrid stats={analytics?.summary} />
      <AgeDistributionChart data={analytics?.age_groups} />
      <GenderBreakdown data={analytics?.gender_stats} />
    </div>
  );
};
```

---

## 🔴 **Enterprise Tier - Full Feature Implementation**

### **Advanced Capabilities:**

- **Full-text search**: PostgreSQL full-text search capabilities
- **Complex analytics**: Advanced reporting and data visualization
- **Enterprise features**: Audit logs, advanced security, bulk operations
- **Performance optimization**: Database views, indexes, caching

### **Enterprise Features:**

#### **Advanced Search & Analytics:**

```typescript
const EnterpriseSearch = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['advanced-search', searchParams],
    queryFn: async () => {
      // Full-text search with ranking
      const { data } = await supabase
        .rpc('advanced_resident_search', {
          search_query: searchParams.query,
          filters: searchParams.filters,
          sort_by: searchParams.sortBy,
          limit: 50,
          offset: searchParams.page * 50
        });
      return data;
    }
  });

  return (
    <div>
      <AdvancedFilters />
      <SearchResults results={data} />
      <Pagination />
    </div>
  );
};
```

#### **Enterprise Dashboard:**

```typescript
const EnterpriseDashboard = () => {
  return (
    <div className="space-y-8">
      <ExecutiveSummary />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopulationTrends />
        <DemographicBreakdown />
        <MigrationPatterns />
        <HouseholdComposition />
      </div>
      <ReportsSection />
    </div>
  );
};
```

---

## 🔧 **Implementation Configuration**

### **Environment-Based Configuration:**

```typescript
// lib/config.ts
export const config = {
  tier: process.env.NEXT_PUBLIC_IMPLEMENTATION_TIER || 'mvp',

  features: {
    mvp: {
      maxRecordsPerPage: 100,
      enableAnalytics: false,
      enableAdvancedSearch: false,
      enableReports: false,
    },
    standard: {
      maxRecordsPerPage: 500,
      enableAnalytics: true,
      enableAdvancedSearch: true,
      enableReports: false,
    },
    enterprise: {
      maxRecordsPerPage: 1000,
      enableAnalytics: true,
      enableAdvancedSearch: true,
      enableReports: true,
    },
  },
};

// Feature flag helper
export const hasFeature = (feature: string) => {
  const currentTier = config.tier as keyof typeof config.features;
  return config.features[currentTier][feature] || false;
};
```

### **Conditional Component Rendering:**

```typescript
// Conditional feature rendering
const Dashboard = () => {
  return (
    <div>
      <BasicStats />

      {hasFeature('enableAnalytics') && <AnalyticsSection />}

      {hasFeature('enableReports') && <ReportsSection />}

      {config.tier === 'enterprise' && <AuditLog />}
    </div>
  );
};
```

---

## 🚀 **Upgrade Path Strategy**

### **Phase 1: MVP → Standard**

1. **Enable server-side processing**
2. **Add enhanced search capabilities**
3. **Implement basic analytics**
4. **Upgrade database plan**

### **Phase 2: Standard → Enterprise**

1. **Add full-text search**
2. **Implement advanced reporting**
3. **Add audit logging**
4. **Enable enterprise security features**

### **Migration Commands:**

```bash
# Upgrade to Standard Tier
npm run upgrade:standard
# - Updates environment variables
# - Enables enhanced features
# - Upgrades database views

# Upgrade to Enterprise Tier
npm run upgrade:enterprise
# - Enables full feature set
# - Adds enterprise components
# - Configures advanced security
```

---

## 📋 **Component Comparison Matrix**

| Component       | 🟢 MVP            | 🟡 Standard        | 🔴 Enterprise        |
| --------------- | ----------------- | ------------------ | -------------------- |
| **Search**      | Text filter       | Multi-field search | Full-text + faceted  |
| **DataTable**   | Client pagination | Server pagination  | Advanced filtering   |
| **Analytics**   | Basic counts      | Charts + trends    | Executive dashboards |
| **Export**      | CSV only          | Multiple formats   | Scheduled reports    |
| **Performance** | Client optimized  | Balanced           | Database optimized   |
| **Users**       | <1,000 records    | <10,000 records    | Unlimited            |

---

## 🎯 **Recommendations**

### **Start with MVP Tier if:**

- Budget is $0/month
- <1,000 residents to manage
- Basic functionality is sufficient
- Quick deployment is needed

### **Upgrade to Standard Tier if:**

- Need enhanced search and filtering
- Want basic analytics and reporting
- Managing 1,000-10,000 records
- Have $25+/month budget

### **Choose Enterprise Tier if:**

- Need full feature set
- Managing >10,000 records
- Require advanced security/auditing
- Have enterprise budget ($100+/month)

---

## 🏛️ **Service Layer Architecture**

### **Clean Architecture Pattern**

The RBI System implements a clean architecture pattern that separates business logic from UI components, ensuring maintainability, testability, and scalability.

#### **Architecture Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Components                           │
│  (ResidentFormWizard, HouseholdFormWizard, DataTables)     │
└─────────────────────────┬───────────────────────────────────┘
                          │ Uses
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks Layer                       │
│  (useResidentOperations, useHouseholdOperations)           │
│  • State management                                         │
│  • Error handling                                           │
│  • Loading states                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │ Calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  (ResidentService, HouseholdService)                       │
│  • Business logic                                           │
│  • Data validation                                          │
│  • Data transformation                                      │
│  • Security operations                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ Interacts with
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Supabase)                    │
│  • Database operations                                      │
│  • Authentication                                           │
│  • Real-time subscriptions                                  │
└─────────────────────────────────────────────────────────────┘
```

### **Key Components**

#### **1. Services (`/src/services/`)**

Services contain all business logic, data transformation, and API operations:

```typescript
// src/services/resident.service.ts
export class ResidentService {
  /**
   * Validates resident data against business rules
   */
  async validateResident(formData: ResidentFormData): Promise<ValidationResult> {
    // Business validation logic
    const errors = [];

    if (!formData.firstName || formData.firstName.length < 2) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    // Age validation
    const age = calculateAge(formData.birthdate);
    if (age < 0 || age > 150) {
      errors.push({ field: 'birthdate', message: 'Invalid birthdate' });
    }

    return { success: errors.length === 0, errors };
  }

  /**
   * Processes and encrypts sensitive data
   */
  async processPhilSysNumber(philsysNumber?: string) {
    if (!philsysNumber) return { success: true };

    // Validate format
    if (!validatePhilSysFormat(philsysNumber)) {
      return { success: false, error: 'Invalid format' };
    }

    // Encrypt for storage
    const hash = await hashPhilSysNumber(philsysNumber);
    const last4 = extractPhilSysLast4(philsysNumber);

    // Log security operation
    logSecurityOperation('PHILSYS_HASH_CREATED', userId, { last4 });

    return { success: true, hash, last4 };
  }

  /**
   * Creates a new resident with all business logic
   */
  async createResident(request: CreateResidentRequest) {
    // 1. Validate data
    const validation = await this.validateResident(request.formData);
    if (!validation.success) return validation;

    // 2. Process sensitive data
    const philsysResult = await this.processPhilSysNumber(request.formData.philsysCardNumber);

    // 3. Transform to database schema
    const dbData = this.transformToDbSchema(request.formData);

    // 4. Execute database operation
    const { data, error } = await supabase.from('residents').insert([dbData]).select();

    // 5. Handle household assignment
    if (request.formData.householdRole === 'Head') {
      await this.updateHouseholdHead(request.formData.householdCode, data[0].id);
    }

    return { success: true, data: data[0] };
  }
}
```

#### **2. Custom Hooks (`/src/hooks/`)**

Hooks provide a React-friendly interface to services:

```typescript
// src/hooks/useResidentOperations.ts
export function useResidentOperations(options: UseResidentOperationsOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { getToken } = useCSRFToken();

  const createResident = useCallback(
    async (formData: ResidentFormData) => {
      setIsSubmitting(true);
      setValidationErrors({});

      try {
        // Get CSRF token for security
        const csrfToken = getToken();

        // Call service
        const result = await residentService.createResident({
          formData,
          csrfToken,
          userAddress: getCurrentUserAddress(),
          barangayCode: getCurrentBarangayCode(),
        });

        if (!result.success) {
          // Handle validation errors
          if (result.errors) {
            const errorMap = result.errors.reduce(
              (acc, err) => ({
                ...acc,
                [err.field]: err.message,
              }),
              {}
            );
            setValidationErrors(errorMap);
          }

          options.onError?.(result.error || 'Creation failed');
          return result;
        }

        // Success
        options.onSuccess?.(result.data);
        return result;
      } catch (error) {
        options.onError?.('Unexpected error occurred');
        return { success: false, error: 'Unexpected error' };
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  return {
    createResident,
    isSubmitting,
    validationErrors,
    clearValidationErrors: () => setValidationErrors({}),
  };
}
```

#### **3. UI Components (Pure Presentation)**

Components focus solely on presentation and user interaction:

```typescript
// src/components/templates/ResidentFormWizard/ResidentFormWizard.tsx
export function ResidentFormWizard({ onComplete }: ResidentFormWizardProps) {
  const router = useRouter();
  const {
    createResident,
    isSubmitting,
    validationErrors
  } = useResidentOperations({
    onSuccess: (data) => {
      toast.success('Resident created successfully!');
      router.push(`/residents/${data.id}`);
      onComplete?.(data);
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const handleSubmit = async (formData: ResidentFormData) => {
    // Pure UI logic - just call the hook
    await createResident(formData);
  };

  return (
    <FormWizard
      steps={residentFormSteps}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      validationErrors={validationErrors}
    />
  );
}
```

### **Benefits of Service Layer Architecture**

#### **1. Separation of Concerns**

- **UI Components**: Focus on presentation and user interaction
- **Hooks**: Manage React state and side effects
- **Services**: Handle business logic and data operations
- **Clear boundaries**: Each layer has specific responsibilities

#### **2. Testability**

```typescript
// Easy to test business logic in isolation
describe('ResidentService', () => {
  it('should validate resident age correctly', async () => {
    const service = new ResidentService();
    const result = await service.validateResident({
      birthdate: '2050-01-01', // Future date
      // ... other fields
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'birthdate',
      message: 'Invalid birthdate',
    });
  });
});
```

#### **3. Reusability**

```typescript
// Same service can be used in multiple components
function ResidentList() {
  const { listResidents } = useResidentOperations();
  // ...
}

function ResidentSearch() {
  const { searchResidents } = useResidentOperations();
  // ...
}

function ResidentReport() {
  const { getResidentStats } = useResidentOperations();
  // ...
}
```

#### **4. Maintainability**

- Business logic changes don't affect UI components
- UI updates don't require service modifications
- Easy to add new features without breaking existing code

### **Migration Guide**

#### **Step 1: Identify Mixed Concerns**

Look for components with:

- Direct database calls
- Business validation logic
- Data transformation code
- Complex state management

#### **Step 2: Extract Business Logic**

```typescript
// Before: Logic in component
function OldResidentForm() {
  const handleSubmit = async data => {
    // Validation logic
    if (!data.firstName) {
      setError('First name required');
      return;
    }

    // Data transformation
    const dbData = {
      first_name: data.firstName,
      // ... mapping
    };

    // Direct database call
    const { error } = await supabase.from('residents').insert([dbData]);
  };
}

// After: Logic in service
function NewResidentForm() {
  const { createResident } = useResidentOperations();

  const handleSubmit = async data => {
    await createResident(data); // Clean!
  };
}
```

#### **Step 3: Create Service Classes**

1. Create a service file in `/src/services/`
2. Move all business logic to service methods
3. Export a singleton instance

#### **Step 4: Create Custom Hooks**

1. Create a hook file in `/src/hooks/`
2. Use the service within the hook
3. Add React-specific logic (state, effects)

#### **Step 5: Update Components**

1. Replace direct logic with hook usage
2. Remove business logic from components
3. Update imports and dependencies

### **Best Practices**

#### **Services Should:**

- ✅ Be framework-agnostic (no React dependencies)
- ✅ Handle all business logic
- ✅ Validate data according to business rules
- ✅ Transform data between UI and database formats
- ✅ Log important operations
- ✅ Handle security operations

#### **Services Should NOT:**

- ❌ Use React hooks or components
- ❌ Manage UI state
- ❌ Handle routing
- ❌ Display notifications
- ❌ Access DOM elements

#### **Hooks Should:**

- ✅ Provide a React interface to services
- ✅ Manage loading and error states
- ✅ Handle React-specific side effects
- ✅ Format errors for UI display
- ✅ Provide callbacks for UI updates

#### **Hooks Should NOT:**

- ❌ Contain business logic
- ❌ Make direct database calls
- ❌ Transform data formats
- ❌ Validate business rules

### **Code Organization**

```
src/
├── services/                    # Business logic layer
│   ├── resident.service.ts      # Resident operations
│   ├── household.service.ts     # Household operations
│   ├── analytics.service.ts     # Analytics calculations
│   ├── auth.service.ts          # Authentication logic
│   └── index.ts                 # Service exports
│
├── hooks/                       # React integration layer
│   ├── useResidentOperations.ts # Resident data hooks
│   ├── useHouseholdOperations.ts # Household data hooks
│   ├── useAnalytics.ts          # Analytics hooks
│   ├── useAuth.ts               # Auth hooks
│   └── index.ts                 # Hook exports
│
└── components/                  # UI layer
    └── templates/
        ├── ResidentFormWizard/  # Pure UI component
        └── HouseholdFormWizard/ # Pure UI component
```

### **Testing Strategy**

#### **Service Tests** (Unit Tests)

```typescript
// __tests__/services/resident.service.test.ts
describe('ResidentService', () => {
  let service: ResidentService;

  beforeEach(() => {
    service = new ResidentService();
  });

  describe('validateResident', () => {
    it('should validate required fields', async () => {
      const result = await service.validateResident({
        firstName: '',
        // ...
      });
      expect(result.success).toBe(false);
    });
  });
});
```

#### **Hook Tests** (Integration Tests)

```typescript
// __tests__/hooks/useResidentOperations.test.ts
describe('useResidentOperations', () => {
  it('should handle submission state', async () => {
    const { result } = renderHook(() => useResidentOperations());

    expect(result.current.isSubmitting).toBe(false);

    act(() => {
      result.current.createResident(mockFormData);
    });

    expect(result.current.isSubmitting).toBe(true);
  });
});
```

#### **Component Tests** (UI Tests)

```typescript
// __tests__/components/ResidentFormWizard.test.tsx
describe('ResidentFormWizard', () => {
  it('should render form steps', () => {
    render(<ResidentFormWizard />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });
});
```

---

**Documentation Status**: ✅ Service Layer Architecture Documented  
**Implementation Status**: ✅ Clean architecture implemented  
**Migration Status**: 🚧 Components ready for migration  
**Next Steps**: Replace old components with refactored versions
