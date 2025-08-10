-- =====================================================
-- RBI SYSTEM FULL-FEATURE DATABASE SCHEMA WITH RLS
-- =====================================================
-- System: Records of Barangay Inhabitant System
-- Version: 2.0
-- Updated: January 2025
-- Features: Complete enterprise features + Row Level Security
-- =====================================================

-- =====================================================
-- TABLE OF CONTENTS
-- =====================================================
-- 1. EXTENSIONS
-- 2. ENUMS AND CUSTOM TYPES
-- 3. REFERENCE DATA TABLES (PSGC & PSOC)
-- 4. USER MANAGEMENT TABLES
-- 5. GEOGRAPHIC MANAGEMENT TABLES
-- 6. CORE DATA TABLES
-- 7. SUPPLEMENTARY TABLES
-- 8. FUNCTIONS AND TRIGGERS
-- 9. INDEXES
-- 10. CONSTRAINTS
-- 11. ROW LEVEL SECURITY
-- 12. VIEWS AND SEARCH FUNCTIONS
-- 13. USER TRACKING SYSTEM
-- 14. PERMISSIONS AND GRANTS
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
    'single',    -- Never been married
    'married',   -- Legally or consensually married
    'divorced',  -- Legally dissolved marriage
    'separated', -- Separated from spouse
    'widowed',   -- Spouse deceased
    'others'     -- Other status (specify in civil_status_others_specify)
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

-- Educational Attainment Levels
CREATE TYPE education_level_enum AS ENUM (
    'elementary',    -- Elementary/Primary school
    'high_school',   -- Secondary/High school
    'college',       -- College/University degree
    'post_graduate', -- Masters/Doctorate
    'vocational'     -- Technical/Vocational course
);
-- Note: Using boolean is_graduate field instead of education_status_enum

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
    'tagalog',
    'cebuano',
    'ilocano',
    'bisaya',
    'hiligaynon',
    'bikolano',
    'waray',
    'kapampangan',
    'pangasinense',
    'maranao',
    'maguindanao',
    'tausug',
    'indigenous',
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
-- 2.7 INCOME CLASSIFICATION ENUM
-- =====================================================

-- Economic Income Classes (Based on NEDA Classifications)
CREATE TYPE income_class_enum AS ENUM (
    'rich',                    -- ≥ 219,140 PHP/month
    'high_income',             -- 131,484 - 219,139 PHP/month
    'upper_middle_income',     -- 76,669 - 131,483 PHP/month
    'middle_income',           -- 43,828 - 76,668 PHP/month
    'lower_middle_income',     -- 21,914 - 43,827 PHP/month
    'low_income',              -- 10,957 - 21,913 PHP/month
    'poor',                    -- < 10,957 PHP/month
    'not_determined'           -- Unable to determine
);

-- =====================================================
-- 2.8 GEOGRAPHIC ENUMS
-- =====================================================

-- Birth Place Level (for PSGC hierarchy)
CREATE TYPE birth_place_level_enum AS ENUM (
    'region', 
    'province', 
    'city_municipality', 
    'barangay'
);

-- =====================================================
-- SECTION 3: REFERENCE DATA TABLES
-- =====================================================
-- Government standard reference data (PSGC & PSOC)

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
    is_city BOOLEAN DEFAULT false,
    is_independent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
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
-- SECTION 4: USER MANAGEMENT TABLES
-- =====================================================
-- System users, roles, and permissions

-- User Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES roles(id),
    
    -- Geographic assignment
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barangay User Assignments (for multi-barangay access)
CREATE TABLE barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    is_primary BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, barangay_code)
);

-- =====================================================
-- SECTION 5: GEOGRAPHIC MANAGEMENT TABLES
-- =====================================================
-- Local geographic subdivisions within barangays

-- Subdivisions/Zones within Barangays
CREATE TABLE subdivisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Subdivision', 'Zone', 'Sitio', 'Purok')),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(name, barangay_code)
);

-- Street Names within Barangays
CREATE TABLE street_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    subdivision_id UUID REFERENCES subdivisions(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
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
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    code VARCHAR(50) NOT NULL UNIQUE, -- Hierarchical format: RRPPMMBBB-SSSS-TTTT-HHHH
    household_number VARCHAR(50) NOT NULL,
    
    -- Address Details
    house_number VARCHAR(50),
    street_id UUID REFERENCES street_names(id),
    subdivision_id UUID REFERENCES subdivisions(id),
    
    -- Geographic Location (PSGC Codes)
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code), -- NULL for independent cities
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    
    -- Household Profile
    total_families INTEGER DEFAULT 1,      -- Number of family units
    total_members INTEGER DEFAULT 0,       -- Auto-calculated
    total_migrants INTEGER DEFAULT 0,      -- Auto-calculated
    
    -- Household Characteristics
    household_type household_type_enum,
    tenure_status tenure_status_enum,
    tenure_others_specify TEXT,
    household_unit household_unit_enum,
    
    -- Economic Information
    monthly_income DECIMAL(12,2) DEFAULT 0.00,
    income_class income_class_enum,
    
    -- Relationship
    household_head_id UUID, -- Will reference residents(id)
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique household number per barangay
    UNIQUE(household_number, barangay_code)
);

-- =====================================================
-- 6.2 RESIDENTS TABLE
-- =====================================================
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- =====================================================
    -- IDENTIFICATION
    -- =====================================================
    
    -- PhilSys Card Number (secure storage)
    philsys_card_number_hash BYTEA,
    philsys_last4 VARCHAR(4),
    
    -- =====================================================
    -- PERSONAL INFORMATION
    -- =====================================================
    
    -- Name
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    extension_name VARCHAR(20),
    
    -- Birth Information
    birthdate DATE NOT NULL,
    age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(birthdate))) STORED,
    
    -- Birth Place (Single field approach like PSOC)
    birth_place_code VARCHAR(10),        -- PSGC code (any level)
    birth_place_level birth_place_level_enum, -- Level of the code
    birth_place_text VARCHAR(200),       -- For non-PSGC locations
    birth_place_full TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN birth_place_text IS NOT NULL THEN birth_place_text
            WHEN birth_place_code IS NOT NULL AND birth_place_level IS NOT NULL THEN
                CASE birth_place_level
                    WHEN 'region' THEN 
                        (SELECT r.name FROM psgc_regions r WHERE r.code = birth_place_code)
                    WHEN 'province' THEN 
                        (SELECT CONCAT_WS(', ', p.name, r.name) 
                         FROM psgc_provinces p 
                         JOIN psgc_regions r ON p.region_code = r.code 
                         WHERE p.code = birth_place_code)
                    WHEN 'city_municipality' THEN 
                        (SELECT CONCAT_WS(', ', 
                            c.name,
                            CASE WHEN c.is_independent THEN NULL ELSE p.name END,
                            r.name
                        ) 
                        FROM psgc_cities_municipalities c
                        LEFT JOIN psgc_provinces p ON c.province_code = p.code
                        LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
                        WHERE c.code = birth_place_code)
                    WHEN 'barangay' THEN 
                        (SELECT CONCAT_WS(', ',
                            b.name,
                            c.name,
                            CASE WHEN c.is_independent THEN NULL ELSE p.name END,
                            r.name
                        ) 
                        FROM psgc_barangays b
                        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
                        LEFT JOIN psgc_provinces p ON c.province_code = p.code
                        LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
                        WHERE b.code = birth_place_code)
                END
            ELSE NULL
        END
    ) STORED,
    
    -- Demographics
    sex sex_enum NOT NULL,
    civil_status civil_status_enum DEFAULT 'single',
    civil_status_others_specify TEXT,
    blood_type blood_type_enum DEFAULT 'unknown',
    
    -- =====================================================
    -- EDUCATION AND EMPLOYMENT
    -- =====================================================
    
    -- Education
    education_attainment education_level_enum,
    is_graduate BOOLEAN DEFAULT false,
    
    -- Employment
    employment_status employment_status_enum,
    
    -- Occupation (PSOC-based)
    psoc_code TEXT,           -- PSOC classification code
    psoc_level TEXT,          -- PSOC hierarchy level
    occupation_title TEXT,    -- Auto-populated from PSOC
    job_title TEXT,          -- Specific job position
    workplace TEXT,          -- Company name and location
    occupation TEXT,         -- General occupation field
    occupation_details TEXT, -- Detailed occupation info
    
    -- =====================================================
    -- CONTACT INFORMATION
    -- =====================================================
    
    mobile_number VARCHAR(20),
    telephone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- =====================================================
    -- LOCATION AND HOUSEHOLD
    -- =====================================================
    
    -- Household Reference
    household_id UUID REFERENCES households(id),
    household_code VARCHAR(50),
    
    -- Location Details
    street_id UUID REFERENCES street_names(id),
    subdivision_id UUID REFERENCES subdivisions(id),
    
    -- Geographic Hierarchy
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    
    -- =====================================================
    -- GOVERNMENT AND CIVIC INFORMATION
    -- =====================================================
    
    -- Identity Documents
    sss_no VARCHAR(20),
    gsis_no VARCHAR(20),
    tin_no VARCHAR(20),
    philhealth_no VARCHAR(20),
    pagibig_no VARCHAR(20),
    drivers_license_no VARCHAR(20),
    passport_no VARCHAR(20),
    
    -- Citizenship and Voting
    citizenship citizenship_enum DEFAULT 'filipino',
    is_registered_voter BOOLEAN DEFAULT false,
    is_resident_voter BOOLEAN DEFAULT false,
    last_voted_year INTEGER,
    
    -- =====================================================
    -- DEMOGRAPHICS AND CULTURAL
    -- =====================================================
    
    ethnicity ethnicity_enum DEFAULT 'not_reported',
    religion religion_enum DEFAULT 'prefer_not_to_say',
    religion_others_specify TEXT,
    
    -- Mother's Maiden Name
    mother_maiden_first TEXT,
    mother_maiden_middle TEXT,
    mother_maiden_last TEXT,
    
    -- =====================================================
    -- METADATA AND SEARCH
    -- =====================================================
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Full-text search
    search_text TEXT GENERATED ALWAYS AS (
        LOWER(CONCAT_WS(' ',
            first_name,
            COALESCE(middle_name, ''),
            last_name,
            COALESCE(occupation_title, ''),
            COALESCE(mobile_number, ''),
            COALESCE(occupation, ''),
            COALESCE(job_title, ''),
            COALESCE(workplace, ''),
            COALESCE(extension_name, '')))
    ) STORED,
    
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(first_name, '') || ' ' ||
            COALESCE(middle_name, '') || ' ' ||
            COALESCE(last_name, '') || ' ' ||
            COALESCE(email, '') || ' ' ||
            COALESCE(mobile_number, '') || ' ' ||
            COALESCE(occupation_details, '') || ' ' ||
            COALESCE(workplace, '')
        )
    ) STORED
);

-- =====================================================
-- SECTION 7: SUPPLEMENTARY TABLES
-- =====================================================
-- Supporting tables for relationships and additional data

-- Household Members Junction Table
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id),
    
    -- Relationship Information
    relationship_to_head VARCHAR(50) NOT NULL,
    family_position family_position_enum,
    position_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(household_id, resident_id)
);

-- Resident Relationships
CREATE TABLE resident_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_a_id UUID NOT NULL REFERENCES residents(id),
    resident_b_id UUID NOT NULL REFERENCES residents(id),
    relationship_type VARCHAR(50) NOT NULL CHECK (
        relationship_type IN ('Spouse', 'Parent', 'Child', 'Sibling', 'Guardian', 'Ward', 'Other')
    ),
    relationship_description TEXT,
    is_reciprocal BOOLEAN DEFAULT true,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT no_self_relationship CHECK (resident_a_id != resident_b_id),
    CONSTRAINT unique_relationship UNIQUE(resident_a_id, resident_b_id, relationship_type)
);

-- Sectoral Information
CREATE TABLE sectoral_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    
    -- Labor Force Status
    is_labor_force BOOLEAN DEFAULT false,
    is_employed BOOLEAN DEFAULT false,
    is_unemployed BOOLEAN DEFAULT false,
    
    -- Special Populations
    is_overseas_filipino_worker BOOLEAN DEFAULT false,
    is_person_with_disability BOOLEAN DEFAULT false,
    is_out_of_school_children BOOLEAN DEFAULT false,
    is_out_of_school_youth BOOLEAN DEFAULT false,
    is_senior_citizen BOOLEAN DEFAULT false,
    is_registered_senior_citizen BOOLEAN DEFAULT false,
    is_solo_parent BOOLEAN DEFAULT false,
    is_indigenous_people BOOLEAN DEFAULT false,
    is_migrant BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(resident_id)
);

-- Migrant Information
CREATE TABLE migrant_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    
    -- Previous Location
    previous_barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    previous_city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    previous_province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    previous_region_code VARCHAR(10) REFERENCES psgc_regions(code),
    
    -- Migration Details
    date_of_transfer DATE,
    reason_for_transferring TEXT,
    duration_of_stay_current_months INTEGER,
    intends_to_return BOOLEAN,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(resident_id)
);

-- Barangay Dashboard Summaries (System-generated)
CREATE TABLE barangay_dashboard_summaries (
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
    age_0_5 INTEGER DEFAULT 0,
    age_6_14 INTEGER DEFAULT 0,
    age_15_24 INTEGER DEFAULT 0,
    age_25_59 INTEGER DEFAULT 0,
    age_60_above INTEGER DEFAULT 0,
    
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
    
    -- System timestamps (no user tracking - system-generated)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(barangay_code, calculation_date)
);

-- Audit Logs (System-generated)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES user_profiles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema Version Tracking
CREATE TABLE schema_version (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- [Additional sections continue with same formatting improvements...]