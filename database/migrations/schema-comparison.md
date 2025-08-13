# Schema Comparison: Current vs Enhanced

## 📊 Overview of Changes

### Tables Being Preserved (No Changes)
- ✅ All PSGC tables (regions, provinces, cities, barangays) - **41,995 barangays kept**
- ✅ All PSOC occupation tables - **All occupation data kept**
- ✅ `roles` table - **Kept as-is**

### New Tables Being Added
1. `barangay_accounts` - Link users to multiple barangays
2. `household_members` - Track household composition
3. `subdivisions` - Villages/subdivisions registry
4. `street_names` - Street name registry
5. `sectoral_information` - Senior citizens, PWD, etc.
6. `migrant_information` - Transient/migrant residents
7. `audit_logs` - Change tracking
8. `barangay_dashboard_summaries` - Performance caching
9. `schema_version` - Migration tracking

### Tables Being Enhanced (Recreated)

---

## 1️⃣ USER_PROFILES Table

| **Current Schema** | **Enhanced Schema** |
|-------------------|-------------------|
| `id UUID` (PK) | `id UUID` (PK) |
| `email TEXT` | `email TEXT` |
| `full_name TEXT` | `full_name TEXT` |
| `role_id UUID` | `role_id UUID` |
| `barangay_code TEXT` | `barangay_code TEXT` |
| | **➕ `is_active BOOLEAN`** |
| | **➕ `phone_number TEXT`** |
| | **➕ `position TEXT`** |
| | **➕ `department TEXT`** |
| | **➕ `avatar_url TEXT`** |
| | **➕ `metadata JSONB`** |
| `created_at TIMESTAMPTZ` | `created_at TIMESTAMPTZ` |
| `updated_at TIMESTAMPTZ` | `updated_at TIMESTAMPTZ` |
| | **➕ `created_by UUID`** |
| | **➕ `updated_by UUID`** |

**New Features:** Contact info, organizational structure, profile pictures, audit trail

---

## 2️⃣ HOUSEHOLDS Table

| **Current Schema** | **Enhanced Schema** |
|-------------------|-------------------|
| `id UUID` (PK) | `id UUID` (PK) |
| `household_number TEXT` | `household_number TEXT` |
| `barangay_code TEXT` | `barangay_code TEXT` |
| `purok TEXT` | `purok TEXT` |
| `street_name TEXT` | **➕ `subdivision_id UUID`** (FK) |
| | **➕ `street_id UUID`** (FK) |
| `house_number TEXT` | `house_number TEXT` |
| | **➕ `building_name TEXT`** |
| | **➕ `unit_number TEXT`** |
| | **➕ `floor_number TEXT`** |
| | **➕ `block_number TEXT`** |
| | **➕ `lot_number TEXT`** |
| `latitude DECIMAL` | `latitude DECIMAL` |
| `longitude DECIMAL` | `longitude DECIMAL` |
| | **➕ `ownership_status ENUM`** |
| | **➕ `structure_type ENUM`** |
| | **➕ `year_constructed INTEGER`** |
| | **➕ `number_of_rooms INTEGER`** |
| | **➕ `has_electricity BOOLEAN`** |
| | **➕ `has_water_supply BOOLEAN`** |
| | **➕ `has_toilet BOOLEAN`** |
| | **➕ `monthly_income_bracket TEXT`** |
| | **➕ `receives_4ps BOOLEAN`** |
| | **➕ `metadata JSONB`** |
| | **➕ `notes TEXT`** |
| `created_at TIMESTAMPTZ` | `created_at TIMESTAMPTZ` |
| `updated_at TIMESTAMPTZ` | `updated_at TIMESTAMPTZ` |
| | **➕ `created_by UUID`** |
| | **➕ `updated_by UUID`** |

**New Features:** 
- Housing conditions (electricity, water, toilet)
- Economic indicators (income bracket, 4Ps beneficiary)
- Detailed location (subdivision, building details)
- Property information (ownership, structure type)

---

## 3️⃣ RESIDENTS Table

| **Current Schema** | **Enhanced Schema** |
|-------------------|-------------------|
| `id UUID` (PK) | `id UUID` (PK) |
| `household_id UUID` | `household_id UUID` |
| `barangay_code TEXT` | `barangay_code TEXT` |
| **Basic Info** | **Personal Information** |
| `first_name TEXT` | `first_name TEXT` |
| `middle_name TEXT` | `middle_name TEXT` |
| `last_name TEXT` | `last_name TEXT` |
| `suffix TEXT` | `suffix TEXT` |
| | **➕ `nickname TEXT`** |
| **Demographics** | **Demographics** |
| `sex TEXT` | `sex sex_enum` (typed) |
| `birth_date DATE` | `birth_date DATE` |
| `birth_place TEXT` | `birth_place TEXT` |
| `civil_status TEXT` | `civil_status civil_status_enum` (typed) |
| | **➕ `citizenship citizenship_enum`** |
| **Contact** | **Contact** |
| `mobile_number TEXT` | `mobile_number TEXT` |
| | **➕ `email TEXT`** |
| | **Education (NEW SECTION)** |
| | **➕ `education_level education_level_enum`** |
| | **➕ `education_status education_status_enum`** |
| | **➕ `school_name TEXT`** |
| | **Employment (NEW SECTION)** |
| | **➕ `employment_status employment_status_enum`** |
| `occupation TEXT` | `occupation TEXT` |
| | **➕ `occupation_code TEXT`** (PSOC link) |
| | **➕ `employer_name TEXT`** |
| | **➕ `employer_address TEXT`** |
| | **➕ `monthly_income DECIMAL`** |
| | **Health (NEW SECTION)** |
| | **➕ `blood_type blood_type_enum`** |
| | **➕ `has_disability BOOLEAN`** |
| | **➕ `disability_type disability_enum[]`** |
| | **➕ `is_pregnant BOOLEAN`** |
| | **Identity & Registration** |
| | **➕ `religion religion_enum`** |
| `is_registered_voter BOOLEAN` | `is_registered_voter BOOLEAN` |
| | **➕ `voter_id_number TEXT`** |
| | **➕ `precinct_number TEXT`** |
| | **Government IDs (NEW SECTION)** |
| | **➕ `national_id_number TEXT`** |
| | **➕ `philhealth_number TEXT`** |
| | **➕ `sss_number TEXT`** |
| | **➕ `gsis_number TEXT`** |
| | **➕ `tin_number TEXT`** |
| | **Additional Info** |
| | **➕ `is_ofw BOOLEAN`** |
| | **➕ `country_of_work TEXT`** |
| | **➕ `metadata JSONB`** |
| | **➕ `photo_url TEXT`** |
| `created_at TIMESTAMPTZ` | `created_at TIMESTAMPTZ` |
| `updated_at TIMESTAMPTZ` | `updated_at TIMESTAMPTZ` |
| | **➕ `created_by UUID`** |
| | **➕ `updated_by UUID`** |

**New Features:**
- Complete education tracking
- Detailed employment information with PSOC occupation codes
- Health information (blood type, disability, pregnancy)
- All government IDs (National ID, PhilHealth, SSS, GSIS, TIN)
- OFW tracking
- Photo storage
- Voter registration details

---

## 4️⃣ RESIDENT_RELATIONSHIPS Table

| **Current Schema** | **Enhanced Schema** |
|-------------------|-------------------|
| `id UUID` (PK) | `id UUID` (PK) |
| `resident_id UUID` | `resident_id UUID` |
| `related_resident_id UUID` | `related_resident_id UUID` |
| `relationship_type TEXT` | `relationship_type TEXT` |
| `created_at TIMESTAMPTZ` | `created_at TIMESTAMPTZ` |
| | No changes, just recreated |

---

## 📈 Benefits of Enhancement

### For Barangay Officials
1. **Better resident profiling** - Complete government IDs, health info
2. **Economic planning** - Income brackets, employment data, 4Ps tracking
3. **Health services** - Blood types, disabilities, pregnancy tracking
4. **Housing census** - Detailed housing conditions and utilities
5. **Voter management** - Precinct numbers, voter IDs

### For System Management
1. **Audit trail** - Track who created/updated records
2. **Performance** - Dashboard summaries table for faster reports
3. **Data quality** - Typed enums prevent invalid data
4. **Flexibility** - JSONB metadata fields for custom data

### For Compliance
1. **National ID integration** - Ready for Philippine National ID System
2. **PSOC compliance** - Links to official occupation codes
3. **4Ps monitoring** - Track Pantawid Pamilyang Pilipino Program
4. **Sectoral tracking** - Senior citizens, PWDs, solo parents

---

## 💾 Storage Impact

**Current Tables Size (estimated):**
- PSGC/PSOC data: ~10-15 MB
- Sample residents/households: < 1 MB
- **Total: ~15 MB**

**Enhanced Tables Size (estimated with same data):**
- Same PSGC/PSOC: ~10-15 MB
- Enhanced residents/households: ~2-3 MB (more fields)
- New empty tables: < 1 MB
- **Total: ~20 MB**

**Supabase Free Tier Limit: 500 MB** ✅ Plenty of room!

---

## 🔄 Migration Safety

1. **PSGC/PSOC preserved** - No data loss
2. **Backup created** - Can restore if needed
3. **Incremental approach** - Adding features, not replacing
4. **RLS maintained** - Security stays intact