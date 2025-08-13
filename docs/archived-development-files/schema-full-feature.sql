-- =====================================================
-- RBI SYSTEM FULL-FEATURE DATABASE SCHEMA WITH RLS
-- Records of Barangay Inhabitant System
-- Complete enterprise features + Row Level Security
-- Updated: January 2025
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. ENUMS AND CUSTOM TYPES
-- =====================================================

-- Personal Information Enums
CREATE TYPE sex_enum AS ENUM ('male', 'female');

CREATE TYPE civil_status_enum AS ENUM (
    'single',    -- A person who has never been married
    'married',   -- A couple living together as husband and wife, legally or consensually
    'divorced',  -- A person whose bond of matrimony has been dissolved legally and who therefore can remarry
    'separated', -- A person separated legally or not from his/her spouse because of marital discord or misunderstanding
    'widowed',   -- A person whose bond of matrimony has been dissolved by death of his/her spouse
    'others'     -- Other civil status not covered by the standard categories
);

CREATE TYPE citizenship_enum AS ENUM (
    'filipino',
    'dual_citizen',
    'foreign_national'
);

-- Education Enums (Highest Educational Attainment)
CREATE TYPE education_level_enum AS ENUM (
    'elementary',   -- Completed elementary/primary school
    'high_school',  -- Completed secondary/high school
    'college',      -- Completed college/university degree
    'post_graduate', -- Completed post-graduate/masters/doctorate
    'vocational'    -- Completed vocational/technical course
);

-- Removed education_status_enum - now using boolean is_graduate field

-- Employment Enum
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

-- Health and Identity Enums
CREATE TYPE blood_type_enum AS ENUM (
    'A+', 'A-', 'B+', 'B-',
    'AB+', 'AB-', 'O+', 'O-',
    'unknown'
);

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

-- Birth Place Level Enum (Similar to PSOC level approach)
CREATE TYPE birth_place_level_enum AS ENUM (
    'region', 'province', 'city_municipality', 'barangay'
);

-- LGU Form 10 Compliant Ethnicity Enum
CREATE TYPE ethnicity_enum AS ENUM (
    -- Major Ethnolinguistic Groups
    'tagalog', 'cebuano', 'ilocano', 'bisaya_visaya',
    'hiligaynon', 'bikol', 'waray', 'kapampangan',
    'pangasinan', 'kinaray_a', 'maranao', 'maguindanao',
    'tausug', 'subanon', 'boholano', 'chavacano',
    
    -- Indigenous Cultural Communities (ICC/IP)
    'cordillera_peoples', 'mangyan', 'palawan_indigenous',
    'mindanao_lumad', 'negrito_groups', 'other_indigenous',
    
    -- Foreign/Mixed Heritage
    'chinese_filipino', 'spanish_filipino', 'american_filipino', 
    'other_foreign_mixed',
    
    -- Single Foreign Ethnicities
    'chinese', 'american', 'korean', 'japanese',
    'indian', 'spanish', 'other_foreign',
    
    -- Standard Options
    'other', 'not_reported'
);

-- Household Type Classifications
CREATE TYPE household_type_enum AS ENUM (
    'nuclear',          -- Parents with children
    'single_parent',    -- Single parent with children
    'extended',         -- Multiple generations or relatives
    'childless',        -- Couple without children
    'grandparents',     -- Grandparents with grandchildren
    'stepfamily'        -- Blended family with step-relations
);

-- Tenure Status Classifications
CREATE TYPE tenure_status_enum AS ENUM (
    'owner',            -- Owns the property
    'renter',           -- Rents the property
    'others'            -- Other arrangements (free, caretaker, etc.)
);

-- Household Unit Types
CREATE TYPE household_unit_enum AS ENUM (
    'single_family_house',  -- Standalone house
    'townhouse',            -- Row house/townhouse
    'condominium',          -- Condo unit
    'duplex',               -- Two-unit building
    'mobile_home'           -- Mobile/manufactured home
);

-- Enhanced Family Position/Relationship Enum
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

-- Income Classification Enum
CREATE TYPE income_class_enum AS ENUM (
    'rich',                    -- ≥ 219,140
    'high_income',             -- 131,484 – 219,139
    'upper_middle_income',     -- 76,669 – 131,483
    'middle_class',            -- 43,828 – 76,668
    'lower_middle_class',      -- 21,194 – 43,827
    'low_income',              -- 9,520 – 21,193
    'poor'                     -- < 10,957
);

-- =====================================================
-- 2. PSGC REFERENCE TABLES (Philippine Standard Geographic Code)
-- =====================================================

CREATE TABLE psgc_regions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psgc_provinces (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psgc_cities_municipalities (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    type VARCHAR(50) NOT NULL,
    is_independent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enhanced: Independence constraint from current implementation
    CONSTRAINT independence_rule CHECK (
        (is_independent = true AND province_code IS NULL) 
        OR 
        (is_independent = false AND province_code IS NOT NULL)
    )
);

CREATE TABLE psgc_barangays (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. PSOC REFERENCE TABLES (Philippine Standard Occupational Classification)
-- =====================================================

-- PSOC Major Groups (code: "1", title: "Managers")
CREATE TABLE psoc_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Sub-Major Groups (code: "11", title: "Chief Executives, Senior Officials And Legislators", major_code: "1")
CREATE TABLE psoc_sub_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    major_code VARCHAR(10) NOT NULL REFERENCES psoc_major_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Minor Groups (code: "111", title: "Legislators And Senior Officials", sub_major_code: "11")
CREATE TABLE psoc_minor_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    sub_major_code VARCHAR(10) NOT NULL REFERENCES psoc_sub_major_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Unit Groups (code: "1111", title: "Legislators", minor_code: "111")
CREATE TABLE psoc_unit_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    minor_code VARCHAR(10) NOT NULL REFERENCES psoc_minor_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC Unit Sub-Groups (code: "111102", title: "Congressman", unit_code: "1111")
CREATE TABLE psoc_unit_sub_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Position titles/job names under unit groups
CREATE TABLE psoc_position_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    is_primary BOOLEAN DEFAULT false, -- Main title for the unit group
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC cross-references for related occupations (from sample data)
CREATE TABLE psoc_occupation_cross_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_occupation_title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ACCESS CONTROL AND USER MANAGEMENT
-- =====================================================

-- Roles and Permissions
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
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES auth_roles(id),
    -- Enhanced: Complete geographic hierarchy from current implementation
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    
    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barangay-specific user accounts for jurisdiction scoping
CREATE TABLE auth_barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth_user_profiles(id) ON DELETE CASCADE,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    is_primary BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, barangay_code)
);

-- =====================================================
-- 5. ADDRESS AND GEOGRAPHY MANAGEMENT
-- =====================================================

-- Subdivisions, Zones, Sitios, Puroks within barangays
CREATE TABLE geo_subdivisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Subdivision', 'Zone', 'Sitio', 'Purok')),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, barangay_code)
);

-- Street names within barangays
CREATE TABLE geo_street_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    subdivision_id UUID REFERENCES geo_subdivisions(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, barangay_code, subdivision_id)
);


-- =====================================================
-- 6. CORE ENTITIES - RESIDENTS AND HOUSEHOLDS
-- =====================================================

-- Function to generate hierarchical household ID using proper PSGC structure (RR-PP-MM-BBB)
CREATE OR REPLACE FUNCTION generate_hierarchical_household_id(
    p_barangay_code VARCHAR(10),
    p_subdivision_id UUID DEFAULT NULL,
    p_street_id UUID DEFAULT NULL
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
        FROM geo_street_names 
        WHERE barangay_code = p_barangay_code 
        AND (subdivision_id = p_subdivision_id OR (subdivision_id IS NULL AND p_subdivision_id IS NULL))
        AND id = p_street_id;
    END IF;
    
    -- Get next house sequence number for this street/subdivision combination
    SELECT COALESCE(MAX(CAST(RIGHT(id, 4) AS INTEGER)), 0) + 1
    INTO next_house_seq
    FROM households 
    WHERE barangay_code = p_barangay_code
    AND COALESCE(subdivision_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(p_subdivision_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND COALESCE(street_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(p_street_id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    house_num := LPAD(next_house_seq::TEXT, 4, '0');
    
    -- Construct the ID using PSGC format: RRPPMMBBB-SSSS-TTTT-HHHH
    new_id := region_code || province_code || municipality_code || 
              barangay_code || '-' || subdivision_num || '-' || street_num || '-' || house_num;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Households (core entity)
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Enhanced: Retain hierarchical code from current implementation
    code VARCHAR(50) NOT NULL UNIQUE, -- Hierarchical format: RRPPMMBBB-SSSS-TTTT-HHHH
    household_number VARCHAR(50) NOT NULL, -- Enhanced: Required from current implementation

    -- Address relationships
    house_number VARCHAR(50),
    street_id UUID REFERENCES geo_street_names(id),
    subdivision_id UUID REFERENCES geo_subdivisions(id),

    -- Enhanced: Required geographic fields from current implementation
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code), -- Required except independent cities
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),

    -- Household Profile Information  
    total_families INTEGER DEFAULT 1, -- Number of family units in household
    total_members INTEGER DEFAULT 0, -- Auto-calculated from residents
    total_migrants INTEGER DEFAULT 0, -- Auto-calculated from resident_sectoral_info



    -- Enhanced household fields
    household_type household_type_enum,
    tenure_status tenure_status_enum,
    tenure_others_specify TEXT, -- For "others" specification
    household_unit household_unit_enum,


    -- Household Name (derived from head's last name)
    household_name VARCHAR(100),

    -- Financial Information (calculated from residents' income)
    monthly_income DECIMAL(12,2) DEFAULT 0.00,
    income_class income_class_enum,


    household_head_id UUID, -- Will reference residents(id) - forward reference
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique household number per barangay
    UNIQUE(household_number, barangay_code)
);

-- Residents (core entity) - Enhanced schema
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- PhilSys Card Number (secure storage) - Optional from current implementation
    philsys_card_number_hash BYTEA,
    philsys_last4 VARCHAR(4),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    extension_name VARCHAR(20),
    birthdate DATE NOT NULL,
    age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(birthdate))) STORED,
    
    -- Birth Place Information (Single field approach like PSOC)
    birth_place_code VARCHAR(10), -- PSGC code (can be region, province, city, or barangay)
    birth_place_level birth_place_level_enum, -- Specifies which PSGC level the code represents
    birth_place_text VARCHAR(200), -- Free text for non-PSGC locations (e.g., foreign countries)
    -- Auto-generated complete birth place address
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
                    ELSE NULL
                END
            ELSE NULL
        END
    ) STORED,
    sex sex_enum NOT NULL,
    civil_status civil_status_enum NOT NULL,
    civil_status_others_specify TEXT, -- Custom text when civil_status = 'others'

    -- Enhanced Education Information - Optional from current implementation
    education_attainment education_level_enum, -- Highest level attempted/studying
    is_graduate BOOLEAN DEFAULT false, -- Completed the education level (true) or still studying/incomplete (false)


    -- Employment Status
    employment_status employment_status_enum, -- NULL for those not yet in workforce age
    
    -- Occupation (Single search field approach using psoc_occupation_search)
    psoc_code TEXT, -- Maps to occupation_code from psoc_occupation_search
    psoc_level TEXT, -- Maps to level_type from psoc_occupation_search
    occupation_title TEXT, -- Auto-populated from PSOC search selection
    job_title TEXT, -- Specific job position or title as stated by the resident
    workplace TEXT, -- Company name and location where the resident works
    occupation TEXT, -- General occupation field (for backward compatibility)
    occupation_details TEXT, -- Detailed occupation information



    -- Contact Information (Enhanced) - Optional from current implementation
    mobile_number VARCHAR(20),
    telephone_number VARCHAR(20), -- Enhanced: From current implementation
    email VARCHAR(255),


    -- Household Reference (Primary foreign key)
    household_id UUID REFERENCES households(id), -- Primary household reference via UUID
    household_code VARCHAR(50), -- Auto-populated from household (not a foreign key)
    
    -- Location Information
    street_id UUID REFERENCES geo_street_names(id),
    subdivision_id UUID REFERENCES geo_subdivisions(id),
    
    -- Geographic Hierarchy (Auto-populated from household or user's barangay)
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code), -- NULL for independent cities
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),



    -- Physical Characteristics (Enhanced: Retained from current implementation)
    blood_type blood_type_enum DEFAULT 'unknown',
    height DECIMAL(5,2), -- Height in cm
    weight DECIMAL(5,2), -- Weight in kg
    complexion VARCHAR(50), -- Complexion description
    citizenship citizenship_enum DEFAULT 'filipino',
    


    is_registered_voter BOOLEAN DEFAULT false, -- Voter registration status
    is_resident_voter BOOLEAN DEFAULT false, -- Resident of voting precinct  
    last_voted_year INTEGER, -- Last voted year

    
    -- Demographics (Optional)
    -- Enhanced: Voting Information from current implementation
    ethnicity ethnicity_enum DEFAULT 'not_reported',

    religion religion_enum DEFAULT 'prefer_not_to_say',
    religion_others_specify TEXT,
    
    
    -- Mother's maiden name
    mother_maiden_first TEXT,
    mother_maiden_middle TEXT,
    mother_maiden_last TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Enhanced: Full-text search from current implementation with improved null handling
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
    
    -- Full text search vector for advanced search
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

-- Add the foreign key constraint for household_head_id
ALTER TABLE households ADD CONSTRAINT fk_household_head 
    FOREIGN KEY (household_head_id) REFERENCES residents(id);

-- Add unique constraint for household head
ALTER TABLE households ADD CONSTRAINT unique_household_head_per_household 
    UNIQUE(household_head_id);

-- Household Members (junction table)
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
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
    UNIQUE(household_id, resident_id)
);

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

-- Sectoral Information Table
CREATE TABLE resident_sectoral_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    
    -- Labor Force Status (automatically determined from occupation)
    is_labor_force BOOLEAN DEFAULT false,
    is_employed BOOLEAN DEFAULT false,
    is_unemployed BOOLEAN DEFAULT false,
    
    -- Special Populations
    is_overseas_filipino_worker BOOLEAN DEFAULT false, -- Overseas Filipino Worker
    is_person_with_disability BOOLEAN DEFAULT false, -- PWD
    is_out_of_school_children BOOLEAN DEFAULT false, -- Auto-calc: Ages 6-14 not enrolled in formal education
    is_out_of_school_youth BOOLEAN DEFAULT false,    -- Auto-calc: Ages 15-24 not in school, no college attainment, not employed
    is_senior_citizen BOOLEAN DEFAULT false,         -- Senior Citizen (60+)
    is_registered_senior_citizen BOOLEAN DEFAULT false, -- Registered SC
    is_solo_parent BOOLEAN DEFAULT false,            -- Solo Parent
    is_indigenous_people BOOLEAN DEFAULT false,      -- Indigenous People
    is_migrant BOOLEAN DEFAULT false,                -- Migrant
        
    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per resident
    UNIQUE(resident_id)
);

-- Migrant Information Table
CREATE TABLE resident_migrant_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    
    -- Previous Residence Information
    previous_barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    previous_city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    previous_province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    previous_region_code VARCHAR(10) REFERENCES psgc_regions(code),
    
    -- Migration Details
    length_of_stay_previous_months INTEGER, -- Length of stay in previous residence (in months)
    reason_for_leaving TEXT, -- Reason for leaving previous residence
    date_of_transfer DATE, -- Date of transfer to current barangay
    reason_for_transferring TEXT, -- Reason for transferring to this barangay
    duration_of_stay_current_months INTEGER, -- Duration of stay in current barangay (in months)
    
    -- Return Intention
    intends_to_return BOOLEAN, -- true = Yes, false = No, null = undecided
    
    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per resident
    UNIQUE(resident_id)
);

-- =====================================================
-- 7. ANALYTICS AND REPORTING
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
-- 8. PERFORMANCE INDEXES
-- =====================================================

-- Primary search indexes
CREATE INDEX idx_residents_search_vector ON residents USING GIN(search_vector);
-- Enhanced: Search text index from current implementation
CREATE INDEX idx_residents_search_text ON residents USING GIN(search_text gin_trgm_ops);
CREATE INDEX idx_residents_barangay ON residents(barangay_code);
CREATE INDEX idx_residents_household ON residents(household_id);
-- Enhanced: Conditional index for storage optimization from current implementation
CREATE INDEX idx_residents_philsys_last4 ON residents(philsys_last4) WHERE philsys_last4 IS NOT NULL;
-- Enhanced: Birthdate and age indexes for age-based calculations
CREATE INDEX idx_residents_birthdate ON residents(birthdate);
CREATE INDEX idx_residents_age ON residents(age);

-- Performance indexes for common query patterns
CREATE INDEX idx_residents_barangay_employment ON residents(barangay_code, employment_status);
CREATE INDEX idx_residents_barangay_age ON residents(barangay_code, age);
CREATE INDEX idx_residents_barangay_civil_status ON residents(barangay_code, civil_status);
CREATE INDEX idx_residents_barangay_education ON residents(barangay_code, education_attainment, is_graduate);
-- Birth place indexes for demographic analysis
CREATE INDEX idx_residents_birth_place_code ON residents(birth_place_code);
CREATE INDEX idx_residents_birth_place_level ON residents(birth_place_level);
CREATE INDEX idx_residents_birth_place_code_level ON residents(birth_place_code, birth_place_level);
CREATE INDEX idx_residents_birth_place_full ON residents USING GIN(to_tsvector('english', birth_place_full));
CREATE INDEX idx_residents_sex ON residents(sex);
CREATE INDEX idx_residents_civil_status ON residents(civil_status);
CREATE INDEX idx_residents_citizenship ON residents(citizenship);
CREATE INDEX idx_residents_registered_voter ON residents(is_registered_voter);
CREATE INDEX idx_residents_education_attainment ON residents(education_attainment);
CREATE INDEX idx_residents_psoc_code ON residents(psoc_code);
CREATE INDEX idx_residents_psoc_level ON residents(psoc_level);
CREATE INDEX idx_residents_employment_status ON residents(employment_status);
CREATE INDEX idx_residents_ethnicity ON residents(ethnicity);
CREATE INDEX idx_residents_religion ON residents(religion);

-- Address and geography indexes
CREATE INDEX idx_residents_region ON residents(region_code);
CREATE INDEX idx_residents_province ON residents(province_code);
CREATE INDEX idx_residents_city_municipality ON residents(city_municipality_code);
CREATE INDEX idx_geo_street_names_barangay ON geo_street_names(barangay_code);
CREATE INDEX idx_geo_street_names_subdivision ON geo_street_names(subdivision_id);
CREATE INDEX idx_geo_street_names_active ON geo_street_names(is_active);
CREATE INDEX idx_geo_subdivisions_barangay ON geo_subdivisions(barangay_code);
CREATE INDEX idx_geo_subdivisions_active ON geo_subdivisions(is_active);

-- Household indexes
CREATE INDEX idx_households_barangay ON households(barangay_code);
CREATE INDEX idx_households_subdivision ON households(subdivision_id);
CREATE INDEX idx_households_street ON households(street_id);
CREATE INDEX idx_households_number_barangay ON households(household_number, barangay_code);
CREATE INDEX idx_household_members_household ON household_members(household_id);
CREATE INDEX idx_household_members_resident ON household_members(resident_id);
CREATE INDEX idx_household_members_active ON household_members(is_active);

-- Household enhanced field indexes
CREATE INDEX idx_households_type ON households(household_type);
CREATE INDEX idx_households_tenure ON households(tenure_status);
CREATE INDEX idx_households_unit ON households(household_unit);
CREATE INDEX idx_households_income_class ON households(income_class);
CREATE INDEX idx_households_monthly_income ON households(monthly_income);
CREATE INDEX idx_households_total_members ON households(total_members);

-- Relationship indexes
CREATE INDEX idx_relationships_resident_a ON resident_relationships(resident_a_id);
CREATE INDEX idx_relationships_resident_b ON resident_relationships(resident_b_id);
CREATE INDEX idx_relationships_type ON resident_relationships(relationship_type);

-- User and access control indexes
CREATE INDEX idx_auth_user_profiles_role ON auth_user_profiles(role_id);
CREATE INDEX idx_barangay_accounts_user ON auth_barangay_accounts(user_id);
CREATE INDEX idx_barangay_accounts_barangay ON auth_barangay_accounts(barangay_code);

-- Audit trail indexes
CREATE INDEX idx_system_audit_logs_table_record ON system_audit_logs(table_name, record_id);
CREATE INDEX idx_system_audit_logs_user ON system_audit_logs(user_id);
CREATE INDEX idx_system_audit_logs_created_at ON system_audit_logs(created_at);
CREATE INDEX idx_system_audit_logs_barangay ON system_audit_logs(barangay_code);

-- Dashboard summary indexes
CREATE INDEX idx_dashboard_summaries_barangay ON system_dashboard_summaries(barangay_code);
CREATE INDEX idx_dashboard_summaries_date ON system_dashboard_summaries(calculation_date);

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

-- Additional indexes for household members
CREATE INDEX idx_household_members_position ON household_members(family_position);

-- Additional indexes for residents new fields
-- Removed duplicate birthplace index (using birth_place_full instead)
CREATE INDEX idx_residents_religion_others ON residents(religion_others_specify);

-- Indexes for migrant information
CREATE INDEX idx_migrant_resident ON resident_migrant_info(resident_id);
CREATE INDEX idx_migrant_previous_region ON resident_migrant_info(previous_region_code);
CREATE INDEX idx_migrant_previous_province ON resident_migrant_info(previous_province_code);
CREATE INDEX idx_migrant_previous_city ON resident_migrant_info(previous_city_municipality_code);
CREATE INDEX idx_migrant_previous_barangay ON resident_migrant_info(previous_barangay_code);
CREATE INDEX idx_migrant_date_transfer ON resident_migrant_info(date_of_transfer);
CREATE INDEX idx_migrant_intention_return ON resident_migrant_info(intends_to_return);
CREATE INDEX idx_migrant_length_stay_previous ON resident_migrant_info(length_of_stay_previous_months);
CREATE INDEX idx_migrant_duration_current ON resident_migrant_info(duration_of_stay_current_months);

-- Additional household income classification indexes
CREATE INDEX idx_households_monthly_income_class ON households(monthly_income, income_class);

-- PSOC table indexes
CREATE INDEX idx_psoc_unit_sub_groups_unit_code ON psoc_unit_sub_groups(unit_code);
CREATE INDEX idx_psoc_position_titles_unit_group_code ON psoc_position_titles(unit_group_code);
CREATE INDEX idx_psoc_position_titles_title ON psoc_position_titles(title);
CREATE INDEX idx_psoc_cross_references_unit_group_code ON psoc_occupation_cross_references(unit_group_code);
CREATE INDEX idx_psoc_cross_references_related_unit_code ON psoc_occupation_cross_references(related_unit_code);

-- Additional household status index
CREATE INDEX idx_households_is_active ON households(is_active);

-- =====================================================
-- 9. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Enhanced function to update household derived fields
CREATE OR REPLACE FUNCTION update_household_derived_fields()
RETURNS TRIGGER AS $$
DECLARE
    calculated_income DECIMAL(12,2);
BEGIN
    -- Calculate the monthly income
    SELECT COALESCE(SUM(r.salary), 0.00)
    INTO calculated_income
    FROM household_members hm
    JOIN residents r ON hm.resident_id = r.id
    WHERE hm.household_id = COALESCE(NEW.household_id, OLD.household_id) 
    AND hm.is_active = true;
    
    -- Update the household with calculated values including income class
    UPDATE households 
    SET 
        total_members = (
            SELECT COUNT(*) 
            FROM household_members 
            WHERE household_id = COALESCE(NEW.household_id, OLD.household_id) 
            AND is_active = true
        ),
        total_migrants = (
            SELECT COUNT(*) 
            FROM household_members hm
            JOIN resident_sectoral_info si ON hm.resident_id = si.resident_id
            WHERE hm.household_id = COALESCE(NEW.household_id, OLD.household_id) 
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
                WHERE id = COALESCE(NEW.household_id, OLD.household_id)
            )
        ),
        household_size = (
            SELECT COUNT(*) 
            FROM household_members 
            WHERE household_id = COALESCE(NEW.household_id, OLD.household_id) 
            AND is_active = true
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.household_id, OLD.household_id);
    
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
CREATE OR REPLACE FUNCTION update_resident_sectoral_status()
RETURNS TRIGGER AS $$
DECLARE
    current_age INTEGER;
BEGIN
    -- Calculate age once for efficiency (generated column not available during INSERT)
    current_age := EXTRACT(YEAR FROM AGE(NEW.birthdate));
    
    -- Enhanced: Better PL/pgSQL syntax with :=
    -- Auto-calculate senior citizen status (age 60+)
    NEW.is_senior_citizen := (current_age >= 60);
    
    -- Auto-calculate labor force status based on employment
    NEW.is_labor_force := (NEW.employment_status IN ('employed', 'unemployed', 'underemployed', 'self_employed', 'looking_for_work'));
    NEW.is_employed := (NEW.employment_status IN ('employed', 'self_employed'));
    NEW.is_unemployed := (NEW.employment_status IN ('unemployed', 'looking_for_work'));
    
    -- Auto-calculate PWD status (this will be set via resident_sectoral_info)  
    -- NEW.is_person_with_disability is handled in resident_sectoral_info table
    
    -- Auto-calculate Out-of-School Children (OSC): Ages 6-14 not enrolled in formal education
    IF current_age BETWEEN 6 AND 14 THEN
        NEW.is_out_of_school_children := (NEW.is_graduate = false 
            AND NEW.education_attainment IN ('elementary', 'high_school')); -- Should be studying/completing elementary/high school
    ELSE
        NEW.is_out_of_school_children := false;
    END IF;
    
    -- Auto-calculate Out-of-School Youth (OSY): Ages 15-24 not attending school, 
    -- haven't completed college/post-secondary course, and not employed
    -- Note: employment_status may be NULL for those not yet in workforce age
    IF current_age BETWEEN 15 AND 24 THEN
        NEW.is_out_of_school_youth := (
            -- Haven't completed college/post-graduate (is_graduate = false for college level OR lower education level)
            (NEW.education_attainment NOT IN ('college', 'post_graduate') OR NEW.is_graduate = false)
            AND NEW.is_graduate = false -- Not completed current education level
            AND (NEW.employment_status IS NULL OR NEW.employment_status NOT IN ('employed', 'self_employed')) -- Not employed or no employment data yet
        );
    ELSE
        NEW.is_out_of_school_youth := false;
    END IF;
    
    -- Enhanced: Auto-update timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-populate household barangay and generate ID
CREATE OR REPLACE FUNCTION generate_household_id_trigger()
RETURNS TRIGGER AS $$
DECLARE
    user_barangay_code VARCHAR(10);
BEGIN
    -- Auto-populate barangay from user's assigned barangay if not provided
    IF NEW.barangay_code IS NULL THEN
        SELECT ba.barangay_code 
        INTO user_barangay_code
        FROM barangay_accounts ba 
        WHERE ba.user_id = auth.uid();
        
        NEW.barangay_code := user_barangay_code;
    END IF;
    
    -- Generate hierarchical ID if not provided
    IF NEW.id IS NULL THEN
        NEW.id := generate_hierarchical_household_id(
            NEW.barangay_code,
            NEW.subdivision_id,
            NEW.street_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to auto-populate resident address from user's assigned barangay or household
CREATE OR REPLACE FUNCTION auto_populate_resident_address()
RETURNS TRIGGER AS $$
DECLARE
    user_barangay_code VARCHAR(10);
    region_code VARCHAR(10);
    province_code VARCHAR(10);
    city_code VARCHAR(10);
    household_code VARCHAR(50);
BEGIN
    -- Priority 1: Auto-populate from household if household_id is provided
    IF NEW.household_id IS NOT NULL THEN
        SELECT 
            h.barangay_code, 
            h.city_municipality_code, 
            h.province_code, 
            h.region_code, 
            h.code
        INTO 
            NEW.barangay_code, 
            NEW.city_municipality_code, 
            NEW.province_code, 
            NEW.region_code, 
            NEW.household_code
        FROM households h 
        WHERE h.id = NEW.household_id;
        
        -- Return early if household was found and populated
        IF FOUND THEN
            RETURN NEW;
        END IF;
    END IF;
    
    -- Priority 2: Auto-populate from user's assigned barangay (fallback)
    SELECT ba.barangay_code 
    INTO user_barangay_code
    FROM barangay_accounts ba 
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
        JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
        WHERE b.code = user_barangay_code;
        
        -- Auto-populate the address fields only if not already set
        IF NEW.barangay_code IS NULL THEN
            NEW.barangay_code := user_barangay_code;
        END IF;
        IF NEW.city_municipality_code IS NULL THEN
            NEW.city_municipality_code := city_code;
        END IF;
        IF NEW.province_code IS NULL THEN
            NEW.province_code := province_code;
        END IF;
        IF NEW.region_code IS NULL THEN
            NEW.region_code := region_code;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trigger_update_geo_street_names_updated_at
    BEFORE UPDATE ON geo_street_names
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 10. ROW LEVEL SECURITY (Complete Implementation)
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
ALTER TABLE psoc_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE psoc_cross_references FORCE ROW LEVEL SECURITY;

-- Application Tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
ALTER TABLE auth_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE barangay_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_accounts FORCE ROW LEVEL SECURITY;
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
ALTER TABLE geo_street_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_street_names FORCE ROW LEVEL SECURITY;
ALTER TABLE resident_sectoral_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_sectoral_info FORCE ROW LEVEL SECURITY;
ALTER TABLE resident_migrant_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_migrant_info FORCE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE system_dashboard_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_dashboard_summaries FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 11. RLS POLICIES (Comprehensive Implementation)
-- =====================================================

-- PSGC Tables - Public read access, admin write access
CREATE POLICY "Public read psgc_regions" ON psgc_regions FOR SELECT USING (true);
CREATE POLICY "Admin write psgc_regions" ON psgc_regions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name IN ('super_admin', 'barangay_admin')
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
CREATE POLICY "Public read psoc_cross_references" ON psoc_cross_references FOR SELECT USING (true);

-- Roles - Super admin access only
CREATE POLICY "Super admin only roles" ON roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'super_admin'
    )
);

-- User profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON auth_user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON auth_user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Barangay-scoped access for residents
CREATE POLICY "Barangay access for residents" ON residents
    FOR ALL USING (
        barangay_code IN (
            SELECT ba.barangay_code 
            FROM barangay_accounts ba 
            WHERE ba.user_id = auth.uid()
        )
    );

-- Barangay-scoped access for households
CREATE POLICY "Barangay access for households" ON households
    FOR ALL USING (
        barangay_code IN (
            SELECT ba.barangay_code 
            FROM barangay_accounts ba 
            WHERE ba.user_id = auth.uid()
        )
    );

-- Barangay-scoped access for household_members
CREATE POLICY "Barangay access for household_members" ON household_members
    FOR ALL USING (
        household_id IN (
            SELECT h.id 
            FROM households h 
            JOIN barangay_accounts ba ON h.barangay_code = ba.barangay_code 
            WHERE ba.user_id = auth.uid()
        )
    );

-- Barangay-scoped access for geo_subdivisions
CREATE POLICY "Barangay access for geo_subdivisions" ON geo_subdivisions
    FOR ALL USING (
        barangay_code IN (
            SELECT ba.barangay_code 
            FROM barangay_accounts ba 
            WHERE ba.user_id = auth.uid()
        )
    );

-- Barangay-scoped access for geo_street_names
CREATE POLICY "Barangay access for geo_street_names" ON geo_street_names
    FOR ALL USING (
        barangay_code IN (
            SELECT ba.barangay_code 
            FROM barangay_accounts ba 
            WHERE ba.user_id = auth.uid()
        )
    );

-- Barangay-scoped access for resident_sectoral_info
CREATE POLICY "Barangay access for resident_sectoral_info" ON resident_sectoral_info
    FOR ALL USING (
        resident_id IN (
            SELECT r.id 
            FROM residents r
            JOIN barangay_accounts ba ON r.barangay_code = ba.barangay_code 
            WHERE ba.user_id = auth.uid()
        )
    );

-- Barangay-scoped access for resident_migrant_info
CREATE POLICY "Barangay access for resident_migrant_info" ON resident_migrant_info
    FOR ALL USING (
        resident_id IN (
            SELECT r.id 
            FROM residents r
            JOIN barangay_accounts ba ON r.barangay_code = ba.barangay_code 
            WHERE ba.user_id = auth.uid()
        )
    );

-- Barangay-scoped access for system_audit_logs
CREATE POLICY "Barangay access for system_audit_logs" ON system_audit_logs
    FOR SELECT USING (
        barangay_code IN (
            SELECT ba.barangay_code 
            FROM barangay_accounts ba 
            WHERE ba.user_id = auth.uid()
        )
    );

-- =====================================================
-- 12. PERMISSIONS (Anonymous & Authenticated)
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
GRANT SELECT ON psoc_cross_references TO anon;

-- Authenticated users - Full access controlled by RLS policies
GRANT ALL ON residents TO authenticated;
GRANT ALL ON households TO authenticated;
GRANT ALL ON household_members TO authenticated;
GRANT ALL ON auth_user_profiles TO authenticated;
GRANT ALL ON barangay_accounts TO authenticated;
GRANT ALL ON resident_relationships TO authenticated;
GRANT ALL ON geo_subdivisions TO authenticated;
GRANT ALL ON geo_street_names TO authenticated;
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
GRANT SELECT ON psoc_cross_references TO authenticated;

-- Admin tables
GRANT SELECT ON roles TO authenticated;

-- Sequences for authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 13. VIEWS FOR UI OPTIMIZATION
-- =====================================================

-- Flattened PSOC hierarchy for unified occupation search
CREATE VIEW psoc_occupation_search AS
-- Unit sub-groups (most specific PSOC level) 
SELECT 
    usg.code as occupation_code,
    'unit_sub_group' as level_type,
    ug.title || ' - ' || usg.title as occupation_title, -- "Legislators - Congressman"
    usg.description as occupation_description,
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
    ug.description as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    ug.code as unit_group_code,
    ug.title as unit_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title || ' > ' || ug.title as full_hierarchy,
    1 as hierarchy_level
FROM psoc_unit_groups ug
JOIN psoc_minor_groups ming ON ug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

SELECT 
    ming.code as occupation_code,
    'minor_group' as level_type,
    ming.title as occupation_title,
    ming.description as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title as full_hierarchy,
    2 as hierarchy_level
FROM psoc_minor_groups ming
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

SELECT 
    smg.code as occupation_code,
    'sub_major_group' as level_type,
    smg.title as occupation_title,
    smg.description as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    NULL as minor_group_code,
    NULL as minor_group_title,
    mg.title || ' > ' || smg.title as full_hierarchy,
    3 as hierarchy_level
FROM psoc_sub_major_groups smg
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

SELECT 
    mg.code as occupation_code,
    'major_group' as level_type,
    mg.title as occupation_title,
    mg.description as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    NULL as sub_major_group_code,
    NULL as sub_major_group_title,
    NULL as minor_group_code,
    NULL as minor_group_title,
    mg.title as full_hierarchy,
    4 as hierarchy_level
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
    mg.title || ' > ' || smg.title || ' > ' || ming.title || ' > ' || rug.title || ' > ' || cr.related_occupation_title as full_hierarchy,
    5 as hierarchy_level -- Lowest priority, shown after main results
FROM psoc_occupation_cross_references cr
JOIN psoc_unit_groups ug ON cr.unit_group_code = ug.code -- Original unit group
JOIN psoc_unit_groups rug ON cr.related_unit_code = rug.code -- Related unit group
JOIN psoc_minor_groups ming ON rug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

ORDER BY hierarchy_level, occupation_title;

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

-- Settings management summary view
CREATE VIEW settings_management_summary AS
SELECT 
    b.code as barangay_code,
    b.name as barangay_name,
    COUNT(DISTINCT s.id) as total_geo_subdivisions,
    COUNT(DISTINCT CASE WHEN s.is_active = true THEN s.id END) as active_geo_subdivisions,
    COUNT(DISTINCT h.id) as total_households,
    COUNT(DISTINCT CASE WHEN h.is_active = true THEN h.id END) as active_households
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
    si.is_ofw,
    si.is_person_with_disability,
    si.is_out_of_school_children,
    si.is_out_of_school_youth,
    si.is_senior_citizen,
    si.is_registered_senior_citizen,
    si.is_solo_parent,
    si.is_indigenous_people,
    si.is_migrant,
    si.notes as sectoral_notes,
    mi.previous_complete_address,
    mi.length_of_stay_previous_months,
    mi.reason_for_leaving,
    mi.date_of_transfer,
    mi.reason_for_transferring,
    mi.duration_of_stay_current_months,
    mi.intention_to_return,
    mi.intention_notes
FROM residents r
LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
LEFT JOIN resident_migrant_info mi ON r.id = mi.resident_id;

-- Enhanced households view with complete information and income classification
CREATE VIEW households_complete AS
SELECT 
    h.*,
    r.first_name || ' ' || r.last_name as head_full_name,
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
LEFT JOIN geo_street_names st ON h.street_id = st.id
LEFT JOIN psgc_barangays bgy ON h.barangay_code = bgy.code
LEFT JOIN psgc_cities_municipalities city ON bgy.city_municipality_code = city.code
LEFT JOIN psgc_provinces prov ON city.province_code = prov.code
LEFT JOIN psgc_regions reg ON prov.region_code = reg.code;

-- Complete migrant information view with address details
CREATE VIEW migrants_complete AS
SELECT 
    mi.*,
    r.first_name,
    r.middle_name,
    r.last_name,
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
-- 12. INITIAL DATA SETUP
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('Super Admin', 'System-wide administrator with full access', '{"all": true}'),
('Barangay Admin', 'Barangay administrator with local management access', 
 '{"manage_users": true, "manage_residents": true, "manage_households": true, "view_analytics": true}'),
('Clerk', 'Data entry clerk with CRUD access to residents and households', 
 '{"manage_residents": true, "manage_households": true}'),
('Resident', 'Self-service access to personal information', 
 '{"view_own_data": true, "update_own_contact": true}');

-- =====================================================
-- SCHEMA COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA public IS 'RBI System - Records of Barangay Inhabitant System Database Schema v1.0';

-- Table comments
COMMENT ON TABLE residents IS 'Core resident profiles with comprehensive demographic data (LGU Form 10 compliant)';
COMMENT ON TABLE households IS 'Household entities with address and composition management';
COMMENT ON TABLE psoc_occupation_search IS 'Flattened PSOC hierarchy view for unified occupation search UI';
COMMENT ON VIEW psgc_address_hierarchy IS 'Complete address hierarchy view for settings management';

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
COMMENT ON COLUMN households.barangay_code IS 'Auto-populated from logged-in user''s assigned barangay (from barangay_accounts table)';
COMMENT ON COLUMN residents.barangay_code IS 'Auto-populated from logged-in user''s assigned barangay (from barangay_accounts table)';
COMMENT ON COLUMN residents.region_code IS 'Auto-populated from barangay hierarchy lookup';
COMMENT ON COLUMN residents.province_code IS 'Auto-populated from barangay hierarchy lookup';
COMMENT ON COLUMN residents.city_municipality_code IS 'Auto-populated from barangay hierarchy lookup';

-- Note: PSGC and PSOC reference data should be imported separately
-- using official data sources from PSA (Philippine Statistics Authority)

-- =====================================================
-- PRODUCTION VALIDATION AND CONSTRAINTS
-- =====================================================

-- Additional constraints for data integrity
ALTER TABLE residents ADD CONSTRAINT valid_birthdate 
    CHECK (birthdate <= CURRENT_DATE AND birthdate >= '1900-01-01');

ALTER TABLE residents ADD CONSTRAINT valid_height 
    CHECK (height_m IS NULL OR (height_m >= 0.5 AND height_m <= 3.0));

ALTER TABLE residents ADD CONSTRAINT valid_weight 
    CHECK (weight_kg IS NULL OR (weight_kg >= 10 AND weight_kg <= 500));

ALTER TABLE residents ADD CONSTRAINT valid_salary 
    CHECK (salary >= 0);

-- Birth place validation constraint
ALTER TABLE residents ADD CONSTRAINT valid_birth_place_code 
    CHECK (
        birth_place_code IS NULL OR birth_place_level IS NULL OR
        CASE birth_place_level
            WHEN 'region' THEN EXISTS (SELECT 1 FROM psgc_regions WHERE code = birth_place_code)
            WHEN 'province' THEN EXISTS (SELECT 1 FROM psgc_provinces WHERE code = birth_place_code)
            WHEN 'city_municipality' THEN EXISTS (SELECT 1 FROM psgc_cities_municipalities WHERE code = birth_place_code)
            WHEN 'barangay' THEN EXISTS (SELECT 1 FROM psgc_barangays WHERE code = birth_place_code)
            ELSE false
        END
    );

-- Civil status others specification constraint
ALTER TABLE residents ADD CONSTRAINT valid_civil_status_others_specify
    CHECK (
        (civil_status = 'others' AND civil_status_others_specify IS NOT NULL AND TRIM(civil_status_others_specify) != '') OR
        (civil_status != 'others')
    );

ALTER TABLE households ADD CONSTRAINT valid_monthly_income 
    CHECK (monthly_income >= 0);

ALTER TABLE households ADD CONSTRAINT valid_total_members 
    CHECK (total_members >= 0);

ALTER TABLE households ADD CONSTRAINT valid_total_families 
    CHECK (total_families >= 1);

-- Ensure philsys_last4 is exactly 4 characters if provided
ALTER TABLE residents ADD CONSTRAINT valid_philsys_last4 
    CHECK (philsys_last4 IS NULL OR LENGTH(philsys_last4) = 4);

-- Ensure email format is valid if provided
ALTER TABLE residents ADD CONSTRAINT valid_email_format 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- =====================================================
-- SCHEMA VERSIONING AND METADATA
-- =====================================================

CREATE TABLE system_schema_versions (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- =====================================================
-- BIRTH PLACE SELECTION VIEWS AND FUNCTIONS
-- =====================================================

-- Unified view for birth place selection (similar to PSOC hierarchy)
CREATE OR REPLACE VIEW birth_place_options AS
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

-- Grant permissions
GRANT SELECT ON birth_place_options TO authenticated;

-- Add comments
COMMENT ON TYPE birth_place_level_enum IS 'Specifies which level of PSGC hierarchy the birth_place_code refers to (similar to PSOC levels)';
COMMENT ON VIEW birth_place_options IS 'Unified view of all PSGC locations for birth place selection (similar to PSOC hierarchy view)';
COMMENT ON FUNCTION search_birth_places(TEXT, birth_place_level_enum, VARCHAR(10), INTEGER) IS 'Search function for birth places across all PSGC levels with fuzzy matching';
COMMENT ON FUNCTION get_birth_place_details(VARCHAR(10), birth_place_level_enum) IS 'Get detailed information for a specific birth place code and level';

-- =====================================================
-- OCCUPATION SEARCH FUNCTIONS
-- =====================================================

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
            pos.occupation_title ILIKE '%' || search_term || '%' OR
            pos.searchable_text ILIKE '%' || search_term || '%'
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_occupations(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupation_details(TEXT) TO authenticated;

-- Add comments
COMMENT ON FUNCTION search_occupations(TEXT, INTEGER) IS 'Search occupations from psoc_occupation_search table by title or searchable text';
COMMENT ON FUNCTION get_occupation_details(TEXT) IS 'Get occupation details by PSOC occupation code';

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

-- =====================================================
-- HOUSEHOLD SEARCH FOR RESIDENT CREATION
-- =====================================================

-- Create household search view with complete address display
CREATE OR REPLACE VIEW household_search AS
SELECT 
    h.id,
    h.code,
    h.household_number,
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
LEFT JOIN geo_street_names s ON h.street_id = s.id
LEFT JOIN geo_subdivisions sub ON h.subdivision_id = sub.id
JOIN psgc_barangays b ON h.barangay_code = b.code
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
WHERE h.is_active = true;

-- Create search function for households with user barangay filtering
CREATE OR REPLACE FUNCTION search_households(
    search_term TEXT DEFAULT NULL,
    user_barangay_code TEXT DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    household_id UUID,
    household_code VARCHAR(50),
    household_number VARCHAR(50),
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
        hs.id,
        hs.code,
        hs.household_number,
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
            hs.household_number ILIKE '%' || search_term || '%' OR
            hs.house_number ILIKE '%' || search_term || '%' OR
            hs.street_name ILIKE '%' || search_term || '%' OR
            hs.subdivision_name ILIKE '%' || search_term || '%' OR
            hs.full_address ILIKE '%' || search_term || '%'
        ))
    ORDER BY 
        -- Prioritize exact matches
        CASE WHEN hs.household_number ILIKE search_term THEN 1
             WHEN hs.house_number ILIKE search_term THEN 2
             ELSE 3 END,
        hs.household_number,
        hs.created_at DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Create function to get household details for auto-population
CREATE OR REPLACE FUNCTION get_household_for_resident(
    household_id UUID
)
RETURNS TABLE (
    id UUID,
    code VARCHAR(50),
    household_number VARCHAR(50),
    barangay_code VARCHAR(10),
    city_municipality_code VARCHAR(10),
    province_code VARCHAR(10),
    region_code VARCHAR(10),
    full_address TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hs.id,
        hs.code,
        hs.household_number,
        hs.barangay_code,
        hs.city_municipality_code,
        hs.province_code,
        hs.region_code,
        hs.full_address
    FROM household_search hs
    WHERE hs.id = get_household_for_resident.household_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for household search functions
GRANT SELECT ON household_search TO authenticated;
GRANT EXECUTE ON FUNCTION search_households(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_household_for_resident(UUID) TO authenticated;

-- Add RLS policy for household_search view
ALTER VIEW household_search SET (security_barrier = true);

-- Add comments for household search
COMMENT ON VIEW household_search IS 'Complete household information with formatted addresses for resident creation search';
COMMENT ON FUNCTION search_households(TEXT, TEXT, INTEGER) IS 'Search households with full address display for resident creation - includes RLS filtering by user barangay';
COMMENT ON FUNCTION get_household_for_resident(UUID) IS 'Get specific household details for resident auto-population';

-- =====================================================
-- USER TRACKING TRIGGERS
-- =====================================================

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

-- Apply user tracking trigger to residents table
CREATE TRIGGER trigger_residents_user_tracking
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to household_members table
CREATE TRIGGER trigger_household_members_user_tracking
    BEFORE INSERT OR UPDATE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to households table
CREATE TRIGGER trigger_households_user_tracking
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to resident_sectoral_info table
CREATE TRIGGER trigger_resident_sectoral_info_user_tracking
    BEFORE INSERT OR UPDATE ON resident_sectoral_info
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to resident_migrant_info table
CREATE TRIGGER trigger_resident_migrant_info_user_tracking
    BEFORE INSERT OR UPDATE ON resident_migrant_info
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to resident_relationships table
CREATE TRIGGER trigger_resident_relationships_user_tracking
    BEFORE INSERT OR UPDATE ON resident_relationships
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to auth_user_profiles table
CREATE TRIGGER trigger_auth_user_profiles_user_tracking
    BEFORE INSERT OR UPDATE ON auth_user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to barangay_accounts table
CREATE TRIGGER trigger_barangay_accounts_user_tracking
    BEFORE INSERT OR UPDATE ON barangay_accounts
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to geo_subdivisions table
CREATE TRIGGER trigger_geo_subdivisions_user_tracking
    BEFORE INSERT OR UPDATE ON geo_subdivisions
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Apply user tracking trigger to geo_street_names table
CREATE TRIGGER trigger_geo_street_names_user_tracking
    BEFORE INSERT OR UPDATE ON geo_street_names
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Note: system_dashboard_summaries is system-generated, no user tracking needed

-- Grant execute permission
GRANT EXECUTE ON FUNCTION populate_user_tracking_fields() TO authenticated;

-- Add comments
COMMENT ON FUNCTION populate_user_tracking_fields() IS 'Automatically populates created_by and updated_by fields with current user ID';

INSERT INTO system_schema_versions (version, description) 
VALUES ('2.0', 'Enhanced full-feature schema with current implementation optimizations: independence constraints, enhanced auto-calculations, improved search, conditional indexes, smart address formatting');

-- Production readiness indicator
COMMENT ON SCHEMA public IS 'RBI System v2.0 - Full-Feature Schema with Current Implementation Enhancements - Records of Barangay Inhabitant System';

-- =====================================================
-- END OF SCHEMA
-- =====================================================