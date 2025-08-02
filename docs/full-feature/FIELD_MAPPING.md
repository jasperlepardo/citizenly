# RBI System - Complete Field Mapping

## 🗂️ Database Schema to UI Form Mapping

### **👤 RESIDENTS MODULE**

#### **Personal Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **PhilSys Card Number (PCN)** | `philsys_card_number_hash` | BYTEA | Hashed, secure | Masked Input |
| **Last 4 Digits** | `philsys_last4` | VARCHAR(4) | Auto-extracted | Display Only |
| **First Name** | `first_name` | VARCHAR(100) | Required, 2-100 chars | Text Input |
| **Middle Name** | `middle_name` | VARCHAR(100) | Optional | Text Input |
| **Last Name** | `last_name` | VARCHAR(100) | Required, 2-100 chars | Text Input |
| **Extension Name** | `extension_name` | VARCHAR(20) | Optional (Jr., Sr., III) | Dropdown |
| **Date of Birth** | `birthdate` | DATE | Required, valid date | Date Picker |
| **Age** | *computed* | *calculated* | Auto-calculated | Display Only |
| **Place of Birth** | `birthplace` | TEXT | Optional | Text Input |
| **Sex** | `sex` | sex_enum | Required | Radio Buttons |
| **Civil Status** | `civil_status` | civil_status_enum | Required | Dropdown |
| **Highest Educational Attainment** | `education_level` | education_level_enum | Required | Dropdown |
| **Profession/Occupation** | `psoc_code` | VARCHAR(10) | Optional | PSOC Search |
| **Salary** | `salary` | DECIMAL(12,2) | Optional, positive number | Currency Input |
| **Citizenship** | `citizenship` | citizenship_enum | Default: 'filipino' | Dropdown |

#### **Contact Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Email Address** | `email` | VARCHAR(255) | Optional, valid email | Email Input |
| **Mobile Number** | `mobile_number` | VARCHAR(20) | Required, PH format | Phone Input |
| **Telephone Number** | `telephone_number` | TEXT | Optional | Phone Input |

#### **Address Section** 
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Household** | `household_id` | VARCHAR(22) | Required | Household Search |
| **Region** | `region_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Province** | `province_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **City/Municipality** | `city_municipality_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Barangay** | `barangay_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Subdivision** | *from household.subdivision* | TEXT | Auto-populated from household | Display Only |
| **Street Name** | *from household.street* | TEXT | Auto-populated from household | Display Only |
| **House Number** | *from household.house_number* | TEXT | Auto-populated from household | Display Only |
| **ZIP Code** | `zip_code` | TEXT | Optional override | Text Input |

#### **Identity Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Blood Type** | `blood_type` | blood_type_enum | Default: 'unknown' | Dropdown |
| **Height (meters)** | `height_m` | DECIMAL(4,2) | Optional, positive | Number Input |
| **Weight (kg)** | `weight_kg` | DECIMAL(5,2) | Optional, positive | Number Input |
| **Complexion** | `complexion` | TEXT | Optional | Text Input |
| **Registered Voter** | `is_voter` | BOOLEAN | Default: false | Checkbox |
| **Resident Voter** | `is_resident_voter` | BOOLEAN | Default: false | Checkbox |
| **Last Voted Year** | `last_voted_year` | INTEGER | Optional | Number Input |
| **Ethnicity** | `ethnicity` | ethnicity_enum | Default: 'not_reported' | Dropdown |
| **Religion** | `religion` | religion_enum | Default: 'prefer_not_to_say' | Enum Dropdown |
| **Religion (Others)** | `religion_others_specify` | TEXT | Required if religion = 'others' | Conditional Text Input |

#### **Mother's Maiden Name Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Mother's First Name** | `mother_maiden_first` | TEXT | Optional | Text Input |
| **Mother's Middle Name** | `mother_maiden_middle` | TEXT | Optional | Text Input |
| **Mother's Last Name** | `mother_maiden_last` | TEXT | Optional | Text Input |

#### **Migrant Information Section** *(Conditional - only if flagged as migrant)*
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Flag if Migrant** | `is_migrant` | BOOLEAN | Default: false | Checkbox |
| **Previous Region** | `previous_region_code` | VARCHAR(10) | Required if migrant | PSGC Dropdown |
| **Previous Province** | `previous_province_code` | VARCHAR(10) | Required if migrant | PSGC Dropdown |
| **Previous City/Municipality** | `previous_city_municipality_code` | VARCHAR(10) | Required if migrant | PSGC Dropdown |
| **Previous Barangay** | `previous_barangay_code` | VARCHAR(10) | Required if migrant | PSGC Dropdown |
| **Previous Street Name** | `previous_street_name` | VARCHAR(200) | Optional | Text Input |
| **Previous House Number** | `previous_house_number` | VARCHAR(50) | Optional | Text Input |
| **Previous Subdivision** | `previous_subdivision` | VARCHAR(100) | Optional | Text Input |
| **Previous ZIP Code** | `previous_zip_code` | VARCHAR(10) | Optional | Text Input |
| **Previous Complete Address** | `previous_complete_address` | TEXT | Optional (for non-PSGC addresses) | Text Area |
| **Length of Stay in Previous Residence (months)** | `length_of_stay_previous_months` | INTEGER | Optional, positive | Number Input |
| **Reason for Leaving** | `reason_for_leaving` | TEXT | Optional | Text Area |
| **Date of Transfer** | `date_of_transfer` | DATE | Optional, not future | Date Picker |
| **Reason for Transferring to this Barangay** | `reason_for_transferring` | TEXT | Optional | Text Area |
| **Duration of Stay in Current Barangay (months)** | `duration_of_stay_current_months` | INTEGER | Auto-calculated from date_of_transfer | Display Only |
| **Intention to Return to Previous Residence** | `intention_to_return` | BOOLEAN | Optional | Radio Buttons |
| - Yes | `true` | boolean | Plans to return | Radio Option |
| - No | `false` | boolean | No plans to return | Radio Option |
| - Undecided | `null` | boolean | Not yet decided | Radio Option |
| **Intention Notes** | `intention_notes` | TEXT | Optional | Text Area |

#### **Sectoral Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Labor Force/Employed** | `is_labor_force` | BOOLEAN | Auto-determined from occupation | Checkbox (Read-only) |
| **Unemployed** | `is_unemployed` | BOOLEAN | Auto-determined from employment status | Checkbox (Read-only) |
| **Overseas Filipino Worker (OFW)** | `is_ofw` | BOOLEAN | Default: false | Checkbox |
| **Person with Disabilities (PWD)** | `is_person_with_disability` | BOOLEAN | Default: false | Checkbox |
| **Out of School Children (OSC)** | `is_out_of_school_children` | BOOLEAN | Auto-determined: Age 6-14 + not in formal education | Checkbox (Read-only) |
| **Out of School Youth (OSY)** | `is_out_of_school_youth` | BOOLEAN | Auto-determined: Age 15-24 + not in school + no college/post-secondary + not working | Checkbox (Read-only) |
| **Solo Parent** | `is_solo_parent` | BOOLEAN | Default: false | Checkbox |
| **Indigenous People (IP)** | `is_indigenous_people` | BOOLEAN | Default: false | Checkbox |
| **Migrant** | `is_migrant` | BOOLEAN | Default: false | Checkbox |
| **Senior Citizen (SC)** | `is_senior_citizen` | BOOLEAN | Auto-determined from age (60+) | Checkbox (Read-only) |
| **Registered Senior Citizen** | `is_registered_senior_citizen` | BOOLEAN | Default: false, enabled if senior citizen | Radio Buttons (Yes/No) |
| **Sectoral Notes** | `notes` | TEXT | Optional | Text Area |

---

### **🏠 HOUSEHOLDS MODULE**

#### **Basic Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Household Number** | `household_number` | VARCHAR(50) | Required, unique per barangay | Text Input |
| **Household Head** | `household_head_id` | UUID | Required | Resident Search |
| **Household Name** | `household_name` | VARCHAR(100) | Auto-derived from head's last name | Display Only |

#### **Household Profile Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Region** | `region_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Province** | `province_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **City/Municipality** | `city_municipality_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Barangay** | `barangay_code` | VARCHAR(10) | Auto-populated from user's barangay | Display Only |
| **Subdivision** | `subdivision_id` | UUID | Optional | Subdivision Dropdown |
| **Street Name** | `street_id` | UUID | Required | Street Dropdown |
| **Household Number** | `household_number` | VARCHAR(20) | Required, unique | Text Input |
| **No. of Families** | `no_of_families` | INTEGER | Default: 1 | Number Input |
| **No. of Household Members** | `no_of_members` | INTEGER | Auto-calculated | Display Only |
| **No. of Migrants** | `no_of_migrants` | INTEGER | Auto-calculated | Display Only |

#### **Household Type Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Household Type** | `household_type` | household_type_enum | Required | Radio Buttons |
| - Nuclear | `nuclear` | enum value | Parents with children | Radio Option |
| - Single Parent | `single_parent` | enum value | Single parent with children | Radio Option |
| - Extended | `extended` | enum value | Multiple generations/relatives | Radio Option |
| - Childless | `childless` | enum value | Couple without children | Radio Option |
| - Grandparents | `grandparents` | enum value | Grandparents with grandchildren | Radio Option |
| - Stepfamily | `stepfamily` | enum value | Blended family | Radio Option |

#### **Tenure Status Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Tenure Status** | `tenure_status` | tenure_status_enum | Required | Radio Buttons |
| - Owner | `owner` | enum value | Owns the property | Radio Option |
| - Renter | `renter` | enum value | Rents the property | Radio Option |
| - Others | `others` | enum value | Other arrangements | Radio Option |
| **Others Specify** | `tenure_others_specify` | TEXT | Required if "Others" selected | Text Input |

#### **Household Unit Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Household Unit Type** | `household_unit` | household_unit_enum | Required | Dropdown |
| - Single-family house | `single_family_house` | enum value | Standalone house | Dropdown Option |
| - Townhouse | `townhouse` | enum value | Row house/townhouse | Dropdown Option |
| - Condominium | `condominium` | enum value | Condo unit | Dropdown Option |
| - Duplex | `duplex` | enum value | Two-unit building | Dropdown Option |
| - Mobile home | `mobile_home` | enum value | Mobile/manufactured home | Dropdown Option |

#### **Financial Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Monthly Income** | `monthly_income` | DECIMAL(12,2) | Auto-calculated from members | Display Only |
| **Income Classification** | `income_class` | income_class_enum | Auto-determined from monthly income | Badge/Tag Display |

#### **Family Head Information Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Head of Family** | `household_head_id` | UUID | Required, select from residents | Resident Search |
| **Family Position** | `family_position` | family_position_enum | Required | Enum Dropdown |

### **🔗 FAMILY RELATIONSHIPS MODULE**

#### **Relationship Management**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Primary Resident** | `resident_id` | UUID | Required | Resident Search |
| **Related Resident** | `related_resident_id` | UUID | Required | Resident Search |
| **Relationship Type** | `relationship_type` | VARCHAR(50) | Required | Dropdown |


---

### **⚙️ SETTINGS MODULE**

#### **User Management Section**
| UI Field Label | Database Column | Data Type | Validation | UI Component |
|----------------|-----------------|-----------|------------|--------------|
| **Email** | `email` | VARCHAR(255) | Required, unique | Email Input |
| **First Name** | `first_name` | VARCHAR(100) | Required | Text Input |
| **Last Name** | `last_name` | VARCHAR(100) | Required | Text Input |
| **Role** | `role_id` | UUID | Required | Role Dropdown |
| **Assigned Barangay** | `barangay_code` | VARCHAR(10) | Required | PSGC Dropdown |
| **Active Status** | `is_active` | BOOLEAN | Default: true | Toggle Switch |

---

## 🎨 **UI Component Specifications**

### **📐 Figma Design References**

#### **App Layout Implementation**
**Citizenly App Design**: [Citizenly Layout](https://www.figma.com/design/srcDxfJEqx3qfPiQRrSR52/Citizenly?node-id=1-829&t=OndQULNKpeMqYE59-4)
- **Use for**: Page layouts, navigation structure, form designs
- **Contains**: Actual RBI system screens, workflows, responsive layouts

#### **Component Implementation**
**JSPR Design System**: [Component Library](https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/JSPR-%7C-Design-System?t=5AC2fFPemOImA5UD-0)
- **Use for**: Base components, design tokens, interaction states

#### **Icon Implementation**
**JSPR Iconography**: [Icon Library](https://www.figma.com/design/CYygNIegdzFYCkeIh8tema/JSPR-%7C-Iconography---Tailwind?node-id=2098-10628&t=CS8rjlKi6yUeTQ8M-0)
- **Use for**: Navigation icons, action buttons, status indicators, form icons

**Implementation Priority:**
1. **Follow Citizenly layout first** - Use actual app design for page structure
2. **Use JSPR components** - Apply design system components within layouts
3. **Integrate JSPR icons** - Use consistent iconography throughout
4. **Maintain consistency** - Ensure all three sources work together harmoniously

### **PSOC Occupation Search Component**
```typescript
interface PSOCSearchProps {
  value: string;
  onChange: (code: string, title: string, level: string) => void;
  placeholder: "Search occupation...";
}

// Database Query:
SELECT * FROM psoc_occupation_search 
WHERE searchable_text ILIKE '%${query}%'
ORDER BY hierarchy_level, occupation_title
LIMIT 20;

// UI Display:
"1111 - Legislators" (unit_group)
"111102 - Legislators - Congressman" (unit_sub_group)  
"Related: Financial controller, Management accountant" (cross_reference)
```

### **PSGC Address Cascade Component**
```typescript
interface AddressCascadeProps {
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  onChange: (codes: AddressCodes) => void;
}

// Cascade Logic:
Region Selection → Load Provinces
Province Selection → Load Cities/Municipalities  
City/Municipality Selection → Load Barangays
Barangay Selection → Set barangay_code
```

### **Household Search Component**
```typescript
interface HouseholdSearchProps {
  value: string;
  barangayCode: string;
  onChange: (householdId: string) => void;
}

// Search Query:
SELECT h.*, head.first_name || ' ' || head.last_name as head_name
FROM households h
LEFT JOIN residents head ON h.household_head_id = head.id
WHERE h.barangay_code = ? 
AND (h.household_number ILIKE ? OR head_name ILIKE ?)
```

---

## 📊 **Form Validation Rules**

### **Field-Level Validations**
| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| `first_name` | Required, 2-100 chars, letters only | "First name is required (2-100 characters, letters only)" |
| `last_name` | Required, 2-100 chars, letters only | "Last name is required (2-100 characters, letters only)" |
| `birthdate` | Required, valid date, not future | "Please enter a valid birth date" |
| `mobile_number` | Required, PH format (+63XXXXXXXXXX) | "Please enter a valid Philippine mobile number" |
| `email` | Optional, valid email format | "Please enter a valid email address" |
| `household_number` | Required, unique per barangay | "Household number already exists in this barangay" |
| `monthly_income` | Optional, positive decimal | "Monthly income must be a positive number" |
| `household_type` | Required, valid enum | "Please select a valid household type" |
| `tenure_status` | Required, valid enum | "Please select tenure status" |
| `tenure_others_specify` | Required if tenure_status = 'others' | "Please specify the tenure arrangement" |
| `household_unit` | Required, valid enum | "Please select household unit type" |
| `family_position` | Required, valid enum | "Please select family position" |
| `birthplace` | Optional, 2-200 chars | "Place of birth must be between 2-200 characters" |
| `salary` | Optional, positive decimal | "Salary must be a positive number" |
| `religion_others_specify` | Required if religion = 'others' | "Please specify the religion" |
| `height_m` | Optional, positive decimal, max 3.00 | "Height must be between 0.5 and 3.0 meters" |
| `weight_kg` | Optional, positive decimal, max 500 | "Weight must be between 10 and 500 kg" |
| `last_voted_year` | Optional, valid year, not future | "Please enter a valid year" |
| `length_of_stay_previous_months` | Optional, positive integer | "Length of stay must be positive" |
| `date_of_transfer` | Optional, not future | "Date of transfer cannot be in the future" |
| `duration_of_stay_current_months` | Auto-calculated | "Calculated from date of transfer" |

### **Business Logic Validations**
| Validation | Rule | Implementation |
|------------|------|----------------|
| **Age Consistency** | Birthdate must result in logical age | Client-side calculation + server validation |
| **Relationship Logic** | Parent must be older than child | Age difference validation (min 15 years) |
| **Household Head** | Only one head per household | Database constraint + UI validation |
| **Barangay Scope** | User can only create records in assigned barangay | RLS policy + UI filtering |
| **Address Auto-Population** | Region/Province/City/Barangay auto-filled from user's assigned barangay | Auto-populate from barangay_accounts table |
| **Duplicate Prevention** | Same name + birthdate in household | Fuzzy matching algorithm |
| **Senior Citizen Auto-Check** | Senior citizen status based on age (60+) | Auto-populate from birthdate |
| **Labor Force Auto-Check** | Employment status determines labor force | Auto-populate from employment_status |
| **Out of School Children Auto-Check** | OSC: Age 6-14 + not attending formal education | Auto-populate from age + education_status |
| **Out of School Youth Auto-Check** | OSY: Age 15-24 + not in school + no college/post-secondary + not working | Auto-populate from age + education_status + employment_status |
| **Registered Senior Citizen** | Only enabled if is_senior_citizen = true | Conditional field availability |
| **Monthly Income Calculation** | Sum of all household members' income | Auto-calculated trigger |
| **Household Member Count** | Count of active household members | Auto-calculated trigger |
| **Migrant Count** | Count of members with is_migrant = true | Auto-calculated trigger |
| **Household Name Derivation** | Last name of household head | Auto-populated from head's last_name |
| **Family Position Logic** | Position must match age and gender appropriately | Business rule validation |
| **Religion Others Validation** | religion_others_specify required if religion = 'others' | Conditional field validation |
| **Migrant Information Dependency** | Migrant details required if is_migrant = true | Conditional section activation |
| **Physical Characteristics Range** | Height/weight within reasonable human ranges | Range validation |
| **Date of Transfer Logic** | Cannot be future date, auto-calculates current stay duration | Date validation + auto-calculation |
| **Previous Address Completion** | At least region/province required if migrant | Address hierarchy validation |
| **Voter Year Validation** | Last voted year cannot be future or before birth year | Date range validation |
| **Salary Income Calculation** | Household monthly_income updates when member salary changes | Auto-calculation trigger |
| **Income Classification Auto-Update** | Income class automatically determined from monthly_income | Auto-classification based on ranges |

---

## 🔍 **Search & Filter Mappings**

### **Global Search Fields**
```sql
-- Full-text search using generated column
search_text GENERATED ALWAYS AS (
  LOWER(first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name || ' ' || 
        COALESCE(occupation_title, '') || ' ' || COALESCE(mobile_number, ''))
) STORED
```

### **Advanced Filter Fields**
| Filter Category | Database Fields | UI Component |
|----------------|-----------------|--------------|
| **Demographics** | `sex`, `civil_status`, `age_range` | Multi-select checkboxes |
| **Education** | `education_level`, `education_status` | Dropdown filters |
| **Employment** | `employment_status`, `psoc_code` | Multi-select + PSOC search |
| **Location** | `region_code`, `province_code`, `city_municipality_code`, `barangay_code` | PSGC cascade |
| **Voting** | `is_voter`, `is_resident_voter` | Boolean toggles |
| **Health** | `blood_type` | Multi-select dropdown |
| **Sectoral Information** | `is_labor_force`, `is_employed`, `is_ofw`, `is_person_with_disability`, `is_senior_citizen`, `is_solo_parent`, `is_indigenous_people`, `is_migrant` | Multi-select checkboxes |
| **Household Type** | `household_type`, `tenure_status`, `household_unit` | Multi-select dropdowns |
| **Financial** | `salary` (ranges), `monthly_income` (ranges), `income_class` | Range slider + Multi-select dropdown |
| **Family Position** | `family_position` | Multi-select dropdown |
| **Physical Characteristics** | `height_m` (ranges), `weight_kg` (ranges), `complexion` | Range sliders + text search |
| **Migration Status** | `is_migrant`, `previous_region_code`, `date_of_transfer` (date range) | Multi-select + date range |
| **Religion** | `religion`, `religion_others_specify` | Multi-select dropdown + text search |
| **Identity** | `birthplace`, `last_voted_year` | Text search + year range |

---

## 📱 **Mobile Form Adaptations**

### **Responsive Breakpoints**
- **Mobile**: 320px-768px (single column, stacked fields)
- **Tablet**: 768px-1024px (two columns, larger inputs)
- **Desktop**: 1024px+ (multi-column, full layout)

### **Mobile-Specific Components**
| Component | Mobile Adaptation |
|-----------|------------------|
| **Date Picker** | Native mobile date input |
| **Dropdown** | Native select with search |
| **PSOC Search** | Modal overlay with search |
| **Photo Upload** | Camera integration |
| **Address Input** | Step-by-step wizard |

---

## 🎯 **Form Submission Flow**

### **Create Resident Workflow (5 Steps - Aligned with UX_WORKFLOW.md)**
```
Step 1: Personal Information
├── Name (first, middle, last, extension)
├── Birthdate, sex, civil status
├── Contact details (mobile, email, telephone)
└── PhilSys card number (secure)

Step 2: Demographics & Identity  
├── Education level & status
├── Blood type, ethnicity, religion
├── Voting registration status
├── Physical characteristics (height, weight, complexion)
├── Place of birth
└── Mother's maiden name (optional)

Step 3: Employment & Occupation
├── PSOC Occupation Search
├── Employment status & workplace
└── Monthly salary

Step 4: Household Assignment
├── Option A: Assign to existing household
├── Option B: Create new household  
├── Define family relationship/position
├── Auto-populate address from household
└── Conditional: Migrant information (if flagged)

Step 5: Review & Save
├── Validate all information
├── Show auto-calculated sectoral information
├── Generate hierarchical resident ID
├── Submit with server validation
└── Success confirmation with next actions
```

### **Create Household Workflow (4 Steps - Aligned with UX_WORKFLOW.md)**
```
Step 1: Basic Information
├── Household number (unique per barangay)
└── Select household head (from existing residents)

Step 2: Address Setup
├── Auto-populated: Region, Province, City, Barangay (from user assignment)
├── Select: Subdivision (optional dropdown)
├── Select: Street name (dropdown)
├── Enter: House number
└── Result: Auto-generate hierarchical ID (RRPPMMBBB-SSSS-TTTT-HHHH)

Step 3: Household Profile
├── Household type (nuclear, extended, single-parent, childless, grandparents, stepfamily)
├── Tenure status (owner, renter, others)
├── Unit type (single-family house, townhouse, condominium, duplex, mobile home)
└── Number of families (default: 1)

Step 4: Add Members & Finalize
├── Link existing residents to household
├── Define family positions (father, mother, son, daughter, etc.)
├── Set relationships to head
├── Review auto-calculated statistics (income class, member counts)
├── Submit with validation
└── Success: Household created with all auto-calculations active
```

### **Error Handling States**
| Error Type | UI Treatment | User Action |
|------------|-------------|-------------|
| **Validation Error** | Red border, inline message | Fix field and retry |
| **Network Error** | Toast notification, retry button | Retry submission |
| **Server Error** | Modal with error details | Contact administrator |
| **Duplicate Warning** | Confirmation dialog | Confirm or modify data |

---

## 🆕 **New UI Components for Enhanced Features**

### **Sectoral Information Component**
```typescript
interface SectoralInfoProps {
  residentId: string;
  isReadOnly?: boolean;
  employmentStatus: employment_status_enum;
  birthdate: Date;
  onChange: (sectoralData: SectoralInformation) => void;
}

// Auto-calculations:
// - is_labor_force: Based on employment_status
// - is_employed/is_unemployed: Based on employment_status  
// - is_senior_citizen: Based on age >= 60
// - is_registered_senior_citizen: Conditional on is_senior_citizen
```

### **Household Type Selector Component**
```typescript
interface HouseholdTypeSelectorProps {
  value: household_type_enum;
  onChange: (type: household_type_enum) => void;
  disabled?: boolean;
}

// Options with descriptions:
// Nuclear: "Parents with children"
// Single Parent: "Single parent with children"  
// Extended: "Multiple generations or relatives"
// Childless: "Couple without children"
// Grandparents: "Grandparents with grandchildren"
// Stepfamily: "Blended family with step-relations"
```

### **Family Position Selector Component**
```typescript
interface FamilyPositionProps {
  value: family_position_enum;
  onChange: (position: family_position_enum) => void;
  residentGender?: sex_enum;
  residentAge?: number;
  validationEnabled?: boolean;
}

// Gender-based validation:
// - Father/Grandfather/Father-in-law: Male only
// - Mother/Grandmother/Mother-in-law: Female only
// - Son/Daughter: Age-appropriate validation
```

### **Household Summary Component**
```typescript
interface HouseholdSummaryProps {
  household: HouseholdComplete;
  showFinancials?: boolean;
  showMembers?: boolean;
}

// Auto-calculated displays:
// - No. of Members (from active household_members)
// - No. of Migrants (from sectoral_information)  
// - Monthly Income (sum of members' income)
// - Household Name (from head's last_name)
```

### **Sectoral Filter Component**
```typescript
interface SectoralFilterProps {
  selectedSectors: string[];
  onChange: (sectors: string[]) => void;
  showCounts?: boolean;
}

// Filter options:
// Labor Force, Employed, OFW, PWD, Senior Citizen,
// Solo Parent, Indigenous People, Migrant, etc.
```

### **Enhanced Search Component**
```typescript
interface EnhancedSearchProps {
  onResidentSelect: (resident: ResidentWithSectoral) => void;
  filters?: {
    sectoral?: string[];
    household_type?: household_type_enum[];
    family_position?: family_position_enum[];
    salary_range?: [number, number];
    is_migrant?: boolean;
    religion?: religion_enum[];
  };
}

// Includes sectoral information in search results
// Shows household type and family position
// Supports financial and migration filtering
```

### **Migrant Information Component**
```typescript
interface MigrantInfoProps {
  residentId: string;
  isMigrant: boolean;
  onMigrantStatusChange: (isMigrant: boolean) => void;
  onMigrantInfoChange: (migrantData: MigrantInformation) => void;
}

// Conditional rendering based on isMigrant flag
// Auto-calculates duration of stay from date_of_transfer
// PSGC cascade for previous address
// Validation for required fields when migrant
```

### **Religion Selector Component**
```typescript
interface ReligionSelectorProps {
  value: religion_enum;
  othersSpecify?: string;
  onChange: (religion: religion_enum, others?: string) => void;
}

// Complete religion options with descriptions
// Conditional "Others" text input
// Validation for others specification
```

### **Physical Characteristics Component**
```typescript
interface PhysicalCharacteristicsProps {
  height?: number;
  weight?: number;
  complexion?: string;
  bloodType: blood_type_enum;
  onChange: (data: PhysicalCharacteristics) => void;
}

// Height in meters with decimal precision
// Weight in kg with decimal precision
// Free text complexion input
// Blood type dropdown
```

### **Conditional Sectoral Component**
```typescript
interface ConditionalSectoralProps {
  age: number;
  employmentStatus: employment_status_enum;
  sectoralData: SectoralInformation;
  onChange: (data: SectoralInformation) => void;
}

// Auto-populate based on age and employment
// Read-only fields for calculated values
// Conditional registered senior citizen field
// Clear visual indication of auto-populated vs manual fields
```

### **Income Classification Component**
```typescript
interface IncomeClassificationProps {
  monthlyIncome: number;
  incomeClass: income_class_enum;
  showRange?: boolean;
  variant?: 'badge' | 'card' | 'inline';
}

// Color-coded income class display:
// Rich: Green (#10B981)
// High Income: Blue (#3B82F6)  
// Upper Middle: Teal (#06B6D4)
// Middle Class: Purple (#8B5CF6)
// Lower Middle: Orange (#F59E0B)
// Low Income: Yellow (#EAB308)
// Poor: Red (#EF4444)

// Shows income range tooltip on hover
// Responsive design for different contexts
```

### **Income Class Filter Component**
```typescript
interface IncomeClassFilterProps {
  selectedClasses: income_class_enum[];
  onChange: (classes: income_class_enum[]) => void;
  showCounts?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

// Multi-select checkboxes with color indicators
// Shows household count per income class
// Supports bulk select/deselect operations
```

---

## 📋 **Implementation Checklist**

### **Database Changes**
- [x] Create new enum types (household_type, tenure_status, household_unit, family_position)
- [x] Create sectoral_information table with all required boolean fields
- [x] Add new columns to households table (type, tenure, unit, counts, income)
- [x] Add salary to residents table (renamed from monthly_income)
- [x] Add family_position to household_members table
- [x] Create auto-calculation triggers and functions
- [x] Add appropriate indexes for performance
- [x] Set up RLS policies for sectoral_information table
- [x] Create enhanced views (residents_with_sectoral, households_complete)
- [x] Update religion enum with complete options including "others"
- [x] Add missing resident fields (birthplace, physical characteristics)
- [x] Create migrant_information table with detailed migration tracking
- [x] Add validation functions for migrant data consistency
- [x] Create comprehensive views for migrant information
- [x] Create income_class_enum with 7 socioeconomic classification levels
- [x] Add income_class column to households table with auto-calculation
- [x] Create function to determine income class from monthly_income
- [x] Add triggers to update income_class when monthly_income changes
- [x] Create enhanced views with income classification details
- [x] Add income distribution analytics and utility functions

### **Frontend Components**
- [ ] Sectoral Information multi-checkbox component with auto-population
- [ ] Household Type radio button group
- [ ] Tenure Status with conditional "Others" input
- [ ] Household Unit dropdown
- [ ] Family Position dropdown with validation
- [ ] Enhanced household summary display
- [ ] Auto-calculation display components
- [ ] Updated search and filter components
- [ ] Migrant Information conditional form with PSGC cascade
- [ ] Religion selector with "Others" specification
- [ ] Physical Characteristics input group (height, weight, complexion)
- [ ] Enhanced PhilSys Card Number input with masking
- [ ] Mother's Maiden Name input group
- [ ] Place of Birth autocomplete input
- [ ] Salary/income currency input with formatting
- [ ] Income Classification badge/tag component with color coding
- [ ] Income Class filter component with multi-select checkboxes

### **Validation & Business Logic**
- [x] Senior citizen auto-population from age
- [x] Labor force auto-population from employment
- [x] Monthly income calculation triggers
- [x] Member count auto-calculation
- [x] Migrant count auto-calculation  
- [x] Household name derivation
- [ ] Family position age/gender validation
- [ ] Conditional field enabling (registered senior citizen)
- [x] Income classification auto-determination from monthly income
- [x] Real-time income class updates when household income changes

### **API Updates**
- [ ] Update resident creation/update endpoints
- [ ] Update household creation/update endpoints  
- [ ] Add sectoral information CRUD endpoints
- [ ] Update search endpoints with sectoral filters
- [ ] Add household analytics endpoints
- [ ] Add income classification endpoints and filters
- [ ] Add income distribution analytics endpoints

---

This comprehensive field mapping now includes all requested household fields and sectoral information, providing complete guidance for implementing the enhanced RBI system with automatic calculations, intelligent defaults, and comprehensive data collection capabilities.