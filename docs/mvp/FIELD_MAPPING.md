# RBI System - Field Mapping (Current Implementation)
## Database Schema to UI Form Mapping - Updated August 2025

---

## 📊 **Implementation Status Overview**

### **Current Implementation Level: ~65% Complete**
- **Personal Information**: ✅ 90% Complete
- **Contact & Address**: ✅ 95% Complete  
- **Education & Employment**: 🔶 60% Complete
- **Health & Demographics**: 🔶 50% Complete
- **Sectoral Information**: ✅ 85% Complete
- **Family Relationships**: ❌ 0% Complete (Not Implemented)

### **Key Implementation Notes:**
- **Manual Sectoral Flags** - Most sectoral information requires manual input (auto-calculations not fully implemented)
- **Basic PSOC Integration** - PSOC selector exists but workplace/title fields incomplete
- **Single-Step Forms** - Current forms are single-page, not multi-step workflow
- **Core CRUD Complete** - All basic resident/household operations functional

---

## 👤 **RESIDENTS MODULE**

### **Personal Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **PhilSys Card Number (PCN)** | `philsys_card_number_hash` | BYTEA | Hashed, secure | Masked Input |
| **Last 4 Digits** | `philsys_last4` | VARCHAR(4) | Auto-extracted | Display Only |
| **First Name** | `first_name` | VARCHAR(100) | Required, 2-100 chars | Text Input |
| **Middle Name** | `middle_name` | VARCHAR(100) | Optional | Text Input |
| **Last Name** | `last_name` | VARCHAR(100) | Required, 2-100 chars | Text Input |
| **Extension Name** | `extension_name` | VARCHAR(20) | Optional (Jr., Sr., III) | Dropdown |
| **Date of Birth** | `birthdate` | DATE | Required, valid date | Date Picker |
| **Age** | *computed* | *calculated* | Auto-calculated from birthdate | Display Only |
| **Sex** | `sex` | sex_enum | Required | Radio Buttons |
| **Civil Status** | `civil_status` | civil_status_enum | Required | Dropdown |
| **Citizenship** | `citizenship` | citizenship_enum | Default: 'filipino' | Dropdown |

### **Education & Employment Section** ✅ *60% Implemented*
| UI Field Label | Database Column | Data Type | Validation | UI Component | Status |
|----------------|-----------------|-----------|------------|--------------|--------|
| **Highest Educational Attainment** | `education_level` | education_level_enum | Optional | Dropdown | ✅ Implemented |
| **Education Status** | `education_status` | education_status_enum | Optional | Dropdown | ✅ Implemented |
| **Employment Status** | `employment_status` | employment_status_enum | Optional | Dropdown | ✅ Implemented |
| **Profession/Occupation** | `psoc_code` | VARCHAR(10) | Optional | PSOC Search | ✅ Implemented |
| **Occupation Level** | `psoc_level` | VARCHAR(20) | Auto-set from PSOC search | Hidden Field | ✅ Implemented |
| **Occupation Title** | `occupation_title` | VARCHAR(200) | Auto-populated from PSOC | Display Only | 🔶 Partial |
| **Workplace** | `workplace` | VARCHAR(255) | Optional | Text Input | ❌ Not Implemented |
| **Occupation Details** | `occupation_details` | TEXT | Optional | Textarea | 🔶 Basic Implementation |

### **Contact Information Section** ✅ *100% Implemented*
| UI Field Label | Database Column | Data Type | Validation | UI Component | Status |
|----------------|-----------------|-----------|------------|--------------|--------|
| **Mobile Number** | `mobile_number` | VARCHAR(20) | Optional, PH format | Phone Input | ✅ Implemented |
| **Telephone Number** | `telephone_number` | VARCHAR(20) | Optional | Phone Input | ✅ Implemented |
| **Email Address** | `email` | VARCHAR(255) | Optional, valid email | Email Input | ✅ Implemented |

### **Address Section** *(Auto-populated from household and user's barangay)*
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Household** | `household_id` | UUID | Required | Household Search |
| **Barangay** | `barangay_code` | VARCHAR(10) | Auto-populated from user's assignment | Display Only |
| **Street Name** | *from household.street_name* | VARCHAR(200) | Auto-populated from household | Display Only |
| **House Number** | *from household.house_number* | VARCHAR(50) | Auto-populated from household | Display Only |
| **Subdivision** | *from household.subdivision* | VARCHAR(100) | Auto-populated from household | Display Only |

### **Health & Demographics Section** 🔶 *50% Implemented*
| UI Field Label | Database Column | Data Type | Validation | UI Component | Status |
|----------------|-----------------|-----------|------------|--------------|--------|
| **Blood Type** | `blood_type` | blood_type_enum | Optional | Dropdown | ✅ Implemented |
| **Height (cm)** | `height` | DECIMAL(5,2) | Optional | Number Input | ❌ Not Implemented |
| **Weight (kg)** | `weight` | DECIMAL(5,2) | Optional | Number Input | ❌ Not Implemented |
| **Complexion** | `complexion` | VARCHAR(50) | Optional | Dropdown | ❌ Not Implemented |
| **Ethnicity** | `ethnicity` | ethnicity_enum | Optional | Dropdown | ✅ Implemented |
| **Religion** | `religion` | religion_enum | Optional | Dropdown | ✅ Implemented |

### **Voting Information Section** 🔶 *70% Implemented*
| UI Field Label | Database Column | Data Type | Validation | UI Component | Status |
|----------------|-----------------|-----------|------------|--------------|--------|
| **Registered Voter** | `is_voter` | BOOLEAN | Default: false | Checkbox | ✅ Implemented |
| **Resident Voter** | `is_resident_voter` | BOOLEAN | Default: false | Checkbox | ✅ Implemented |
| **Voter ID Number** | `voter_id_number` | VARCHAR(20) | Optional | Text Input | 🔶 Field exists, UI partial |
| **Last Voted Year** | `last_voted_year` | VARCHAR(4) | Optional | Number Input | ❌ Not Implemented |

### **Sectoral Information Section** ✅ *85% Implemented* ⚠️ *Manual Entry Only*
| UI Field Label | Database Column | Data Type | Current Implementation | UI Component | Status |
|----------------|-----------------|-----------|----------------------|--------------|--------|
| **Labor Force** | `is_labor_force` | BOOLEAN | Manual entry (not auto-computed) | Checkbox | 🔶 Manual only |
| **Employed** | `is_employed` | BOOLEAN | Manual entry (not auto-computed) | Checkbox | 🔶 Manual only |
| **Unemployed** | `is_unemployed` | BOOLEAN | Manual entry (not auto-computed) | Checkbox | 🔶 Manual only |
| **Overseas Filipino Worker (OFW)** | `is_ofw` | BOOLEAN | Manual entry | Checkbox | ✅ Implemented |
| **Person with Disabilities (PWD)** | `is_pwd` | BOOLEAN | Manual entry | Checkbox | ✅ Implemented |
| **Out of School Children (OSC)** | `is_out_of_school_children` | BOOLEAN | Manual entry (not auto-computed) | Checkbox | 🔶 Manual only |
| **Out of School Youth (OSY)** | `is_out_of_school_youth` | BOOLEAN | Manual entry (not auto-computed) | Checkbox | 🔶 Manual only |
| **Senior Citizen (SC)** | `is_senior_citizen` | BOOLEAN | **Auto-computed from age (60+)** | Checkbox (Read-only) | ✅ Auto-computed |
| **Registered Senior Citizen** | `is_registered_senior_citizen` | BOOLEAN | Manual entry | Checkbox | ✅ Implemented |
| **Solo Parent** | `is_solo_parent` | BOOLEAN | Manual entry | Checkbox | ✅ Implemented |
| **Indigenous People (IP)** | `is_indigenous_people` | BOOLEAN | Manual entry | Checkbox | ✅ Implemented |
| **Migrant** | `is_migrant` | BOOLEAN | Manual entry | Checkbox | ✅ Implemented |

**⚠️ Implementation Note:** Most sectoral flags require manual input. Only Senior Citizen status is auto-calculated from age. Other auto-calculations (labor force, OSC/OSY) are not implemented.

---

## 🏠 **HOUSEHOLDS MODULE**

### **Basic Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Household Number** | `household_number` | VARCHAR(50) | Required, unique per barangay | Text Input |
| **Household Head** | `household_head_id` | UUID | Required | Resident Search |

### **Address Information Section** *(Auto-populated from user's barangay)*
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Region** | `region_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Province** | `province_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **City/Municipality** | `city_municipality_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Barangay** | `barangay_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Street Name** | `street_name` | VARCHAR(200) | Optional | Text Input |
| **House Number** | `house_number` | VARCHAR(50) | Required | Text Input |
| **Subdivision** | `subdivision` | VARCHAR(100) | Optional | Text Input |
| **ZIP Code** | `zip_code` | VARCHAR(10) | Optional | Text Input |

---

## 🔗 **FAMILY RELATIONSHIPS MODULE** ❌ *Not Implemented*

**Status**: This module is not implemented in the current version.

### **Planned Relationship Management** *(Future Implementation)*
| UI Field Label | Database Column | Data Type | Validation | UI Component | Status |
|----------------|-----------------|-----------|------------|--------------|--------|
| **Primary Resident** | `resident_id` | UUID | Required | Resident Search | ❌ Not Implemented |
| **Related Resident** | `related_resident_id` | UUID | Required | Resident Search | ❌ Not Implemented |
| **Relationship Type** | `relationship_type` | VARCHAR(50) | Required | Dropdown | ❌ Not Implemented |

### **Planned Relationship Types** *(Future Implementation)*:
- `parent` - Parent relationship
- `child` - Child relationship  
- `spouse` - Spouse/Partner relationship
- `sibling` - Brother/Sister relationship

**Note**: Family relationships are currently tracked informally through household membership only.

---

## ⚙️ **USER MANAGEMENT MODULE**

### **User Profile Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Email** | `email` | VARCHAR(255) | Required, unique | Email Input |
| **First Name** | `first_name` | VARCHAR(100) | Required | Text Input |
| **Last Name** | `last_name` | VARCHAR(100) | Required | Text Input |
| **Role** | `role_id` | UUID | Required | Role Dropdown |
| **Assigned Barangay** | `barangay_code` | VARCHAR(10) | Required | PSGC Dropdown |
| **Active Status** | `is_active` | BOOLEAN | Default: true | Toggle Switch |

---

## 🎨 **UI Component Specifications (Free Tier Optimized)**

### **📐 Figma Design References**
- **App Layout**: [Citizenly Layout](https://www.figma.com/design/srcDxfJEqx3qfPiQRrSR52/Citizenly?node-id=1-829&t=OndQULNKpeMqYE59-4)
- **Components**: [JSPR Design System](https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/JSPR-%7C-Design-System?t=5AC2fFPemOImA5UD-0)
- **Icons**: [JSPR Iconography](https://www.figma.com/design/CYygNIegdzFYCkeIh8tema/JSPR-%7C-Iconography---Tailwind?node-id=2098-10628&t=CS8rjlKi6yUeTQ8M-0)

### **PSOC Occupation Search Component** ✅ *Implemented*
```typescript
// Current Implementation: PSOCSelector component exists
interface PSOCSearchProps {
  value: string;
  onChange: (code: string, title: string, level: string) => void;
  placeholder: "Search occupation...";
}

// Status: ✅ Component implemented
// Location: /src/components/ui/PSOCSelector.tsx
// Features: 
// - Search functionality working
// - Code and title selection
// - Integration with resident forms
// 
// Limitations:
// - Workplace field not fully integrated
// - Title display may need enhancement
```

### **Household Search Component** ✅ *Implemented*
```typescript
// Current Implementation: HouseholdSelector component exists
interface HouseholdSearchProps {
  value: string;
  barangayCode: string;
  onChange: (householdId: string) => void;
}

// Status: ✅ Component implemented with advanced features
// Location: /src/components/ui/HouseholdSelector.tsx
// Features:
// - Advanced search across multiple fields
// - Individual filters (house number, street, subdivision)
// - Results counter
// - Create new household modal integration
// - Real-time search and filtering
// 
// Enhanced beyond original spec:
// - Displays all households by default
// - Comprehensive filtering options
// - Better user experience than originally planned
```

### **Sectoral Information Component** 🔶 *Partially Implemented*
```typescript
// Current Implementation: Individual checkboxes in resident forms
interface SectoralInfoProps {
  residentId: string;
  isReadOnly?: boolean;
  employmentStatus: employment_status_enum;
  birthdate: Date;
  onChange: (sectoralData: SectoralInformation) => void;
}

// Status: 🔶 Implemented but mostly manual entry
// Location: Integrated in resident detail and create forms
// 
// Current Implementation:
// ✅ is_senior_citizen: age >= 60 (AUTO-CALCULATED)
// 🔶 is_labor_force: Manual checkbox (NOT auto-calculated)
// 🔶 is_employed: Manual checkbox (NOT auto-calculated)  
// 🔶 is_unemployed: Manual checkbox (NOT auto-calculated)
// 🔶 is_out_of_school_children: Manual checkbox (NOT auto-calculated)
// 🔶 is_out_of_school_youth: Manual checkbox (NOT auto-calculated)
// ✅ All other sectoral flags: Manual checkboxes working
//
// Missing: Most auto-calculation logic not implemented
```

---

## 📊 **Form Validation Rules (Free Tier)**

### **Field-Level Validations**
| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| `first_name` | Required, 2-100 chars, letters only | "First name is required (2-100 characters, letters only)" |
| `last_name` | Required, 2-100 chars, letters only | "Last name is required (2-100 characters, letters only)" |
| `birthdate` | Required, valid date, not future | "Please enter a valid birth date" |
| `mobile_number` | Required, PH format (+63XXXXXXXXXX) | "Please enter a valid Philippine mobile number" |
| `email` | Optional, valid email format | "Please enter a valid email address" |
| `household_number` | Required, unique per barangay | "Household number already exists in this barangay" |
| `psoc_code` | Optional, valid PSOC code | "Please select a valid occupation" |
| `household_id` | Required, valid UUID | "Please select a household" |

### **Business Logic Validations (Simplified)**
| Validation | Rule | Implementation |
|------------|------|----------------|
| **Age Consistency** | Birthdate must result in logical age | Client-side calculation + server validation |
| **Relationship Logic** | Parent must be older than child | Age difference validation (min 15 years) |
| **Household Head** | Only one head per household | Database constraint + UI validation |
| **Barangay Scope** | User can only create records in assigned barangay | RLS policy + UI filtering |
| **Address Auto-Population** | Region/Province/City/Barangay auto-filled | Auto-populate from user_profiles.barangay_code |
| **Senior Citizen Auto-Check** | Senior citizen status based on age (60+) | Auto-populate from birthdate |
| **Labor Force Auto-Check** | Employment status determines labor force | Auto-populate from employment_status |
| **OSC/OSY Auto-Check** | Age + education status determines OSC/OSY | Auto-populate from age + education_status |

---

## 🔍 **Search & Filter Mappings (Free Tier Optimized)**

### **Global Search Fields (Simplified)**
```sql
-- Lightweight search using generated column
search_text GENERATED ALWAYS AS (
  LOWER(first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name || ' ' || 
        COALESCE(occupation_title, '') || ' ' || COALESCE(mobile_number, ''))
) STORED
```

### **Advanced Filter Fields**
| Filter Category | Database Fields | UI Component |
|----------------|-----------------|--------------| 
| **Demographics** | `sex`, `civil_status`, age calculation | Multi-select checkboxes |
| **Education** | `education_level`, `education_status` | Dropdown filters |
| **Employment** | `employment_status`, `occupation_title` | Multi-select + text search |
| **Location** | `barangay_code` (scoped to user) | Display only (auto-filtered) |
| **Voting** | `is_voter`, `is_resident_voter` | Boolean toggles |
| **Health** | `blood_type` | Multi-select dropdown |
| **Sectoral Information** | All sectoral boolean fields | Multi-select checkboxes |

---

## 📱 **Mobile Form Adaptations**

### **Responsive Breakpoints**
- **Mobile**: 320px-768px (single column, essential fields only)
- **Tablet**: 768px-1024px (two columns, larger inputs)
- **Desktop**: 1024px+ (multi-column, full layout)

### **Mobile-Specific Components**
| Component | Mobile Adaptation |
|-----------|------------------| 
| **Date Picker** | Native mobile date input |
| **Dropdown** | Native select with search |
| **PSOC Search** | Simplified modal with autocomplete |
| **Sectoral Info** | Collapsible sections |
| **Address Input** | Auto-populated, read-only |

---

## 🎯 **Form Submission Flow (Free Tier)**

### **Current Resident Creation Workflow** 🔶 *Single-Step Form*
```
Current Implementation: Single-page form (not multi-step)

Single Step: Complete Resident Information
├── Personal Information
│   ├── Name (first, middle, last, extension) ✅
│   ├── Birthdate, sex, civil status, citizenship ✅
│   └── Contact details (mobile, telephone, email) ✅
├── Education & Employment ✅
│   ├── Education level & status ✅
│   ├── Employment status ✅
│   └── PSOC occupation search ✅
├── Health & Demographics 🔶
│   ├── Blood type, ethnicity, religion ✅
│   ├── Voting registration status ✅
│   └── Height, weight, complexion ❌ (not implemented)
├── Documentation 🔶
│   ├── PhilSys card number ✅
│   └── Profile photo upload 🔶 (basic implementation)
├── Household Assignment ✅
│   ├── Household selection ✅
│   └── Household role assignment ✅
└── Sectoral Information 🔶
    ├── Manual flags: All sectoral checkboxes ✅
    ├── Auto-calculated: Only senior citizen ✅
    └── Submit with validation ✅

Note: Form is currently single-page, not the planned 5-step workflow
```

### **Current Household Creation Workflow** ✅ *Implemented*
```
Current Implementation: Available through HouseholdSelector component

Method 1: Create New Household (via HouseholdSelector modal) ✅
├── Auto-populated: Region, Province, City, Barangay ✅
├── Enter: House number (required) ✅
├── Enter: Street name (optional) ✅
├── Enter: Subdivision (optional) ✅
├── Select: Household head (from existing residents) ✅
├── Auto-generate: Household code/UUID ✅
└── Submit with validation ✅

Method 2: Direct Household Management ✅
├── Access via Households page ✅
├── View household details ✅
├── Add/remove members ✅
├── Update household information ✅
└── Manage household head assignment ✅

Note: Household creation is integrated into resident assignment workflow
Family relationships are tracked through household membership only
```

---

## 📋 **Implementation Checklist (Free Tier)**

### **Database Changes** ✅ *Complete*
- [x] ✅ Database schema implemented and working
- [x] ✅ Essential indexes in place
- [x] ✅ Sectoral information (boolean fields in residents table)
- [x] ✅ PSOC integration working
- [x] ✅ RLS policies for barangay-scoped access

### **Frontend Components** 🔶 *Mostly Complete*
- [x] ✅ Comprehensive UI components (Button, Input, Card, Modal, etc.)
- [x] ✅ PSOC search with autocomplete (PSOCSelector)
- [x] 🔶 Sectoral information checkboxes (manual only, limited auto-calculation)
- [x] ✅ Advanced household search and selection (HouseholdSelector)
- [ ] ❌ Multi-step forms (current: single-page forms)
- [x] ✅ Data tables with sorting and filtering
- [x] ✅ Comprehensive search with multiple filters
- [x] ✅ RBI Form generation with household selection

### **Validation & Business Logic** 🔶 *Partially Complete*
- [x] ✅ Client-side age calculations
- [ ] ❌ Employment status → labor force auto-population
- [x] ✅ Age-based senior citizen auto-check
- [ ] ❌ Education + age → OSC/OSY auto-check
- [x] ✅ Basic form validation
- [x] ✅ Barangay-scoped data access

### **API Optimization** ✅ *Complete*
- [x] ✅ Efficient database queries with proper JOINs
- [x] ✅ Client-side calculations where appropriate
- [x] ✅ Optimized search queries
- [x] ✅ Performance-optimized component architecture

---

## 📈 **Current Implementation Status Summary**

**Overall Implementation**: 🔶 **65% Complete - Production Ready Core**  
**Database Schema**: ✅ **90% Complete**  
**UI Components**: ✅ **85% Complete**  
**Business Logic**: 🔶 **60% Complete**  

### **Production-Ready Features** ✅
- Complete resident CRUD operations
- Household management and assignment
- PSOC occupation integration
- Advanced search and filtering
- RBI Form generation
- Role-based access control
- Mobile-responsive design

### **Limitations & Missing Features** ❌
- **Auto-calculations**: Most sectoral flags require manual entry
- **Multi-step forms**: Current forms are single-page
- **Family relationships**: Not implemented (household membership only)
- **Physical attributes**: Height, weight, complexion fields missing
- **Advanced workflows**: Simplified compared to original specification

### **Recommended Next Steps** 🎯
1. **High Priority**: Implement auto-calculation logic for sectoral information
2. **Medium Priority**: Add missing physical attribute fields
3. **Low Priority**: Convert to multi-step form workflow
4. **Future**: Implement family relationships module

**Updated**: August 2025 - Reflects current implementation state