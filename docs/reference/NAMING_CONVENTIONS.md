# Comprehensive Naming Conventions

> **The Definitive Guide to Naming in the Citizenly Project**
> 
> This document consolidates all naming conventions across the entire codebase - from variables to databases, APIs to files. Follow these rules for consistent, maintainable code.

## 📖 Table of Contents

1. [🔤 Code & Variables](#-code--variables)
2. [📡 APIs & Routes](#-apis--routes)
3. [🗄️ Database & SQL](#️-database--sql)
4. [📁 Files & Directories](#-files--directories)
5. [📂 Folder Structure](#-folder-structure)
6. [🎨 Styling & CSS](#-styling--css)
7. [🧪 Testing](#-testing)
8. [🌐 i18n & Config](#-i18n--config)
9. [📊 Analytics & Logging](#-analytics--logging)
10. [📚 Documentation](#-documentation)
11. [🐙 GitHub & CI/CD](#-github--cicd)
12. [⚠️ Common Mistakes](#️-common-mistakes)
13. [📋 Quick Reference](#-quick-reference)

---

## 🔤 Code & Variables

### **JavaScript/TypeScript Variables & Functions**

#### ✅ **camelCase** for variables, functions, and properties
```typescript
// Variables
const userProfile = await getUserProfile();
const barangayCode = '123456';
const isActive = true;
const totalResidents = 150;
const authLoading = false;

// Functions
function calculateAge(birthdate: string): number { }
function loadBarangayAddress(): Promise<void> { }
function validateUserInput(data: FormData): boolean { }

// Object properties
const apiResponse = {
  totalResidents: 100,
  maleResidents: 45,
  femaleResidents: 55,
  youngDependents: 20,
  workingAge: 70
};

// Event handlers
const handleSubmit = async (data: FormData) => { };
const onSearchChange = (term: string) => { };
```

#### ✅ **PascalCase** for types, interfaces, classes, and components
```typescript
// React Components
function ResidentFormWizard() { }
function DependencyRatioPieChart() { }
function CascadingGeographicSelector() { }

// TypeScript interfaces and types
interface DashboardStats {
  residents: number;
  households: number;
  seniorCitizens: number;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  barangayCode: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginData) => Promise<void>;
};

type Theme = 'light' | 'dark' | 'system';

// Classes and Enums
class DatabaseService {
  async getResidents(): Promise<Resident[]> { }
}

enum UserRole {
  Admin = 'admin',
  BarangayAdmin = 'barangay_admin',
  Resident = 'resident'
}
```

#### ✅ **SCREAMING_SNAKE_CASE** for constants
```typescript
// Global constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PAGE_SIZE = 20;
const API_TIMEOUT = 30000;

// Environment variables
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Error messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_INPUT: 'Please check your input and try again',
  SERVER_ERROR: 'An unexpected error occurred'
} as const;
```

### **Specific Patterns**

#### **Boolean Variables** - Use descriptive prefixes
```typescript
✅ const isLoading = true;
✅ const hasError = false;
✅ const canEdit = true;
✅ const shouldUpdate = false;

❌ const flag = true;
❌ const check = false;
❌ const status = true;
```

#### **React State** - Paired state variables
```typescript
✅ const [loading, setLoading] = useState(false);
✅ const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
✅ const [isModalOpen, setIsModalOpen] = useState(false);

❌ const [user, updateUser] = useState(null);
❌ const [data, changeData] = useState([]);
```

---

## 📡 APIs & Routes

### **URL Structure**

#### ✅ **kebab-case** for all URL segments
```
✅ /api/dashboard/stats
✅ /api/auth/assign-role
✅ /api/addresses/barangays
✅ /api/residents/[id]

❌ /api/dashboardStats
❌ /api/auth/assignRole
❌ /api/addresses_barangays
```

#### ✅ **Plural nouns** for resource collections
```
✅ /api/residents
✅ /api/households
✅ /api/addresses

❌ /api/resident
❌ /api/household
❌ /api/address
```

#### ✅ **Descriptive action verbs** for operations
```
✅ /api/auth/assign-role
✅ /api/auth/create-profile
✅ /api/auth/check-barangay-admin

❌ /api/auth/assign
❌ /api/auth/create
❌ /api/auth/check
```

### **Resource Hierarchy**
```
/api/addresses/
├── regions/
├── provinces/
├── cities/
└── barangays/

/api/auth/
├── profile/
├── assign-role/
├── webhook/
└── create-profile/

/api/dashboard/
├── stats/
└── analytics/
```

### **Special Endpoint Types**
```
✅ Public endpoints: /api/addresses/regions/public
✅ Admin endpoints: /api/admin/users
✅ Debug endpoints: /api/debug/residents
✅ Dynamic routes: /api/residents/[id]
```

### **Query Parameters** - camelCase
```typescript
✅ /api/residents?barangayCode=123&includeInactive=false
✅ /api/households?searchTerm=garcia&sortBy=name

❌ /api/residents?barangay_code=123
❌ /api/residents?BarangayCode=123
```

---

## 🗄️ Database & SQL

### **Table Names** - snake_case, plural
```sql
✅ residents
✅ households  
✅ auth_user_profiles
✅ resident_sectoral_info
✅ psgc_regions
✅ psgc_provinces

❌ Residents (PascalCase)
❌ resident (singular)
❌ userProfiles (camelCase)
```

### **Column Names** - snake_case, descriptive
```sql
✅ id
✅ first_name
✅ last_name
✅ birth_date
✅ barangay_code
✅ is_active
✅ created_at
✅ updated_at

❌ firstName (camelCase)
❌ BirthDate (PascalCase)
❌ isactive (no underscore)
```

### **Views** - Prefix with purpose
```sql
✅ api_dashboard_stats
✅ api_residents_with_geography
✅ api_households_with_members
✅ admin_user_summary

❌ dashboard_view
❌ residents_view
❌ vw_households
```

### **Functions and Procedures** - snake_case, verb_noun
```sql
✅ calculate_age()
✅ get_complete_address()
✅ update_household_stats()
✅ validate_barangay_access()

❌ CalculateAge()
❌ getAddress()
❌ updateStats()
```

### **Indexes** - Format: idx_tablename_columnname(s)
```sql
✅ idx_residents_barangay_code
✅ idx_households_created_at
✅ idx_auth_user_profiles_id

❌ residents_idx
❌ barangay_index
❌ idx_1
```

### **Enums and Types** - snake_case with _enum suffix
```sql
✅ sex_enum
✅ civil_status_enum
✅ employment_status_enum
✅ education_level_enum

❌ SexEnum
❌ sex_type
❌ sexValues
```

---

## 📁 Files & Directories

### **React Components**
```
✅ PascalCase for component files
ResidentFormWizard.tsx
DependencyRatioPieChart.tsx
CascadingGeographicSelector.tsx

✅ kebab-case for directories
resident-form-wizard/
dependency-ratio-pie-chart/
cascading-geographic-selector/
```

### **Utility and Service Files**
```
✅ camelCase for utility files
authUtils.ts
dateHelpers.ts
validationRules.ts

✅ kebab-case for directories
auth-utils/
date-helpers/
validation-rules/
```

### **Hook Files**
```
✅ camelCase starting with "use"
useAuth.ts
useUserBarangay.ts
useLocalStorage.ts
useDebounce.ts
```

### **Test Files**
```
✅ Component tests
ResidentFormWizard.test.tsx
DashboardLayout.test.tsx

✅ Utility tests  
authUtils.test.ts
dateHelpers.test.ts

✅ Integration tests
api/residents.integration.test.ts
api/auth.integration.test.ts

✅ E2E tests
e2e/resident-registration.e2e.ts
e2e/dashboard-navigation.e2e.ts
```

### **Storybook Files**
```
✅ Component stories
Button.stories.tsx
ResidentFormWizard.stories.tsx

✅ Documentation stories
Atoms.stories.mdx
Molecules.stories.mdx
```

### **Configuration Files**
```
✅ Config files
jest.config.js
tailwind.config.js
next.config.js
eslint.config.js

✅ Environment files
.env.local
.env.development
.env.staging
.env.production
```

### **Migration Files** - timestamp_description
```sql
✅ 2025-01-15_create_residents_table.sql
✅ 2025-01-16_add_household_relationships.sql
✅ 2025-01-17_create_dashboard_views.sql

❌ migration1.sql
❌ update.sql
❌ new_tables.sql
```

---

## 📂 Folder Structure

### **Project Root Directories** - kebab-case or lowercase
```
✅ Root level folders
src/                    # Source code
public/                 # Static assets
docs/                   # Documentation
database/               # Database files
.github/                # GitHub configuration
node_modules/           # Dependencies (auto-generated)
.next/                  # Next.js build output
coverage/               # Test coverage reports
storybook-static/       # Storybook build output

❌ Avoid
Source/                 # Use: src/
Database/               # Use: database/
Documentation/          # Use: docs/
GitHub/                 # Use: .github/
```

### **Source Code Organization** - kebab-case for directories
```
✅ src/ folder structure
src/
├── app/                # Next.js app directory
│   ├── api/           # API routes  
│   ├── admin/         # Admin pages
│   ├── auth/          # Auth pages
│   ├── dashboard/     # Dashboard pages
│   ├── residents/     # Resident pages
│   └── households/    # Household pages
├── components/        # React components
│   ├── atoms/         # Basic components
│   ├── molecules/     # Composite components
│   ├── organisms/     # Complex components
│   └── templates/     # Page layouts
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── lib/               # Utility libraries
├── providers/         # React providers
├── styles/            # Global styles
├── types/             # TypeScript types
└── utils/             # Helper functions

❌ Avoid
src/Components/        # Use: src/components/
src/API/               # Use: src/app/api/
src/Auth/              # Use: src/app/auth/
src/Utils/             # Use: src/utils/
```

### **Component Organization** - kebab-case with hierarchy
```
✅ Component folder structure
components/
├── atoms/             # Basic building blocks
│   ├── button/
│   ├── input/
│   ├── text/
│   └── icon/
├── molecules/         # Combinations of atoms
│   ├── search-bar/
│   ├── form-field/
│   ├── stats-card/
│   └── dropdown-select/
├── organisms/         # Complex components
│   ├── navigation-bar/
│   ├── resident-form-wizard/
│   ├── dashboard-layout/
│   └── data-table/
└── templates/         # Page-level layouts
    ├── main-layout/
    ├── auth-layout/
    └── dashboard-layout/

❌ Avoid
components/Button/     # Use: components/atoms/button/
components/SearchBar/  # Use: components/molecules/search-bar/
components/UI/         # Use atomic design structure
```

### **API Route Organization** - kebab-case, RESTful structure
```
✅ API folder structure
app/api/
├── auth/              # Authentication endpoints
│   ├── profile/
│   ├── assign-role/
│   └── webhook/
├── residents/         # Resident CRUD
│   ├── route.ts       # Collection endpoint
│   └── [id]/          # Individual resource
│       └── route.ts
├── households/        # Household CRUD
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── addresses/         # Geographic data
│   ├── regions/
│   ├── provinces/
│   ├── cities/
│   └── barangays/
├── dashboard/         # Dashboard data
│   └── stats/
└── admin/             # Admin operations
    └── users/

❌ Avoid
api/getResidents/      # Use RESTful structure
api/createHousehold/   # Use: api/households/ with POST
api/Auth/              # Use: api/auth/
```

### **Database Organization** - kebab-case for directories
```
✅ Database folder structure
database/
├── migrations/        # Database migrations
│   ├── package.json   # Migration scripts
│   └── *.sql         # Individual migrations
├── seeds/             # Seed data
│   ├── development/
│   ├── staging/
│   └── production/
├── schemas/           # Schema definitions
│   ├── tables/
│   ├── views/
│   └── functions/
└── backups/           # Database backups
    ├── daily/
    ├── weekly/
    └── monthly/

❌ Avoid
database/Migrations/   # Use: database/migrations/
database/SeedData/     # Use: database/seeds/
database/DB_Backups/   # Use: database/backups/
```

### **Documentation Organization** - kebab-case, hierarchical
```
✅ Documentation structure
docs/
├── reference/         # Technical reference
│   ├── api-documentation/
│   ├── database-schema/
│   └── naming-conventions/
├── guides/            # How-to guides
│   ├── installation/
│   ├── deployment/
│   └── development/
├── tutorials/         # Step-by-step tutorials
│   ├── getting-started/
│   ├── creating-components/
│   └── api-usage/
├── architecture/      # System architecture
│   ├── overview/
│   ├── database-design/
│   └── frontend-structure/
└── assets/            # Documentation assets
    ├── images/
    ├── diagrams/
    └── videos/

❌ Avoid
docs/API/              # Use: docs/reference/api-documentation/
docs/HowTo/            # Use: docs/guides/
docs/Pictures/         # Use: docs/assets/images/
```

### **Test Organization** - Match source structure
```
✅ Test folder structure
src/
├── components/
│   └── atoms/
│       └── button/
│           ├── Button.tsx
│           ├── Button.test.tsx     # Unit tests
│           └── Button.stories.tsx  # Storybook stories
├── __tests__/         # Integration tests
│   ├── integration/
│   │   ├── auth.test.ts
│   │   └── residents.test.ts
│   └── e2e/           # End-to-end tests
│       ├── user-flow.e2e.ts
│       └── admin-flow.e2e.ts
├── __mocks__/         # Mock files
│   ├── supabase.ts
│   └── next-router.ts
└── fixtures/          # Test data
    ├── residents.json
    └── households.json

❌ Avoid
tests/                 # Use: __tests__/ or co-located
Test/                  # Use: __tests__/
testing/               # Use: __tests__/
```

### **Style Organization** - kebab-case, modular
```
✅ Styles folder structure
src/styles/
├── globals.css        # Global styles
├── tailwind.css       # Tailwind imports
├── components/        # Component-specific styles
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── layouts/           # Layout-specific styles
│   ├── main-layout.css
│   └── auth-layout.css
├── pages/             # Page-specific styles
│   ├── dashboard.css
│   └── residents.css
├── utilities/         # Utility classes
│   ├── spacing.css
│   └── typography.css
└── themes/            # Theme configurations
    ├── light.css
    └── dark.css

❌ Avoid
styles/Components/     # Use: styles/components/
styles/CSS/            # Use: styles/
styles/Style/          # Use: styles/
```

### **Asset Organization** - kebab-case, logical grouping
```
✅ Public assets structure
public/
├── images/            # Static images
│   ├── logos/
│   ├── icons/
│   ├── avatars/
│   └── illustrations/
├── fonts/             # Custom fonts
│   ├── inter/
│   └── montserrat/
├── videos/            # Video files
│   ├── tutorials/
│   └── demos/
├── documents/         # Static documents
│   ├── guides/
│   └── templates/
└── favicon/           # Favicon files
    ├── favicon.ico
    ├── apple-touch-icon.png
    └── manifest.json

❌ Avoid
public/Images/         # Use: public/images/
public/static/         # Use logical groupings
public/assets/img/     # Use: public/images/
```

### **Configuration Files** - Root level, descriptive names
```
✅ Config file placement
project-root/
├── .env.local         # Environment variables
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
├── tailwind.config.js # Tailwind configuration
├── next.config.js     # Next.js configuration
├── jest.config.js     # Jest configuration
├── package.json       # Node.js dependencies
├── tsconfig.json      # TypeScript configuration
├── README.md          # Project documentation
└── CHANGELOG.md       # Version history

❌ Avoid
config/                # Keep configs at root level
configuration/         # Use standard names
settings/              # Use standard names
```

### **Folder Naming Rules Summary**

#### ✅ **Use kebab-case for:**
- All directory names
- Component folders
- Feature folders
- Page folders

#### ✅ **Use lowercase for:**
- Standard directories (`src`, `public`, `docs`)
- Node.js conventions (`node_modules`)

#### ✅ **Use dot-prefixed for:**
- Hidden configuration (`.github`, `.next`)
- Environment files (`.env.local`)

#### ❌ **Avoid:**
- PascalCase directories (`Components/`, `Pages/`)
- snake_case directories (`api_routes/`, `test_files/`)
- Spaces in folder names (`API Routes/`, `Test Files/`)
- Mixed casing (`apiRoutes/`, `TestFiles/`)

---

## 🎨 Styling & CSS

### **CSS Classes** - kebab-case, BEM when needed
```css
✅ .resident-form
✅ .dashboard-header
✅ .stats-card
✅ .search-input

✅ BEM methodology
.form-field--required
.button--primary
.button--secondary
.card--highlighted

❌ .residentForm (camelCase)
❌ .ResidentForm (PascalCase)
❌ .resident_form (snake_case)
```

### **CSS Variables** - kebab-case with semantic names
```css
✅ --color-primary
✅ --color-secondary
✅ --color-background
✅ --spacing-small
✅ --spacing-medium
✅ --border-radius-default
✅ --font-size-heading

❌ --primaryColor (camelCase)
❌ --color_primary (snake_case)
❌ --blue (non-semantic)
❌ --size1 (non-descriptive)
```

### **SCSS/Sass Files**
```
✅ File naming
_variables.scss
_mixins.scss
_components.scss
_utilities.scss
base.scss
layout.scss
```

---

## 🧪 Testing

### **Test Suite Names** - Descriptive hierarchy
```typescript
✅ describe('ResidentFormWizard', () => {
  describe('form validation', () => {
    describe('when required fields are missing', () => {
      it('should display validation errors', () => {});
    });
  });
});

✅ describe('AuthContext', () => {
  describe('user authentication', () => {
    it('should sign in with valid credentials', () => {});
    it('should handle sign in errors gracefully', () => {});
  });
});
```

### **Mock and Fixture Names**
```typescript
✅ Mock naming
const mockUserProfile = { id: '1', firstName: 'John' };
const mockResidentsData = [{ id: '1', name: 'Jane' }];
const mockApiResponse = { data: [], error: null };

✅ Mock files
__mocks__/
├── supabase.ts
├── next-router.ts
└── api-responses.ts

✅ Fixtures
fixtures/
├── resident-data.json
├── household-data.json
└── dashboard-stats.json
```

---

## 🌐 i18n & Config

### **Translation Keys** - Hierarchical dot notation
```typescript
✅ {
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "accountLocked": "Account has been locked"
    }
  },
  "residents": {
    "form": {
      "title": "Resident Registration",
      "fields": {
        "firstName": "First Name",
        "lastName": "Last Name"
      }
    }
  }
}

❌ {
  "signInButton": "Sign In",
  "sign_out": "Sign Out",
  "error_invalid_creds": "Invalid credentials"
}
```

### **Environment Variables** - SCREAMING_SNAKE_CASE with prefixes
```bash
✅ # Database
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

✅ # API Keys
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

✅ # Feature Flags
FEATURE_ENABLE_ANALYTICS=true
FEATURE_ENABLE_NOTIFICATIONS=false

❌ supabaseUrl (camelCase)
❌ database-url (kebab-case)
❌ api_key_smtp (mixed styles)
```

### **Config Object Keys** - camelCase
```typescript
✅ const config = {
  database: {
    connectionString: process.env.DATABASE_URL,
    maxConnections: 10,
    timeoutMs: 5000
  },
  auth: {
    secretKey: process.env.AUTH_SECRET,
    tokenExpirationHours: 24,
    allowSignups: true
  }
};
```

---

## 📊 Analytics & Logging

### **Event Names** - snake_case
```typescript
✅ 'user_signed_in'
✅ 'resident_created'
✅ 'household_updated'
✅ 'form_validation_error'
✅ 'page_viewed'

❌ 'userSignedIn' (camelCase)
❌ 'UserSignedIn' (PascalCase)
❌ 'user-signed-in' (kebab-case)
```

### **Structured Logging**
```typescript
✅ logger.info('User signed in', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString()
});

✅ logger.error('Database connection failed', {
  error: error.message,
  connectionString: config.database.url,
  retryAttempt: 3
});

❌ console.log('user signed in');
❌ logger.info('error happened');
```

---

## 📚 Documentation

### **README Files** - Consistent structure
```
✅ README.md (root)
✅ components/README.md
✅ api/README.md
✅ database/README.md
```

### **Documentation Files** - Descriptive names
```
✅ INSTALLATION.md
✅ DEPLOYMENT.md
✅ TROUBLESHOOTING.md
✅ API_REFERENCE.md
✅ NAMING_CONVENTIONS.md
✅ CONTRIBUTING.md
✅ CHANGELOG.md
```

---

## 🐙 GitHub & CI/CD

> 📌 **Note**: For complete Git workflow conventions (branch naming, commit messages, PR titles, release flows), see [GIT_WORKFLOW_CONVENTIONS.md](./GIT_WORKFLOW_CONVENTIONS.md).

### **GitHub Workflows** - kebab-case with descriptive names
```yaml
✅ Workflow files (.github/workflows/)
pull-request.yml
code-review.yml
deploy-storybook.yml
production-validation.yml
staging-validation.yml
bundle-analysis.yml
ai-review.yml
codeql.yml
sonarcloud.yml
vercel-build.yml
release.yml

❌ Avoid
pr.yml
build.yml
test.yml
workflow1.yml
```

### **GitHub Issue Labels** - kebab-case with prefixes
```
✅ Label naming
bug/critical
bug/minor
feature/enhancement
feature/new
docs/update
chore/maintenance
priority/high
priority/low
status/in-progress
status/needs-review
type/security
area/frontend
area/backend
area/database

❌ Avoid
Bug (inconsistent casing)
high priority (spaces)
front_end (snake_case)
```

### **GitHub Templates** - SCREAMING_SNAKE_CASE for templates
```
✅ Template files
.github/
├── ISSUE_TEMPLATE/
│   ├── BUG_REPORT.md
│   ├── FEATURE_REQUEST.md
│   └── DOCUMENTATION.md
├── PULL_REQUEST_TEMPLATE.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md

❌ Avoid
bug_report.md
pull-request-template.md
contributing.txt
```

### **GitHub Actions** - kebab-case for action names
```yaml
✅ Action step names
- name: "setup-node-environment"
- name: "install-dependencies"
- name: "run-type-check"
- name: "build-application"
- name: "deploy-to-vercel"
- name: "notify-deployment-status"

❌ Avoid
- name: "Setup Node"
- name: "install_deps"
- name: "TypeCheck"
```

### **GitHub Secrets and Variables** - SCREAMING_SNAKE_CASE
```yaml
✅ Repository secrets
VERCEL_TOKEN
SUPABASE_SERVICE_ROLE_KEY
SONAR_TOKEN
OPENAI_API_KEY
SLACK_WEBHOOK_URL
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL

✅ Environment variables in workflows
NODE_ENV
VERCEL_ORG_ID
VERCEL_PROJECT_ID
STORYBOOK_URL

❌ Avoid
vercelToken (camelCase)
supabase-key (kebab-case)
api_key (mixed styles)
```

### **Branch Protection Rules** - Match branch naming
```
✅ Protected branches
main
develop
staging
feature/*
fix/*
hotfix/*
release/*

✅ Status checks required for develop merges
build-and-test
lint-and-typecheck
security-scan

✅ Status checks required for staging merges
All develop checks +
e2e-tests
performance-tests

✅ Status checks required for main merges
All staging checks +
accessibility-tests
staging-deployment-check
```

### **Release Tags** - Semantic versioning
```
✅ Release naming
v1.0.0
v1.1.0
v1.1.1
v2.0.0-alpha.1
v2.0.0-beta.2
v2.0.0-rc.1

❌ Avoid
release-1.0
version_1.1
v1 (incomplete)
prod-release
```

### **Dependabot Configuration** - kebab-case for identifiers
```yaml
✅ dependabot.yml
package-ecosystem: "npm"
directory: "/"
schedule:
  interval: "weekly"
  day: "monday"
  time: "09:00"
open-pull-requests-limit: 5
reviewers:
  - "team-leads"
assignees:
  - "maintainers"

✅ Update groups
group-name: "dependencies"
group-name: "dev-dependencies"
group-name: "security-updates"
```

### **GitHub Project Boards** - Title Case with clear organization
```
✅ Project naming
"Sprint Planning Board"
"Bug Tracking"
"Feature Development Pipeline"
"Release Management"

✅ Column naming
"📋 Backlog"
"🔍 In Review"
"✅ Ready for Testing"
"🚀 Ready for Release"
"✨ Done"

❌ Avoid
"todo" 
"in progress"
"stuff to do"
"random tasks"
```

---

## ⚠️ Common Mistakes

### **❌ Wrong Variable Naming**
```typescript
❌ const usr = getUserData();          // Use: user or userData
❌ const addr = getAddress();          // Use: address
❌ const res = await apiCall();        // Use: response or result
❌ const data = fetchData();           // Use: residents, users, etc.
❌ const flag = true;                  // Use: isActive, hasError, etc.
❌ const user_name = 'john';           // Use: userName (camelCase)
```

### **❌ Wrong URL Patterns**
```
❌ /api/getResidents          # Use /api/residents with GET
❌ /api/createResident        # Use /api/residents with POST  
❌ /api/updateResident/123    # Use /api/residents/123 with PUT
❌ /api/ResidentDetails       # Use kebab-case
❌ /api/residents_list        # Use /api/residents
```

### **❌ Wrong Database Naming**
```sql
❌ Residents (PascalCase)     -- Use: residents
❌ firstName (camelCase)      -- Use: first_name
❌ dashboard_view             -- Use: api_dashboard_stats
❌ residents_idx              -- Use: idx_residents_barangay_code
```

### **❌ Wrong File Naming**
```
❌ residentForm.tsx           # Use: ResidentForm.tsx
❌ resident_form.tsx          # Use: ResidentForm.tsx
❌ ResidentForm.Test.tsx      # Use: ResidentForm.test.tsx
❌ migration1.sql             # Use: 2025-01-15_create_table.sql
```

### **❌ Wrong GitHub Naming**
```yaml
❌ Wrong workflow names
build.yml                     # Use: build-and-test.yml
test.yml                      # Use: run-tests.yml
pr.yml                        # Use: pull-request.yml

❌ Wrong action step names
- name: "Setup Node"          # Use: "setup-node-environment"
- name: "install_deps"        # Use: "install-dependencies"  
- name: "TypeCheck"           # Use: "run-type-check"

❌ Wrong secrets
vercelToken                   # Use: VERCEL_TOKEN
supabase-key                  # Use: SUPABASE_SERVICE_ROLE_KEY
api_key                       # Use: API_KEY

❌ Wrong labels
Bug                           # Use: bug/critical
high priority                 # Use: priority/high
front_end                     # Use: area/frontend

```

---

## 📋 Quick Reference

| **Context** | **Convention** | **Example** |
|-------------|----------------|-------------|
| **Variables** | camelCase | `userProfile`, `isLoading` |
| **Functions** | camelCase | `calculateAge()`, `handleSubmit()` |
| **Components** | PascalCase | `ResidentFormWizard` |
| **Interfaces** | PascalCase | `DashboardStats` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| **API URLs** | kebab-case | `/api/dashboard/stats` |
| **Database Tables** | snake_case, plural | `residents`, `households` |
| **Database Columns** | snake_case | `first_name`, `barangay_code` |
| **CSS Classes** | kebab-case | `.resident-form`, `.stats-card` |
| **CSS Variables** | kebab-case | `--color-primary` |
| **Component Files** | PascalCase.tsx | `ResidentForm.tsx` |
| **Utility Files** | camelCase.ts | `authUtils.ts` |
| **Test Files** | PascalCase.test.tsx | `ResidentForm.test.tsx` |
| **Config Files** | kebab-case.js | `jest.config.js` |
| **Environment Vars** | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
| **Event Names** | snake_case | `user_signed_in` |
| **Translation Keys** | dot.notation | `auth.signIn` |
| **GitHub Workflows** | kebab-case.yml | `pull-request.yml` |
| **GitHub Actions** | kebab-case | `setup-node-environment` |
| **GitHub Secrets** | SCREAMING_SNAKE_CASE | `VERCEL_TOKEN` |
| **GitHub Labels** | kebab-case/prefix | `bug/critical` |

> 📌 **Git Workflows**: For branches, commits, PRs, and releases, see [GIT_WORKFLOW_CONVENTIONS.md](./GIT_WORKFLOW_CONVENTIONS.md)

---

## 🎯 Enforcement Tools

### **ESLint Rules** (Future Implementation)
```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

### **Database Naming Linter** (Future Implementation)
```sql
-- Check table names are snake_case and plural
-- Check column names are snake_case
-- Check view names start with api_ or admin_
```

---

💡 **Remember**: Consistency is more important than perfection. When in doubt, follow the existing patterns in the codebase!