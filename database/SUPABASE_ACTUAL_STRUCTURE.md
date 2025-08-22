# Actual Supabase Database Structure Documentation

## Overview
This document captures the ACTUAL structure of the Supabase database as discovered through analysis.
The schema.sql file has many discrepancies with what's actually deployed in Supabase.

## Residents Table (Actual Structure)
The residents table in Supabase has exactly **38 fields** (not including system fields).

### Fields That EXIST in Supabase:
```sql
- id UUID PRIMARY KEY
- first_name VARCHAR(100) NOT NULL
- middle_name VARCHAR(100)
- last_name VARCHAR(100) NOT NULL
- extension_name VARCHAR(20)
- birthdate DATE NOT NULL
- birth_place_code VARCHAR(10)
- sex sex_enum NOT NULL
- civil_status civil_status_enum
- civil_status_others_specify TEXT
- education_attainment education_level_enum
- is_graduate BOOLEAN DEFAULT false
- employment_status employment_status_enum
- occupation_code VARCHAR(10)  -- Note: NOT psoc_code
- email VARCHAR(255)
- mobile_number VARCHAR(20)
- telephone_number VARCHAR(20)
- household_code VARCHAR(50) REFERENCES households(code)
- blood_type blood_type_enum
- height DECIMAL(5,2)
- weight DECIMAL(5,2)
- complexion VARCHAR(50)
- citizenship citizenship_enum DEFAULT 'filipino'
- is_voter BOOLEAN
- is_resident_voter BOOLEAN
- last_voted_date DATE
- ethnicity ethnicity_enum
- religion religion_enum
- religion_others_specify TEXT
- mother_maiden_first VARCHAR(100)
- mother_maiden_middle VARCHAR(100)
- mother_maiden_last VARCHAR(100)
- philsys_card_number VARCHAR(20)
- is_active BOOLEAN DEFAULT true
- created_by UUID
- updated_by UUID
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()
```

### Fields that DO NOT EXIST in Supabase residents table:
```sql
- barangay_code (accessed through household relationship)
- city_municipality_code (accessed through household relationship)
- province_code (accessed through household relationship)
- region_code (accessed through household relationship)
- birth_place_level
- birth_place_name
- psoc_code (it's occupation_code instead)
- psoc_level
- occupation_title
- employment_code
- employment_name
- philsys_card_number_hash
- philsys_last4
- street_id
- subdivision_id
```

## Households Table (Actual Structure)
The households table includes all geographic hierarchy fields:

### Fields That EXIST:
```sql
- code VARCHAR(50) PRIMARY KEY
- name VARCHAR(200)
- address TEXT
- house_number VARCHAR(50) NOT NULL
- street_id UUID REFERENCES geo_streets(id)
- subdivision_id UUID REFERENCES geo_subdivisions(id)
- barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code)
- city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code)
- province_code VARCHAR(10) REFERENCES psgc_provinces(code)
- region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code)
- zip_code VARCHAR(10)  -- This field EXISTS (was missing in old schema)
- no_of_families INTEGER DEFAULT 1
- no_of_household_members INTEGER DEFAULT 0
- no_of_migrants INTEGER DEFAULT 0
- household_type household_type_enum
- tenure_status tenure_status_enum
- tenure_others_specify TEXT
- household_unit household_unit_enum
- monthly_income DECIMAL(12,2)
- income_class income_class_enum
- household_head_id UUID
- household_head_position VARCHAR(50)
- is_active BOOLEAN DEFAULT true
- created_by UUID
- updated_by UUID
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()
```

## Auth User Profiles Table (Actual Structure)
The auth_user_profiles table has additional fields for email verification and onboarding:

### Fields That EXIST:
```sql
- id UUID PRIMARY KEY REFERENCES auth.users(id)
- first_name VARCHAR(100) NOT NULL
- middle_name VARCHAR(100)
- last_name VARCHAR(100) NOT NULL
- email VARCHAR(255) NOT NULL
- phone VARCHAR(20)
- role_id UUID NOT NULL REFERENCES auth_roles(id)
- barangay_code VARCHAR(10) REFERENCES psgc_barangays(code)
- city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code)
- province_code VARCHAR(10) REFERENCES psgc_provinces(code)
- region_code VARCHAR(10) REFERENCES psgc_regions(code)
- is_active BOOLEAN DEFAULT true
- last_login TIMESTAMPTZ
- email_verified BOOLEAN DEFAULT false  -- Added field
- email_verified_at TIMESTAMPTZ  -- Added field
- onboarding_completed BOOLEAN DEFAULT false  -- Added field
- onboarding_completed_at TIMESTAMPTZ  -- Added field
- welcome_email_sent BOOLEAN DEFAULT false  -- Added field
- welcome_email_sent_at TIMESTAMPTZ  -- Added field
- created_by UUID
- updated_by UUID
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()
```

## Household Members Table
Uses VARCHAR instead of enum for family_position:

```sql
- family_position VARCHAR(50)  -- NOT family_position_enum
```

## Resident Sectoral Info Table
Exists in Supabase but has **0 records** despite having 53 residents.
The auto-population triggers are not working.

## Key Architectural Points

### Geographic Hierarchy Access Pattern
- Residents DO NOT have direct geographic fields (barangay_code, city_municipality_code, etc.)
- Geographic location is accessed through: `resident -> household -> geographic codes`
- This means all queries needing resident location must JOIN with households table

### Occupation Code Pattern
- The field is named `occupation_code` NOT `psoc_code`
- There are no psoc_level, occupation_title, employment_code, or employment_name fields
- Occupation details must be looked up from PSOC reference tables

### PhilSys Pattern
- Only `philsys_card_number` exists
- No hash field, no last4 field for privacy/search optimization

### Birth Place Pattern
- Only `birth_place_code` exists
- No birth_place_level or birth_place_name fields
- Birth place details must be computed from PSGC reference tables

## Non-existent Enums That Were Referenced
- birth_place_level_enum (doesn't exist)
- family_position_enum (household_members uses VARCHAR(50) instead)

## Functions/Triggers That Reference Non-existent Fields
These functions exist in schema.sql but would fail in production:
- auto_populate_birth_place_name() - references birth_place_name field
- auto_populate_employment_name() - references employment_code and employment_name fields
- Related triggers that call these functions

## Indexes That Reference Non-existent Fields
These indexes are defined but would fail to create:
- idx_residents_birth_place_level
- idx_residents_birth_place_code_level
- idx_residents_barangay
- idx_residents_barangay_employment
- idx_residents_barangay_civil_status
- idx_residents_barangay_education
- idx_residents_philsys_last4
- idx_residents_psoc_code
- idx_residents_psoc_level

## Critical Misalignments Summary

1. **Geographic Fields**: Residents don't have direct geographic fields; they're accessed through households
2. **Occupation Fields**: It's `occupation_code`, not `psoc_code`, and no related fields exist
3. **Birth Place Fields**: Only the code exists, no level or name fields
4. **PhilSys Fields**: Only the main card number exists, no optimization fields
5. **Enum Types**: Some enums defined in schema don't exist, some fields use VARCHAR instead
6. **Functions/Triggers**: Many reference non-existent columns and would fail
7. **Indexes**: Many reference non-existent columns and would fail to create

## Implications for Application Code

1. **All resident location queries must JOIN with households**
2. **Cannot filter residents directly by barangay/city/province/region**
3. **Occupation details require separate lookup from PSOC tables**
4. **Birth place details require separate lookup from PSGC tables**
5. **No optimized PhilSys search capability (no last4 index)**
6. **Sectoral info auto-population is broken (0 records)**

## Recommended Actions

1. **Update schema.sql to match reality** - Remove all non-existent fields and references
2. **Fix API code** - Ensure it doesn't try to insert/query non-existent fields
3. **Update views and functions** - Ensure they JOIN properly for geographic access
4. **Fix sectoral info triggers** - Currently not populating any data
5. **Document the architectural decision** - Why geographic fields are on households not residents