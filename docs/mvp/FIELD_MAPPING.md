# RBI System - Free Tier Field Mapping
## Database Schema to UI Form Mapping (Optimized for Supabase Free Tier)

---

## 🗂️ **Free Tier Optimizations**

### **Key Simplifications:**
- **Streamlined sectoral information** - Essential flags only
- **Simplified occupation search** - Single field for PSOC code + level
- **Basic household management** - Core features without complex analytics
- **Optimized indexing** - Only 12 indexes vs 76+ in full version
- **Denormalized data** - Performance over normalization for free tier limits

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

### **Education & Employment Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Highest Educational Attainment** | `education_level` | education_level_enum | Required | Dropdown |
| **Education Status** | `education_status` | education_status_enum | Required | Dropdown |
| **Employment Status** | `employment_status` | employment_status_enum | Default: 'not_in_labor_force' | Dropdown |
| **Profession/Occupation** | `psoc_code` | VARCHAR(10) | Optional | PSOC Search |
| **Occupation Level** | `psoc_level` | VARCHAR(20) | Auto-set from PSOC search | Hidden Field |
| **Occupation Title** | `occupation_title` | VARCHAR(200) | Auto-populated from PSOC | Display Only |

### **Contact Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Mobile Number** | `mobile_number` | VARCHAR(20) | Required, PH format | Phone Input |
| **Email Address** | `email` | VARCHAR(255) | Optional, valid email | Email Input |

### **Address Section** *(Auto-populated from household and user's barangay)*
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Household** | `household_id` | UUID | Required | Household Search |
| **Barangay** | `barangay_code` | VARCHAR(10) | Auto-populated from user's assignment | Display Only |
| **Street Name** | *from household.street_name* | VARCHAR(200) | Auto-populated from household | Display Only |
| **House Number** | *from household.house_number* | VARCHAR(50) | Auto-populated from household | Display Only |
| **Subdivision** | *from household.subdivision* | VARCHAR(100) | Auto-populated from household | Display Only |

### **Health & Demographics Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Blood Type** | `blood_type` | blood_type_enum | Default: 'unknown' | Dropdown |
| **Ethnicity** | `ethnicity` | ethnicity_enum | Default: 'not_reported' | Dropdown |
| **Religion** | `religion` | religion_enum | Default: 'other' | Dropdown |

### **Voting Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Registered Voter** | `is_voter` | BOOLEAN | Default: false | Checkbox |
| **Resident Voter** | `is_resident_voter` | BOOLEAN | Default: false | Checkbox |

### **Sectoral Information Section** *(Simplified for Free Tier)*
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Labor Force** | `is_labor_force` | BOOLEAN | Auto-computed from employment_status | Checkbox (Read-only) |
| **Employed** | `is_employed` | BOOLEAN | Auto-computed from employment_status | Checkbox (Read-only) |
| **Unemployed** | `is_unemployed` | BOOLEAN | Auto-computed from employment_status | Checkbox (Read-only) |
| **Overseas Filipino Worker (OFW)** | `is_ofw` | BOOLEAN | Default: false | Checkbox |
| **Person with Disabilities (PWD)** | `is_pwd` | BOOLEAN | Default: false | Checkbox |
| **Out of School Children (OSC)** | `is_out_of_school_children` | BOOLEAN | Auto-determined: Age 6-15 + not in formal education | Checkbox (Read-only) |
| **Out of School Youth (OSY)** | `is_out_of_school_youth` | BOOLEAN | Auto-determined: Age 16-24 + not in school/work | Checkbox (Read-only) |
| **Senior Citizen (SC)** | `is_senior_citizen` | BOOLEAN | Auto-determined from age (60+) | Checkbox (Read-only) |
| **Registered Senior Citizen** | `is_registered_senior_citizen` | BOOLEAN | Default: false, enabled if senior citizen | Checkbox |
| **Solo Parent** | `is_solo_parent` | BOOLEAN | Default: false | Checkbox |
| **Indigenous People (IP)** | `is_indigenous_people` | BOOLEAN | Default: false | Checkbox |
| **Migrant** | `is_migrant` | BOOLEAN | Default: false | Checkbox |

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

## 🔗 **FAMILY RELATIONSHIPS MODULE** *(Simplified)*

### **Relationship Management**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------| 
| **Primary Resident** | `resident_id` | UUID | Required | Resident Search |
| **Related Resident** | `related_resident_id` | UUID | Required | Resident Search |
| **Relationship Type** | `relationship_type` | VARCHAR(50) | Required | Dropdown |

### **Available Relationship Types:**
- `parent` - Parent relationship
- `child` - Child relationship  
- `spouse` - Spouse/Partner relationship
- `sibling` - Brother/Sister relationship

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

### **PSOC Occupation Search Component (Simplified)**
```typescript
interface PSOCSearchProps {
  value: string;
  onChange: (code: string, title: string, level: string) => void;
  placeholder: "Search occupation...";
}

// Free Tier Query (Optimized):
SELECT * FROM psoc_occupation_search 
WHERE searchable_text ILIKE '%${query}%'
ORDER BY hierarchy_level, occupation_title
LIMIT 20;

// UI Display:
"1111 - Legislators" (unit_group)
"111102 - Legislators - Congressman" (unit_sub_group)  
"Related: Financial controller, Management accountant" (cross_reference)
```

### **Household Search Component**
```typescript
interface HouseholdSearchProps {
  value: string;
  barangayCode: string;
  onChange: (householdId: string) => void;
}

// Simple Query (Free Tier Optimized):
SELECT h.*, r.first_name || ' ' || r.last_name as head_name
FROM households h
LEFT JOIN residents r ON h.household_head_id = r.id
WHERE h.barangay_code = ? 
AND (h.household_number ILIKE ? OR head_name ILIKE ?)
LIMIT 20;
```

### **Sectoral Information Component (Simplified)**
```typescript
interface SectoralInfoProps {
  residentId: string;
  isReadOnly?: boolean;
  employmentStatus: employment_status_enum;
  birthdate: Date;
  onChange: (sectoralData: SectoralInformation) => void;
}

// Auto-calculations (Client-side for performance):
// - is_labor_force: employmentStatus in ['employed', 'self_employed', 'underemployed']
// - is_employed: employmentStatus === 'employed' || employmentStatus === 'self_employed'
// - is_unemployed: employmentStatus === 'unemployed' || employmentStatus === 'looking_for_work'  
// - is_senior_citizen: age >= 60
// - is_out_of_school_children: age >= 6 && age <= 15 && education_status !== 'currently_studying'
// - is_out_of_school_youth: age >= 16 && age <= 24 && education_status !== 'currently_studying' && employment_status !== 'employed'
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

### **Create Resident Workflow (5 Steps - Simplified)**
```
Step 1: Personal Information
├── Name (first, middle, last, extension)
├── Birthdate, sex, civil status, citizenship
└── Contact details (mobile, email)

Step 2: Education & Employment  
├── Education level & status
├── Employment status
└── Optional: PSOC occupation search

Step 3: Health & Demographics
├── Blood type, ethnicity, religion
├── Voting registration status
└── Auto-calculated: Age, senior citizen status

Step 4: Household Assignment
├── Option A: Assign to existing household
├── Option B: Create new household  
├── Auto-populate: Address from household
└── Auto-calculate: Labor force, OSC/OSY status

Step 5: Sectoral Information & Review
├── Manual flags: OFW, PWD, Solo Parent, IP, Migrant
├── Auto-calculated flags displayed (read-only)
├── Review all information
├── Submit with server validation
└── Success confirmation
```

### **Create Household Workflow (4 Steps - Simplified)**
```
Step 1: Basic Information
├── Household number (unique per barangay)
└── Select household head (from existing residents)

Step 2: Address Setup
├── Auto-populated: Region, Province, City, Barangay
├── Enter: Street name (optional)
├── Enter: House number (required)
├── Enter: Subdivision (optional)
└── Enter: ZIP code (optional)

Step 3: Review & Save
├── Validate all information
├── Auto-generate household UUID
├── Submit with server validation
└── Success confirmation

Step 4: Add Members (Post-creation)
├── Link existing residents to household
├── Create family relationships
└── Update household head if needed
```

---

## 📋 **Implementation Checklist (Free Tier)**

### **Database Changes**
- [x] Use free tier optimized schema (schema.sql)
- [x] Essential indexes only (12 total)
- [x] Simplified sectoral information (boolean fields in residents table)
- [x] Basic PSOC search view
- [x] RLS policies for barangay-scoped access

### **Frontend Components (Essential Only)**
- [ ] Basic UI components (Button, Input, Card, Modal)
- [ ] Simplified PSOC search with autocomplete
- [ ] Sectoral information checkboxes (manual + auto-calculated)
- [ ] Basic household search and selection
- [ ] 5-step resident registration form
- [ ] 4-step household creation form
- [ ] Basic data table with client-side sorting
- [ ] Simple search bar with text-based filtering

### **Validation & Business Logic**
- [ ] Client-side age calculations
- [ ] Employment status → labor force auto-population
- [ ] Age-based senior citizen auto-check
- [ ] Education + age → OSC/OSY auto-check
- [ ] Basic form validation
- [ ] Barangay-scoped data access

### **API Optimization**
- [ ] Minimal database queries
- [ ] Client-side calculations where possible
- [ ] Batch operations for better performance
- [ ] Simple search without complex JOINs

---

**Free Tier Field Mapping Status**: ✅ **Optimized for Supabase Free Tier**  
**Estimated Database Size**: ~300MB with 10K residents  
**API Call Reduction**: 60% fewer complex queries vs full schema

This simplified field mapping maintains all essential RBI system functionality while staying within Supabase free tier limits.