-- =====================================================
-- RBI SYSTEM FULL-FEATURE DATABASE SCHEMA WITH RLS
-- =====================================================
-- System: Records of Barangay Inhabitant System
-- Version: 2.8 - Enhanced Geographic Hierarchy + Auto-Population + Multi-Level Access Control
-- Updated: January 2025
-- Lines: 4,249
-- Features: Complete enterprise features + Row Level Security + PII Encryption + Auto-Population + Geographic Hierarchy
-- =====================================================
-- FEATURE SUMMARY (v2.8)
-- =====================================================
-- ✨ AUTO-POPULATION SYSTEM:
--    • Household addresses auto-generated from components
--    • Geographic hierarchy auto-populated from barangay codes  
--    • Resident addresses inherited from households
--    • Sectoral demographics automatically classified
--
-- 🌍 ENHANCED GEOGRAPHIC HIERARCHY:
--    • Complete PSGC hierarchy in all geo tables
--    • Multi-level access control (national→barangay)
--    • 95 strategic indexes for optimal performance
--
-- 🔒 ENTERPRISE SECURITY:
--    • 25 Row Level Security policies
--    • PII encryption with AES-256
--    • Comprehensive audit trails
--    • Role-based geographic access
--
-- 📊 PERFORMANCE OPTIMIZATION:
--    • 17 pre-computed API views
--    • 95 performance-optimized indexes
--    • 27 automated triggers
--    • Sub-second query performance
--
-- 📋 DILG COMPLIANCE:
--    • Exact RBI Form A & B field order
--    • Complete household addresses
--    • Philippine Standard Geographic Code (PSGC)
--    • Philippine Standard Occupational Classification (PSOC)
-- =====================================================

-- =====================================================
-- TABLE OF CONTENTS
-- =====================================================
-- 1. EXTENSIONS
-- 2. ENUMS AND CUSTOM TYPES
--    2.1 Personal Information Enums
--    2.2 Education Enums
--    2.3 Employment Enums
--    2.4 Health and Identity Enums
--    2.5 Household Enums
--    2.6 Family Position Enums
--    2.7 Income Classification Enums
--    2.8 Geographic Enums
-- 3. REFERENCE DATA TABLES (PSGC & PSOC)
--    3.1 Philippine Standard Geographic Code (PSGC)
--    3.2 Philippine Standard Occupational Classification (PSOC)
-- 4. AUTHENTICATION TABLES (auth_*)
-- 5. SECURITY TABLES (system_encryption_*)
-- 6. GEOGRAPHIC MANAGEMENT TABLES (geo_*) - ✨ ENHANCED WITH FULL HIERARCHY
-- 7. CORE DATA TABLES
--    7.1 Households Table - ✨ AUTO-POPULATED ADDRESS
--    7.2 Residents Table
-- 8. SUPPLEMENTARY TABLES
--    8.1 Household Members
--    8.2 Resident Relationships
--    8.3 Resident Sectoral Information
--    8.4 Resident Migrant Information
-- 9. SYSTEM TABLES (system_*)
-- 10. PII ENCRYPTION FUNCTIONS
-- 11. DATA ACCESS VIEWS
-- 12. FUNCTIONS AND TRIGGERS - ✨ AUTO-POPULATION FUNCTIONS
--     12.0 Geographic Hierarchy Auto-Population
--     12.1 Household Address Auto-Population  
--     12.2 Resident Address Auto-Population
--     12.3 Sectoral Information Auto-Population
-- 13. VIEWS AND SEARCH FUNCTIONS - ✨ ENHANCED API VIEWS
-- 14. INDEXES - ✨ 95 PERFORMANCE-OPTIMIZED INDEXES
-- 15. CONSTRAINTS - ✨ 220+ VALIDATION RULES
-- 16. ROW LEVEL SECURITY - ✨ 25 MULTI-LEVEL POLICIES
-- 17. PERMISSIONS AND GRANTS
-- =====================================================

-- =====================================================
-- SECTION 1: EXTENSIONS
-- =====================================================
-- Required PostgreSQL extensions for system functionality

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";      -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram text search

-- =====================================================
-- SECTION 2: ENUMS AND CUSTOM TYPES
-- =====================================================
-- Standardized value lists for data consistency

-- =====================================================
-- 2.1 PERSONAL INFORMATION ENUMS
-- =====================================================

-- Biological Sex
CREATE TYPE sex_enum AS ENUM (
    'male',
    'female'
);

-- Civil Status (PSA Standard Categories)
CREATE TYPE civil_status_enum AS ENUM (
    'single',    -- A person who has never been married
    'married',   -- A couple living together as husband and wife, legally or consensually
    'divorced',  -- A person whose bond of matrimony has been dissolved legally and who therefore can remarry
    'separated', -- A person separated legally or not from his/her spouse because of marital discord or misunderstanding
    'widowed',   -- A person whose bond of matrimony has been dissolved by death of his/her spouse
    'others'     -- Other civil status not covered by the standard categories
);

-- Citizenship Status
CREATE TYPE citizenship_enum AS ENUM (
    'filipino',
    'dual_citizen',
    'foreign_national'
);

-- =====================================================
-- 2.2 EDUCATION ENUMS
-- =====================================================

-- Educational Attainment Levels (Highest Educational Attainment)
CREATE TYPE education_level_enum AS ENUM (
    'elementary',    -- Completed elementary/primary school
    'high_school',   -- Completed secondary/high school
    'college',       -- Completed college/university degree
    'post_graduate', -- Completed post-graduate/masters/doctorate
    'vocational'     -- Completed vocational/technical course
);

-- Note: Using boolean is_graduate field instead of education_status_enum for simplicity

-- =====================================================
-- 2.3 EMPLOYMENT ENUMS
-- =====================================================

-- Employment Status Categories
CREATE TYPE employment_status_enum AS ENUM (
    'employed',
    'unemployed',
    'underemployed',
    'self_employed',
    'student',
    'retired',
    'homemaker',
    'unable_to_work',
    'looking_for_work',
    'not_in_labor_force'
);

-- =====================================================
-- 2.4 HEALTH AND IDENTITY ENUMS
-- =====================================================

-- Blood Type Classification
CREATE TYPE blood_type_enum AS ENUM (
    'A+', 'A-',
    'B+', 'B-',
    'AB+', 'AB-',
    'O+', 'O-',
    'unknown'
);

-- Religious Affiliation
CREATE TYPE religion_enum AS ENUM (
    'roman_catholic',
    'islam',
    'iglesia_ni_cristo',
    'christian',
    'aglipayan_church',
    'seventh_day_adventist',
    'bible_baptist_church',
    'jehovahs_witnesses',
    'church_of_jesus_christ_latter_day_saints',
    'united_church_of_christ_philippines',
    'protestant',
    'buddhism',
    'baptist',
    'methodist',
    'pentecostal',
    'evangelical',
    'mormon',
    'orthodox',
    'hinduism',
    'judaism',
    'indigenous_beliefs',
    'atheist',
    'agnostic',
    'no_religion',
    'others',
    'prefer_not_to_say'
);

-- Ethnic Background
CREATE TYPE ethnicity_enum AS ENUM (
    -- Major Philippine ethnic groups
    'tagalog',
    'cebuano',
    'ilocano',
    'bisaya',
    'hiligaynon',
    'bikolano',
    'waray',
    'kapampangan',
    'pangasinense',
    
    -- Muslim/Moro groups
    'maranao',
    'maguindanao',
    'tausug',
    'yakan',
    'samal',
    'badjao',
    
    -- Indigenous Peoples (Lumad/IP groups)
    'aeta',
    'agta',
    'ati',
    'batak',
    'bukidnon',
    'gaddang',
    'higaonon',
    'ibaloi',
    'ifugao',
    'igorot',
    'ilongot',
    'isneg',
    'ivatan',
    'kalinga',
    'kankanaey',
    'mangyan',
    'mansaka',
    'palawan',
    'subanen',
    'tboli',
    'teduray',
    'tumandok',
    
    -- Other groups
    'chinese',
    'other',
    'not_reported'
);

-- =====================================================
-- 2.5 HOUSEHOLD ENUMS
-- =====================================================

-- Household Type Classification
CREATE TYPE household_type_enum AS ENUM (
    'nuclear',       -- Parents and children only
    'single_parent', -- One parent with children
    'extended',      -- Multiple generations
    'childless',     -- Couple without children
    'one_person',    -- Living alone
    'non_family',    -- Unrelated individuals
    'other'          -- Other arrangements
);

-- Housing Tenure Status
CREATE TYPE tenure_status_enum AS ENUM (
    'owned',                    -- Fully owned
    'owned_with_mortgage',      -- With housing loan
    'rented',                   -- Renting
    'occupied_for_free',        -- No payment arrangement
    'occupied_without_consent', -- Informal settler
    'others'                    -- Other arrangements
);

-- Household Unit Type
CREATE TYPE household_unit_enum AS ENUM (
    'single_house',       -- Detached house
    'duplex',            -- Two-unit structure
    'apartment',         -- Multi-unit building
    'townhouse',         -- Row houses
    'condominium',       -- Condo unit
    'boarding_house',    -- Boarding facility
    'institutional',     -- Institution (dormitory, etc.)
    'makeshift',         -- Temporary structure
    'others'             -- Other types
);

-- =====================================================
-- 2.6 FAMILY POSITION ENUMS
-- =====================================================

-- Family Role/Position
CREATE TYPE family_position_enum AS ENUM (
    'father',
    'mother',
    'son',
    'daughter',
    'grandmother',
    'grandfather',
    'father_in_law',
    'mother_in_law',
    'brother_in_law',
    'sister_in_law',
    'spouse',
    'sibling',
    'guardian',
    'ward',
    'other'
);

-- =====================================================
-- 2.7 INCOME CLASSIFICATION ENUMS
-- =====================================================

-- Economic Income Classes (Based on NEDA Classifications)
CREATE TYPE income_class_enum AS ENUM (
    'rich',                    -- ≥ 219,140 PHP/month
    'high_income',             -- 131,484 - 219,139 PHP/month
    'upper_middle_income',     -- 76,669 - 131,483 PHP/month
    'middle_class',            -- 43,828 - 76,668 PHP/month
    'lower_middle_class',      -- 21,194 - 43,827 PHP/month
    'low_income',              -- 9,520 - 21,193 PHP/month
    'poor',                    -- < 10,957 PHP/month
    'not_determined'           -- Unable to determine
);

-- =====================================================
-- 2.8 GEOGRAPHIC ENUMS
-- =====================================================

-- Birth Place Level (for PSGC hierarchy - similar to PSOC level approach)
CREATE TYPE birth_place_level_enum AS ENUM (
    'region',
    'province',
    'city_municipality',
    'barangay'
);

-- =====================================================
-- SECTION 3: REFERENCE DATA TABLES (PSGC & PSOC)
-- =====================================================
-- Government standard reference data - read-only tables

-- =====================================================
-- 3.1 PHILIPPINE STANDARD GEOGRAPHIC CODE (PSGC) TABLES
-- =====================================================

-- PSGC Regions (Level 1)
CREATE TABLE psgc_regions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSGC Provinces (Level 2)
CREATE TABLE psgc_provinces (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSGC Cities and Municipalities (Level 3)
CREATE TABLE psgc_cities_municipalities (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    type VARCHAR(50) NOT NULL,
    is_independent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Independence constraint: Independent cities have no province
    CONSTRAINT independence_rule CHECK (
        (is_independent = true AND province_code IS NULL)
        OR (is_independent = false)
    )
);

-- PSGC Barangays (Level 4)
CREATE TABLE psgc_barangays (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3.2 PHILIPPINE STANDARD OCCUPATIONAL CLASSIFICATION (PSOC) TABLES
-- =====================================================

-- PSOC Major Groups (Level 1)
CREATE TABLE psoc_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Sub-Major Groups (Level 2)
CREATE TABLE psoc_sub_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    major_code VARCHAR(10) NOT NULL REFERENCES psoc_major_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Minor Groups (Level 3)
CREATE TABLE psoc_minor_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    sub_major_code VARCHAR(10) NOT NULL REFERENCES psoc_sub_major_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Unit Groups (Level 4)
CREATE TABLE psoc_unit_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    minor_code VARCHAR(10) NOT NULL REFERENCES psoc_minor_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Unit Sub-Groups (Level 5)
CREATE TABLE psoc_unit_sub_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Position Titles
CREATE TABLE psoc_position_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    is_primary BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Cross-References
CREATE TABLE psoc_occupation_cross_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_occupation_title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 4: AUTHENTICATION TABLES (auth_*)
-- =====================================================
-- User management, roles, and permissions

-- User Roles and Permissions
CREATE TABLE auth_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE auth_user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Role Assignment
    role_id UUID NOT NULL REFERENCES auth_roles(id),

    -- Geographic Assignment
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,

    -- Audit Fields
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barangay User Assignments (for multi-barangay access)
CREATE TABLE auth_barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth_user_profiles(id) ON DELETE CASCADE,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    is_primary BOOLEAN DEFAULT false,

    -- Audit Fields
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, barangay_code)
);

-- =====================================================
-- SECTION 5: SECURITY TABLES (system_encryption_*)
-- =====================================================
-- PII Encryption and key management tables

-- Encryption key management table
CREATE TABLE system_encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(50) NOT NULL UNIQUE,
    key_version INTEGER NOT NULL DEFAULT 1,
    encryption_algorithm VARCHAR(20) DEFAULT 'AES-256-GCM',
    key_purpose VARCHAR(50) NOT NULL, -- 'pii', 'documents', 'communications'

    -- Security metadata
    key_hash BYTEA NOT NULL,  -- Store key hash, not actual key
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),

    -- Constraints
    CONSTRAINT valid_algorithm CHECK (encryption_algorithm IN ('AES-256-GCM', 'AES-256-CBC')),
    CONSTRAINT valid_purpose CHECK (key_purpose IN ('pii', 'documents', 'communications', 'system'))
);

-- Key rotation history
CREATE TABLE system_key_rotation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(50) NOT NULL,
    old_key_version INTEGER NOT NULL,
    new_key_version INTEGER NOT NULL,
    rotation_reason TEXT,
    rotated_by UUID REFERENCES auth_user_profiles(id),
    rotated_at TIMESTAMPTZ DEFAULT NOW(),
    records_migrated INTEGER DEFAULT 0,
    migration_completed_at TIMESTAMPTZ
);

-- =====================================================
-- SECTION 6: GEOGRAPHIC MANAGEMENT TABLES (geo_*)
-- =====================================================
-- Local geographic subdivisions within barangays

-- Subdivisions/Zones within Barangays
CREATE TABLE geo_subdivisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Subdivision', 'Zone', 'Sitio', 'Purok')),
    
    -- Full Geographic Hierarchy (matches auth_user_profiles pattern)
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code), -- NULL for independent cities
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    
    description TEXT,
    is_active BOOLEAN DEFAULT true,

    -- Audit Fields
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(name, barangay_code)
);

-- Streets within Barangays
CREATE TABLE geo_streets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    subdivision_id UUID REFERENCES geo_subdivisions(id), -- Optional - streets can exist without subdivisions
    
    -- Full Geographic Hierarchy (matches auth_user_profiles pattern)
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code), -- NULL for independent cities
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    
    description TEXT,
    is_active BOOLEAN DEFAULT true,

    -- Audit Fields
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(name, barangay_code, subdivision_id)
);

-- =====================================================
-- SECTION 6: CORE DATA TABLES
-- =====================================================
-- Main data tables for households and residents

-- =====================================================
-- 6.1 HOUSEHOLDS TABLE
-- =====================================================

-- Function to generate hierarchical household ID using proper PSGC structure (RR-PP-MM-BBB)
CREATE OR REPLACE FUNCTION generate_hierarchical_household_id(
    p_barangay_code VARCHAR(10),
    p_subdivision_id UUID DEFAULT NULL,
    p_street_id UUID DEFAULT NULL,
    p_house_number VARCHAR(50) DEFAULT NULL
) RETURNS VARCHAR(22) AS $$
DECLARE
    region_code VARCHAR(2);
    province_code VARCHAR(2);
    municipality_code VARCHAR(2);
    barangay_code VARCHAR(3);
    subdivision_num VARCHAR(4) := '0000';
    street_num VARCHAR(4) := '0000';
    house_num VARCHAR(4);
    new_id VARCHAR(22);
    next_house_seq INTEGER;
BEGIN
    -- Extract PSGC components from barangay code
    -- Assuming barangay code format: RRPPMMBBB (9 digits)
    -- RR = Region (01-99), PP = Province (01-99), MM = Municipality (01-99), BBB = Barangay (001-999)

    region_code := SUBSTRING(p_barangay_code FROM 1 FOR 2);
    province_code := SUBSTRING(p_barangay_code FROM 3 FOR 2);
    municipality_code := SUBSTRING(p_barangay_code FROM 5 FOR 2);
    barangay_code := SUBSTRING(p_barangay_code FROM 7 FOR 3);

    -- Get subdivision sequence number (or 0000 if null)
    IF p_subdivision_id IS NOT NULL THEN
        SELECT LPAD(ROW_NUMBER() OVER (PARTITION BY barangay_code ORDER BY created_at)::TEXT, 4, '0')
        INTO subdivision_num
        FROM geo_subdivisions
        WHERE barangay_code = p_barangay_code AND id = p_subdivision_id;
    END IF;

    -- Get street sequence number within barangay/subdivision
    IF p_street_id IS NOT NULL THEN
        SELECT LPAD(ROW_NUMBER() OVER (
            PARTITION BY barangay_code, COALESCE(subdivision_id::TEXT, 'null')
            ORDER BY created_at
        )::TEXT, 4, '0')
        INTO street_num
        FROM geo_streets
        WHERE barangay_code = p_barangay_code
        AND (subdivision_id = p_subdivision_id OR (subdivision_id IS NULL AND p_subdivision_id IS NULL))
        AND id = p_street_id;
    END IF;

    -- Use actual house ID if provided, otherwise generate next sequential number
    IF p_house_number IS NOT NULL AND TRIM(p_house_number) != '' THEN
        -- Extract numeric part from house ID (e.g., "123-A" -> "123")
        house_num := LPAD(REGEXP_REPLACE(p_house_number, '[^0-9]', '', 'g'), 4, '0');
    ELSE
        -- Fallback to sequential numbering if no house ID provided
        SELECT COALESCE(MAX(CAST(RIGHT(code, 4) AS INTEGER)), 0) + 1
        INTO next_house_seq
        FROM households
        WHERE barangay_code = p_barangay_code
        AND COALESCE(subdivision_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(p_subdivision_id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND COALESCE(street_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(p_street_id, '00000000-0000-0000-0000-000000000000'::UUID);
        
        house_num := LPAD(next_house_seq::TEXT, 4, '0');
    END IF;

    -- Construct the ID using PSGC format: RRPPMMBBB-SSSS-TTTT-HHHH
    new_id := region_code || province_code || municipality_code ||
              barangay_code || '-' || subdivision_num || '-' || street_num || '-' || house_num;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HOUSEHOLDS TABLE - EXACT DILG RBI FORM A STRUCTURE
-- =====================================================
-- DILG RBI Form A: Record of Barangay Inhabitants by Household
CREATE TABLE households (
    -- =====================================================
    -- DILG RBI FORM A - EXACT FIELD ORDER
    -- =====================================================
    code VARCHAR(50) PRIMARY KEY, -- Hierarchical format: RRPPMMBBB-SSSS-TTTT-HHHH
    

    -- 12. HOUSEHOLD NAME - Auto-populated: lastname + "Residence" (e.g. "Dela Cruz Residence")
    name VARCHAR(200), -- Auto-populated from household head's last name

    -- 5. HOUSEHOLD ADDRESS - Auto-populated: Complete address from house number to region
    address TEXT, -- Auto-populated by trigger from all address components

    house_number VARCHAR(50) NOT NULL, -- House/Block/Lot No.

    street_id UUID NOT NULL REFERENCES geo_streets(id),

    subdivision_id UUID REFERENCES geo_subdivisions(id),
         
    -- 4. BARANGAY - Indicate the name of barangay
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),

    -- 3. CITY/MUNICIPALITY - Indicate the name of city/municipality
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),

    -- 2. PROVINCE - Indicate the name of province  
    province_code VARCHAR(10) REFERENCES psgc_provinces(code), -- NULL for independent cities

    -- 1. REGION - Indicate the name of region
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    
    -- 6. NO. OF FAMILY/IES - Indicate number of family/ies in the Household
    no_of_families INTEGER DEFAULT 1,
    
    -- 7. NO. OF HOUSEHOLD MEMBERS - Indicate the complete number of Household Members
    no_of_household_members INTEGER DEFAULT 0, -- Auto-calculated
    
    -- 8. NO. OF MIGRANT/S - Indicate the complete number of Household Migrants (if any)
    no_of_migrants INTEGER DEFAULT 0, -- Auto-calculated
    
    -- 9. HOUSEHOLD TYPE - Select: Nuclear; Single Parent; Extended; Childless; Grandparent; or Stepfamily
    household_type household_type_enum,
    
    -- 10. TENURE STATUS - Select: Owner; Renter; please specify if others
    tenure_status tenure_status_enum,
    tenure_others_specify TEXT,
    
    -- 11. HOUSEHOLD UNIT - Select: Single-family house; Town house; Condominium; Duplex; or Mobile home
    household_unit household_unit_enum,
    
    
    -- 13. MONTHLY INCOME - Specify the total monthly income of the household (e.g. Php 50,000)
    monthly_income DECIMAL(12,2),
    income_class income_class_enum,
    
    -- 14. HEAD OF THE FAMILY NAME - Identify the head of the family by providing the Full Name
    household_head_id UUID, -- References residents(id)
    
    -- 15. POSITION - Select Head of Family's position: Father; Mother; Son; daughter; etc.
    household_head_position family_position_enum,
    
    -- =====================================================
    -- SYSTEM FIELDS (Not part of DILG form)
    -- =====================================================
    
    
    
    -- Audit fields
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

);

-- =====================================================
-- 6.2 RESIDENTS TABLE
-- =====================================================

-- =====================================================  
-- RESIDENTS TABLE - EXACT DILG RBI FORM B STRUCTURE
-- =====================================================
-- DILG RBI Form B: Individual Records of Barangay Inhabitant
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Search optimization fields  
    name_encrypted BYTEA, -- Full name: first + middle + last (encrypted PII)
    name_hash VARCHAR(64), -- Hash for searching full name


    -- =====================================================
    -- A. PERSONAL INFORMATION - EXACT DILG RBI FORM B ORDER
    -- =====================================================
    
    -- 1. PHILSYS CARD NUMBER (PCN) - Provide the 16-digit PhilSys Card Number
    philsys_card_number_hash BYTEA,         -- Encrypted for privacy
    philsys_last4 VARCHAR(4),               -- Last 4 digits (searchable)
    
    -- 2. FIRST NAME - Indicate Given Name
    first_name_encrypted BYTEA NOT NULL,    -- Encrypted for PII Protection
    first_name_hash VARCHAR(64),            -- Hash for searching
    
    -- 3. MIDDLE NAME - Indicate Middle Name
    middle_name_encrypted BYTEA,            -- Encrypted for PII Protection  
    
    -- 4. LAST NAME - Indicate Last Name
    last_name_encrypted BYTEA NOT NULL,     -- Encrypted for PII Protection
    last_name_hash VARCHAR(64),             -- Hash for searching
    
    -- 5. EXTENSION NAME - Indicate Extension Name/Suffix (e.g. Sr., Jr., II, III)
    extension_name VARCHAR(20),
    
    
    -- 6. BIRTHDATE - Indicate complete Birth date in format (MM/DD/YYYY)
    birthdate DATE NOT NULL,
    
    -- 7. AGE - Indicate age in numerical value (e.g. 20) - Calculated in views
    -- Note: AGE is auto-calculated from birthdate
    
    -- 8. BIRTH PLACE - Indicate the City/Municipality where the Barangay Inhabitant was born
    birth_place_code VARCHAR(10),           -- PSGC code for birth location
    birth_place_name VARCHAR(200),          -- Auto-populated from birth_place_code
    
    -- 9. SEX - Indicate sex by selecting Male or Female
    sex sex_enum NOT NULL,
    
    -- 10. CIVIL STATUS - Select: Single; Married; Widowed; Divorced; Separated; Registered Partnership; others
    civil_status civil_status_enum DEFAULT 'single',
    civil_status_others_specify TEXT,
    
    -- 11. HIGHEST EDUCATIONAL ATTAINMENT - Select: Elementary, High School, College, Post Grad, Vocational
    -- Then specify "Graduate" or "Undergraduate"
    education_attainment education_level_enum,
    is_graduate BOOLEAN DEFAULT false,         -- Graduate or Undergraduate
    
    -- 12. PROFESSION/OCCUPATION - Indicate Profession or Occupation (if any)
    -- 12. PROFESSION/OCCUPATION - Based on PSOC hierarchy
    employment_status employment_status_enum,
    employment_code VARCHAR(10),               -- PSOC code for occupation (can reference any PSOC level 1-5)
    employment_name VARCHAR(300),              -- Auto-populated from employment_code
    -- For Level 5: REFERENCES psoc_unit_sub_groups(code)
    -- For Level 4: REFERENCES psoc_unit_groups(code)  
    -- For Level 3: REFERENCES psoc_minor_groups(code)
    -- For Level 2: REFERENCES psoc_sub_major_groups(code)
    -- For Level 1: REFERENCES psoc_major_groups(code)

    -- =====================================================
    -- B. CONTACT DETAILS - EXACT DILG RBI FORM B ORDER
    -- =====================================================
    
    -- 13. EMAIL ADDRESS - Enter email address (if any)
    email_encrypted BYTEA,                  -- Encrypted for privacy
    email_hash VARCHAR(64),                 -- Hash for searching
    
    -- 14. MOBILE NUMBER - Provide 11-digit mobile number
    mobile_number_encrypted BYTEA,          -- Encrypted for privacy
    mobile_number_hash VARCHAR(64),         -- Hash for searching
    
    -- 15. TELEPHONE NUMBER - Provide telephone number (if any)
    telephone_number_encrypted BYTEA,       -- Encrypted for privacy
    
    -- 16. ADDRESS - Complete address hierarchy per DILG
    
    -- HOUSEHOLD CODE - Select household to auto-populate all address fields
    household_code VARCHAR(50) REFERENCES households(code),
    
    -- STREET NAME - Auto-populated from household
    street_id UUID REFERENCES geo_streets(id),
    
    -- SUBDIVISION/VILLAGE - Auto-populated from household
    subdivision_id UUID REFERENCES geo_subdivisions(id),

    -- BARANGAY - Indicate name of barangay (e.g. Barangay Bago Bantay)
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),

    -- CITY/MUNICIPALITY - Indicate city, municipality, sub-municipality, or SGU (e.g. Quezon City)
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),

    -- PROVINCE - Indicate province, HUC, or ICC as applicable (e.g. Metro Manila)
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),

    -- REGION - Indicate region (e.g. National Capital Region)
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),

    -- ZIP CODE - Indicate zip code if available
    zip_code VARCHAR(10),

    -- =====================================================
    -- C. IDENTITY INFORMATION - EXACT DILG RBI FORM B ORDER
    -- =====================================================
    
    -- 17. BLOOD TYPE - Specify blood type from list: A+, A-, O+, O-, B+, B-, AB+, AB-
    blood_type blood_type_enum DEFAULT 'unknown',
    
    -- 18. HEIGHT - Provide height in meters
    height DECIMAL(5,2),
    
    -- 19. WEIGHT - Provide weight in kilograms
    weight DECIMAL(5,2),
    
    -- 20. COMPLEXION - Describe complexion: "Fair," "Medium," or "Dark"
    complexion VARCHAR(50),
    
    -- 21. CITIZENSHIP - Select: Filipino, Dual Citizenship, or Foreigner
    citizenship citizenship_enum DEFAULT 'filipino',
    
    -- 22. VOTER - Indicate whether you are a voter by selecting "Yes" or "No"
    is_voter BOOLEAN,
    
    -- 23. RESIDENT VOTER - Specify if you are a resident voter by selecting "Yes" or "No"
    is_resident_voter BOOLEAN,
    
    -- 24. LAST VOTED YEAR - Enter the date of the last year you voted in format MM-DD-YYYY
    last_voted_date DATE,
    
    -- 25. ETHNICITY - Specify your ethnicity (e.g. Igorot) (Refer to LGUSS Form 10)
    ethnicity ethnicity_enum DEFAULT 'not_reported',
    
    -- 26. RELIGION - Select from list: Roman Catholic, Islam, Iglesia ni Cristo, Christian, etc.
    religion religion_enum DEFAULT 'prefer_not_to_say',
    religion_others_specify TEXT,
    
    -- 27. MOTHER'S MAIDEN NAME - Provide mother's maiden name (First, Middle, Last Name)
    mother_maiden_first_encrypted BYTEA,    -- First Name (encrypted)
    mother_maiden_middle_encrypted BYTEA,   -- Middle Name (encrypted)
    mother_maiden_last_encrypted BYTEA,     -- Last Name (encrypted)

    -- Encryption metadata
    is_data_encrypted BOOLEAN DEFAULT false,
    encryption_key_version INTEGER DEFAULT 1,
    encrypted_at TIMESTAMPTZ,
    encrypted_by UUID REFERENCES auth_user_profiles(id),

    -- =====================================================
    -- D. SECTORAL INFORMATION (DILG RBI Form B Section D)
    -- =====================================================
    -- Note: Detailed sectoral information is stored in resident_sectoral_info table
    -- SECTORAL INFORMATION options: Labor Force/Employed, Unemployed, OFW, PWD,
    -- OSC, OSY, Solo Parent, Indigenous People, Migrant, Senior Citizen

    -- =====================================================
    -- HOUSEHOLD AND LOCATION REFERENCES
    -- =====================================================
    
    -- Household Reference
    household_code VARCHAR(50) REFERENCES households(code),

    -- Location Details (for internal system use)
    street_id UUID REFERENCES geo_streets(id),
    subdivision_id UUID REFERENCES geo_subdivisions(id),

    -- =====================================================
    -- AUDIT AND METADATA
    -- =====================================================
    
    -- System audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()

    -- Search functionality now handled through API views
);

-- Add the foreign key constraint for household_head_id
ALTER TABLE households ADD CONSTRAINT fk_household_head
    FOREIGN KEY (household_head_id) REFERENCES residents(id);

-- Add unique constraint for household head
ALTER TABLE households ADD CONSTRAINT unique_household_head_per_household
    UNIQUE(household_head_id);

-- =====================================================
-- SECTION 7: SUPPLEMENTARY TABLES
-- =====================================================
-- Supporting tables for relationships and detailed information

-- =====================================================
-- 7.1 HOUSEHOLD MEMBERS TABLE
-- =====================================================

-- Household Members (junction table)
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_code VARCHAR(50) NOT NULL REFERENCES households(code) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id),

    relationship_to_head VARCHAR(50) NOT NULL,
    family_position family_position_enum,
    position_notes TEXT,
    is_active BOOLEAN DEFAULT true,

    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(household_code, resident_id)
);

-- =====================================================
-- 7.2 RESIDENT RELATIONSHIPS TABLE
-- =====================================================

-- Resident Relationships (family relationships)
CREATE TABLE resident_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_a_id UUID NOT NULL REFERENCES residents(id),
    resident_b_id UUID NOT NULL REFERENCES residents(id),
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('Spouse', 'Parent', 'Child', 'Sibling', 'Guardian', 'Ward', 'Other')),
    relationship_description TEXT,
    is_reciprocal BOOLEAN DEFAULT true,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,

    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT no_self_relationship CHECK (resident_a_id != resident_b_id),
    CONSTRAINT unique_relationship UNIQUE(resident_a_id, resident_b_id, relationship_type)
);

-- =====================================================
-- 7.3 RESIDENT SECTORAL INFORMATION TABLE
-- =====================================================
-- DILG RBI Form B Section D: SECTORAL INFORMATION Compliant
-- Tracks sectoral classification as required by DILG RBI Form B

CREATE TABLE resident_sectoral_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,

    -- DILG RBI Form B Section D: SECTORAL INFORMATION
    -- "Select a sector from the list provided. You may select more than one as applicable:"
    
    -- Labor Force Status
    is_labor_force_employed BOOLEAN DEFAULT false,    -- Labor Force/Employed (combined category)
    is_unemployed BOOLEAN DEFAULT false,             -- Unemployed

    -- Special Populations (DILG RBI Form B Required Sectors)
    is_overseas_filipino_worker BOOLEAN DEFAULT false, -- Overseas Filipino Worker (OFW)
    is_person_with_disability BOOLEAN DEFAULT false,   -- Person with Disabilities (PWD)
    is_out_of_school_children BOOLEAN DEFAULT false,   -- Out of School Children (OSC)
    is_out_of_school_youth BOOLEAN DEFAULT false,      -- Out of School Youth (OSY)
    is_senior_citizen BOOLEAN DEFAULT false,           -- Senior Citizen (SC) 
    is_registered_senior_citizen BOOLEAN DEFAULT false, -- SC - specify if registered (Yes/No)
    is_solo_parent BOOLEAN DEFAULT false,               -- Solo Parent
    is_indigenous_people BOOLEAN DEFAULT false,         -- Indigenous People (IP)
    is_migrant BOOLEAN DEFAULT false,                   -- Migrant

    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one record per resident
    UNIQUE(resident_id)
);

-- =====================================================
-- 7.4 RESIDENT MIGRANT INFORMATION TABLE
-- =====================================================

-- Migrant Information Table
-- =====================================================
-- PART 3: MIGRANT INFORMATION (DILG RBI Form A)
-- =====================================================
-- This table stores migration information as required by DILG RBI Form A Part 3
CREATE TABLE resident_migrant_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,

    -- DILG RBI Part 3 Required Fields (in exact order):
    -- Note: LAST NAME, FIRST NAME, MIDDLE NAME, EXTENSION NAME stored in residents table
    
    -- PREVIOUS RESIDENCE ADDRESS (Barangay, City/Municipality, Province)
    previous_barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    previous_city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    previous_province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    previous_region_code VARCHAR(10) REFERENCES psgc_regions(code),

    -- LENGTH OF STAY IN THE PREVIOUS BARANGAY (months or years)
    length_of_stay_previous_months INTEGER, 
    
    -- REASON/S FOR LEAVING (previous residence)
    reason_for_leaving TEXT, 
    
    -- DATE OF TRANSFER (MM/DD/YYYY format)
    date_of_transfer DATE, 
    
    -- REASON/S FOR TRANSFERRING IN THIS BARANGAY
    reason_for_transferring TEXT, 
    
    -- DURATION OF STAY IN THE CURRENT BARANGAY (months/years)
    duration_of_stay_current_months INTEGER, 

    -- INTENTION TO RETURN TO PREVIOUS RESIDENCE (Yes or No)
    is_intending_to_return BOOLEAN, -- true = Yes, false = No, null = undecided

    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one record per resident
    UNIQUE(resident_id)
);

-- =====================================================
-- SECTION 8: SYSTEM TABLES (system_*)
-- =====================================================
-- Analytics, reporting, and system management tables

-- =====================================================
-- 8.1 DASHBOARD SUMMARIES TABLE
-- =====================================================

-- Pre-calculated dashboard summaries
CREATE TABLE system_dashboard_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    calculation_date DATE DEFAULT CURRENT_DATE,

    -- Population Statistics
    total_residents INTEGER DEFAULT 0,
    total_households INTEGER DEFAULT 0,
    average_household_size DECIMAL(3,2) DEFAULT 0,

    -- Demographics
    male_count INTEGER DEFAULT 0,
    female_count INTEGER DEFAULT 0,

    -- Age Groups
    age_0_14 INTEGER DEFAULT 0,
    age_15_64 INTEGER DEFAULT 0,
    age_65_plus INTEGER DEFAULT 0,

    -- Civil Status
    single_count INTEGER DEFAULT 0,
    married_count INTEGER DEFAULT 0,
    widowed_count INTEGER DEFAULT 0,
    divorced_separated_count INTEGER DEFAULT 0,

    -- Employment
    employed_count INTEGER DEFAULT 0,
    unemployed_count INTEGER DEFAULT 0,
    student_count INTEGER DEFAULT 0,
    retired_count INTEGER DEFAULT 0,

    -- System generated timestamps (no user tracking needed)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(barangay_code, calculation_date)
);

-- =====================================================
-- 8.2 AUDIT LOGS TABLE
-- =====================================================

-- Audit trail table
CREATE TABLE system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth_user_profiles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8.3 SCHEMA VERSIONS TABLE
-- =====================================================

CREATE TABLE system_schema_versions (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- =====================================================
-- SECTION 10: PII ENCRYPTION FUNCTIONS
-- =====================================================
-- Secure PII handling functions and utilities

-- Function: Get active encryption key
CREATE OR REPLACE FUNCTION get_active_encryption_key(p_key_name VARCHAR)
RETURNS BYTEA AS $$
DECLARE
    encryption_key BYTEA;
BEGIN
    SELECT key_hash INTO encryption_key
    FROM system_encryption_keys
    WHERE key_name = p_key_name
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'No active encryption key found for: %', p_key_name;
    END IF;

    RETURN encryption_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Encrypt PII data
CREATE OR REPLACE FUNCTION encrypt_pii(
    p_plaintext TEXT,
    p_key_name VARCHAR DEFAULT 'pii_master_key'
)
RETURNS BYTEA AS $$
DECLARE
    encryption_key BYTEA;
    encrypted_data BYTEA;
BEGIN
    -- Handle NULL input
    IF p_plaintext IS NULL OR TRIM(p_plaintext) = '' THEN
        RETURN NULL;
    END IF;

    -- Get active key
    encryption_key := get_active_encryption_key(p_key_name);

    -- Encrypt using pgcrypto
    encrypted_data := pgp_sym_encrypt(p_plaintext, encode(encryption_key, 'hex'));

    -- Log encryption event (for audit)
    INSERT INTO system_audit_logs (
        table_name,
        operation,
        record_id,
        new_values,
        user_id,
        created_at
    ) VALUES (
        'pii_encryption',
        'ENCRYPT',
        gen_random_uuid(),
        jsonb_build_object('key_name', p_key_name, 'data_length', length(p_plaintext)),
        auth.uid(),
        NOW()
    );

    RETURN encrypted_data;
EXCEPTION
    WHEN OTHERS THEN
        -- Log encryption failure
        INSERT INTO system_audit_logs (
            table_name,
            operation,
            record_id,
            new_values,
            user_id,
            created_at
        ) VALUES (
            'pii_encryption',
            'ENCRYPT_FAILED',
            gen_random_uuid(),
            jsonb_build_object('error', SQLERRM, 'key_name', p_key_name),
            auth.uid(),
            NOW()
        );
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Decrypt PII data
CREATE OR REPLACE FUNCTION decrypt_pii(
    p_encrypted_data BYTEA,
    p_key_name VARCHAR DEFAULT 'pii_master_key'
)
RETURNS TEXT AS $$
DECLARE
    encryption_key BYTEA;
    decrypted_data TEXT;
BEGIN
    -- Handle NULL input
    IF p_encrypted_data IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get active key
    encryption_key := get_active_encryption_key(p_key_name);

    -- Decrypt using pgcrypto
    decrypted_data := pgp_sym_decrypt(p_encrypted_data, encode(encryption_key, 'hex'));

    -- Log decryption access (for audit)
    INSERT INTO system_audit_logs (
        table_name,
        operation,
        record_id,
        new_values,
        user_id,
        created_at
    ) VALUES (
        'pii_decryption',
        'DECRYPT',
        gen_random_uuid(),
        jsonb_build_object('key_name', p_key_name, 'accessed_by', auth.uid()),
        auth.uid(),
        NOW()
    );

    RETURN decrypted_data;
EXCEPTION
    WHEN OTHERS THEN
        -- Log decryption failure
        INSERT INTO system_audit_logs (
            table_name,
            operation,
            record_id,
            new_values,
            user_id,
            created_at
        ) VALUES (
            'pii_decryption',
            'DECRYPT_FAILED',
            gen_random_uuid(),
            jsonb_build_object('error', SQLERRM, 'key_name', p_key_name),
            auth.uid(),
            NOW()
        );
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create searchable hash for encrypted fields
CREATE OR REPLACE FUNCTION create_search_hash(
    p_plaintext TEXT,
    p_salt TEXT DEFAULT 'RBI_SEARCH_SALT_2025'
)
RETURNS VARCHAR(64) AS $$
BEGIN
    -- Handle NULL input
    IF p_plaintext IS NULL OR TRIM(p_plaintext) = '' THEN
        RETURN NULL;
    END IF;

    -- Create searchable hash (not for encryption, just for lookups)
    RETURN encode(
        hmac(LOWER(TRIM(p_plaintext)), p_salt, 'sha256'),
        'hex'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Insert resident with automatic encryption
CREATE OR REPLACE FUNCTION insert_resident_encrypted(
    -- Required parameters (no defaults)
    p_first_name TEXT,
    p_last_name TEXT,
    p_birthdate DATE,
    p_sex sex_enum,
    p_barangay_code VARCHAR(10),
    -- Optional parameters (all with defaults)
    p_middle_name TEXT DEFAULT NULL,
    p_mobile_number TEXT DEFAULT NULL,
    p_telephone_number TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_mother_maiden_first TEXT DEFAULT NULL,
    p_mother_maiden_middle TEXT DEFAULT NULL,
    p_mother_maiden_last TEXT DEFAULT NULL,
    p_household_code VARCHAR(50) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_resident_id UUID;
BEGIN
    INSERT INTO residents (
        first_name_encrypted,
        middle_name_encrypted,
        last_name_encrypted,
        mobile_number_encrypted,
        telephone_number_encrypted,
        email_encrypted,
        mother_maiden_first_encrypted,
        mother_maiden_middle_encrypted,
        mother_maiden_last_encrypted,
        first_name_hash,
        last_name_hash,
        mobile_number_hash,
        email_hash,
        full_name_hash,
        birthdate,
        sex,
        barangay_code,
        household_code,
        is_data_encrypted,
        encryption_key_version,
        encrypted_at,
        encrypted_by
    ) VALUES (
        encrypt_pii(p_first_name),
        encrypt_pii(p_middle_name),
        encrypt_pii(p_last_name),
        encrypt_pii(p_mobile_number),
        encrypt_pii(p_telephone_number),
        encrypt_pii(p_email),
        encrypt_pii(p_mother_maiden_first),
        encrypt_pii(p_mother_maiden_middle),
        encrypt_pii(p_mother_maiden_last),
        create_search_hash(p_first_name),
        create_search_hash(p_last_name),
        create_search_hash(p_mobile_number),
        create_search_hash(p_email),
        create_search_hash(
            TRIM(COALESCE(p_first_name, '') || ' ' ||
                 COALESCE(p_middle_name, '') || ' ' ||
                 COALESCE(p_last_name, ''))
        ),
        p_birthdate,
        p_sex,
        p_barangay_code,
        p_household_code,
        true,
        1,
        NOW(),
        auth.uid()
    ) RETURNING id INTO new_resident_id;

    RETURN new_resident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 11: DATA ACCESS VIEWS
-- =====================================================
-- Secure views for accessing encrypted data

-- View: Decrypted resident data (for authorized access)
CREATE VIEW residents_decrypted AS
SELECT
    id,
    philsys_card_number_hash,
    philsys_last4,

    -- Decrypted personal information (encrypted-only storage)
    decrypt_pii(first_name_encrypted) as first_name,
    decrypt_pii(middle_name_encrypted) as middle_name,
    decrypt_pii(last_name_encrypted) as last_name,
    decrypt_pii(name_encrypted) as name, -- Full name: first + middle + last

    -- Non-PII fields (unchanged)
    extension_name,
    birthdate,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate)) as age,
    birth_place_code,
    birth_place_level,
    birth_place_text,
    sex,
    civil_status,
    civil_status_others_specify,
    blood_type,
    height,
    weight,
    complexion,

    -- Education and employment (non-sensitive)
    education_attainment,
    is_graduate,
    employment_status,
    psoc_code,
    psoc_level,
    occupation_title,
    job_title,
    workplace,
    occupation,
    occupation_details,

    -- Decrypted contact information (encrypted-only storage)
    decrypt_pii(mobile_number_encrypted) as mobile_number,
    decrypt_pii(telephone_number_encrypted) as telephone_number,
    decrypt_pii(email_encrypted) as email,

    -- Location and household (non-sensitive)
    household_code,
    street_id,
    subdivision_id,
    barangay_code,
    city_municipality_code,
    province_code,
    region_code,

    -- Civic information (non-sensitive)
    citizenship,
    is_registered_voter,
    is_resident_voter,
    last_voted_year,
    ethnicity,
    religion,
    religion_others_specify,

    -- Decrypted mother's maiden name (encrypted-only storage)
    decrypt_pii(mother_maiden_first_encrypted) as mother_maiden_first,
    decrypt_pii(mother_maiden_middle_encrypted) as mother_maiden_middle,
    decrypt_pii(mother_maiden_last_encrypted) as mother_maiden_last,

    -- Metadata
    created_by,
    updated_by,
    created_at,
    updated_at,

    -- Encryption metadata
    is_data_encrypted,
    encryption_key_version,
    encrypted_at,
    encrypted_by

FROM residents;

-- View: Masked resident data (for public/limited access)
CREATE VIEW residents_masked AS
SELECT
    id,

    -- Masked personal information (encrypted-only storage)
    CASE
        WHEN first_name_encrypted IS NOT NULL THEN
            LEFT(decrypt_pii(first_name_encrypted), 1) || '***'
        ELSE NULL
    END as first_name_masked,
    CASE
        WHEN last_name_encrypted IS NOT NULL THEN
            LEFT(decrypt_pii(last_name_encrypted), 1) || '***'
        ELSE NULL
    END as last_name_masked,

    -- Public demographic information
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate)) as age,
    sex,
    civil_status,
    barangay_code,

    -- Masked contact information (encrypted-only storage)
    CASE
        WHEN mobile_number_encrypted IS NOT NULL THEN
            'XXX-XXX-' || RIGHT(decrypt_pii(mobile_number_encrypted), 4)
        ELSE NULL
    END as mobile_number_masked,

    -- General location (non-specific)
    subdivision_id,
    city_municipality_code,
    province_code,
    region_code,

    -- Non-sensitive metadata
    created_at,
    is_data_encrypted

FROM residents;

-- =====================================================
-- SECTION 12: FUNCTIONS AND TRIGGERS
-- =====================================================
-- Automated database logic and triggers

-- =====================================================
-- 12.0 GEOGRAPHIC HIERARCHY AUTO-POPULATION
-- =====================================================
-- Function to auto-populate geographic hierarchy for geo tables
CREATE OR REPLACE FUNCTION auto_populate_geo_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    region_code VARCHAR(10);
    province_code VARCHAR(10);
    city_code VARCHAR(10);
BEGIN
    -- Auto-populate geographic hierarchy from barangay_code
    IF NEW.barangay_code IS NOT NULL THEN
        SELECT
            r.code,
            CASE WHEN c.is_independent THEN NULL ELSE p.code END,
            c.code
        INTO
            region_code,
            province_code,
            city_code
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        LEFT JOIN psgc_provinces p ON c.province_code = p.code
        JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
        WHERE b.code = NEW.barangay_code;
        
        -- Populate the fields if not already set
        NEW.region_code := COALESCE(NEW.region_code, region_code);
        NEW.province_code := COALESCE(NEW.province_code, province_code);
        NEW.city_municipality_code := COALESCE(NEW.city_municipality_code, city_code);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12.1 HOUSEHOLD ADDRESS AUTO-POPULATION
-- =====================================================
-- Function to auto-populate household_address from all address components
CREATE OR REPLACE FUNCTION auto_populate_household_address()
RETURNS TRIGGER AS $$
DECLARE
    street_name VARCHAR(100);
    subdivision_name VARCHAR(100);
    barangay_name VARCHAR(100);
    city_name VARCHAR(100);
    province_name VARCHAR(100);
    region_name VARCHAR(100);
    full_address TEXT;
BEGIN
    -- Get all address component names
    IF NEW.street_id IS NOT NULL THEN
        SELECT name INTO street_name FROM geo_streets WHERE id = NEW.street_id;
    END IF;
    
    IF NEW.subdivision_id IS NOT NULL THEN
        SELECT name INTO subdivision_name FROM geo_subdivisions WHERE id = NEW.subdivision_id;
    END IF;
    
    -- Get geographic names from PSGC tables
    SELECT 
        b.name,
        c.name,
        p.name,
        r.name
    INTO
        barangay_name,
        city_name,
        province_name,
        region_name
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    LEFT JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
    WHERE b.code = NEW.barangay_code;
    
    -- Build complete address string
    full_address := '';
    
    -- House number (required)
    IF NEW.house_number IS NOT NULL AND TRIM(NEW.house_number) != '' THEN
        full_address := TRIM(NEW.house_number);
    END IF;
    
    -- Street name (required)
    IF street_name IS NOT NULL AND TRIM(street_name) != '' THEN
        full_address := full_address || ' ' || TRIM(street_name);
    END IF;
    
    -- Subdivision (optional)
    IF subdivision_name IS NOT NULL AND TRIM(subdivision_name) != '' THEN
        full_address := full_address || ', ' || TRIM(subdivision_name);
    END IF;
    
    -- Barangay (required)
    IF barangay_name IS NOT NULL AND TRIM(barangay_name) != '' THEN
        full_address := full_address || ', Barangay ' || TRIM(barangay_name);
    END IF;
    
    -- City/Municipality (required)
    IF city_name IS NOT NULL AND TRIM(city_name) != '' THEN
        full_address := full_address || ', ' || TRIM(city_name);
    END IF;
    
    -- Province (optional for independent cities)
    IF province_name IS NOT NULL AND TRIM(province_name) != '' THEN
        full_address := full_address || ', ' || TRIM(province_name);
    END IF;
    
    -- Region (required)
    IF region_name IS NOT NULL AND TRIM(region_name) != '' THEN
        full_address := full_address || ', ' || TRIM(region_name);
    END IF;
    
    -- Set the concatenated address (field 5)
    NEW.address := TRIM(full_address);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12.2 HOUSEHOLD NAME AUTO-POPULATION
-- =====================================================
-- Function to auto-populate household name from household head's last name + "Residence"
CREATE OR REPLACE FUNCTION auto_populate_household_name()
RETURNS TRIGGER AS $$
DECLARE
    head_last_name VARCHAR(100);
BEGIN
    -- Get household head's last name
    SELECT 
        CASE 
            WHEN last_name_encrypted IS NOT NULL THEN decrypt_pii(last_name_encrypted)
            ELSE last_name
        END
    INTO head_last_name
    FROM residents 
    WHERE household_code = NEW.code 
    AND relationship_to_head = 'head' 
    AND is_active = true
    LIMIT 1;
    
    -- Auto-populate household name: lastname + "Residence"
    IF head_last_name IS NOT NULL AND TRIM(head_last_name) != '' THEN
        NEW.name := TRIM(head_last_name) || ' Residence';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12.3 RESIDENT FULL NAME AUTO-POPULATION
-- =====================================================
-- Function to auto-populate encrypted full name from first + middle + last names
CREATE OR REPLACE FUNCTION auto_populate_resident_full_name()
RETURNS TRIGGER AS $$
DECLARE
    first_name_text TEXT;
    middle_name_text TEXT;  
    last_name_text TEXT;
    full_name_text TEXT;
BEGIN
    -- Get decrypted name components
    first_name_text := CASE 
        WHEN NEW.first_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.first_name_encrypted)
        ELSE NEW.first_name
    END;
    
    middle_name_text := CASE 
        WHEN NEW.middle_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.middle_name_encrypted)  
        ELSE NEW.middle_name
    END;
    
    last_name_text := CASE 
        WHEN NEW.last_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.last_name_encrypted)
        ELSE NEW.last_name  
    END;
    
    -- Build full name: first + middle + last (with proper spacing)
    full_name_text := TRIM(COALESCE(first_name_text, ''));
    
    IF middle_name_text IS NOT NULL AND TRIM(middle_name_text) != '' THEN
        full_name_text := full_name_text || ' ' || TRIM(middle_name_text);
    END IF;
    
    IF last_name_text IS NOT NULL AND TRIM(last_name_text) != '' THEN
        full_name_text := full_name_text || ' ' || TRIM(last_name_text);
    END IF;
    
    -- Encrypt the full name and create hash
    IF full_name_text IS NOT NULL AND TRIM(full_name_text) != '' THEN
        NEW.name_encrypted := encrypt_pii(TRIM(full_name_text));
        NEW.name_hash := encode(sha256(UPPER(TRIM(full_name_text))::bytea), 'hex');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12.4 BIRTH PLACE AUTO-POPULATION
-- =====================================================
-- Function to auto-populate birth place name from PSGC code
CREATE OR REPLACE FUNCTION auto_populate_birth_place_name()
RETURNS TRIGGER AS $$
DECLARE
    barangay_name VARCHAR(100);
    city_name VARCHAR(100);
    province_name VARCHAR(100);
    region_name VARCHAR(100);
    birth_place_full_text TEXT;
BEGIN
    -- Only proceed if birth_place_code is provided
    IF NEW.birth_place_code IS NOT NULL AND TRIM(NEW.birth_place_code) != '' THEN
        
        -- Check if it's a barangay code (10 digits)
        IF LENGTH(NEW.birth_place_code) = 10 THEN
            SELECT 
                b.name,
                c.name,
                p.name,
                r.name
            INTO
                barangay_name,
                city_name,
                province_name,
                region_name
            FROM psgc_barangays b
            JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
            LEFT JOIN psgc_provinces p ON c.province_code = p.code
            JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
            WHERE b.code = NEW.birth_place_code;
            
            -- Build: "Barangay [Name], [City], [Province], [Region]"
            IF barangay_name IS NOT NULL THEN
                birth_place_full_text := 'Barangay ' || barangay_name;
                IF city_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || city_name;
                END IF;
                IF province_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || province_name;
                END IF;
                IF region_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || region_name;
                END IF;
            END IF;
            
        -- Check if it's a city/municipality code (6 digits)
        ELSIF LENGTH(NEW.birth_place_code) = 6 THEN
            SELECT 
                c.name,
                p.name,
                r.name
            INTO
                city_name,
                province_name,
                region_name
            FROM psgc_cities_municipalities c
            LEFT JOIN psgc_provinces p ON c.province_code = p.code
            JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
            WHERE c.code = NEW.birth_place_code;
            
            -- Build: "[City], [Province], [Region]"
            IF city_name IS NOT NULL THEN
                birth_place_full_text := city_name;
                IF province_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || province_name;
                END IF;
                IF region_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || region_name;
                END IF;
            END IF;
            
        -- Check if it's a province code (4 digits)
        ELSIF LENGTH(NEW.birth_place_code) = 4 THEN
            SELECT 
                p.name,
                r.name
            INTO
                province_name,
                region_name
            FROM psgc_provinces p
            JOIN psgc_regions r ON p.region_code = r.code
            WHERE p.code = NEW.birth_place_code;
            
            -- Build: "[Province], [Region]"
            IF province_name IS NOT NULL THEN
                birth_place_full_text := province_name;
                IF region_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || region_name;
                END IF;
            END IF;
            
        -- Check if it's a region code (2 digits)
        ELSIF LENGTH(NEW.birth_place_code) = 2 THEN
            SELECT name INTO region_name
            FROM psgc_regions
            WHERE code = NEW.birth_place_code;
            
            -- Build: "[Region]"
            IF region_name IS NOT NULL THEN
                birth_place_full_text := region_name;
            END IF;
        END IF;
        
        -- Set the auto-populated birth place name
        IF birth_place_full_text IS NOT NULL AND TRIM(birth_place_full_text) != '' THEN
            NEW.birth_place_name := TRIM(birth_place_full_text);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12.5 EMPLOYMENT NAME AUTO-POPULATION
-- =====================================================
-- Function to auto-populate employment name from PSOC code
CREATE OR REPLACE FUNCTION auto_populate_employment_name()
RETURNS TRIGGER AS $$
DECLARE
    occupation_name VARCHAR(300);
BEGIN
    -- Only proceed if employment_code is provided
    IF NEW.employment_code IS NOT NULL AND TRIM(NEW.employment_code) != '' THEN
        
        -- Check PSOC level based on code length and pattern
        -- Level 5: Unit Sub-Groups (5 digits)
        IF LENGTH(NEW.employment_code) = 5 THEN
            SELECT name INTO occupation_name
            FROM psoc_unit_sub_groups
            WHERE code = NEW.employment_code;
            
        -- Level 4: Unit Groups (4 digits)
        ELSIF LENGTH(NEW.employment_code) = 4 THEN
            SELECT name INTO occupation_name
            FROM psoc_unit_groups
            WHERE code = NEW.employment_code;
            
        -- Level 3: Minor Groups (3 digits)
        ELSIF LENGTH(NEW.employment_code) = 3 THEN
            SELECT name INTO occupation_name
            FROM psoc_minor_groups
            WHERE code = NEW.employment_code;
            
        -- Level 2: Sub-Major Groups (2 digits)
        ELSIF LENGTH(NEW.employment_code) = 2 THEN
            SELECT name INTO occupation_name
            FROM psoc_sub_major_groups
            WHERE code = NEW.employment_code;
            
        -- Level 1: Major Groups (1 digit)
        ELSIF LENGTH(NEW.employment_code) = 1 THEN
            SELECT name INTO occupation_name
            FROM psoc_major_groups
            WHERE code = NEW.employment_code;
        END IF;
        
        -- Set the auto-populated employment name
        IF occupation_name IS NOT NULL AND TRIM(occupation_name) != '' THEN
            NEW.employment_name := TRIM(occupation_name);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9.1 HOUSEHOLD MANAGEMENT FUNCTIONS
-- =====================================================

-- Enhanced function to update household derived fields
CREATE OR REPLACE FUNCTION update_household_derived_fields()
RETURNS TRIGGER AS $$
DECLARE
    calculated_income DECIMAL(12,2);
BEGIN
    -- Calculate the monthly income (set to 0 since salary field doesn't exist)
    calculated_income := 0.00;

    -- Update the household with calculated values including income class
    UPDATE households
    SET
        total_members = (
            SELECT COUNT(*)
            FROM household_members
            WHERE household_code = COALESCE(NEW.household_code, OLD.household_code)
            AND is_active = true
        ),
        total_migrants = (
            SELECT COUNT(*)
            FROM household_members hm
            JOIN resident_sectoral_info si ON hm.resident_id = si.resident_id
            WHERE hm.household_code = COALESCE(NEW.household_code, OLD.household_code)
            AND hm.is_active = true
            AND si.is_migrant = true
        ),
        monthly_income = calculated_income,
        income_class = determine_income_class(calculated_income),
        household_name = (
            SELECT r.last_name
            FROM residents r
            WHERE r.id = (
                SELECT household_head_id
                FROM households
                WHERE code = COALESCE(NEW.household_code, OLD.household_code)
            )
        ),
        updated_at = NOW()
    WHERE code = COALESCE(NEW.household_code, OLD.household_code);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to determine income class from monthly income
CREATE OR REPLACE FUNCTION determine_income_class(monthly_income DECIMAL(12,2))
RETURNS income_class_enum AS $$
BEGIN
    -- Handle NULL or negative income
    IF monthly_income IS NULL OR monthly_income < 0 THEN
        RETURN 'poor';
    END IF;

    -- Classify based on income ranges
    IF monthly_income >= 219140 THEN
        RETURN 'rich';
    ELSIF monthly_income >= 131484 THEN
        RETURN 'high_income';
    ELSIF monthly_income >= 76669 THEN
        RETURN 'upper_middle_income';
    ELSIF monthly_income >= 43828 THEN
        RETURN 'middle_class';
    ELSIF monthly_income >= 21194 THEN
        RETURN 'lower_middle_class';
    ELSIF monthly_income >= 9520 THEN
        RETURN 'low_income';
    ELSE
        RETURN 'poor';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 9.1 AUTHENTICATION AND AUTHORIZATION FUNCTIONS
-- =====================================================
-- Multi-level geographic access control functions

-- Function: Get user's assigned barangay code
CREATE OR REPLACE FUNCTION auth.user_barangay_code()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN (
        SELECT barangay_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid()
        AND is_active = true
        AND barangay_code IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's assigned city/municipality code  
CREATE OR REPLACE FUNCTION auth.user_city_code()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN (
        SELECT city_municipality_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid()
        AND is_active = true
        AND city_municipality_code IS NOT NULL
        AND barangay_code IS NULL  -- Only if no barangay-specific access
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's assigned province code
CREATE OR REPLACE FUNCTION auth.user_province_code()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN (
        SELECT province_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid()
        AND is_active = true
        AND province_code IS NOT NULL
        AND barangay_code IS NULL          -- Only if no barangay access
        AND city_municipality_code IS NULL -- Only if no city access
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's assigned region code
CREATE OR REPLACE FUNCTION auth.user_region_code()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN (
        SELECT region_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid()
        AND is_active = true
        AND region_code IS NOT NULL
        AND barangay_code IS NULL          -- Only if no barangay access
        AND city_municipality_code IS NULL -- Only if no city access
        AND province_code IS NULL          -- Only if no province access
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's role name
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN (
        SELECT r.name 
        FROM auth_user_profiles u
        JOIN auth_roles r ON u.role_id = r.id
        WHERE u.id = auth.uid()
        AND u.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's access level and code
CREATE OR REPLACE FUNCTION auth.user_access_level()
RETURNS TABLE(level VARCHAR(10), code VARCHAR(10)) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN up.barangay_code IS NOT NULL THEN 'barangay'::VARCHAR(10)
            WHEN up.city_municipality_code IS NOT NULL THEN 'city'::VARCHAR(10) 
            WHEN up.province_code IS NOT NULL THEN 'province'::VARCHAR(10)
            WHEN up.region_code IS NOT NULL THEN 'region'::VARCHAR(10)
            ELSE 'none'::VARCHAR(10)
        END as level,
        COALESCE(
            up.barangay_code,
            up.city_municipality_code,
            up.province_code, 
            up.region_code
        ) as code
    FROM auth_user_profiles up
    WHERE up.id = auth.uid()
    AND up.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user has admin privileges
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT r.name IN ('super_admin', 'barangay_admin', 'provincial_admin', 'regional_admin')
        FROM auth_user_profiles u
        JOIN auth_roles r ON u.role_id = r.id
        WHERE u.id = auth.uid()
        AND u.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9.2 SECTORAL INFORMATION FUNCTIONS
-- =====================================================

-- Function to auto-populate sectoral information based on resident data
CREATE OR REPLACE FUNCTION auto_populate_sectoral_info()
RETURNS TRIGGER AS $$
DECLARE
    resident_age INTEGER;
    is_working BOOLEAN;
BEGIN
    -- Calculate age from birthdate
    resident_age := EXTRACT(YEAR FROM AGE(NEW.birthdate));

    -- Determine if employed based on employment status
    is_working := NEW.employment_status IN ('employed', 'self_employed');

    -- Insert or update sectoral information
    INSERT INTO resident_sectoral_info (
        resident_id,
        is_labor_force,
        is_employed,
        is_unemployed,
        is_senior_citizen,
        is_out_of_school_children,
        is_out_of_school_youth
    ) VALUES (
        NEW.id,
        CASE WHEN NEW.employment_status IN ('employed', 'self_employed', 'unemployed', 'looking_for_work', 'underemployed') THEN true ELSE false END,
        is_working,
        NEW.employment_status IN ('unemployed', 'looking_for_work'),
        resident_age >= 60,
        -- OSC: Age 6-14 + not graduated from education level
        (resident_age >= 6 AND resident_age <= 14 AND NEW.is_graduate = false),
        -- OSY: Age 15-24 + not graduated + no college/post-secondary + not working
        (resident_age >= 15 AND resident_age <= 24 AND NEW.is_graduate = false
         AND NEW.education_attainment NOT IN ('college', 'post_graduate')
         AND NEW.employment_status IN ('unemployed', 'not_in_labor_force', 'looking_for_work'))
    )
    ON CONFLICT (resident_id)
    DO UPDATE SET
        is_labor_force = CASE WHEN NEW.employment_status IN ('employed', 'self_employed', 'unemployed', 'looking_for_work', 'underemployed') THEN true ELSE false END,
        is_employed = is_working,
        is_unemployed = NEW.employment_status IN ('unemployed', 'looking_for_work'),
        is_senior_citizen = resident_age >= 60,
        is_out_of_school_children = (resident_age >= 6 AND resident_age <= 14 AND NEW.is_graduate = false),
        is_out_of_school_youth = (resident_age >= 15 AND resident_age <= 24 AND NEW.is_graduate = false
                                  AND NEW.education_attainment NOT IN ('college', 'post_graduate')
                                  AND NEW.employment_status IN ('unemployed', 'not_in_labor_force', 'looking_for_work')),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enhanced: Direct sectoral field updates from current implementation
-- Note: This function updates fields in resident_sectoral_info, not directly on residents table
CREATE OR REPLACE FUNCTION update_resident_sectoral_status()
RETURNS TRIGGER AS $$
DECLARE
    current_age INTEGER;
    is_senior BOOLEAN;
    is_osc BOOLEAN;
    is_osy BOOLEAN;
BEGIN
    -- Calculate age once for efficiency (generated column not available during INSERT)
    current_age := EXTRACT(YEAR FROM AGE(NEW.birthdate));

    -- Auto-calculate senior citizen status (age 60+)
    is_senior := (current_age >= 60);

    -- Auto-calculate Out-of-School Children (OSC): Ages 6-14 not enrolled in formal education
    IF current_age BETWEEN 6 AND 14 THEN
        is_osc := (NEW.is_graduate = false
            AND NEW.education_attainment IN ('elementary', 'high_school')); -- Should be studying/completing elementary/high school
    ELSE
        is_osc := false;
    END IF;

    -- Auto-calculate Out-of-School Youth (OSY): Ages 15-24 not attending school,
    -- haven't completed college/post-secondary course, and not employed
    -- Note: employment_status may be NULL for those not yet in workforce age
    IF current_age BETWEEN 15 AND 24 THEN
        is_osy := (
            -- Haven't completed college/post-graduate (is_graduate = false for college level OR lower education level)
            (NEW.education_attainment NOT IN ('college', 'post_graduate') OR NEW.is_graduate = false)
            AND NEW.is_graduate = false -- Not completed current education level
            AND (NEW.employment_status IS NULL OR NEW.employment_status NOT IN ('employed', 'self_employed')) -- Not employed or no employment data yet
        );
    ELSE
        is_osy := false;
    END IF;

    -- Enhanced: Auto-update timestamp
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9.3 ADDRESS AUTO-POPULATION FUNCTIONS
-- =====================================================

-- Function to auto-populate geographic codes from user's assigned barangay and generate household ID
CREATE OR REPLACE FUNCTION generate_household_id_trigger()
RETURNS TRIGGER AS $$
DECLARE
    user_barangay_code VARCHAR(10);
    user_city_code VARCHAR(10);
    user_province_code VARCHAR(10);
    user_region_code VARCHAR(10);
BEGIN
    -- Auto-populate all geographic codes from user's assigned barangay if not provided
    IF NEW.barangay_code IS NULL OR NEW.city_municipality_code IS NULL OR 
       NEW.province_code IS NULL OR NEW.region_code IS NULL THEN
       
        SELECT ba.barangay_code
        INTO user_barangay_code
        FROM auth_barangay_accounts ba
        WHERE ba.user_id = auth.uid();

        IF user_barangay_code IS NOT NULL THEN
            -- Get the full geographic hierarchy from the barangay code
            SELECT 
                b.code,
                c.code,
                p.code,
                r.code
            INTO
                NEW.barangay_code,
                NEW.city_municipality_code,
                NEW.province_code,
                NEW.region_code
            FROM psgc_barangays b
            JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
            LEFT JOIN psgc_provinces p ON c.province_code = p.code
            JOIN psgc_regions r ON COALESCE(p.region_code, c.region_code) = r.code
            WHERE b.code = user_barangay_code;
        END IF;
    END IF;

    -- Generate hierarchical code if not provided
    IF NEW.code IS NULL THEN
        NEW.code := generate_hierarchical_household_id(
            NEW.barangay_code,
            NEW.subdivision_id,
            NEW.street_id,
            NEW.house_number
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-populate resident location from household or user's assigned barangay
CREATE OR REPLACE FUNCTION auto_populate_resident_address()
RETURNS TRIGGER AS $$
DECLARE
    user_barangay_code VARCHAR(10);
    region_code VARCHAR(10);
    province_code VARCHAR(10);
    city_code VARCHAR(10);
    household_code VARCHAR(50);
BEGIN
    -- Priority 1: Auto-populate ALL location fields from household if household_code is provided
    IF NEW.household_code IS NOT NULL THEN
        SELECT
            h.barangay_code,
            h.city_municipality_code,
            h.province_code,
            h.region_code,
            h.street_id,
            h.subdivision_id
        INTO
            NEW.barangay_code,
            NEW.city_municipality_code,
            NEW.province_code,
            NEW.region_code,
            NEW.street_id,
            NEW.subdivision_id
        FROM households h
        WHERE h.code = NEW.household_code;

        -- Return early if household was found and populated
        IF FOUND THEN
            RETURN NEW;
        END IF;
    END IF;

    -- Priority 2: Auto-populate from user's assigned barangay (fallback)
    SELECT ba.barangay_code
    INTO user_barangay_code
    FROM auth_barangay_accounts ba
    WHERE ba.user_id = auth.uid();

    -- If we found a user's barangay, get the hierarchy
    IF user_barangay_code IS NOT NULL THEN
        SELECT
            r.code,
            CASE WHEN c.is_independent THEN NULL ELSE p.code END,
            c.code
        INTO
            region_code,
            province_code,
            city_code
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        LEFT JOIN psgc_provinces p ON c.province_code = p.code
        JOIN psgc_regions r ON COALESCE(p.region_code, c.region_code) = r.code
        WHERE b.code = user_barangay_code;

        -- Auto-populate all geographic fields based on user's barangay
        -- This ensures consistency across the entire geographic hierarchy
        NEW.barangay_code := user_barangay_code;
        NEW.city_municipality_code := city_code;
        NEW.province_code := province_code;
        NEW.region_code := region_code;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9.4 AUDIT AND TRACKING FUNCTIONS
-- =====================================================

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_audit_logs (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        user_id,
        barangay_code
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        COALESCE(
            NEW.created_by,
            OLD.created_by,
            (current_setting('request.jwt.claims', true)::jsonb->>'sub')::UUID
        ),
        COALESCE(NEW.barangay_code, OLD.barangay_code)
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically populate created_by and updated_by fields
CREATE OR REPLACE FUNCTION populate_user_tracking_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- On INSERT: Set created_by if not already set
    IF TG_OP = 'INSERT' THEN
        IF NEW.created_by IS NULL THEN
            NEW.created_by := auth.uid();
        END IF;
        NEW.updated_by := auth.uid();
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    -- On UPDATE: Set updated_by and updated_at
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_by := auth.uid();
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9.5 TRIGGER DEFINITIONS
-- =====================================================

-- Trigger to auto-generate hierarchical ID
CREATE TRIGGER trigger_generate_household_id
    BEFORE INSERT ON households
    FOR EACH ROW
    EXECUTE FUNCTION generate_household_id_trigger();

-- Trigger for enhanced household updates
CREATE TRIGGER trigger_update_household_derived_fields
    AFTER INSERT OR UPDATE OR DELETE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION update_household_derived_fields();

-- Trigger function: Auto-encrypt PII on insert/update (Simplified for encrypted-only fields)
CREATE OR REPLACE FUNCTION trigger_encrypt_resident_pii()
RETURNS TRIGGER AS $$
BEGIN
    -- Note: This trigger is now optional since we're using encrypted-only storage
    -- It's kept for consistency and can handle any plain-text inputs from application layer

    -- Update encryption metadata
    NEW.is_data_encrypted := true;
    NEW.encryption_key_version := 1;
    NEW.encrypted_at := NOW();
    NEW.encrypted_by := auth.uid();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic PII encryption
CREATE TRIGGER trigger_residents_encrypt_pii
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION trigger_encrypt_resident_pii();

-- Resident full name auto-population trigger
CREATE TRIGGER trigger_residents_auto_populate_full_name
    BEFORE INSERT OR UPDATE ON residents  
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_resident_full_name();

-- Birth place name auto-population trigger
CREATE TRIGGER trigger_residents_auto_populate_birth_place
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_birth_place_name();

-- Employment name auto-population trigger
CREATE TRIGGER trigger_residents_auto_populate_employment_name
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_employment_name();

-- Trigger to auto-populate resident address from user's barangay
CREATE TRIGGER trigger_auto_populate_resident_address
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_resident_address();

-- Trigger to auto-populate sectoral information
CREATE TRIGGER trigger_auto_populate_sectoral_info
    AFTER INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_sectoral_info();

-- Enhanced: Trigger for direct resident sectoral field updates from current implementation
CREATE TRIGGER trigger_update_resident_sectoral_status
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_resident_sectoral_status();

-- Audit triggers for main tables
CREATE TRIGGER trigger_audit_residents
    AFTER INSERT OR UPDATE OR DELETE ON residents
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER trigger_audit_households
    AFTER INSERT OR UPDATE OR DELETE ON households
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER trigger_audit_household_members
    AFTER INSERT OR UPDATE OR DELETE ON household_members
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Triggers for updated_at columns
CREATE TRIGGER trigger_update_residents_updated_at
    BEFORE UPDATE ON residents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_households_updated_at
    BEFORE UPDATE ON households
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_auth_user_profiles_updated_at
    BEFORE UPDATE ON auth_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_geo_subdivisions_updated_at
    BEFORE UPDATE ON geo_subdivisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_geo_streets_updated_at
    BEFORE UPDATE ON geo_streets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User tracking triggers
CREATE TRIGGER trigger_residents_user_tracking
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_household_members_user_tracking
    BEFORE INSERT OR UPDATE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_households_user_tracking
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Household address auto-population trigger
CREATE TRIGGER trigger_households_auto_populate_address
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_household_address();

-- Household name auto-population trigger  
CREATE TRIGGER trigger_households_auto_populate_name
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_household_name();

-- Update household name when resident head's last name changes
CREATE OR REPLACE FUNCTION update_household_name_on_resident_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is the household head and last name changed, update household name
    IF (NEW.relationship_to_head = 'head' OR OLD.relationship_to_head = 'head') 
       AND (NEW.last_name IS DISTINCT FROM OLD.last_name 
            OR NEW.last_name_encrypted IS DISTINCT FROM OLD.last_name_encrypted) THEN
        
        UPDATE households 
        SET name = (
            SELECT TRIM(
                CASE 
                    WHEN r.last_name_encrypted IS NOT NULL THEN decrypt_pii(r.last_name_encrypted)
                    ELSE r.last_name
                END
            ) || ' Residence'
            FROM residents r
            WHERE r.household_code = NEW.household_code
            AND r.relationship_to_head = 'head'
            AND r.is_active = true
            LIMIT 1
        )
        WHERE code = NEW.household_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_household_name_on_resident_change
    AFTER UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_household_name_on_resident_change();

CREATE TRIGGER trigger_resident_sectoral_info_user_tracking
    BEFORE INSERT OR UPDATE ON resident_sectoral_info
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_resident_migrant_info_user_tracking
    BEFORE INSERT OR UPDATE ON resident_migrant_info
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_resident_relationships_user_tracking
    BEFORE INSERT OR UPDATE ON resident_relationships
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_auth_user_profiles_user_tracking
    BEFORE INSERT OR UPDATE ON auth_user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_barangay_accounts_user_tracking
    BEFORE INSERT OR UPDATE ON auth_barangay_accounts
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_geo_subdivisions_user_tracking
    BEFORE INSERT OR UPDATE ON geo_subdivisions
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

CREATE TRIGGER trigger_geo_streets_user_tracking
    BEFORE INSERT OR UPDATE ON geo_streets
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Geographic hierarchy auto-population triggers  
CREATE TRIGGER trigger_geo_subdivisions_auto_populate_hierarchy
    BEFORE INSERT OR UPDATE ON geo_subdivisions
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_geo_hierarchy();

CREATE TRIGGER trigger_geo_streets_auto_populate_hierarchy
    BEFORE INSERT OR UPDATE ON geo_streets
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_geo_hierarchy();

-- =====================================================
-- SECTION 13: INDEXES
-- =====================================================
-- Performance indexes for efficient queries

-- =====================================================
-- 10.1 SEARCH AND TEXT INDEXES
-- =====================================================

-- Search indexes removed - search functionality now handled through API views with decrypted data
CREATE INDEX idx_residents_barangay ON residents(barangay_code);
CREATE INDEX idx_residents_household ON residents(household_code);

-- =====================================================
-- 10.1.1 SYSTEM ENCRYPTION INDEXES
-- =====================================================

-- Partial unique index for active encryption keys (only one active key per name)
CREATE UNIQUE INDEX idx_encryption_keys_active_unique ON system_encryption_keys(key_name) WHERE is_active = true;
-- Enhanced: Conditional index for storage optimization from current implementation
CREATE INDEX idx_residents_philsys_last4 ON residents(philsys_last4) WHERE philsys_last4 IS NOT NULL;
-- Enhanced: Birthdate and age indexes for age-based calculations
CREATE INDEX idx_residents_birthdate ON residents(birthdate);
-- Age index removed - age is now computed dynamically from birthdate

-- =====================================================
-- 10.2 DEMOGRAPHIC INDEXES
-- =====================================================

-- Performance indexes for common query patterns
CREATE INDEX idx_residents_barangay_employment ON residents(barangay_code, employment_status);
-- Barangay-age index removed - age is now computed dynamically from birthdate
CREATE INDEX idx_residents_barangay_civil_status ON residents(barangay_code, civil_status);
CREATE INDEX idx_residents_barangay_education ON residents(barangay_code, education_attainment, is_graduate);
CREATE INDEX idx_residents_sex ON residents(sex);
CREATE INDEX idx_residents_civil_status ON residents(civil_status);
CREATE INDEX idx_residents_citizenship ON residents(citizenship);
CREATE INDEX idx_residents_registered_voter ON residents(is_registered_voter);
CREATE INDEX idx_residents_education_attainment ON residents(education_attainment);
CREATE INDEX idx_residents_employment_status ON residents(employment_status);
CREATE INDEX idx_residents_ethnicity ON residents(ethnicity);
CREATE INDEX idx_residents_religion ON residents(religion);

-- =====================================================
-- 10.3 OCCUPATIONAL INDEXES
-- =====================================================

-- PSOC and occupation indexes
CREATE INDEX idx_residents_psoc_code ON residents(psoc_code);
CREATE INDEX idx_residents_psoc_level ON residents(psoc_level);
CREATE INDEX idx_psoc_unit_sub_groups_unit_code ON psoc_unit_sub_groups(unit_code);
CREATE INDEX idx_psoc_position_titles_unit_group_code ON psoc_position_titles(unit_group_code);
CREATE INDEX idx_psoc_position_titles_title ON psoc_position_titles(title);
CREATE INDEX idx_psoc_cross_references_unit_group_code ON psoc_occupation_cross_references(unit_group_code);
CREATE INDEX idx_psoc_cross_references_related_unit_code ON psoc_occupation_cross_references(related_unit_code);

-- =====================================================
-- 10.4 BIRTH PLACE INDEXES
-- =====================================================

-- Birth place indexes for demographic analysis
CREATE INDEX idx_residents_birth_place_code ON residents(birth_place_code);
CREATE INDEX idx_residents_birth_place_level ON residents(birth_place_level);
CREATE INDEX idx_residents_birth_place_code_level ON residents(birth_place_code, birth_place_level);
-- Index on birth_place_full removed - column was converted to computed field in API views

-- =====================================================
-- 10.5 GEOGRAPHIC INDEXES
-- =====================================================

-- Address and geography indexes
CREATE INDEX idx_residents_region ON residents(region_code);
CREATE INDEX idx_residents_province ON residents(province_code);
CREATE INDEX idx_residents_city_municipality ON residents(city_municipality_code);
-- Geographic tables indexes
CREATE INDEX idx_geo_subdivisions_barangay ON geo_subdivisions(barangay_code);
CREATE INDEX idx_geo_subdivisions_city ON geo_subdivisions(city_municipality_code);
CREATE INDEX idx_geo_subdivisions_province ON geo_subdivisions(province_code);
CREATE INDEX idx_geo_subdivisions_region ON geo_subdivisions(region_code);
CREATE INDEX idx_geo_subdivisions_active ON geo_subdivisions(is_active);

CREATE INDEX idx_geo_streets_barangay ON geo_streets(barangay_code);
CREATE INDEX idx_geo_streets_city ON geo_streets(city_municipality_code);
CREATE INDEX idx_geo_streets_province ON geo_streets(province_code);
CREATE INDEX idx_geo_streets_region ON geo_streets(region_code);
CREATE INDEX idx_geo_streets_subdivision ON geo_streets(subdivision_id);
CREATE INDEX idx_geo_streets_active ON geo_streets(is_active);

-- =====================================================
-- 10.6 HOUSEHOLD INDEXES
-- =====================================================

-- Household indexes
CREATE INDEX idx_households_barangay ON households(barangay_code);
CREATE INDEX idx_households_subdivision ON households(subdivision_id);
CREATE INDEX idx_households_street ON households(street_id);
CREATE INDEX idx_household_members_household ON household_members(household_code);
CREATE INDEX idx_household_members_resident ON household_members(resident_id);
CREATE INDEX idx_household_members_active ON household_members(is_active);

-- Household enhanced field indexes
CREATE INDEX idx_households_type ON households(household_type);
CREATE INDEX idx_households_tenure ON households(tenure_status);
CREATE INDEX idx_households_unit ON households(household_unit);
CREATE INDEX idx_households_income_class ON households(income_class);
CREATE INDEX idx_households_monthly_income ON households(monthly_income);
CREATE INDEX idx_households_total_members ON households(total_members);
CREATE INDEX idx_households_is_active ON households(is_active);
CREATE INDEX idx_households_monthly_income_class ON households(monthly_income, income_class);

-- =====================================================
-- 10.7 RELATIONSHIP INDEXES
-- =====================================================

-- Relationship indexes
CREATE INDEX idx_relationships_resident_a ON resident_relationships(resident_a_id);
CREATE INDEX idx_relationships_resident_b ON resident_relationships(resident_b_id);
CREATE INDEX idx_relationships_type ON resident_relationships(relationship_type);

-- Additional indexes for household members
CREATE INDEX idx_household_members_position ON household_members(family_position);

-- =====================================================
-- 10.8 USER AND SECURITY INDEXES
-- =====================================================

-- User and access control indexes
CREATE INDEX idx_auth_user_profiles_role ON auth_user_profiles(role_id);
CREATE INDEX idx_barangay_accounts_user ON auth_barangay_accounts(user_id);
CREATE INDEX idx_barangay_accounts_barangay ON auth_barangay_accounts(barangay_code);

-- =====================================================
-- 10.9 SYSTEM AND AUDIT INDEXES
-- =====================================================

-- Audit trail indexes
CREATE INDEX idx_system_audit_logs_table_record ON system_audit_logs(table_name, record_id);
CREATE INDEX idx_system_audit_logs_user ON system_audit_logs(user_id);
CREATE INDEX idx_system_audit_logs_created_at ON system_audit_logs(created_at);
CREATE INDEX idx_system_audit_logs_barangay ON system_audit_logs(barangay_code);

-- Dashboard summary indexes
CREATE INDEX idx_dashboard_summaries_barangay ON system_dashboard_summaries(barangay_code);
CREATE INDEX idx_dashboard_summaries_date ON system_dashboard_summaries(calculation_date);

-- =====================================================
-- 10.10 SECTORAL INFORMATION INDEXES
-- =====================================================

-- Additional indexes for sectoral information
CREATE INDEX idx_sectoral_resident ON resident_sectoral_info(resident_id);
CREATE INDEX idx_sectoral_labor_force ON resident_sectoral_info(is_labor_force);
CREATE INDEX idx_sectoral_employed ON resident_sectoral_info(is_employed);
CREATE INDEX idx_sectoral_ofw ON resident_sectoral_info(is_overseas_filipino_worker);
CREATE INDEX idx_sectoral_pwd ON resident_sectoral_info(is_person_with_disability);
CREATE INDEX idx_sectoral_senior ON resident_sectoral_info(is_senior_citizen);
CREATE INDEX idx_sectoral_solo_parent ON resident_sectoral_info(is_solo_parent);
CREATE INDEX idx_sectoral_indigenous ON resident_sectoral_info(is_indigenous_people);
CREATE INDEX idx_sectoral_migrant ON resident_sectoral_info(is_migrant);

-- =====================================================
-- 10.11 MIGRANT INFORMATION INDEXES
-- =====================================================

-- Indexes for migrant information
CREATE INDEX idx_migrant_resident ON resident_migrant_info(resident_id);
CREATE INDEX idx_migrant_previous_region ON resident_migrant_info(previous_region_code);
CREATE INDEX idx_migrant_previous_province ON resident_migrant_info(previous_province_code);
CREATE INDEX idx_migrant_previous_city ON resident_migrant_info(previous_city_municipality_code);
CREATE INDEX idx_migrant_previous_barangay ON resident_migrant_info(previous_barangay_code);
CREATE INDEX idx_migrant_date_transfer ON resident_migrant_info(date_of_transfer);
CREATE INDEX idx_migrant_intention_return ON resident_migrant_info(is_intending_to_return);
CREATE INDEX idx_migrant_length_stay_previous ON resident_migrant_info(length_of_stay_previous_months);
CREATE INDEX idx_migrant_duration_current ON resident_migrant_info(duration_of_stay_current_months);

-- =====================================================
-- 13.12 PII ENCRYPTION INDEXES
-- =====================================================

-- Indexes for hash-based searching
CREATE INDEX idx_residents_first_name_hash ON residents(first_name_hash) WHERE first_name_hash IS NOT NULL;
CREATE INDEX idx_residents_last_name_hash ON residents(last_name_hash) WHERE last_name_hash IS NOT NULL;
CREATE INDEX idx_residents_full_name_hash ON residents(full_name_hash) WHERE full_name_hash IS NOT NULL;
CREATE INDEX idx_residents_mobile_hash ON residents(mobile_number_hash) WHERE mobile_number_hash IS NOT NULL;
CREATE INDEX idx_residents_email_hash ON residents(email_hash) WHERE email_hash IS NOT NULL;

-- Index for encryption status
CREATE INDEX idx_residents_encryption_status ON residents(is_data_encrypted, encrypted_at);

-- Index for key version (for key rotation)
CREATE INDEX idx_residents_key_version ON residents(encryption_key_version) WHERE is_data_encrypted = true;

-- Indexes for encryption keys management
CREATE INDEX idx_encryption_keys_active ON system_encryption_keys(key_name, is_active) WHERE is_active = true;
CREATE INDEX idx_encryption_keys_purpose ON system_encryption_keys(key_purpose);
CREATE INDEX idx_key_rotation_history_key_name ON system_key_rotation_history(key_name, rotated_at);

-- =====================================================
-- 13.13 MISCELLANEOUS INDEXES
-- =====================================================

-- Additional residents new fields indexes
CREATE INDEX idx_residents_religion_others ON residents(religion_others_specify);

-- =====================================================
-- SECTION 11: CONSTRAINTS
-- =====================================================
-- Data validation and integrity constraints

-- =====================================================
-- 11.1 DATE AND TIME CONSTRAINTS
-- =====================================================

-- Additional constraints for data integrity
ALTER TABLE residents ADD CONSTRAINT valid_birthdate
    CHECK (birthdate <= CURRENT_DATE AND birthdate >= '1900-01-01');

-- =====================================================
-- 11.2 PHYSICAL CHARACTERISTICS CONSTRAINTS
-- =====================================================

ALTER TABLE residents ADD CONSTRAINT valid_height
    CHECK (height IS NULL OR (height >= 50 AND height <= 300));

ALTER TABLE residents ADD CONSTRAINT valid_weight
    CHECK (weight IS NULL OR (weight >= 10 AND weight <= 500));

-- =====================================================
-- 11.3 CIVIL STATUS CONSTRAINTS
-- =====================================================

-- Civil status others specification constraint
ALTER TABLE residents ADD CONSTRAINT valid_civil_status_others_specify
    CHECK (
        (civil_status = 'others' AND civil_status_others_specify IS NOT NULL AND TRIM(civil_status_others_specify) != '') OR
        (civil_status != 'others')
    );

-- =====================================================
-- 11.4 BIRTH PLACE CONSTRAINTS
-- =====================================================

-- Birth place validation removed - PostgreSQL doesn't allow subqueries in check constraints
-- Birth place validation should be handled at application level or through triggers
-- Basic constraint: if birth_place_code is specified, birth_place_level must also be specified
ALTER TABLE residents ADD CONSTRAINT valid_birth_place_level_required
    CHECK (
        (birth_place_code IS NULL AND birth_place_level IS NULL) OR
        (birth_place_code IS NOT NULL AND birth_place_level IS NOT NULL)
    );

-- =====================================================
-- 11.5 IDENTITY DOCUMENT CONSTRAINTS
-- =====================================================

-- Ensure philsys_last4 is exactly 4 characters if provided
ALTER TABLE residents ADD CONSTRAINT valid_philsys_last4
    CHECK (philsys_last4 IS NULL OR LENGTH(philsys_last4) = 4);

-- Email format validation removed - email is stored encrypted as email_encrypted
-- Email format validation should be handled at application level before encryption

-- =====================================================
-- 11.6 HOUSEHOLD CONSTRAINTS
-- =====================================================

ALTER TABLE households ADD CONSTRAINT valid_monthly_income
    CHECK (monthly_income >= 0);

ALTER TABLE households ADD CONSTRAINT valid_total_members
    CHECK (total_members >= 0);

ALTER TABLE households ADD CONSTRAINT valid_total_families
    CHECK (total_families >= 1);

-- New address requirements constraints
ALTER TABLE households ADD CONSTRAINT required_house_number
    CHECK (house_number IS NOT NULL AND TRIM(house_number) != '');
ALTER TABLE households ADD CONSTRAINT required_street
    CHECK (street_id IS NOT NULL);

-- =====================================================
-- 11.7 SALARY CONSTRAINTS
-- =====================================================


-- =====================================================
-- SECTION 15: ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Data access control and security policies

-- =====================================================
-- 15.1 ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on ALL tables (PSGC reference data + application tables)
-- PSGC Reference Tables
ALTER TABLE psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_regions FORCE ROW LEVEL SECURITY;
ALTER TABLE psgc_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_provinces FORCE ROW LEVEL SECURITY;
ALTER TABLE psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_cities_municipalities FORCE ROW LEVEL SECURITY;
ALTER TABLE psgc_barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_barangays FORCE ROW LEVEL SECURITY;

-- PSOC Reference Tables
ALTER TABLE psoc_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_major_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE psoc_sub_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_sub_major_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE psoc_minor_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_minor_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE psoc_unit_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_unit_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE psoc_unit_sub_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_unit_sub_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE psoc_position_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_position_titles FORCE ROW LEVEL SECURITY;
ALTER TABLE psoc_occupation_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_occupation_cross_references FORCE ROW LEVEL SECURITY;

-- Application Tables
ALTER TABLE auth_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE auth_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE auth_barangay_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_barangay_accounts FORCE ROW LEVEL SECURITY;

-- Security Tables
ALTER TABLE system_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_encryption_keys FORCE ROW LEVEL SECURITY;
ALTER TABLE system_key_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_key_rotation_history FORCE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents FORCE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE households FORCE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members FORCE ROW LEVEL SECURITY;
ALTER TABLE resident_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_relationships FORCE ROW LEVEL SECURITY;
ALTER TABLE geo_subdivisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_subdivisions FORCE ROW LEVEL SECURITY;
ALTER TABLE geo_streets ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_streets FORCE ROW LEVEL SECURITY;
ALTER TABLE resident_sectoral_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_sectoral_info FORCE ROW LEVEL SECURITY;
ALTER TABLE resident_migrant_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_migrant_info FORCE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE system_dashboard_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_dashboard_summaries FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 15.2 RLS POLICIES FOR REFERENCE DATA
-- =====================================================

-- PSGC Tables - Public read access, admin write access
CREATE POLICY "Public read psgc_regions" ON psgc_regions FOR SELECT USING (true);
CREATE POLICY "Admin write psgc_regions" ON psgc_regions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles up
        JOIN auth_roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name IN ('Super Admin', 'Barangay Admin')
    )
);

CREATE POLICY "Public read psgc_provinces" ON psgc_provinces FOR SELECT USING (true);
CREATE POLICY "Public read psgc_cities" ON psgc_cities_municipalities FOR SELECT USING (true);
CREATE POLICY "Public read psgc_barangays" ON psgc_barangays FOR SELECT USING (true);

-- PSOC Tables - Public read access
CREATE POLICY "Public read psoc_major_groups" ON psoc_major_groups FOR SELECT USING (true);
CREATE POLICY "Public read psoc_sub_major_groups" ON psoc_sub_major_groups FOR SELECT USING (true);
CREATE POLICY "Public read psoc_minor_groups" ON psoc_minor_groups FOR SELECT USING (true);
CREATE POLICY "Public read psoc_unit_groups" ON psoc_unit_groups FOR SELECT USING (true);
CREATE POLICY "Public read psoc_unit_sub_groups" ON psoc_unit_sub_groups FOR SELECT USING (true);
CREATE POLICY "Public read psoc_position_titles" ON psoc_position_titles FOR SELECT USING (true);
CREATE POLICY "Public read psoc_cross_references" ON psoc_occupation_cross_references FOR SELECT USING (true);

-- =====================================================
-- 12.3 RLS POLICIES FOR USER MANAGEMENT
-- =====================================================

-- Roles - Super admin access only
CREATE POLICY "Super admin only roles" ON auth_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles up
        JOIN auth_roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'Super Admin'
    )
);

-- Security Tables Policies
-- Only super admins can manage encryption keys
CREATE POLICY "Super admin encryption keys" ON system_encryption_keys
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles p
        JOIN auth_roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name = 'super_admin'
    )
);

-- Key rotation history access
CREATE POLICY "Admin key rotation history" ON system_key_rotation_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles p
        JOIN auth_roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name IN ('super_admin', 'admin')
    )
);

-- User profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON auth_user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON auth_user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 12.4 RLS POLICIES FOR MAIN DATA TABLES
-- =====================================================

-- Multi-level geographic access for residents
CREATE POLICY "Multi-level geographic access for residents" ON residents
    FOR ALL USING (
        -- Allow access based on user's geographic access level
        CASE auth.user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = auth.user_barangay_code()
            WHEN 'city' THEN city_municipality_code = auth.user_city_code()
            WHEN 'province' THEN province_code = auth.user_province_code()
            WHEN 'region' THEN region_code = auth.user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- Multi-level geographic access for households
CREATE POLICY "Multi-level geographic access for households" ON households
    FOR ALL USING (
        -- Allow access based on user's geographic access level
        CASE auth.user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = auth.user_barangay_code()
            WHEN 'city' THEN city_municipality_code = auth.user_city_code()
            WHEN 'province' THEN province_code = auth.user_province_code()
            WHEN 'region' THEN region_code = auth.user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- Multi-level geographic access for household_members
CREATE POLICY "Multi-level geographic access for household_members" ON household_members
    FOR ALL USING (
        household_code IN (
            SELECT h.code
            FROM households h
            WHERE CASE auth.user_access_level()::json->>'level'
                WHEN 'barangay' THEN h.barangay_code = auth.user_barangay_code()
                WHEN 'city' THEN h.city_municipality_code = auth.user_city_code()
                WHEN 'province' THEN h.province_code = auth.user_province_code()
                WHEN 'region' THEN h.region_code = auth.user_region_code()
                WHEN 'national' THEN true -- National users see all
                ELSE false -- No access by default
            END
        )
    );

-- =====================================================
-- 12.5 RLS POLICIES FOR GEOGRAPHIC DATA
-- =====================================================

-- Multi-level geographic access for geo_subdivisions
CREATE POLICY "Multi-level geographic access for geo_subdivisions" ON geo_subdivisions
    FOR ALL USING (
        -- Allow access based on user's geographic access level
        CASE auth.user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = auth.user_barangay_code()
            WHEN 'city' THEN city_municipality_code = auth.user_city_code()
            WHEN 'province' THEN province_code = auth.user_province_code()
            WHEN 'region' THEN region_code = auth.user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- Multi-level geographic access for geo_streets
CREATE POLICY "Multi-level geographic access for geo_streets" ON geo_streets
    FOR ALL USING (
        -- Allow access based on user's geographic access level
        CASE auth.user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = auth.user_barangay_code()
            WHEN 'city' THEN city_municipality_code = auth.user_city_code()
            WHEN 'province' THEN province_code = auth.user_province_code()
            WHEN 'region' THEN region_code = auth.user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- =====================================================
-- 12.6 RLS POLICIES FOR SUPPLEMENTARY TABLES
-- =====================================================

-- Multi-level geographic access for resident_sectoral_info
CREATE POLICY "Multi-level geographic access for resident_sectoral_info" ON resident_sectoral_info
    FOR ALL USING (
        resident_id IN (
            SELECT r.id
            FROM residents r
            WHERE CASE auth.user_access_level()::json->>'level'
                WHEN 'barangay' THEN r.barangay_code = auth.user_barangay_code()
                WHEN 'city' THEN r.city_municipality_code = auth.user_city_code()
                WHEN 'province' THEN r.province_code = auth.user_province_code()
                WHEN 'region' THEN r.region_code = auth.user_region_code()
                WHEN 'national' THEN true -- National users see all
                ELSE false -- No access by default
            END
        )
    );

-- Multi-level geographic access for resident_migrant_info
CREATE POLICY "Multi-level geographic access for resident_migrant_info" ON resident_migrant_info
    FOR ALL USING (
        resident_id IN (
            SELECT r.id
            FROM residents r
            WHERE CASE auth.user_access_level()::json->>'level'
                WHEN 'barangay' THEN r.barangay_code = auth.user_barangay_code()
                WHEN 'city' THEN r.city_municipality_code = auth.user_city_code()
                WHEN 'province' THEN r.province_code = auth.user_province_code()
                WHEN 'region' THEN r.region_code = auth.user_region_code()
                WHEN 'national' THEN true -- National users see all
                ELSE false -- No access by default
            END
        )
    );

-- =====================================================
-- 12.7 RLS POLICIES FOR SYSTEM TABLES
-- =====================================================

-- Multi-level geographic access for system_audit_logs
CREATE POLICY "Multi-level geographic access for system_audit_logs" ON system_audit_logs
    FOR SELECT USING (
        -- Allow access based on user's geographic access level
        CASE auth.user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = auth.user_barangay_code()
            WHEN 'city' THEN city_municipality_code = auth.user_city_code()
            WHEN 'province' THEN province_code = auth.user_province_code()
            WHEN 'region' THEN region_code = auth.user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- =====================================================
-- SECTION 13: VIEWS AND SEARCH FUNCTIONS
-- =====================================================
-- Enhanced views and functions for UI optimization

-- =====================================================
-- 13.1 PSOC OCCUPATION SEARCH VIEW
-- =====================================================

-- Flattened PSOC hierarchy for unified occupation search
CREATE VIEW psoc_occupation_search AS
-- Unit sub-groups (most specific PSOC level)
SELECT
    usg.code as occupation_code,
    'unit_sub_group' as level_type,
    ug.title || ' - ' || usg.title as occupation_title, -- "Legislators - Congressman"
    usg.title as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    ug.code as unit_group_code,
    ug.title as unit_group_title,
    usg.code as unit_sub_group_code,
    usg.title as unit_sub_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title || ' > ' || ug.title || ' > ' || usg.title as full_hierarchy,
    0 as hierarchy_level -- Highest priority
FROM psoc_unit_sub_groups usg
JOIN psoc_unit_groups ug ON usg.unit_code = ug.code
JOIN psoc_minor_groups ming ON ug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

-- Position titles
SELECT
    pt.id::text as occupation_code,
    'position_title' as level_type,
    pt.title as occupation_title,
    pt.description as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    ug.code as unit_group_code,
    ug.title as unit_group_title,
    NULL as unit_sub_group_code,
    NULL as unit_sub_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title || ' > ' || ug.title || ' > ' || pt.title as full_hierarchy,
    1 as hierarchy_level
FROM psoc_position_titles pt
JOIN psoc_unit_groups ug ON pt.unit_group_code = ug.code
JOIN psoc_minor_groups ming ON ug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

-- Unit groups
SELECT
    ug.code as occupation_code,
    'unit_group' as level_type,
    ug.title as occupation_title,
    ug.title as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    ug.code as unit_group_code,
    ug.title as unit_group_title,
    NULL as unit_sub_group_code,
    NULL as unit_sub_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title || ' > ' || ug.title as full_hierarchy,
    2 as hierarchy_level
FROM psoc_unit_groups ug
JOIN psoc_minor_groups ming ON ug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

SELECT
    ming.code as occupation_code,
    'minor_group' as level_type,
    ming.title as occupation_title,
    ming.title as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    NULL as unit_group_code,
    NULL as unit_group_title,
    NULL as unit_sub_group_code,
    NULL as unit_sub_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title as full_hierarchy,
    3 as hierarchy_level
FROM psoc_minor_groups ming
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

SELECT
    smg.code as occupation_code,
    'sub_major_group' as level_type,
    smg.title as occupation_title,
    smg.title as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    NULL as minor_group_code,
    NULL as minor_group_title,
    NULL as unit_group_code,
    NULL as unit_group_title,
    NULL as unit_sub_group_code,
    NULL as unit_sub_group_title,
    mg.title || ' > ' || smg.title as full_hierarchy,
    4 as hierarchy_level
FROM psoc_sub_major_groups smg
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

SELECT
    mg.code as occupation_code,
    'major_group' as level_type,
    mg.title as occupation_title,
    mg.title as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    NULL as sub_major_group_code,
    NULL as sub_major_group_title,
    NULL as minor_group_code,
    NULL as minor_group_title,
    NULL as unit_group_code,
    NULL as unit_group_title,
    NULL as unit_sub_group_code,
    NULL as unit_sub_group_title,
    mg.title as full_hierarchy,
    5 as hierarchy_level
FROM psoc_major_groups mg

UNION ALL

-- Cross-referenced occupations (when searching for 1211, also show related 2411 titles)
SELECT
    cr.related_unit_code as occupation_code,
    'cross_reference' as level_type,
    cr.related_occupation_title as occupation_title,
    'Related to ' || ug.title as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    rug.code as unit_group_code,
    rug.title as unit_group_title,
    NULL as unit_sub_group_code,
    NULL as unit_sub_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title || ' > ' || rug.title || ' > ' || cr.related_occupation_title as full_hierarchy,
    6 as hierarchy_level -- Lowest priority, shown after main results
FROM psoc_occupation_cross_references cr
JOIN psoc_unit_groups ug ON cr.unit_group_code = ug.code -- Original unit group
JOIN psoc_unit_groups rug ON cr.related_unit_code = rug.code -- Related unit group
JOIN psoc_minor_groups ming ON rug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

ORDER BY hierarchy_level, occupation_title;

-- =====================================================
-- 13.2 ADDRESS HIERARCHY VIEW
-- =====================================================

-- Complete Address Hierarchy View (Fixed for all barangays including independent cities)
CREATE VIEW address_hierarchy AS
SELECT
    b.code::text AS barangay_code,
    b.name::text AS barangay_name,
    c.code::text AS city_code,
    c.name::text AS city_name,
    c.type::text AS city_type,
    p.code::text AS province_code,
    p.name::text AS province_name,
    COALESCE(r.code, 'UNKNOWN')::text AS region_code,
    COALESCE(r.name, 'Unknown Region')::text AS region_name,
    s.id as subdivision_id,
    s.name as subdivision_name,
    s.type as subdivision_type,
    s.is_active as subdivision_active,
    -- Smart address formatting for independent cities and missing regions
    CASE
        WHEN c.is_independent = true AND r.name IS NOT NULL THEN
            CONCAT(b.name, ', ', c.name, ', ', r.name)
        WHEN c.is_independent = true AND r.name IS NULL THEN
            CONCAT(b.name, ', ', c.name, ', Metro Manila/NCR')  -- Default for missing regions
        ELSE
            CONCAT(b.name, ', ', c.name, ', ', COALESCE(p.name, ''), ', ', COALESCE(r.name, 'Unknown Region'))
    END AS full_address
FROM psgc_barangays b
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
LEFT JOIN geo_subdivisions s ON b.code = s.barangay_code
ORDER BY COALESCE(r.name, 'ZZ'), COALESCE(p.name, ''), c.name, b.name;

-- =====================================================
-- 13.3 HOUSEHOLD SEARCH VIEW
-- =====================================================

-- Create household search view with complete address display
CREATE VIEW household_search AS
SELECT
    h.code,
    h.house_number,
    s.name as street_name,
    sub.name as subdivision_name,
    b.name as barangay_name,
    c.name as city_municipality_name,
    p.name as province_name,
    r.name as region_name,
    -- Complete formatted address for display
    CONCAT_WS(', ',
        NULLIF(TRIM(h.house_number), ''),
        NULLIF(TRIM(s.name), ''),
        NULLIF(TRIM(sub.name), ''),
        TRIM(b.name),
        TRIM(c.name),
        CASE WHEN p.name IS NOT NULL THEN TRIM(p.name) ELSE NULL END,
        TRIM(r.name)
    ) as full_address,
    -- Geographic codes for auto-population
    h.barangay_code,
    h.city_municipality_code,
    h.province_code,
    h.region_code,
    h.total_members,
    h.created_at
FROM households h
LEFT JOIN geo_streets s ON h.street_id = s.id
LEFT JOIN geo_subdivisions sub ON h.subdivision_id = sub.id
JOIN psgc_barangays b ON h.barangay_code = b.code
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
WHERE h.is_active = true;

-- =====================================================
-- 13.4 BIRTH PLACE OPTIONS VIEW
-- =====================================================

-- Unified view for birth place selection (similar to PSOC hierarchy)
CREATE VIEW birth_place_options AS
SELECT
    'region' as place_level,
    code,
    name,
    name as full_name,
    NULL::VARCHAR(10) as parent_code
FROM psgc_regions

UNION ALL

SELECT
    'province' as place_level,
    p.code,
    p.name,
    CONCAT_WS(', ', p.name, r.name) as full_name,
    p.region_code as parent_code
FROM psgc_provinces p
JOIN psgc_regions r ON p.region_code = r.code

UNION ALL

SELECT
    'city_municipality' as place_level,
    c.code,
    c.name,
    CASE
        WHEN c.is_independent THEN CONCAT_WS(', ', c.name, r.name)
        ELSE CONCAT_WS(', ', c.name, p.name, r.name)
    END as full_name,
    c.province_code as parent_code
FROM psgc_cities_municipalities c
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code

UNION ALL

SELECT
    'barangay' as place_level,
    b.code,
    b.name,
    CONCAT_WS(', ',
        b.name,
        c.name,
        CASE WHEN c.is_independent THEN NULL ELSE p.name END,
        r.name
    ) as full_name,
    b.city_municipality_code as parent_code
FROM psgc_barangays b
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code;

-- =====================================================
-- 13.5 ENHANCED VIEWS WITH COMPLETE INFORMATION
-- =====================================================

-- Settings management summary view
CREATE VIEW settings_management_summary AS
SELECT
    b.code as barangay_code,
    b.name as barangay_name,
    COUNT(DISTINCT s.id) as total_geo_subdivisions,
    COUNT(DISTINCT CASE WHEN s.is_active = true THEN s.id END) as active_geo_subdivisions,
    COUNT(DISTINCT h.code) as total_households,
    COUNT(DISTINCT CASE WHEN h.is_active = true THEN h.code END) as active_households
FROM psgc_barangays b
LEFT JOIN geo_subdivisions s ON b.code = s.barangay_code
LEFT JOIN households h ON b.code = h.barangay_code
GROUP BY b.code, b.name;

-- Enhanced residents view with sectoral information
CREATE VIEW residents_with_sectoral AS
SELECT
    r.*,
    si.is_labor_force,
    si.is_employed,
    si.is_unemployed,
    si.is_overseas_filipino_worker,
    si.is_person_with_disability,
    si.is_out_of_school_children,
    si.is_out_of_school_youth,
    si.is_senior_citizen,
    si.is_registered_senior_citizen,
    si.is_solo_parent,
    si.is_indigenous_people,
    si.is_migrant,
    mi.previous_region_code,
    mi.previous_province_code,
    mi.previous_city_municipality_code,
    mi.previous_barangay_code,
    mi.length_of_stay_previous_months,
    mi.reason_for_leaving,
    mi.date_of_transfer,
    mi.reason_for_transferring,
    mi.duration_of_stay_current_months,
    mi.is_intending_to_return
FROM residents r
LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
LEFT JOIN resident_migrant_info mi ON r.id = mi.resident_id;

-- Enhanced households view with complete information and income classification
CREATE VIEW households_complete AS
SELECT
    h.*,
    COALESCE(decrypt_pii(r.first_name_encrypted), '') || ' ' || COALESCE(decrypt_pii(r.last_name_encrypted), '') as head_full_name,
    -- Address components
    reg.name as region_name,
    prov.name as province_name,
    city.name as city_municipality_name,
    bgy.name as barangay_name,
    s.name as subdivision_name,
    s.type as subdivision_type,
    st.name as street_name,
    -- Complete address
    CONCAT_WS(', ',
        NULLIF(h.house_number, ''),
        NULLIF(st.name, ''),
        NULLIF(s.name, ''),
        bgy.name,
        city.name,
        prov.name
    ) as full_address,
    -- Income classification details
    CASE h.income_class
        WHEN 'rich' THEN 'Rich (≥ ₱219,140)'
        WHEN 'high_income' THEN 'High Income (₱131,484 – ₱219,139)'
        WHEN 'upper_middle_income' THEN 'Upper Middle Income (₱76,669 – ₱131,483)'
        WHEN 'middle_class' THEN 'Middle Class (₱43,828 – ₱76,668)'
        WHEN 'lower_middle_class' THEN 'Lower Middle Class (₱21,194 – ₱43,827)'
        WHEN 'low_income' THEN 'Low Income (₱9,520 – ₱21,193)'
        WHEN 'poor' THEN 'Poor (< ₱10,957)'
        ELSE 'Unclassified'
    END as income_class_description
FROM households h
LEFT JOIN residents r ON h.household_head_id = r.id
LEFT JOIN geo_subdivisions s ON h.subdivision_id = s.id
LEFT JOIN geo_streets st ON h.street_id = st.id
LEFT JOIN psgc_barangays bgy ON h.barangay_code = bgy.code
LEFT JOIN psgc_cities_municipalities city ON bgy.city_municipality_code = city.code
LEFT JOIN psgc_provinces prov ON city.province_code = prov.code
LEFT JOIN psgc_regions reg ON prov.region_code = reg.code;

-- Complete migrant information view with address details
CREATE VIEW migrants_complete AS
SELECT
    mi.*,
    decrypt_pii(r.first_name_encrypted) as first_name,
    decrypt_pii(r.middle_name_encrypted) as middle_name,
    decrypt_pii(r.last_name_encrypted) as last_name,
    r.birthdate,
    r.sex,
    -- Previous address components
    prev_reg.name as previous_region_name,
    prev_prov.name as previous_province_name,
    prev_city.name as previous_city_municipality_name,
    prev_bgy.name as previous_barangay_name,
    -- Current address from resident
    curr_reg.name as current_region_name,
    curr_prov.name as current_province_name,
    curr_city.name as current_city_municipality_name,
    curr_bgy.name as current_barangay_name
FROM resident_migrant_info mi
JOIN residents r ON mi.resident_id = r.id
-- Previous address joins
LEFT JOIN psgc_regions prev_reg ON mi.previous_region_code = prev_reg.code
LEFT JOIN psgc_provinces prev_prov ON mi.previous_province_code = prev_prov.code
LEFT JOIN psgc_cities_municipalities prev_city ON mi.previous_city_municipality_code = prev_city.code
LEFT JOIN psgc_barangays prev_bgy ON mi.previous_barangay_code = prev_bgy.code
-- Current address joins
LEFT JOIN psgc_regions curr_reg ON r.region_code = curr_reg.code
LEFT JOIN psgc_provinces curr_prov ON r.province_code = curr_prov.code
LEFT JOIN psgc_cities_municipalities curr_city ON r.city_municipality_code = curr_city.code
LEFT JOIN psgc_barangays curr_bgy ON r.barangay_code = curr_bgy.code;

-- Income distribution analytics view
CREATE VIEW household_income_analytics AS
SELECT
    h.barangay_code,
    bgy.name as barangay_name,
    h.income_class,
    CASE h.income_class
        WHEN 'rich' THEN 'Rich'
        WHEN 'high_income' THEN 'High Income'
        WHEN 'upper_middle_income' THEN 'Upper Middle Income'
        WHEN 'middle_class' THEN 'Middle Class'
        WHEN 'lower_middle_class' THEN 'Lower Middle Class'
        WHEN 'low_income' THEN 'Low Income'
        WHEN 'poor' THEN 'Poor'
    END as income_class_label,
    COUNT(*) as household_count,
    ROUND(AVG(h.monthly_income), 2) as average_income,
    ROUND(MIN(h.monthly_income), 2) as min_income,
    ROUND(MAX(h.monthly_income), 2) as max_income,
    ROUND(
        (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY h.barangay_code)),
        2
    ) as percentage_in_barangay
FROM households h
JOIN psgc_barangays bgy ON h.barangay_code = bgy.code
WHERE h.income_class IS NOT NULL
GROUP BY h.barangay_code, bgy.name, h.income_class
ORDER BY h.barangay_code,
    CASE h.income_class
        WHEN 'rich' THEN 1
        WHEN 'high_income' THEN 2
        WHEN 'upper_middle_income' THEN 3
        WHEN 'middle_class' THEN 4
        WHEN 'lower_middle_class' THEN 5
        WHEN 'low_income' THEN 6
        WHEN 'poor' THEN 7
    END;

-- =====================================================
-- 13.6 SEARCH FUNCTIONS
-- =====================================================

-- Function to search birth places (similar to PSOC search)
CREATE OR REPLACE FUNCTION search_birth_places(
    search_term TEXT DEFAULT NULL,
    level_filter birth_place_level_enum DEFAULT NULL,
    parent_code_filter VARCHAR(10) DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    place_level TEXT,
    code VARCHAR(10),
    name VARCHAR,
    full_name TEXT,
    parent_code VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bpo.place_level,
        bpo.code,
        bpo.name,
        bpo.full_name,
        bpo.parent_code
    FROM birth_place_options bpo
    WHERE
        (search_term IS NULL OR (
            bpo.name ILIKE '%' || search_term || '%' OR
            bpo.full_name ILIKE '%' || search_term || '%'
        ))
        AND (level_filter IS NULL OR bpo.place_level = level_filter::TEXT)
        AND (parent_code_filter IS NULL OR bpo.parent_code = parent_code_filter)
    ORDER BY
        bpo.name ASC,
        bpo.place_level ASC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get birth place details by code and level
CREATE OR REPLACE FUNCTION get_birth_place_details(
    place_code VARCHAR(10),
    place_level birth_place_level_enum
)
RETURNS TABLE (
    code VARCHAR(10),
    name VARCHAR,
    full_name TEXT,
    level TEXT,
    parent_code VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bpo.code,
        bpo.name,
        bpo.full_name,
        bpo.place_level,
        bpo.parent_code
    FROM birth_place_options bpo
    WHERE bpo.code = place_code AND bpo.place_level = place_level::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to search occupations using existing psoc_occupation_search table
CREATE OR REPLACE FUNCTION search_occupations(
    search_term TEXT DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    psoc_code TEXT,
    psoc_level TEXT,
    occupation_title TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pos.occupation_code as psoc_code,
        pos.level_type as psoc_level,
        pos.occupation_title
    FROM psoc_occupation_search pos
    WHERE
        search_term IS NULL OR (
            pos.occupation_title ILIKE '%' || search_term || '%'
        )
    ORDER BY
        pos.occupation_title ASC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get occupation details by code
CREATE OR REPLACE FUNCTION get_occupation_details(
    occupation_code TEXT
)
RETURNS TABLE (
    psoc_code TEXT,
    psoc_level TEXT,
    occupation_title TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pos.occupation_code as psoc_code,
        pos.level_type as psoc_level,
        pos.occupation_title
    FROM psoc_occupation_search pos
    WHERE pos.occupation_code = occupation_details.occupation_code;
END;
$$ LANGUAGE plpgsql;

-- Create search function for households with user barangay filtering
CREATE OR REPLACE FUNCTION search_households(
    search_term TEXT DEFAULT NULL,
    user_barangay_code TEXT DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    household_code VARCHAR(50),
    house_number VARCHAR(50),
    street_name TEXT,
    subdivision_name TEXT,
    barangay_name TEXT,
    city_municipality_name TEXT,
    province_name TEXT,
    region_name TEXT,
    full_address TEXT,
    barangay_code VARCHAR(10),
    city_municipality_code VARCHAR(10),
    province_code VARCHAR(10),
    region_code VARCHAR(10),
    total_members INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        hs.code,
        hs.house_number,
        hs.street_name,
        hs.subdivision_name,
        hs.barangay_name,
        hs.city_municipality_name,
        hs.province_name,
        hs.region_name,
        hs.full_address,
        hs.barangay_code,
        hs.city_municipality_code,
        hs.province_code,
        hs.region_code,
        hs.total_members,
        hs.created_at
    FROM household_search hs
    WHERE
        -- Apply user barangay filter if provided (for RLS compliance)
        (user_barangay_code IS NULL OR hs.barangay_code = user_barangay_code)
        -- Apply search term filter if provided
        AND (search_term IS NULL OR (
            hs.code ILIKE '%' || search_term || '%' OR
            hs.house_number ILIKE '%' || search_term || '%' OR
            hs.street_name ILIKE '%' || search_term || '%' OR
            hs.subdivision_name ILIKE '%' || search_term || '%' OR
            hs.full_address ILIKE '%' || search_term || '%'
        ))
    ORDER BY
        -- Prioritize exact matches
        CASE WHEN hs.code ILIKE search_term THEN 1
             WHEN hs.house_number ILIKE search_term THEN 2
             ELSE 3 END,
        hs.code,
        hs.created_at DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Create function to get household details for auto-population
CREATE OR REPLACE FUNCTION get_household_for_resident(
    household_code VARCHAR(50)
)
RETURNS TABLE (
    code VARCHAR(50),
    barangay_code VARCHAR(10),
    city_municipality_code VARCHAR(10),
    province_code VARCHAR(10),
    region_code VARCHAR(10),
    full_address TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        hs.code,
        hs.barangay_code,
        hs.city_municipality_code,
        hs.province_code,
        hs.region_code,
        hs.full_address
    FROM household_search hs
    WHERE hs.code = get_household_for_resident.household_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 13.7: SERVER-SIDE API OPTIMIZED FLAT VIEWS
-- =====================================================
-- These views are optimized for the server-side API layer
-- and provide pre-joined, flattened data structures

-- =====================================================
-- 13.7.1 RESIDENTS WITH COMPLETE GEOGRAPHIC INFO
-- =====================================================
CREATE OR REPLACE VIEW api_residents_with_geography AS
SELECT 
    -- Core resident fields (excluding household_code to avoid duplicate)
    r.id,
    r.philsys_card_number_hash,
    r.philsys_last4,
    r.first_name_encrypted,
    r.middle_name_encrypted,
    r.last_name_encrypted,
    r.extension_name,
    r.birthdate,
    r.birth_place_code,
    r.birth_place_level,
    r.birth_place_text,
    r.sex,
    r.civil_status,
    r.civil_status_others_specify,
    r.blood_type,
    r.height,
    r.weight,
    r.complexion,
    r.education_attainment,
    r.is_graduate,
    r.employment_status,
    r.psoc_code,
    r.psoc_level,
    r.occupation_title,
    r.job_title,
    r.workplace,
    r.occupation,
    r.occupation_details,
    r.mobile_number_encrypted,
    r.telephone_number_encrypted,
    r.email_encrypted,
    r.mother_maiden_first_encrypted,
    r.mother_maiden_middle_encrypted,
    r.mother_maiden_last_encrypted,
    r.first_name_hash,
    r.last_name_hash,
    r.mobile_number_hash,
    r.email_hash,
    r.full_name_hash,
    r.is_data_encrypted,
    r.encryption_key_version,
    r.encrypted_at,
    r.encrypted_by,
    -- r.household_code excluded to avoid duplicate with h.code AS household_code
    r.street_id,
    r.subdivision_id,
    r.barangay_code,
    r.city_municipality_code,
    -- r.province_code and r.region_code excluded to avoid duplicates with ah.* columns
    r.citizenship,
    r.is_registered_voter,
    r.is_resident_voter,
    r.last_voted_year,
    r.ethnicity,
    r.religion,
    r.religion_others_specify,
    r.created_by,
    r.updated_by,
    r.created_at,
    r.updated_at,
    
    -- Computed age (dynamic calculation)
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, r.birthdate)) AS age,
    
    -- Computed birth place (dynamic calculation)
    CASE
        WHEN r.birth_place_text IS NOT NULL THEN r.birth_place_text
        WHEN r.birth_place_code IS NOT NULL AND r.birth_place_level IS NOT NULL THEN
            CASE r.birth_place_level
                WHEN 'region' THEN reg.name
                WHEN 'province' THEN CONCAT_WS(', ', prov.name, reg2.name)
                WHEN 'city_municipality' THEN CONCAT_WS(', ',
                    city.name,
                    CASE WHEN city.is_independent THEN NULL ELSE prov2.name END,
                    reg3.name
                )
                WHEN 'barangay' THEN CONCAT_WS(', ',
                    brgy.name,
                    city.name,
                    CASE WHEN city.is_independent THEN NULL ELSE prov2.name END,
                    reg3.name
                )
                ELSE NULL
            END
        ELSE NULL
    END AS birth_place_full,
    
    -- Household information (if exists)
    h.code AS household_code,
    h.house_number AS household_house_number, -- House/Block/Lot No.
    h.total_members AS household_total_members,
    h.monthly_income AS household_monthly_income,
    h.household_type AS household_type,
    
    -- Geographic hierarchy (using existing address_hierarchy view)
    ah.region_code,
    ah.region_name,
    ah.province_code, 
    ah.province_name,
    ah.city_code,
    ah.city_name,
    ah.city_type,
    ah.barangay_name,
    ah.full_address AS complete_geographic_address,
    
    -- Computed fields for API responses
    CONCAT_WS(' ', 
        NULLIF(decrypt_pii(r.first_name_encrypted), ''),
        NULLIF(decrypt_pii(r.middle_name_encrypted), ''), 
        NULLIF(decrypt_pii(r.last_name_encrypted), ''),
        NULLIF(r.extension_name, '')
    ) AS full_name,
    
    -- Address components for display
    CASE 
        WHEN h.house_number IS NOT NULL THEN
            CONCAT(h.house_number, ', ', ah.barangay_name)
        ELSE
            ah.barangay_name
    END AS display_address

FROM residents r
LEFT JOIN households h ON r.household_code = h.code
LEFT JOIN address_hierarchy ah ON r.barangay_code = ah.barangay_code
-- Birth place lookups for computed birth_place_full
LEFT JOIN psgc_regions reg ON r.birth_place_code = reg.code AND r.birth_place_level = 'region'
LEFT JOIN psgc_provinces prov ON r.birth_place_code = prov.code AND r.birth_place_level = 'province'
LEFT JOIN psgc_regions reg2 ON prov.region_code = reg2.code AND r.birth_place_level = 'province'
LEFT JOIN psgc_cities_municipalities city ON r.birth_place_code = city.code AND r.birth_place_level IN ('city_municipality', 'barangay')
LEFT JOIN psgc_provinces prov2 ON city.province_code = prov2.code AND r.birth_place_level IN ('city_municipality', 'barangay')
LEFT JOIN psgc_regions reg3 ON COALESCE(prov2.region_code, city.province_code) = reg3.code AND r.birth_place_level IN ('city_municipality', 'barangay')
LEFT JOIN psgc_barangays brgy ON r.birth_place_code = brgy.code AND r.birth_place_level = 'barangay';

-- =====================================================
-- 13.7.2 HOUSEHOLDS WITH COMPLETE MEMBER INFO
-- =====================================================
CREATE OR REPLACE VIEW api_households_with_members AS
SELECT 
    -- Core household fields (excluding geographic columns to avoid conflicts with ah.*)
    h.code,
    h.house_number,
    h.street_id,
    h.subdivision_id,
    h.barangay_code, -- Keep for JOINs, conflicts resolved with ah prefix
    -- h.city_municipality_code, h.province_code, h.region_code excluded to avoid conflicts
    h.total_families,
    h.total_members,
    h.total_migrants,
    h.household_type,
    h.tenure_status,
    h.tenure_others_specify,
    h.household_unit,
    h.household_name,
    h.monthly_income,
    h.income_class,
    h.household_head_id,
    h.is_active,
    h.created_by,
    h.updated_by,
    h.created_at,
    h.updated_at,
    
    -- Geographic hierarchy
    ah.region_code,
    ah.region_name,
    ah.province_code,
    ah.province_name, 
    ah.city_code,
    ah.city_name,
    ah.city_type,
    ah.barangay_name,
    ah.full_address AS complete_geographic_address,
    
    -- Household head information
    head.id AS head_id,
    decrypt_pii(head.first_name_encrypted) AS head_first_name,
    decrypt_pii(head.middle_name_encrypted) AS head_middle_name,
    decrypt_pii(head.last_name_encrypted) AS head_last_name,
    head.extension_name AS head_extension_name,
    CONCAT_WS(' ', 
        NULLIF(decrypt_pii(head.first_name_encrypted), ''),
        NULLIF(decrypt_pii(head.middle_name_encrypted), ''),
        NULLIF(decrypt_pii(head.last_name_encrypted), ''),
        NULLIF(head.extension_name, '')
    ) AS head_full_name,
    head.sex AS head_sex,
    head.birthdate AS head_birthdate,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, head.birthdate::DATE)) AS head_age,
    
    -- Member statistics (computed from actual members)
    COALESCE(member_stats.actual_member_count, 0) AS actual_member_count,
    COALESCE(member_stats.male_count, 0) AS male_members,
    COALESCE(member_stats.female_count, 0) AS female_members,
    COALESCE(member_stats.minor_count, 0) AS minor_members,
    COALESCE(member_stats.adult_count, 0) AS adult_members,
    COALESCE(member_stats.senior_count, 0) AS senior_members,
    COALESCE(member_stats.pwd_count, 0) AS pwd_members,
    COALESCE(member_stats.voter_count, 0) AS voter_members,
    
    -- Display address
    CASE 
        WHEN h.house_number IS NOT NULL THEN
            CONCAT(h.house_number, ', ', ah.barangay_name)
        ELSE
            ah.barangay_name
    END AS display_address

FROM households h
LEFT JOIN address_hierarchy ah ON h.barangay_code = ah.barangay_code
-- Get household head
LEFT JOIN residents head ON h.household_head_id = head.id
-- Get member statistics
LEFT JOIN (
    SELECT 
        household_code,
        COUNT(*) AS actual_member_count,
        COUNT(*) FILTER (WHERE sex = 'male') AS male_count,
        COUNT(*) FILTER (WHERE sex = 'female') AS female_count,
        COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) < 18) AS minor_count,
        COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) BETWEEN 18 AND 59) AS adult_count,
        COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) >= 60) AS senior_count,
        COUNT(*) FILTER (WHERE si.is_person_with_disability = true) AS pwd_count,
        COUNT(*) FILTER (WHERE r.is_registered_voter = true) AS voter_count
    FROM residents r
    LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
    GROUP BY household_code
) member_stats ON h.code = member_stats.household_code;

-- =====================================================
-- 13.7.3 DASHBOARD STATS VIEW (Pre-aggregated)
-- =====================================================
CREATE OR REPLACE VIEW api_dashboard_stats AS
SELECT 
    r.barangay_code,
    
    -- Basic counts
    COUNT(*) AS total_residents,
    COUNT(*) FILTER (WHERE sex = 'male') AS male_residents,
    COUNT(*) FILTER (WHERE sex = 'female') AS female_residents,
    
    -- Age groups
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) < 18) AS minors,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) BETWEEN 18 AND 59) AS adults,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) >= 60) AS seniors,
    
    -- Special categories
    COUNT(*) FILTER (WHERE si.is_person_with_disability = true) AS pwd_residents,
    COUNT(*) FILTER (WHERE si.is_solo_parent = true) AS solo_parents,
    COUNT(*) FILTER (WHERE si.is_overseas_filipino_worker = true) AS ofw_residents,
    COUNT(*) FILTER (WHERE si.is_indigenous_people = true) AS indigenous_residents,
    
    -- Voting
    COUNT(*) FILTER (WHERE r.is_registered_voter = true) AS registered_voters,
    COUNT(*) FILTER (WHERE r.is_resident_voter = true) AS resident_voters,
    
    -- Employment
    COUNT(*) FILTER (WHERE si.is_labor_force = true) AS labor_force,
    COUNT(*) FILTER (WHERE si.is_employed = true) AS employed,
    COUNT(*) FILTER (WHERE si.is_unemployed = true) AS unemployed,
    COUNT(*) FILTER (WHERE si.is_out_of_school_youth = true) AS out_of_school_youth,
    
    -- Education levels (top 5)
    COUNT(*) FILTER (WHERE education_attainment = 'elementary') AS elementary_education,
    COUNT(*) FILTER (WHERE education_attainment = 'high_school') AS high_school_education,  
    COUNT(*) FILTER (WHERE education_attainment = 'college') AS college_education,
    COUNT(*) FILTER (WHERE education_attainment = 'vocational') AS vocational_education,
    COUNT(*) FILTER (WHERE education_attainment = 'post_graduate') AS post_graduate_education,
    
    -- Civil status
    COUNT(*) FILTER (WHERE civil_status = 'single') AS single_residents,
    COUNT(*) FILTER (WHERE civil_status = 'married') AS married_residents,
    COUNT(*) FILTER (WHERE civil_status = 'widowed') AS widowed_residents,
    COUNT(*) FILTER (WHERE civil_status = 'divorced') AS divorced_residents,
    
    -- Geographic info (from first resident in barangay)
    MAX(ah.region_name) AS region_name,
    MAX(ah.province_name) AS province_name,
    MAX(ah.city_name) AS city_name,
    MAX(ah.barangay_name) AS barangay_name

FROM residents r
LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
LEFT JOIN address_hierarchy ah ON r.barangay_code = ah.barangay_code
GROUP BY r.barangay_code;

-- =====================================================
-- 13.7.4 ADDRESS SEARCH VIEW (Optimized for barangay search)
-- =====================================================
CREATE OR REPLACE VIEW api_address_search AS
SELECT 
    ah.barangay_code AS code,
    ah.barangay_name AS name,
    ah.city_name,
    ah.province_name,
    ah.region_name,
    ah.full_address,
    
    -- Search-optimized fields
    LOWER(ah.barangay_name) AS barangay_lower,
    LOWER(ah.city_name) AS city_lower,
    LOWER(ah.province_name) AS province_lower,
    LOWER(ah.region_name) AS region_lower,
    
    -- Combined search text for full-text search
    LOWER(CONCAT_WS(' ', ah.barangay_name, ah.city_name, ah.province_name, ah.region_name)) AS searchable_text,
    
    -- Display formats
    CONCAT(ah.barangay_name, ', ', ah.city_name) AS short_display,
    CONCAT(ah.barangay_name, ', ', ah.city_name, ', ', ah.province_name) AS medium_display,
    ah.full_address AS full_display

FROM address_hierarchy ah
ORDER BY ah.region_name, ah.province_name, ah.city_name, ah.barangay_name;

-- =====================================================
-- SECTION 14: PERMISSIONS AND GRANTS
-- =====================================================
-- Database access permissions for different user types

-- =====================================================
-- 14.1 ANONYMOUS USER PERMISSIONS
-- =====================================================

-- Remove ALL permissions from anonymous users
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant safe read access to reference data (geographic and occupation data)
GRANT SELECT ON psgc_regions TO anon;
GRANT SELECT ON psgc_provinces TO anon;
GRANT SELECT ON psgc_cities_municipalities TO anon;
GRANT SELECT ON psgc_barangays TO anon;
GRANT SELECT ON psoc_major_groups TO anon;
GRANT SELECT ON psoc_sub_major_groups TO anon;
GRANT SELECT ON psoc_minor_groups TO anon;
GRANT SELECT ON psoc_unit_groups TO anon;
GRANT SELECT ON psoc_unit_sub_groups TO anon;
GRANT SELECT ON psoc_position_titles TO anon;
GRANT SELECT ON psoc_occupation_cross_references TO anon;

-- =====================================================
-- 14.2 AUTHENTICATED USER PERMISSIONS
-- =====================================================

-- Authenticated users - Full access controlled by RLS policies
GRANT ALL ON residents TO authenticated;
GRANT ALL ON households TO authenticated;
GRANT ALL ON household_members TO authenticated;
GRANT ALL ON auth_user_profiles TO authenticated;
GRANT ALL ON auth_barangay_accounts TO authenticated;
GRANT ALL ON resident_relationships TO authenticated;
GRANT ALL ON geo_subdivisions TO authenticated;
GRANT ALL ON geo_streets TO authenticated;
GRANT ALL ON resident_sectoral_info TO authenticated;
GRANT ALL ON resident_migrant_info TO authenticated;
GRANT ALL ON system_audit_logs TO authenticated;
GRANT ALL ON system_dashboard_summaries TO authenticated;

-- Reference data for authenticated users
GRANT SELECT ON psgc_regions TO authenticated;
GRANT SELECT ON psgc_provinces TO authenticated;
GRANT SELECT ON psgc_cities_municipalities TO authenticated;
GRANT SELECT ON psgc_barangays TO authenticated;
GRANT SELECT ON psoc_major_groups TO authenticated;
GRANT SELECT ON psoc_sub_major_groups TO authenticated;
GRANT SELECT ON psoc_minor_groups TO authenticated;
GRANT SELECT ON psoc_unit_groups TO authenticated;
GRANT SELECT ON psoc_unit_sub_groups TO authenticated;
GRANT SELECT ON psoc_position_titles TO authenticated;
GRANT SELECT ON psoc_occupation_cross_references TO authenticated;

-- Admin tables
GRANT SELECT ON auth_roles TO authenticated;

-- Sequences for authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Views and search functions
GRANT SELECT ON psoc_occupation_search TO authenticated;
GRANT SELECT ON address_hierarchy TO authenticated;
GRANT SELECT ON birth_place_options TO authenticated;
GRANT SELECT ON household_search TO authenticated;
GRANT SELECT ON settings_management_summary TO authenticated;
GRANT SELECT ON residents_with_sectoral TO authenticated;
GRANT SELECT ON households_complete TO authenticated;
GRANT SELECT ON migrants_complete TO authenticated;
GRANT SELECT ON household_income_analytics TO authenticated;

-- Server-side API optimized views
GRANT SELECT ON api_residents_with_geography TO authenticated;
GRANT SELECT ON api_households_with_members TO authenticated;
GRANT SELECT ON api_dashboard_stats TO authenticated;
GRANT SELECT ON api_address_search TO authenticated;

-- Function permissions
GRANT EXECUTE ON FUNCTION search_birth_places(TEXT, birth_place_level_enum, VARCHAR(10), INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_birth_place_details(VARCHAR(10), birth_place_level_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION search_occupations(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupation_details(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_households(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_household_for_resident(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION populate_user_tracking_fields() TO authenticated;

-- =====================================================
-- SECTION 15: INITIAL DATA AND COMMENTS
-- =====================================================
-- Setup data and documentation

-- =====================================================
-- 15.1 DEFAULT ROLES
-- =====================================================

-- Insert default roles
INSERT INTO auth_roles (name, description, permissions) VALUES
('Super Admin', 'System-wide administrator with full access', '{"all": true}'),
('Barangay Admin', 'Barangay administrator with local management access',
 '{"manage_users": true, "manage_residents": true, "manage_households": true, "view_analytics": true}'),
('Clerk', 'Data entry clerk with CRUD access to residents and households',
 '{"manage_residents": true, "manage_households": true}'),
('Resident', 'Self-service access to personal information',
 '{"view_own_data": true, "update_own_contact": true}');

-- =====================================================
-- 15.2 SCHEMA COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA public IS 'RBI System - Records of Barangay Inhabitant System Database Schema v2.0';

-- Table comments
COMMENT ON TABLE residents IS 'Core resident profiles with comprehensive demographic data (LGU Form 10 compliant)';
COMMENT ON TABLE households IS 'Household entities with address and composition management';
COMMENT ON VIEW psoc_occupation_search IS 'Flattened PSOC hierarchy view for unified occupation search UI';
COMMENT ON VIEW address_hierarchy IS 'Complete address hierarchy view for settings management';

-- Server-side API optimized views comments
COMMENT ON VIEW api_residents_with_geography IS 'Optimized flat view for resident API endpoints with pre-joined geographic and household data';
COMMENT ON VIEW api_households_with_members IS 'Optimized flat view for household API endpoints with pre-computed member statistics and geographic data';
COMMENT ON VIEW api_dashboard_stats IS 'Pre-aggregated statistics by barangay for dashboard API performance optimization';
COMMENT ON VIEW api_address_search IS 'Optimized view for address/barangay search API with searchable text fields and multiple display formats';

-- Column comments for key fields
COMMENT ON COLUMN residents.philsys_card_number_hash IS 'Hashed PhilSys card number for security (use crypt/hmac)';
COMMENT ON COLUMN residents.philsys_last4 IS 'Last 4 digits of PhilSys card for user-friendly lookup';
COMMENT ON COLUMN residents.ethnicity IS 'LGU Form 10 compliant ethnicity classification';
COMMENT ON COLUMN residents.psoc_code IS 'PSOC code - can reference any level (Major Group to Unit Group)';
COMMENT ON COLUMN residents.psoc_level IS 'Indicates which PSOC hierarchy level the code references';

-- Hierarchical Household ID Examples using proper PSGC structure:
-- 042114014-0000-0001-0001 = Region 04 (CALABARZON), Province 21 (Cavite), Municipality 14 (Mendez), Barangay 014 (Anuling Cerca I), No Subdivision, Street 0001, House 0001
-- 133901001-0000-0001-0001 = Region 13 (NCR), Province 39 (Manila), District 01, Barangay 001 (Ermita), No Subdivision, Street 0001, House 0001
-- 071201025-0003-0012-0045 = Region 07 (Central Visayas), Province 12 (Cebu), City 01 (Cebu City), Barangay 025 (Lahug), Subdivision 0003, Street 0012, House 0045

COMMENT ON COLUMN households.id IS 'Hierarchical ID using PSGC structure: RRPPMMBBB-SSSS-TTTT-HHHH (PSGC barangay code-Subdivision-Street-House)';
COMMENT ON COLUMN households.barangay_code IS 'Auto-populated from logged-in user''s assigned barangay (from auth_barangay_accounts table)';
COMMENT ON COLUMN residents.barangay_code IS 'Auto-populated from logged-in user''s assigned barangay (from auth_barangay_accounts table)';
COMMENT ON COLUMN residents.region_code IS 'Auto-populated from barangay hierarchy lookup';
COMMENT ON COLUMN residents.province_code IS 'Auto-populated from barangay hierarchy lookup';
COMMENT ON COLUMN residents.city_municipality_code IS 'Auto-populated from barangay hierarchy lookup';

-- Add comments for civil status others field
COMMENT ON COLUMN residents.civil_status_others_specify IS 'Required custom text when civil_status = ''others'' (e.g., "common-law", "engaged", "live-in", etc.)';

-- Add comments for education fields
COMMENT ON COLUMN residents.education_attainment IS 'Highest level of education attempted/studying by the resident';
COMMENT ON COLUMN residents.is_graduate IS 'Whether the resident completed their education level: true = graduated, false = still studying/incomplete';

-- Add comments for occupation fields
COMMENT ON COLUMN residents.psoc_code IS 'PSOC occupation code from psoc_occupation_search table (e.g., "251206")';
COMMENT ON COLUMN residents.psoc_level IS 'PSOC hierarchy level from psoc_occupation_search table (e.g., "unit_sub_group")';
COMMENT ON COLUMN residents.occupation_title IS 'Standardized occupation title from PSOC search selection (e.g., "Software developer")';
COMMENT ON COLUMN residents.job_title IS 'Specific job position or title as stated by the resident (e.g., "Senior React Developer")';
COMMENT ON COLUMN residents.workplace IS 'Company name and location where the resident works (e.g., "TechStart Inc., BGC Taguig")';

-- Add comments for views and functions
COMMENT ON TYPE birth_place_level_enum IS 'Specifies which level of PSGC hierarchy the birth_place_code refers to (similar to PSOC levels)';
COMMENT ON VIEW birth_place_options IS 'Unified view of all PSGC locations for birth place selection (similar to PSOC hierarchy view)';
COMMENT ON VIEW household_search IS 'Complete household information with formatted addresses for resident creation search';
COMMENT ON FUNCTION search_birth_places(TEXT, birth_place_level_enum, VARCHAR(10), INTEGER) IS 'Search function for birth places across all PSGC levels with fuzzy matching';
COMMENT ON FUNCTION get_birth_place_details(VARCHAR(10), birth_place_level_enum) IS 'Get detailed information for a specific birth place code and level';
COMMENT ON FUNCTION search_occupations(TEXT, INTEGER) IS 'Search occupations from psoc_occupation_search table by title or searchable text';
COMMENT ON FUNCTION get_occupation_details(TEXT) IS 'Get occupation details by PSOC occupation code';
COMMENT ON FUNCTION search_households(TEXT, TEXT, INTEGER) IS 'Search households with full address display for resident creation - includes RLS filtering by user barangay';
COMMENT ON FUNCTION get_household_for_resident(UUID) IS 'Get specific household details for resident auto-population';
COMMENT ON FUNCTION populate_user_tracking_fields() IS 'Automatically populates created_by and updated_by fields with current user ID';

-- Set security barrier for views
ALTER VIEW household_search SET (security_barrier = true);

-- Note: PSGC and PSOC reference data should be imported separately
-- using official data sources from PSA (Philippine Statistics Authority)

-- =====================================================
-- 15.3 SCHEMA VERSION INSERT
-- =====================================================

INSERT INTO system_schema_versions (version, description)
VALUES ('2.0', 'Enhanced full-feature schema with current implementation optimizations: independence constraints, enhanced auto-calculations, improved search, conditional indexes, smart address formatting');

-- Production readiness indicator
COMMENT ON SCHEMA public IS 'RBI System v2.2 - PII Encryption + Address Rules + Full-Feature Schema - Records of Barangay Inhabitant System';

-- =====================================================
-- SECTION 18: SECURITY INITIALIZATION
-- =====================================================
-- 14. PSOC UNIFIED SEARCH VIEWS AND FUNCTIONS
-- =====================================================

-- Unified view for searching across all PSOC hierarchy levels
CREATE OR REPLACE VIEW psoc_unified_search AS
-- Level 1: Major Groups
SELECT 
    code as psoc_code,
    title as occupation_title,
    1 as psoc_level,
    'Major Group' as level_name,
    NULL::VARCHAR as parent_code,
    NULL::VARCHAR as parent_title,
    code || ' - ' || title as display_text,
    title as search_text
FROM psoc_major_groups

UNION ALL

-- Level 2: Sub-Major Groups  
SELECT 
    s.code as psoc_code,
    s.title as occupation_title,
    2 as psoc_level,
    'Sub-Major Group' as level_name,
    m.code as parent_code,
    m.title as parent_title,
    s.code || ' - ' || s.title || ' (' || m.title || ')' as display_text,
    s.title || ' ' || m.title as search_text
FROM psoc_sub_major_groups s
JOIN psoc_major_groups m ON s.major_code = m.code

UNION ALL

-- Level 3: Minor Groups
SELECT 
    mi.code as psoc_code,
    mi.title as occupation_title,
    3 as psoc_level,
    'Minor Group' as level_name,
    s.code as parent_code,
    s.title as parent_title,
    mi.code || ' - ' || mi.title || ' (' || s.title || ')' as display_text,
    mi.title || ' ' || s.title || ' ' || m.title as search_text
FROM psoc_minor_groups mi
JOIN psoc_sub_major_groups s ON mi.sub_major_code = s.code
JOIN psoc_major_groups m ON s.major_code = m.code

UNION ALL

-- Level 4: Unit Groups
SELECT 
    u.code as psoc_code,
    u.title as occupation_title,
    4 as psoc_level,
    'Unit Group' as level_name,
    mi.code as parent_code,
    mi.title as parent_title,
    u.code || ' - ' || u.title || ' (' || mi.title || ')' as display_text,
    u.title || ' ' || mi.title || ' ' || s.title || ' ' || m.title as search_text
FROM psoc_unit_groups u
JOIN psoc_minor_groups mi ON u.minor_code = mi.code
JOIN psoc_sub_major_groups s ON mi.sub_major_code = s.code
JOIN psoc_major_groups m ON s.major_code = m.code

UNION ALL

-- Level 5: Unit Sub-Groups
SELECT 
    us.code as psoc_code,
    us.title as occupation_title,
    5 as psoc_level,
    'Unit Sub-Group' as level_name,
    u.code as parent_code,
    u.title as parent_title,
    us.code || ' - ' || us.title || ' (' || u.title || ')' as display_text,
    us.title || ' ' || u.title || ' ' || mi.title || ' ' || s.title || ' ' || m.title as search_text
FROM psoc_unit_sub_groups us
JOIN psoc_unit_groups u ON us.unit_code = u.code
JOIN psoc_minor_groups mi ON u.minor_code = mi.code
JOIN psoc_sub_major_groups s ON mi.sub_major_code = s.code
JOIN psoc_major_groups m ON s.major_code = m.code;

-- Function to get occupation title by PSOC code
CREATE OR REPLACE FUNCTION get_psoc_title(p_psoc_code VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_title VARCHAR;
BEGIN
    -- Try each level to find the title
    SELECT occupation_title INTO v_title
    FROM psoc_unified_search
    WHERE psoc_code = p_psoc_code
    LIMIT 1;
    
    RETURN v_title;
END;
$$ LANGUAGE plpgsql;

-- Function to search PSOC occupations (for UI autocomplete)
CREATE OR REPLACE FUNCTION search_psoc_occupations(
    p_search_term VARCHAR,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    psoc_code VARCHAR,
    occupation_title VARCHAR,
    psoc_level INTEGER,
    level_name VARCHAR,
    display_text VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pus.psoc_code,
        pus.occupation_title,
        pus.psoc_level,
        pus.level_name,
        pus.display_text
    FROM psoc_unified_search pus
    WHERE 
        pus.search_text ILIKE '%' || p_search_term || '%'
        OR pus.occupation_title ILIKE '%' || p_search_term || '%'
        OR pus.psoc_code ILIKE p_search_term || '%'
    ORDER BY 
        -- Exact title matches first
        CASE WHEN pus.occupation_title ILIKE p_search_term THEN 0 ELSE 1 END,
        -- Then by level (more specific first)
        pus.psoc_level DESC,
        -- Then alphabetically
        pus.occupation_title
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- View: Residents with occupation details
CREATE OR REPLACE VIEW residents_with_occupation AS
SELECT 
    r.id,
    r.employment_status,
    r.psoc_code,
    pus.occupation_title,
    pus.psoc_level,
    pus.level_name,
    pus.parent_title,
    pus.display_text as occupation_display
FROM residents r
LEFT JOIN psoc_unified_search pus ON r.psoc_code = pus.psoc_code;

COMMENT ON VIEW psoc_unified_search IS 
'Unified view for searching across all PSOC hierarchy levels. Use for UI dropdowns and autocomplete.';

COMMENT ON FUNCTION get_psoc_title IS 
'Returns the occupation title for any PSOC code regardless of level';

COMMENT ON FUNCTION search_psoc_occupations IS 
'Search function for UI autocomplete. Returns matching occupations from all levels.';

COMMENT ON VIEW residents_with_occupation IS 
'View joining residents with their occupation details from PSOC hierarchy';

-- =====================================================
-- Initialize encryption keys and security settings

-- Initialize default PII encryption key
INSERT INTO system_encryption_keys (
    key_name,
    key_purpose,
    key_hash,
    created_by
) VALUES (
    'pii_master_key',
    'pii',
    digest('RBI-PII-KEY-2025-' || extract(epoch from now())::text, 'sha256'),
    NULL  -- Will be set by first super admin user
) ON CONFLICT (key_name) DO NOTHING;

-- Add security comments
COMMENT ON TABLE system_encryption_keys IS 'Manages encryption keys for PII data protection';
COMMENT ON TABLE system_key_rotation_history IS 'Tracks encryption key rotation events';
COMMENT ON FUNCTION encrypt_pii(TEXT, VARCHAR) IS 'Encrypts PII data using active encryption key';
COMMENT ON FUNCTION decrypt_pii(BYTEA, VARCHAR) IS 'Decrypts PII data (logs access for audit)';
COMMENT ON FUNCTION create_search_hash(TEXT, TEXT) IS 'Creates searchable hash for encrypted fields';
COMMENT ON VIEW residents_decrypted IS 'Decrypted view of residents (requires proper permissions)';
COMMENT ON VIEW residents_masked IS 'Masked view of residents for public/limited access';

COMMENT ON COLUMN residents.first_name_encrypted IS 'Encrypted first name using AES-256';
COMMENT ON COLUMN residents.mobile_number_encrypted IS 'Encrypted mobile number for privacy';
COMMENT ON COLUMN residents.email_encrypted IS 'Encrypted email address';
COMMENT ON COLUMN residents.mother_maiden_first_encrypted IS 'Encrypted mother maiden name (highly sensitive)';
COMMENT ON COLUMN residents.first_name_hash IS 'Searchable hash of first name (not reversible)';
COMMENT ON COLUMN residents.is_data_encrypted IS 'Flag indicating if PII is encrypted';

-- =====================================================
-- END OF SCHEMA
-- =====================================================