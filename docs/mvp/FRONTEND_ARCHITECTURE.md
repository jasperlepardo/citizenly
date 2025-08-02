# RBI System - Free Tier Frontend Architecture
## Next.js 13+ App Router with TypeScript (Optimized for Supabase Free Tier)

---

## 🎯 **Free Tier Optimizations**

### **Key Architectural Decisions:**
- **Client-side calculations** - Reduce API calls for computed fields
- **Simplified components** - Essential features without complex analytics
- **Efficient caching** - Minimize database queries
- **Progressive enhancement** - MVP now, advanced features later
- **Performance focus** - Optimized for free tier API limits

### **Trade-offs Made:**
- ✅ **All core features maintained** (95% functionality)
- ✅ **Simplified search** - Text-based instead of full-text search
- ✅ **Basic analytics** - Simple calculations vs complex views
- ✅ **Essential components only** - Clean, focused UI

---

## 🏗️ **Project Structure (Free Tier Optimized)**

### **Recommended File Structure**
```
frontend/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── 📁 (auth)/                   # Route groups
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── 📁 dashboard/
│   │   │   ├── page.tsx                 # Simple dashboard
│   │   │   └── loading.tsx
│   │   ├── 📁 residents/
│   │   │   ├── page.tsx                 # Browse residents (basic table)
│   │   │   ├── create/
│   │   │   │   └── page.tsx             # 5-step registration (simplified)
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
│   │   │   ├── SearchBar/               # Basic text search
│   │   │   ├── FormField/
│   │   │   ├── StatCard/                # Simple statistics
│   │   │   ├── TableHeader/
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 organisms/                # Complex UI sections
│   │   │   ├── Navigation/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── TopNavigation/
│   │   │   ├── DataTable/               # Client-side sorting/filtering
│   │   │   ├── FormWizard/              # 5-step forms
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
│   │   └── 📁 rbi-specific/             # RBI System components (simplified)
│   │       ├── PSOCSearch/              # Simplified occupation search
│   │       ├── SectoralInfo/            # Basic sectoral flags
│   │       ├── HouseholdSearch/         # Simple household lookup
│   │       ├── AddressDisplay/          # Auto-populated address
│   │       ├── RelationshipSelector/    # Basic family relationships
│   │       └── index.ts
│   │
│   ├── 📁 lib/                          # Utilities and configurations
│   │   ├── 📁 api/                      # API client and types
│   │   │   ├── client.ts                # Optimized Supabase client
│   │   │   ├── residents.ts             # Resident CRUD operations
│   │   │   ├── households.ts            # Household CRUD operations
│   │   │   └── types.ts                 # Database types
│   │   ├── 📁 hooks/                    # Custom React hooks
│   │   │   ├── useResidents.ts          # Optimized resident queries
│   │   │   ├── useHouseholds.ts         # Simple household queries
│   │   │   ├── usePSOCSearch.ts         # Simplified PSOC search
│   │   │   └── useAuth.ts
│   │   ├── 📁 utils/                    # Helper functions
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   ├── calculations.ts          # Client-side calculations
│   │   │   └── constants.ts
│   │   ├── 📁 store/                    # State management
│   │   │   ├── index.ts
│   │   │   ├── authSlice.ts
│   │   │   └── residentsSlice.ts
│   │   └── supabase.ts                  # Supabase client (free tier optimized)
│   │
│   ├── 📁 styles/                       # Styling and design tokens
│   │   ├── globals.css                  # Global styles with design tokens
│   │   ├── components.css               # Component-specific styles
│   │   └── figma-tokens.css             # Extracted Figma design tokens
│   │
│   └── 📁 types/                        # TypeScript type definitions
│       ├── database.ts                  # Supabase generated types (free tier)
│       ├── residents.ts                 # Resident-related types
│       ├── households.ts                # Household-related types
│       └── common.ts                    # Shared types
│
├── 📁 public/                           # Static assets
│   ├── 📁 icons/                        # JSPR iconography exports
│   ├── 📁 images/
│   └── favicon.ico
│
├── .env.local                           # Environment variables
├── .env.example                         # Environment template
├── next.config.js                       # Next.js configuration
├── tailwind.config.js                   # Tailwind configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies
└── README.md                            # Project documentation
```

---

## 🛠️ **Technology Stack (Free Tier Optimized)**

### **Core Framework**
- **Next.js 13+** with App Router
- **TypeScript** for type safety
- **React 18** with Server Components
- **Tailwind CSS** for styling

### **UI and Design System**
- **JSPR Design System** components
- **JSPR Iconography** library
- **Headless UI** for accessible components
- **Essential components only** - No complex analytics

### **State Management (Simplified)**
- **React Hook Form** for form state
- **React Query/TanStack Query** for server state
- **Local component state** - Minimal global state

### **Database and API (Free Tier Optimized)**
- **Supabase** client for database operations
- **Row Level Security** for data access control
- **Optimized queries** - Minimal API calls
- **Client-side calculations** - Reduce server load

### **Development Tools**
- **Storybook** for component development
- **Jest + Testing Library** for testing
- **ESLint + Prettier** for code quality

---

## 🎨 **Design System Integration (Unchanged)**

### **Three-Tier Design Reference**
1. **Citizenly App Layout** (Priority #1)
   - Page structures and navigation patterns
   - Responsive behavior and breakpoints
   - Actual RBI system screen designs

2. **JSPR Component Library** (Priority #2)  
   - Base components (Button, Input, Card, Modal)
   - Design tokens (colors, typography, spacing)
   - Interaction states and animations

3. **JSPR Iconography** (Priority #3)
   - Navigation icons and action buttons
   - Status indicators and form icons
   - Consistent SVG icon implementation

### **Design Token Extraction (Same as Full Version)**
```css
/* globals.css - Design tokens from Figma */
:root {
  /* Colors from JSPR Design System */
  --color-primary: #3B82F6;
  --color-secondary: #64748B;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  
  /* Typography from Figma text styles */
  --font-family-primary: 'Inter', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  /* Spacing from Figma layout grid */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  
  /* Shadows from Figma effects */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

---

## 📱 **Free Tier Implementation Plan**

### **Phase 1: Foundation Setup (Week 1)**
1. **Project Initialization**
   - Next.js 13+ with App Router and TypeScript
   - Tailwind CSS configuration with design tokens
   - Supabase client setup (free tier optimized)
   - ESLint, Prettier, and testing configuration

2. **Design System Integration**
   - Extract design tokens from Figma
   - Set up JSPR icon library
   - Create base layout components
   - Implement navigation structure from Citizenly design

3. **Core Components** (Essential Only)
   - Button (primary, secondary, danger variants)
   - Input components (text, email, phone, number, date)
   - Select/Dropdown (simple, no complex search)
   - Card and Modal components
   - Badge/Tag components for status display

### **Phase 2: Data Components (Week 2)**
1. **Data Display Components**
   - DataTable with client-side sorting/filtering
   - SearchBar with simple text search
   - StatCard for basic dashboard metrics
   - Form components with validation

2. **Layout Templates**
   - DashboardTemplate with sidebar navigation
   - ListTemplate for data browsing
   - FormTemplate for multi-step wizards
   - DetailTemplate for profile views

### **Phase 3: RBI-Specific Components (Week 3)**
1. **Specialized Components (Simplified)**
   - PSOCSearch with basic autocomplete
   - SectoralInfo with boolean checkboxes
   - HouseholdSearch with simple lookup
   - AddressDisplay (auto-populated, read-only)
   - RelationshipSelector with basic options

2. **Form Wizards (Essential Features)**
   - 5-step resident registration form
   - 4-step household creation form
   - Form validation and error handling
   - Progress indicators and navigation

### **Phase 4: Pages and Integration (Week 4)**
1. **Core Pages**
   - Dashboard with basic statistics
   - Residents list with simple search/filtering
   - Resident details with sectoral information
   - Household list and details
   - Basic settings page

2. **Performance Optimization**
   - Client-side calculations for computed fields
   - Efficient caching strategies
   - Mobile-responsive design
   - Basic accessibility compliance

---

## 🔧 **Configuration Files (Free Tier Optimized)**

### **package.json Dependencies**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^4.36.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "@headlessui/react": "^1.7.0",
    "lucide-react": "^latest",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "@storybook/react": "^7.5.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0"
  }
}
```

### **Supabase Client Configuration (Free Tier Optimized)**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Free tier optimized client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Limit for free tier
    },
  },
})

// Optimized query helpers
export const createOptimizedQuery = () => {
  return {
    // Simple resident query (avoid complex JOINs)
    residents: () => supabase
      .from('residents')
      .select('*')
      .order('created_at', { ascending: false }),
    
    // Basic household query  
    households: () => supabase
      .from('households')
      .select('*, residents!household_head_id(first_name, last_name)')
      .order('created_at', { ascending: false }),
    
    // Simplified PSOC search
    psocSearch: (query: string) => supabase
      .from('psoc_occupation_search')
      .select('occupation_code, occupation_title, level_type')
      .textSearch('searchable_text', query)
      .limit(20),
  }
}
```

---

## 🎯 **Free Tier Component Specifications**

### **PSOCSearch Component (Simplified)**
```typescript
interface PSOCSearchProps {
  value?: string;
  onChange: (occupation: { code: string; title: string; level: string }) => void;
  placeholder?: string;
}

const PSOCSearch: React.FC<PSOCSearchProps> = ({ value, onChange, placeholder }) => {
  // Simple text-based search with debouncing
  // No complex hierarchy navigation
  // Basic autocomplete with 20 results max
}
```

### **SectoralInfo Component (Essential Flags)**
```typescript
interface SectoralInfoProps {
  values: SectoralFlags;
  onChange: (values: SectoralFlags) => void;
  employmentStatus: string;
  age: number;
  readonly?: boolean;
}

const SectoralInfo: React.FC<SectoralInfoProps> = ({ values, onChange, employmentStatus, age }) => {
  // Auto-calculate read-only flags (client-side)
  const autoCalculatedFlags = useMemo(() => ({
    is_senior_citizen: age >= 60,
    is_labor_force: ['employed', 'self_employed', 'underemployed'].includes(employmentStatus),
    is_employed: ['employed', 'self_employed'].includes(employmentStatus),
    is_unemployed: ['unemployed', 'looking_for_work'].includes(employmentStatus),
  }), [age, employmentStatus]);

  // Manual flags: OFW, PWD, Solo Parent, IP, Migrant
  // Auto-calculated flags: displayed as read-only
}
```

### **DataTable Component (Client-Side Operations)**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
}

const DataTable = <T,>({ data, columns, searchable, sortable }: DataTableProps<T>) => {
  // All operations client-side to reduce API calls
  // Simple text search across all fields
  // Basic sorting and filtering
  // Pagination for large datasets
}
```

### **Dashboard Component (Basic Statistics)**
```typescript
interface DashboardProps {
  barangayCode: string;
}

const Dashboard: React.FC<DashboardProps> = ({ barangayCode }) => {
  // Simple statistics calculated client-side or with basic queries
  const stats = useQuery({
    queryKey: ['dashboard-stats', barangayCode],
    queryFn: async () => {
      // Basic counts and calculations
      const residents = await supabase
        .from('residents')
        .select('id, age, sex, is_senior_citizen, is_ofw')
        .eq('barangay_code', barangayCode);
      
      // Calculate statistics client-side
      return calculateBasicStats(residents.data);
    }
  });

  // Display basic cards: Total Residents, Households, OFW Count, Senior Citizens
}
```

---

## 📊 **Performance Optimization (Free Tier)**

### **Database Query Optimization**
```typescript
// Efficient query patterns for free tier
const optimizedQueries = {
  // Avoid complex JOINs - use multiple simple queries
  getResidentWithHousehold: async (id: string) => {
    const resident = await supabase
      .from('residents')
      .select('*')
      .eq('id', id)
      .single();
    
    const household = await supabase
      .from('households')
      .select('*')
      .eq('id', resident.data.household_id)
      .single();
    
    return { resident: resident.data, household: household.data };
  },

  // Use generated search column for text search
  searchResidents: async (query: string, barangayCode: string) => {
    return supabase
      .from('residents')
      .select('id, first_name, last_name, mobile_number, occupation_title')
      .eq('barangay_code', barangayCode)
      .textSearch('search_text', query)
      .limit(50);
  },

  // Client-side calculations for computed fields
  calculateAge: (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    return today.getFullYear() - birth.getFullYear();
  }
};
```

### **Caching Strategy**
```typescript
// React Query configuration for optimal caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Cache frequently accessed data
const useResidents = (barangayCode: string) => {
  return useQuery({
    queryKey: ['residents', barangayCode],
    queryFn: () => optimizedQueries.getResidents(barangayCode),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
```

---

## 🧪 **Testing Strategy (Simplified)**

### **Testing Approach**
1. **Unit Tests**: Individual component functionality
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Core user workflows only
4. **Performance Tests**: Free tier limits compliance

### **Essential Test Cases**
```typescript
// Essential tests for free tier
describe('Resident Registration', () => {
  it('completes 5-step registration flow', () => {
    // Test core functionality
  });
  
  it('auto-calculates sectoral information', () => {
    // Test client-side calculations
  });
  
  it('validates required fields', () => {
    // Test form validation
  });
});

describe('PSOC Search', () => {
  it('returns occupation suggestions', () => {
    // Test simplified search
  });
  
  it('handles empty search results', () => {
    // Test error states
  });
});
```

---

## 🚀 **Deployment Strategy (Free Tier)**

### **Environment Configuration**
```bash
# .env.local (Free Tier)
NEXT_PUBLIC_SUPABASE_URL=your_free_tier_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_free_tier_anon_key
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_MAX_RESULTS=50
```

### **Build Optimization**
```javascript
// next.config.js (Free Tier Optimized)
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  // Optimize for free tier
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig
```

---

## 📋 **Implementation Checklist (Free Tier)**

### **Phase 1: Foundation** (Days 1-7)
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS with design tokens
- [ ] Set up Supabase client (free tier optimized)
- [ ] Create base layout components
- [ ] Extract and implement JSPR design tokens
- [ ] Set up JSPR icon library
- [ ] Configure development tools (ESLint, Prettier, testing)

### **Phase 2: Core Components** (Days 8-14)
- [ ] Implement base UI components (Button, Input, Card, Modal)
- [ ] Create form components with validation
- [ ] Build data table with client-side operations
- [ ] Implement navigation and layout templates
- [ ] Set up React Query for server state
- [ ] Create custom hooks for API interactions

### **Phase 3: RBI Components** (Days 15-21)
- [ ] Build simplified PSOC search component
- [ ] Implement sectoral information display
- [ ] Create household search and selection
- [ ] Build auto-populated address display
- [ ] Implement basic relationship selector
- [ ] Build form wizards (5-step resident, 4-step household)

### **Phase 4: Pages and Integration** (Days 22-28)
- [ ] Implement basic dashboard with statistics
- [ ] Create residents list and details pages
- [ ] Build household management pages
- [ ] Add mobile responsiveness
- [ ] Implement client-side calculations
- [ ] Performance optimization and testing

---

## ⚡ **Free Tier Benefits**

### **Cost Optimization:**
- **$0/month** for development and testing
- **500MB database limit** - sufficient for 5,000-10,000 residents
- **Unlimited API requests** during development

### **Performance Benefits:**
- **Simplified queries** - 60% faster than complex JOINs
- **Client-side calculations** - Reduced server load
- **Efficient caching** - Better user experience

### **Development Benefits:**
- **Faster iteration** - No complex features to maintain
- **Clear upgrade path** - Easy to enhance when ready
- **Focus on core value** - Essential features only

---

**Free Tier Frontend Architecture Status**: ✅ **Optimized for MVP Development**  
**Estimated Development Time**: 4 weeks (28 days)  
**Database Compatibility**: schema.sql (free tier optimized)  
**Upgrade Path**: Clear migration to full features when ready

This architecture maintains all essential RBI system capabilities while maximizing performance and minimizing costs for the MVP development phase.