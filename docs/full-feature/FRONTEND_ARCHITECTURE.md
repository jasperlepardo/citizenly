# RBI System - Frontend Architecture Implementation Plan
## Next.js 13+ App Router with TypeScript and Design System Integration

---

## 🏗️ **Project Structure**

### **Recommended File Structure**
```
frontend/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── 📁 (auth)/                   # Route groups
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── 📁 dashboard/
│   │   │   ├── page.tsx
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
│   │   ├── 📁 analytics/
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
│   │   │   ├── SearchBar/
│   │   │   ├── FormField/
│   │   │   ├── StatCard/
│   │   │   ├── TableHeader/
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 organisms/                # Complex UI sections
│   │   │   ├── Navigation/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── TopNavigation/
│   │   │   ├── DataTable/
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
│   │       ├── PSOCSearch/
│   │       ├── SectoralInfo/
│   │       ├── HouseholdTypeSelector/
│   │       ├── FamilyPositionSelector/
│   │       ├── IncomeClassBadge/
│   │       ├── MigrantInfo/
│   │       ├── PSGCAddressCascade/
│   │       └── index.ts
│   │
│   ├── 📁 lib/                          # Utilities and configurations
│   │   ├── 📁 api/                      # API client and types
│   │   │   ├── client.ts
│   │   │   ├── residents.ts
│   │   │   ├── households.ts
│   │   │   └── types.ts
│   │   ├── 📁 hooks/                    # Custom React hooks
│   │   │   ├── useResidents.ts
│   │   │   ├── useHouseholds.ts
│   │   │   ├── usePSOCSearch.ts
│   │   │   └── useAuth.ts
│   │   ├── 📁 utils/                    # Helper functions
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   ├── calculations.ts
│   │   │   └── constants.ts
│   │   ├── 📁 store/                    # State management
│   │   │   ├── index.ts
│   │   │   ├── authSlice.ts
│   │   │   └── residentsSlice.ts
│   │   └── supabase.ts                  # Supabase client
│   │
│   ├── 📁 styles/                       # Styling and design tokens
│   │   ├── globals.css                  # Global styles with design tokens
│   │   ├── components.css               # Component-specific styles
│   │   └── figma-tokens.css             # Extracted Figma design tokens
│   │
│   └── 📁 types/                        # TypeScript type definitions
│       ├── database.ts                  # Supabase generated types
│       ├── residents.ts                 # Resident-related types
│       ├── households.ts                # Household-related types
│       └── common.ts                    # Shared types
│
├── 📁 public/                           # Static assets
│   ├── 📁 icons/                        # JSPR iconography exports
│   ├── 📁 images/
│   └── favicon.ico
│
├── 📁 docs/                             # Component documentation
│   ├── component-guide.md
│   └── design-system-integration.md
│
├── 📁 tests/                            # Testing
│   ├── 📁 __mocks__/
│   ├── 📁 components/
│   └── setup.ts
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

## 🛠️ **Technology Stack**

### **Core Framework**
- **Next.js 13+** with App Router
- **TypeScript** for type safety
- **React 18** with Server Components
- **Tailwind CSS** for styling

### **UI and Design System**
- **JSPR Design System** components
- **JSPR Iconography** library
- **Headless UI** for accessible components
- **Figma design tokens** extraction

### **State Management**
- **Redux Toolkit** with RTK Query for global state
- **React Hook Form** for form state
- **Zustand** for lightweight local state (if needed)

### **Database and API**
- **Supabase** client for database operations
- **Row Level Security** for data access control
- **Real-time subscriptions** for live updates

### **Development Tools**
- **Storybook** for component development
- **Jest + Testing Library** for testing
- **ESLint + Prettier** for code quality
- **Husky** for git hooks

---

## 🎨 **Design System Integration**

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

### **Design Token Extraction**
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

## 📱 **Page Implementation Plan**

### **Phase 1: Foundation Setup** (Week 1)
1. **Project Initialization**
   - Next.js 13+ with App Router and TypeScript
   - Tailwind CSS configuration with design tokens
   - Supabase client setup and type generation
   - ESLint, Prettier, and testing configuration

2. **Design System Integration**
   - Extract design tokens from Figma
   - Set up JSPR icon library
   - Create base layout components
   - Implement navigation structure from Citizenly design

3. **Core Components** (Atomic Design)
   - Button (all variants from JSPR design system)
   - Input components (text, email, phone, number, date)
   - Select/Dropdown with search functionality
   - Card and Modal components
   - Badge/Tag components for status display

### **Phase 2: Data Components** (Week 2)
1. **Data Display Components**
   - DataTable with sorting, filtering, and pagination
   - SearchBar with global search functionality
   - StatCard for dashboard metrics
   - Form components with validation

2. **Layout Templates**
   - DashboardTemplate with sidebar navigation
   - ListTemplate for data browsing
   - FormTemplate for multi-step wizards
   - DetailTemplate for profile views

### **Phase 3: RBI-Specific Components** (Week 3)
1. **Specialized Components**
   - PSOCSearch with occupation autocomplete
   - SectoralInfo with auto-population logic
   - HouseholdTypeSelector with descriptions
   - FamilyPositionSelector with validation
   - IncomeClassBadge with color coding
   - MigrantInfo conditional form
   - PSGCAddressCascade for address hierarchy

2. **Form Wizards**
   - 5-step resident registration form
   - 4-step household creation form
   - Form validation and error handling
   - Progress indicators and navigation

### **Phase 4: Pages and Features** (Week 4)
1. **Core Pages**
   - Dashboard with statistics and quick actions
   - Residents list with search and filtering
   - Resident details with sectoral information
   - Household list and details
   - Analytics and reports

2. **Advanced Features**
   - Real-time updates with Supabase
   - Print/export functionality
   - Mobile-responsive design
   - Accessibility compliance (WCAG 2.1)

---

## 🔧 **Configuration Files**

### **package.json Dependencies**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.1.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "@headlessui/react": "^1.7.0",
    "lucide-react": "^latest",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
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
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // JSPR Design System colors
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        // Income class colors
        'income-rich': '#10B981',
        'income-high': '#3B82F6',
        'income-upper-middle': '#06B6D4',
        'income-middle': '#8B5CF6',
        'income-lower-middle': '#F59E0B',
        'income-low': '#EAB308',
        'income-poor': '#EF4444',
      },
      fontFamily: {
        primary: 'var(--font-family-primary)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'figma-sm': 'var(--shadow-sm)',
        'figma-md': 'var(--shadow-md)',
        'figma-lg': 'var(--shadow-lg)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### **TypeScript Configuration**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🧪 **Testing Strategy**

### **Testing Approach**
1. **Unit Tests**: Individual component functionality
2. **Integration Tests**: Component interactions and API calls
3. **E2E Tests**: Complete user workflows
4. **Visual Regression**: Component appearance consistency
5. **Accessibility Tests**: WCAG 2.1 compliance

### **Testing Tools Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
  ],
}
```

---

## 📊 **Performance Optimization**

### **Next.js Optimizations**
- Server Components for static content
- Client Components only when needed
- Image optimization with next/image
- Font optimization with next/font
- Bundle analysis and code splitting

### **Supabase Optimizations**
- Row Level Security for data access
- Efficient queries with select specifications
- Real-time subscriptions only when needed
- Connection pooling for production

---

## 🚀 **Deployment Strategy**

### **Development Environment**
```bash
npm run dev          # Start development server
npm run storybook    # Component development
npm run test         # Run tests
npm run lint         # Code quality checks
```

### **Production Build**
```bash
npm run build        # Production build
npm run start        # Production server
npm run export       # Static export (if needed)
```

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Foundation** (Days 1-7)
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS with design tokens
- [ ] Set up Supabase client and type generation
- [ ] Create base layout components
- [ ] Extract and implement JSPR design tokens
- [ ] Set up JSPR icon library
- [ ] Configure development tools (ESLint, Prettier, testing)
- [ ] Create atomic design component structure

### **Phase 2: Core Components** (Days 8-14)
- [ ] Implement base UI components (Button, Input, Card, Modal)
- [ ] Create form components with validation
- [ ] Build data table with search and pagination
- [ ] Implement navigation and layout templates
- [ ] Set up state management with Redux Toolkit
- [ ] Create custom hooks for API interactions

### **Phase 3: RBI Components** (Days 15-21)
- [ ] Build PSOC search component
- [ ] Implement sectoral information display
- [ ] Create household type and family position selectors
- [ ] Build income classification components
- [ ] Implement migrant information forms
- [ ] Create PSGC address cascade component
- [ ] Build form wizards (5-step resident, 4-step household)

### **Phase 4: Pages and Integration** (Days 22-28)
- [ ] Implement dashboard with statistics
- [ ] Create residents list and details pages
- [ ] Build household management pages
- [ ] Add analytics and reporting features
- [ ] Implement real-time updates
- [ ] Add mobile responsiveness
- [ ] Conduct accessibility testing
- [ ] Performance optimization and testing

---

**Implementation Status**: ✅ **Ready to Begin**  
**Estimated Timeline**: 4 weeks (28 days)  
**Next Step**: Initialize Next.js project with approved architecture

This comprehensive frontend architecture plan ensures consistent implementation following the established design system and provides a clear roadmap for building the RBI System frontend.