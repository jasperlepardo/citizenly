# RBI System Implementation Plan
## Using Original Schema + PRD + Field Mapping

### 📋 **OVERVIEW**
This plan shows how to implement the full RBI system using the **original schema.sql** structure while meeting all PRD requirements and field mapping specifications.

---

## 🔍 **SCHEMA ANALYSIS**

### **Original Schema Capabilities:**
```sql
-- Core user management
user_profiles (id, email, first_name, last_name, role_id, barangay_code, is_active, created_at)

-- Complete resident data
residents (40+ fields including demographics, employment, sectoral info, etc.)

-- Household management  
households (address, composition, household_head_id, etc.)

-- Geographic reference data
psgc_* tables (complete Philippine geographic hierarchy)

-- Occupation data
psoc_* tables (5-level occupation classification)
```

### **PRD Requirements Coverage:**
✅ **Dashboard Module** - Analytics from residents/households data
✅ **Residents Module** - Full CRUD with all demographics  
✅ **Households Module** - Complete household management
✅ **Settings Module** - User/role management via user_profiles
✅ **Family Relationships** - resident_relationships table
✅ **Role-Based Access** - Built-in RLS policies

---

## 🏗️ **IMPLEMENTATION STRATEGY**

### **Phase 1: Foundation (Original Schema)**
**Use the existing schema.sql as-is with these modifications:**

#### **1.1 Enhanced User Management**
```sql
-- Add minimal required fields to user_profiles for signup
ALTER TABLE user_profiles ADD COLUMN mobile_number VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN status VARCHAR(50) DEFAULT 'active';
ALTER TABLE user_profiles ALTER COLUMN role_id SET DEFAULT (
    SELECT id FROM roles WHERE name = 'resident' LIMIT 1
);
```

#### **1.2 Simplified User Workflow**
- **Admin creates users** → No self-signup initially
- **Single barangay per user** → Use existing barangay_code in user_profiles
- **Direct role assignment** → Use existing role_id field

---

### **Phase 2: Core Modules Implementation**

#### **2.1 Authentication & Access Control**
```typescript
// AuthContext - Simplified for original schema
interface UserWithProfile {
  user: User
  profile: UserProfile  // From user_profiles table
  role: Role           // From roles table
  barangayCode: string // From user_profiles.barangay_code
}

// Single barangay access (no barangay_accounts needed)
const canAccessBarangay = (barangayCode: string) => {
  return userProfile?.barangay_code === barangayCode
}
```

#### **2.2 Dashboard Module**
```typescript
// Dashboard using original schema
interface DashboardData {
  totalResidents: number      // COUNT(*) FROM residents WHERE barangay_code = ?
  totalHouseholds: number     // COUNT(*) FROM households WHERE barangay_code = ?
  populationPyramid: AgeGenderData[]  // FROM residents GROUP BY age_range, sex
  sectoralBreakdown: SectoralData[]   // FROM residents sectoral fields
}

// Real-time queries from residents table
const getDashboardStats = async (barangayCode: string) => {
  const { data: residents } = await supabase
    .from('residents')
    .select('*')
    .eq('barangay_code', barangayCode)
}
```

#### **2.3 Residents Module (Full Implementation)**
```typescript
// Complete resident form matching field mapping
interface ResidentFormData {
  // Personal Information (from field mapping)
  philsys_card_number_hash: string
  first_name: string
  middle_name?: string
  last_name: string
  extension_name?: string
  birthdate: string
  sex: sex_enum
  civil_status: civil_status_enum
  
  // Contact Information
  mobile_number: string
  email?: string
  
  // Address (auto-populated from user's barangay)
  household_id?: string
  barangay_code: string  // From user session
  
  // Demographics & Identity
  blood_type: blood_type_enum
  ethnicity: ethnicity_enum
  religion: religion_enum
  
  // Sectoral Information (auto-calculated)
  is_labor_force: boolean
  is_senior_citizen: boolean
  is_ofw: boolean
  // ... all other sectoral fields
}

// Form validation using original schema constraints
const validateResident = (data: ResidentFormData) => {
  // All validations from field mapping document
  // Use enum types for dropdown validation
  // Auto-calculate age, sectoral flags, etc.
}
```

#### **2.4 Households Module**
```typescript
// Household management using original schema
interface HouseholdData {
  household_number: string
  barangay_code: string    // Auto-set from user
  street_name: string
  house_number: string
  subdivision?: string
  household_head_id: string  // Must be existing resident
}

// Member management through residents table
const getHouseholdMembers = async (householdId: string) => {
  return supabase
    .from('residents')
    .select('*')
    .eq('household_id', householdId)
}
```

---

### **Phase 3: Advanced Features**

#### **3.1 PSOC Occupation Integration**
```typescript
// Use existing psoc_occupation_search view
const searchOccupations = async (query: string) => {
  return supabase
    .from('psoc_occupation_search')
    .select('*')
    .ilike('searchable_text', `%${query}%`)
    .limit(20)
}

// 5-level hierarchy support
interface PSOCSelection {
  code: string
  level: 'major_group' | 'sub_major_group' | 'minor_group' | 'unit_group' | 'unit_sub_group'
  title: string
}
```

#### **3.2 Family Relationships**
```typescript
// Use existing resident_relationships table
const createFamilyRelationship = async (
  residentId: string, 
  relatedResidentId: string, 
  type: 'parent' | 'child' | 'spouse' | 'sibling'
) => {
  return supabase
    .from('resident_relationships')
    .insert({ resident_id: residentId, related_resident_id: relatedResidentId, relationship_type: type })
}
```

#### **3.3 Address Hierarchy**
```typescript
// Use existing PSGC tables and psgc_address_hierarchy view
const getAddressHierarchy = async () => {
  return supabase
    .from('psgc_address_hierarchy')
    .select('*')
    .order('full_address')
}

// Auto-populate address from user's barangay
const getBarangayAddress = async (barangayCode: string) => {
  return supabase
    .from('psgc_barangays')
    .select(`
      *,
      psgc_cities_municipalities(*),
      psgc_provinces(*),
      psgc_regions(*)
    `)
    .eq('code', barangayCode)
    .single()
}
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1-2)**
1. ✅ Use original schema.sql as base
2. ✅ Add minimal user_profiles enhancements
3. ✅ Implement simplified AuthContext
4. ✅ Create role-based access control
5. ✅ Set up basic RLS policies

### **Phase 2: Core Modules (Week 3-6)**
1. 📊 Dashboard with real-time analytics
2. 👤 Complete residents CRUD with all field mapping
3. 🏠 Households management with member linking
4. ⚙️ Settings for user/role management
5. 🔍 Search and filtering across all data

### **Phase 3: Advanced Features (Week 7-10)**
1. 👨‍👩‍👧‍👦 Family relationships mapping
2. 💼 PSOC occupation search and selection
3. 🗺️ Complete address hierarchy navigation
4. 📈 Advanced analytics and reporting
5. 📱 PWA features and offline support

### **Phase 4: Polish & Deploy (Week 11-12)**
1. 🎨 UI/UX refinements using Figma designs
2. 🧪 Comprehensive testing
3. 📚 Documentation and training materials
4. 🚀 Production deployment
5. 👥 User training and onboarding

---

## 💻 **CODE STRUCTURE**

### **Directory Structure:**
```
src/
├── components/
│   ├── residents/
│   │   ├── ResidentForm.tsx      # Complete form with all fields
│   │   ├── ResidentList.tsx      # Search, filter, pagination
│   │   └── ResidentDetails.tsx   # View with sectoral info
│   ├── households/
│   │   ├── HouseholdForm.tsx     # Address + member management
│   │   └── HouseholdMembers.tsx  # Member assignment
│   ├── dashboard/
│   │   ├── PopulationPyramid.tsx # Age/gender visualization
│   │   └── SectoralStats.tsx     # Sectoral breakdown
│   └── ui/
│       ├── PSOCSelector.tsx      # 5-level occupation search
│       └── AddressSelector.tsx   # PSGC hierarchy picker
├── contexts/
│   └── AuthContext.tsx           # Simplified for original schema
├── hooks/
│   ├── useResidents.tsx          # Residents CRUD operations
│   └── useHouseholds.tsx         # Households management
└── lib/
    ├── supabase.ts               # Enhanced with original schema types
    └── validations.ts            # Field mapping validations
```

---

## 🎯 **KEY BENEFITS OF THIS APPROACH**

### **✅ Advantages:**
1. **Leverages existing schema** - No major structural changes
2. **Full PRD compliance** - Meets all requirements
3. **Scalable architecture** - Can grow with needs
4. **Maintainable code** - Clear separation of concerns
5. **Fast development** - Uses proven patterns

### **🔄 Migration Path:**
- **Start with original schema** (minimal changes)
- **Add features incrementally** (residents → households → dashboard)
- **Enhance gradually** (relationships → analytics → PWA)

### **📊 Expected Outcomes:**
- ✅ Complete RBI system functionality
- ✅ All field mapping requirements met
- ✅ Role-based access control working
- ✅ Real-time dashboard analytics
- ✅ Scalable to 10,000+ residents per barangay

---

## 🚀 **NEXT STEPS**

1. **Review this plan** and confirm approach
2. **Revert to original schema** using REVERT_TO_ORIGINAL_SCHEMA.sql
3. **Implement Phase 1** foundation components
4. **Build iteratively** following the phases above

**This approach gives you a production-ready RBI system that fully utilizes the original schema while meeting all PRD and field mapping requirements.**