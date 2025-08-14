-- RECORDS OF BARANGAY INHABITANT (RBI) SYSTEM - SUPABASE EDITION
-- Version: 3.0.0 - PostgreSQL 15+ Schema for Supabase
-- Updated: January 2025
-- Documentation: docs/reference/DATABASE_SCHEMA_DOCUMENTATION.md

-- =============================================================================
-- SECTION 1: EXTENSIONS
-- Required PostgreSQL extensions for system functionality
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram fuzzy text search

-- SECTION 2: ENUMS AND CUSTOM TYPES
-- Standardized data types for DILG RBI compliance and data consistency

-- Personal Information
CREATE TYPE sex_enum AS ENUM ('male', 'female');
CREATE TYPE civil_status_enum AS ENUM ('single', 'married', 'divorced', 'separated', 'widowed', 'others');
CREATE TYPE citizenship_enum AS ENUM ('filipino', 'dual_citizen', 'foreign_national');

-- Education
CREATE TYPE education_level_enum AS ENUM ('elementary', 'high_school', 'college', 'post_graduate', 'vocational');

-- Employment
CREATE TYPE employment_status_enum AS ENUM (
    'employed', 'unemployed', 'underemployed', 'self_employed', 'student', 
    'retired', 'homemaker', 'unable_to_work', 'looking_for_work', 'not_in_labor_force'
);

-- Health and Identity
CREATE TYPE blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');

CREATE TYPE religion_enum AS ENUM (
    'roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian', 'aglipayan_church',
    'seventh_day_adventist', 'bible_baptist_church', 'jehovahs_witnesses',
    'church_of_jesus_christ_latter_day_saints', 'united_church_of_christ_philippines',
    'protestant', 'buddhism', 'baptist', 'methodist', 'pentecostal', 'evangelical',
    'mormon', 'orthodox', 'hinduism', 'judaism', 'indigenous_beliefs',
    'atheist', 'agnostic', 'no_religion', 'others', 'prefer_not_to_say'
);

CREATE TYPE ethnicity_enum AS ENUM (
    -- Major ethnic groups
    'tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bikolano', 'waray', 'kapampangan', 'pangasinense',
    -- Muslim/Moro groups  
    'maranao', 'maguindanao', 'tausug', 'yakan', 'samal', 'badjao',
    -- Indigenous Peoples
    'aeta', 'agta', 'ati', 'batak', 'bukidnon', 'gaddang', 'higaonon', 'ibaloi', 'ifugao', 'igorot',
    'ilongot', 'isneg', 'ivatan', 'kalinga', 'kankanaey', 'mangyan', 'mansaka', 'palawan', 'subanen',
    'tboli', 'teduray', 'tumandok',
    -- Other groups
    'chinese', 'other', 'not_reported'
);

-- Household Classifications
CREATE TYPE household_type_enum AS ENUM ('nuclear', 'single_parent', 'extended', 'childless', 'one_person', 'non_family', 'other');
CREATE TYPE tenure_status_enum AS ENUM ('owned', 'owned_with_mortgage', 'rented', 'occupied_for_free', 'occupied_without_consent', 'others');
CREATE TYPE household_unit_enum AS ENUM ('single_house', 'duplex', 'apartment', 'townhouse', 'condominium', 'boarding_house', 'institutional', 'makeshift', 'others');

-- Family Relationships
CREATE TYPE family_position_enum AS ENUM (
    'father', 'mother', 'son', 'daughter', 'grandmother', 'grandfather',
    'father_in_law', 'mother_in_law', 'brother_in_law', 'sister_in_law',
    'spouse', 'sibling', 'guardian', 'ward', 'other'
);

-- Income Classifications (NEDA standards)
CREATE TYPE income_class_enum AS ENUM (
    'rich', 'high_income', 'upper_middle_income', 'middle_class', 
    'lower_middle_class', 'low_income', 'poor', 'not_determined'
);

-- Geographic Classifications
CREATE TYPE birth_place_level_enum AS ENUM ('region', 'province', 'city_municipality', 'barangay');

-- SECTION 3: REFERENCE DATA TABLES (PSGC & PSOC)
-- Philippine government standard reference data (PSA maintained)

-- PSGC: 4-level geographic hierarchy (Region → Province → City → Barangay)
CREATE TABLE psgc_regions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psgc_provinces (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psgc_cities_municipalities (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    type VARCHAR(50) NOT NULL,
    is_independent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT independence_rule CHECK (
        (is_independent = true AND province_code IS NULL)
        OR (is_independent = false)
    )
);

CREATE TABLE psgc_barangays (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSOC: 5-level occupational hierarchy (Major → Sub-Major → Minor → Unit → Unit Sub-Groups)
CREATE TABLE psoc_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psoc_sub_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    major_code VARCHAR(10) NOT NULL REFERENCES psoc_major_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psoc_minor_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    sub_major_code VARCHAR(10) NOT NULL REFERENCES psoc_sub_major_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psoc_unit_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    minor_code VARCHAR(10) NOT NULL REFERENCES psoc_minor_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psoc_unit_sub_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psoc_position_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    is_primary BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psoc_occupation_cross_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_occupation_title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 4: AUTHENTICATION & USER MANAGEMENT SYSTEM
-- Multi-level geographic access control for Philippine LGU administration

CREATE TABLE auth_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth_user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES auth_roles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth_barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth_user_profiles(id) ON DELETE CASCADE,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    is_primary BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, barangay_code)
);



-- SECTION 6: GEOGRAPHIC MANAGEMENT TABLES (geo_*)
-- Local geographic subdivisions within barangays (subdivisions, zones, sitios, puroks)

CREATE TABLE geo_subdivisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Subdivision', 'Zone', 'Sitio', 'Purok')),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, barangay_code)
);

CREATE TABLE geo_streets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    subdivision_id UUID REFERENCES geo_subdivisions(id),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, barangay_code, subdivision_id)
);

-- SECTION 7: CORE DATA TABLES

-- Function to generate hierarchical household ID using proper PSGC structure (RR-PP-MM-BBB)
CREATE OR REPLACE FUNCTION generate_hierarchical_household_id(
    p_barangay_code VARCHAR(10),
    p_subdivision_id UUID DEFAULT NULL,
    p_street_id UUID DEFAULT NULL,
    p_house_number VARCHAR(50) DEFAULT NULL
) RETURNS VARCHAR(22) AS $$
DECLARE
    -- PSGC component variables (extracted from 9-digit barangay code)
    region_code VARCHAR(2);        -- 2-digit region code (positions 1-2)
    province_code VARCHAR(2);      -- 2-digit province code (positions 3-4)
    municipality_code VARCHAR(2);  -- 2-digit municipality code (positions 5-6)
    barangay_code VARCHAR(3);      -- 3-digit barangay code (positions 7-9)
    
    -- Location sequence numbers (4 digits each, zero-padded)
    subdivision_num VARCHAR(4) := '0000';  -- Subdivision sequence within barangay
    street_num VARCHAR(4) := '0000';       -- Street sequence within subdivision
    house_num VARCHAR(4);                  -- House number or sequence
    
    -- Result variables
    new_id VARCHAR(22);            -- Final household code
    next_house_seq INTEGER;        -- For auto-generating house sequences
BEGIN
    -- =========================================================================
    -- STEP 1: Extract PSGC components from barangay code
    -- =========================================================================
    -- Philippine Standard Geographic Code format: RRPPMMBBB (9 digits total)
    -- Example: "137404001" = Region 13, Province 74, Municipality 04, Barangay 001
    
    region_code := SUBSTRING(p_barangay_code FROM 1 FOR 2);       -- Extract "13"
    province_code := SUBSTRING(p_barangay_code FROM 3 FOR 2);     -- Extract "74"
    municipality_code := SUBSTRING(p_barangay_code FROM 5 FOR 2); -- Extract "04"
    barangay_code := SUBSTRING(p_barangay_code FROM 7 FOR 3);     -- Extract "001"

    -- =========================================================================
    -- STEP 2: Calculate subdivision sequence number
    -- =========================================================================
    -- Each subdivision gets a unique sequence number within its barangay
    -- Ordered by creation date to maintain consistency
    
    IF p_subdivision_id IS NOT NULL THEN
        SELECT LPAD(ROW_NUMBER() OVER (PARTITION BY barangay_code ORDER BY created_at)::TEXT, 4, '0')
        INTO subdivision_num
        FROM geo_subdivisions
        WHERE barangay_code = p_barangay_code AND id = p_subdivision_id;
        -- If subdivision not found, will remain '0000'
    END IF;

    -- =========================================================================
    -- STEP 3: Calculate street sequence number
    -- =========================================================================
    -- Streets are numbered within their subdivision (or barangay if no subdivision)
    -- This creates a logical hierarchy: Barangay → Subdivision → Street
    
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
        -- If street not found, will remain '0000'
    END IF;

    -- =========================================================================
    -- STEP 4: Determine house number
    -- =========================================================================
    -- Priority: Use actual house number if provided, otherwise auto-generate
    
    IF p_house_number IS NOT NULL AND TRIM(p_house_number) != '' THEN
        -- Extract numeric part from house number
        -- Examples: "123-A" → "0123", "456" → "0456", "12B" → "0012"
        house_num := LPAD(REGEXP_REPLACE(p_house_number, '[^0-9]', '', 'g'), 4, '0');
        
        -- Handle edge case: if no numbers found, use sequential
        IF house_num = '0000' OR house_num IS NULL THEN
            house_num := '0001';
        END IF;
    ELSE
        -- Auto-generate sequential house number within same location
        -- Ensures uniqueness when house number not provided
        SELECT COALESCE(MAX(CAST(RIGHT(code, 4) AS INTEGER)), 0) + 1
        INTO next_house_seq
        FROM households
        WHERE barangay_code = p_barangay_code
        AND COALESCE(subdivision_id, '00000000-0000-0000-0000-000000000000'::UUID) = 
            COALESCE(p_subdivision_id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND COALESCE(street_id, '00000000-0000-0000-0000-000000000000'::UUID) = 
            COALESCE(p_street_id, '00000000-0000-0000-0000-000000000000'::UUID);
        
        house_num := LPAD(next_house_seq::TEXT, 4, '0');
    END IF;

    -- =========================================================================
    -- STEP 5: Assemble final household code
    -- =========================================================================
    -- Format: RRPPMMBBB-SSSS-TTTT-HHHH (22 characters with hyphens)
    -- Example: "137404001-0001-0002-0123"
    
    new_id := region_code || province_code || municipality_code ||
              barangay_code || '-' || subdivision_num || '-' || street_num || '-' || house_num;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- HOUSEHOLDS TABLE - DILG RBI FORM A
CREATE TABLE households (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200),
    address TEXT,
    house_number VARCHAR(50) NOT NULL,
    street_id UUID NOT NULL REFERENCES geo_streets(id),
    subdivision_id UUID REFERENCES geo_subdivisions(id),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    no_of_families INTEGER DEFAULT 1,
    no_of_household_members INTEGER DEFAULT 0,
    no_of_migrants INTEGER DEFAULT 0,
    household_type household_type_enum,
    tenure_status tenure_status_enum,
    tenure_others_specify TEXT,
    household_unit household_unit_enum,
    monthly_income DECIMAL(12,2),
    income_class income_class_enum,
    household_head_id UUID,
    household_head_position family_position_enum,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()

);

-- RESIDENTS TABLE - DILG RBI FORM B
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300),
    philsys_card_number VARCHAR(20),
    philsys_last4 VARCHAR(4),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    extension_name VARCHAR(20),
    birthdate DATE NOT NULL,
    birth_place_code VARCHAR(10),
    birth_place_level birth_place_level_enum,
    birth_place_name VARCHAR(200),
    sex sex_enum NOT NULL,
    civil_status civil_status_enum DEFAULT 'single',
    civil_status_others_specify TEXT,
    education_attainment education_level_enum,
    is_graduate BOOLEAN DEFAULT false,
    employment_status employment_status_enum,
    employment_code VARCHAR(10),
    employment_name VARCHAR(300),
    psoc_code VARCHAR(10),
    psoc_level INTEGER,
    occupation_title VARCHAR(300),
    email VARCHAR(255),
    mobile_number VARCHAR(20),
    telephone_number VARCHAR(20),
    household_code VARCHAR(50) REFERENCES households(code),
    street_id UUID REFERENCES geo_streets(id),
    subdivision_id UUID REFERENCES geo_subdivisions(id),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    zip_code VARCHAR(10),
    blood_type blood_type_enum DEFAULT 'unknown',
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    complexion VARCHAR(50),
    citizenship citizenship_enum DEFAULT 'filipino',
    is_voter BOOLEAN,
    is_resident_voter BOOLEAN,
    last_voted_date DATE,
    ethnicity ethnicity_enum DEFAULT 'not_reported',
    religion religion_enum DEFAULT 'prefer_not_to_say',
    religion_others_specify TEXT,
    mother_maiden_first VARCHAR(100),
    mother_maiden_middle VARCHAR(100),
    mother_maiden_last VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household-Resident Relationships
ALTER TABLE households ADD CONSTRAINT fk_household_head
    FOREIGN KEY (household_head_id) REFERENCES residents(id);

ALTER TABLE households ADD CONSTRAINT unique_household_head_per_household
    UNIQUE(household_head_id);

-- SECTION 8: SUPPLEMENTARY TABLES

-- 8.1 HOUSEHOLD MEMBERS TABLE
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_code VARCHAR(50) NOT NULL REFERENCES households(code) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id),
    relationship_to_head VARCHAR(50) NOT NULL,
    family_position family_position_enum,
    position_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_code, resident_id)
);

-- 8.2 RESIDENT RELATIONSHIPS TABLE
CREATE TABLE resident_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_a_id UUID NOT NULL REFERENCES residents(id),
    resident_b_id UUID NOT NULL REFERENCES residents(id),
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN 
        ('Spouse', 'Parent', 'Child', 'Sibling', 'Guardian', 'Ward', 'Other')),
    relationship_description TEXT,
    is_reciprocal BOOLEAN DEFAULT true,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_self_relationship CHECK (resident_a_id != resident_b_id),
    CONSTRAINT unique_relationship UNIQUE(resident_a_id, resident_b_id, relationship_type)
);

-- 8.3 RESIDENT SECTORAL INFORMATION TABLE
CREATE TABLE resident_sectoral_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    is_labor_force BOOLEAN DEFAULT false,
    is_labor_force_employed BOOLEAN DEFAULT false,
    is_unemployed BOOLEAN DEFAULT false,
    is_overseas_filipino_worker BOOLEAN DEFAULT false,
    is_person_with_disability BOOLEAN DEFAULT false,
    is_out_of_school_children BOOLEAN DEFAULT false,
    is_out_of_school_youth BOOLEAN DEFAULT false,
    is_senior_citizen BOOLEAN DEFAULT false,
    is_registered_senior_citizen BOOLEAN DEFAULT false,
    is_solo_parent BOOLEAN DEFAULT false,
    is_indigenous_people BOOLEAN DEFAULT false,
    is_migrant BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resident_id)
);

-- 8.4 RESIDENT MIGRANT INFORMATION TABLE
CREATE TABLE resident_migrant_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    previous_barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    previous_city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    previous_province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    previous_region_code VARCHAR(10) REFERENCES psgc_regions(code),
    length_of_stay_previous_months INTEGER,
    reason_for_leaving TEXT,
    date_of_transfer DATE,
    reason_for_transferring TEXT,
    duration_of_stay_current_months INTEGER,
    is_intending_to_return BOOLEAN,
    migration_type VARCHAR(50),
    is_whole_family_migrated BOOLEAN,
    created_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth_user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(resident_id)                    -- One migration record per resident
);

-- SECTION 9: SYSTEM TABLES

-- 9.1 DASHBOARD SUMMARIES TABLE
CREATE TABLE system_dashboard_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    calculation_date DATE DEFAULT CURRENT_DATE,
    total_residents INTEGER DEFAULT 0,
    total_households INTEGER DEFAULT 0,
    average_household_size DECIMAL(3,2) DEFAULT 0,
    male_count INTEGER DEFAULT 0,
    female_count INTEGER DEFAULT 0,
    age_0_14 INTEGER DEFAULT 0,
    age_15_64 INTEGER DEFAULT 0,
    age_65_plus INTEGER DEFAULT 0,
    single_count INTEGER DEFAULT 0,
    married_count INTEGER DEFAULT 0,
    widowed_count INTEGER DEFAULT 0,
    divorced_separated_count INTEGER DEFAULT 0,
    employed_count INTEGER DEFAULT 0,
    unemployed_count INTEGER DEFAULT 0,
    student_count INTEGER DEFAULT 0,
    retired_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(barangay_code, calculation_date)
);

-- 9.2 AUDIT LOGS TABLE
CREATE TABLE system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth_user_profiles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table_record ON system_audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON system_audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON system_audit_logs(created_at DESC);

-- 9.3 SCHEMA VERSIONS TABLE
CREATE TABLE system_schema_versions (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    migration_script TEXT,
    applied_by VARCHAR(100),
    execution_time_ms INTEGER,
    checksum VARCHAR(64)
);

-- SECTION 10: DATA ACCESS VIEWS


-- SECTION 12: FUNCTIONS AND TRIGGERS
-- Automated database logic for data consistency and user experience enhancement

CREATE OR REPLACE FUNCTION auto_populate_geo_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    region_code VARCHAR(10);
    province_code VARCHAR(10);
    city_code VARCHAR(10);
BEGIN
    IF NEW.barangay_code IS NOT NULL THEN
        SELECT
            r.code,
            CASE WHEN c.is_independent THEN NULL ELSE p.code END,
            c.code
        INTO region_code, province_code, city_code
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        LEFT JOIN psgc_provinces p ON c.province_code = p.code
        JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
        WHERE b.code = NEW.barangay_code;
        
        NEW.region_code := COALESCE(NEW.region_code, region_code);
        NEW.province_code := COALESCE(NEW.province_code, province_code);
        NEW.city_municipality_code := COALESCE(NEW.city_municipality_code, city_code);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    IF NEW.street_id IS NOT NULL THEN
        SELECT name INTO street_name FROM geo_streets WHERE id = NEW.street_id;
    END IF;
    
    IF NEW.subdivision_id IS NOT NULL THEN
        SELECT name INTO subdivision_name FROM geo_subdivisions WHERE id = NEW.subdivision_id;
    END IF;
    
    SELECT b.name, c.name, p.name, r.name
    INTO barangay_name, city_name, province_name, region_name
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    LEFT JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
    WHERE b.code = NEW.barangay_code;
    
    full_address := '';
    
    IF NEW.house_number IS NOT NULL AND TRIM(NEW.house_number) != '' THEN
        full_address := TRIM(NEW.house_number);
    END IF;
    
    IF street_name IS NOT NULL AND TRIM(street_name) != '' THEN
        full_address := full_address || ' ' || TRIM(street_name);
    END IF;
    
    IF subdivision_name IS NOT NULL AND TRIM(subdivision_name) != '' THEN
        full_address := full_address || ', ' || TRIM(subdivision_name);
    END IF;
    
    IF barangay_name IS NOT NULL AND TRIM(barangay_name) != '' THEN
        full_address := full_address || ', Barangay ' || TRIM(barangay_name);
    END IF;
    
    IF city_name IS NOT NULL AND TRIM(city_name) != '' THEN
        full_address := full_address || ', ' || TRIM(city_name);
    END IF;
    
    IF province_name IS NOT NULL AND TRIM(province_name) != '' THEN
        full_address := full_address || ', ' || TRIM(province_name);
    END IF;
    
    IF region_name IS NOT NULL AND TRIM(region_name) != '' THEN
        full_address := full_address || ', ' || TRIM(region_name);
    END IF;
    
    NEW.address := TRIM(full_address);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_populate_name()
RETURNS TRIGGER AS $$
DECLARE
    head_last_name VARCHAR(100);
BEGIN
    SELECT 
        last_name
    INTO head_last_name
    FROM residents 
    WHERE household_code = NEW.code 
    AND relationship_to_head = 'head' 
    AND is_active = true
    LIMIT 1;
    
    IF head_last_name IS NOT NULL AND TRIM(head_last_name) != '' THEN
        NEW.name := TRIM(head_last_name) || ' Residence';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_populate_resident_full_name()
RETURNS TRIGGER AS $$
DECLARE
    full_name_text TEXT;
BEGIN
    full_name_text := TRIM(COALESCE(NEW.first_name, ''));
    
    IF NEW.middle_name IS NOT NULL AND TRIM(NEW.middle_name) != '' THEN
        full_name_text := full_name_text || ' ' || TRIM(NEW.middle_name);
    END IF;
    
    IF NEW.last_name IS NOT NULL AND TRIM(NEW.last_name) != '' THEN
        full_name_text := full_name_text || ' ' || TRIM(NEW.last_name);
    END IF;
    
    IF full_name_text IS NOT NULL AND TRIM(full_name_text) != '' THEN
        NEW.name := TRIM(full_name_text);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_populate_birth_place_name()
RETURNS TRIGGER AS $$
DECLARE
    barangay_name VARCHAR(100);
    city_name VARCHAR(100);
    province_name VARCHAR(100);
    region_name VARCHAR(100);
    birth_place_full_text TEXT;
BEGIN
    IF NEW.birth_place_code IS NOT NULL AND TRIM(NEW.birth_place_code) != '' THEN
        
        IF LENGTH(NEW.birth_place_code) = 10 THEN
            SELECT b.name, c.name, p.name, r.name
            INTO barangay_name, city_name, province_name, region_name
            FROM psgc_barangays b
            JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
            LEFT JOIN psgc_provinces p ON c.province_code = p.code
            JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
            WHERE b.code = NEW.birth_place_code;
            
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
            
        ELSIF LENGTH(NEW.birth_place_code) = 6 THEN
            SELECT c.name, p.name, r.name
            INTO city_name, province_name, region_name
            FROM psgc_cities_municipalities c
            LEFT JOIN psgc_provinces p ON c.province_code = p.code
            JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
            WHERE c.code = NEW.birth_place_code;
            
            IF city_name IS NOT NULL THEN
                birth_place_full_text := city_name;
                IF province_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || province_name;
                END IF;
                IF region_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || region_name;
                END IF;
            END IF;
            
        ELSIF LENGTH(NEW.birth_place_code) = 4 THEN
            SELECT p.name, r.name
            INTO province_name, region_name
            FROM psgc_provinces p
            JOIN psgc_regions r ON p.region_code = r.code
            WHERE p.code = NEW.birth_place_code;
            
            IF province_name IS NOT NULL THEN
                birth_place_full_text := province_name;
                IF region_name IS NOT NULL THEN
                    birth_place_full_text := birth_place_full_text || ', ' || region_name;
                END IF;
            END IF;
            
        ELSIF LENGTH(NEW.birth_place_code) = 2 THEN
            SELECT name INTO region_name
            FROM psgc_regions
            WHERE code = NEW.birth_place_code;
            
            IF region_name IS NOT NULL THEN
                birth_place_full_text := region_name;
            END IF;
        END IF;
        
        IF birth_place_full_text IS NOT NULL AND TRIM(birth_place_full_text) != '' THEN
            NEW.birth_place_name := TRIM(birth_place_full_text);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_populate_employment_name()
RETURNS TRIGGER AS $$
DECLARE
    occupation_name VARCHAR(300);
BEGIN
    IF NEW.employment_code IS NOT NULL AND TRIM(NEW.employment_code) != '' THEN
        
        IF LENGTH(NEW.employment_code) = 5 THEN
            SELECT name INTO occupation_name FROM psoc_unit_sub_groups WHERE code = NEW.employment_code;
        ELSIF LENGTH(NEW.employment_code) = 4 THEN
            SELECT name INTO occupation_name FROM psoc_unit_groups WHERE code = NEW.employment_code;
        ELSIF LENGTH(NEW.employment_code) = 3 THEN
            SELECT name INTO occupation_name FROM psoc_minor_groups WHERE code = NEW.employment_code;
        ELSIF LENGTH(NEW.employment_code) = 2 THEN
            SELECT name INTO occupation_name FROM psoc_sub_major_groups WHERE code = NEW.employment_code;
        ELSIF LENGTH(NEW.employment_code) = 1 THEN
            SELECT name INTO occupation_name FROM psoc_major_groups WHERE code = NEW.employment_code;
        END IF;
        
        IF occupation_name IS NOT NULL AND TRIM(occupation_name) != '' THEN
            NEW.employment_name := TRIM(occupation_name);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_household_derived_fields()
RETURNS TRIGGER AS $$
DECLARE
    calculated_income DECIMAL(12,2);
BEGIN
    calculated_income := 0.00;

    UPDATE households
    SET
        no_of_household_members = (
            SELECT COUNT(*)
            FROM household_members
            WHERE household_code = COALESCE(NEW.household_code, OLD.household_code)
            AND is_active = true
        ),
        no_of_migrants = (
            SELECT COUNT(*)
            FROM household_members hm
            JOIN resident_sectoral_info si ON hm.resident_id = si.resident_id
            WHERE hm.household_code = COALESCE(NEW.household_code, OLD.household_code)
            AND hm.is_active = true
            AND si.is_migrant = true
        ),
        monthly_income = calculated_income,
        income_class = determine_income_class(calculated_income),
        name = (
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

CREATE OR REPLACE FUNCTION determine_income_class(monthly_income DECIMAL(12,2))
RETURNS income_class_enum AS $$
BEGIN
    IF monthly_income IS NULL OR monthly_income < 0 THEN
        RETURN 'poor';
    END IF;

    IF monthly_income >= 219140 THEN
        RETURN 'rich';
    ELSIF monthly_income >= 131484 THEN
        RETURN 'high_income';
    ELSIF monthly_income >= 76669 THEN
        RETURN 'upper_middle_income';    -- ₱76,669-₱131,483 (Upper middle class)
    ELSIF monthly_income >= 43828 THEN
        RETURN 'middle_class';           -- ₱43,828-₱76,668 (True middle class)
    ELSIF monthly_income >= 21194 THEN
        RETURN 'lower_middle_class';     -- ₱21,194-₱43,827 (Lower middle class)
    ELSIF monthly_income >= 9520 THEN
        RETURN 'low_income';             -- ₱9,520-₱21,193 (Low income, not poor)
    ELSE
        RETURN 'poor';                   -- Below ₱9,520 (Below poverty line)
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION user_barangay_code()
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

CREATE OR REPLACE FUNCTION user_city_code()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN (
        SELECT city_municipality_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid()
        AND is_active = true
        AND city_municipality_code IS NOT NULL
        AND barangay_code IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_province_code()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN (
        SELECT province_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid()
        AND is_active = true
        AND province_code IS NOT NULL
        AND barangay_code IS NULL
        AND city_municipality_code IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_region_code()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN (
        SELECT region_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid()
        AND is_active = true
        AND region_code IS NOT NULL
        AND barangay_code IS NULL
        AND city_municipality_code IS NULL
        AND province_code IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_role()
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

CREATE OR REPLACE FUNCTION user_access_level()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'level', CASE 
            WHEN up.barangay_code IS NOT NULL THEN 'barangay'
            WHEN up.city_municipality_code IS NOT NULL THEN 'city' 
            WHEN up.province_code IS NOT NULL THEN 'province'
            WHEN up.region_code IS NOT NULL THEN 'region'
            ELSE 'none'
        END,
        'code', COALESCE(
            up.barangay_code,
            up.city_municipality_code,
            up.province_code, 
            up.region_code
        )
    ) INTO result
    FROM auth_user_profiles up
    WHERE up.id = auth.uid()
    AND up.is_active = true;
    
    RETURN COALESCE(result, json_build_object('level', 'none', 'code', null));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
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

CREATE OR REPLACE FUNCTION auto_populate_sectoral_info()
RETURNS TRIGGER AS $$
DECLARE
    resident_age INTEGER;
    is_working BOOLEAN;
BEGIN
    resident_age := EXTRACT(YEAR FROM AGE(NEW.birthdate));
    is_working := NEW.employment_status IN ('employed', 'self_employed');

    INSERT INTO resident_sectoral_info (
        resident_id,
        is_labor_force,
        is_labor_force_employed,
        is_unemployed,
        is_senior_citizen,
        is_out_of_school_children,
        is_out_of_school_youth
    ) VALUES (
        NEW.id,
        CASE WHEN NEW.employment_status IN ('employed', 'self_employed', 'unemployed', 'looking_for_work', 'underemployed') 
             THEN true ELSE false END,
        
        -- Employment Status: Currently working in any capacity
        is_working,
        
        -- Unemployment Status: Actively seeking work but not employed
        NEW.employment_status IN ('unemployed', 'looking_for_work'),
        
        -- Senior Citizen Status: Age 60+ per RA 9994 Senior Citizens Act
        resident_age >= 60,
        
        -- Out-of-School Children (OSC): Ages 6-14 not graduated from current education level
        -- Note: Should be in elementary or high school at this age range
        (resident_age >= 6 AND resident_age <= 14 AND NEW.is_graduate = false),
        
        -- Out-of-School Youth (OSY): Ages 15-24 with educational/employment gaps
        -- Criteria: Not graduated + not in higher education + not employed
        (resident_age >= 15 AND resident_age <= 24 AND NEW.is_graduate = false
         AND NEW.education_attainment NOT IN ('college', 'post_graduate')
         AND NEW.employment_status IN ('unemployed', 'not_in_labor_force', 'looking_for_work'))
    )
    ON CONFLICT (resident_id)
    DO UPDATE SET
        -- Update all sectoral classifications when resident data changes
        is_labor_force = CASE WHEN NEW.employment_status IN ('employed', 'self_employed', 'unemployed', 'looking_for_work', 'underemployed') 
                              THEN true ELSE false END,
        is_labor_force_employed = is_working,
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

CREATE OR REPLACE FUNCTION update_resident_sectoral_status()
RETURNS TRIGGER AS $$
DECLARE
    current_age INTEGER;
    is_senior BOOLEAN;
    is_osc BOOLEAN;
    is_osy BOOLEAN;
BEGIN
    -- Calculate age once for efficiency (avoids repeated AGE() calculations)
    current_age := EXTRACT(YEAR FROM AGE(NEW.birthdate));

    -- Senior Citizen Classification: Age 60+ per RA 9994 Senior Citizens Act
    is_senior := (current_age >= 60);

    -- Out-of-School Children (OSC) Classification: Ages 6-14 not enrolled in formal education
    -- Should be in elementary or high school at this age range
    IF current_age BETWEEN 6 AND 14 THEN
        is_osc := (NEW.is_graduate = false
            AND NEW.education_attainment IN ('elementary', 'high_school')); -- Age-appropriate education level
    ELSE
        is_osc := false; -- Outside OSC age range
    END IF;

    -- Out-of-School Youth (OSY) Classification: Ages 15-24 with educational/employment gaps
    -- PSA definition: Not in school, not completed higher education, not employed
    IF current_age BETWEEN 15 AND 24 THEN
        is_osy := (
            -- Educational gap: Either in lower education without completion OR college incomplete
            (NEW.education_attainment NOT IN ('college', 'post_graduate') OR NEW.is_graduate = false)
            AND NEW.is_graduate = false -- Not completed current education level
            AND (NEW.employment_status IS NULL OR NEW.employment_status NOT IN ('employed', 'self_employed')) -- Not economically active
        );
    ELSE
        is_osy := false; -- Outside OSY age range
    END IF;

    -- Update audit timestamp for data freshness tracking
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9.4 ADDRESS AUTO-POPULATION FUNCTIONS



-- Function to auto-populate geographic codes from user's assigned barangay and generate household ID
CREATE OR REPLACE FUNCTION generate_household_id_trigger()
RETURNS TRIGGER AS $$
DECLARE
    user_barangay_code VARCHAR(10);
    user_city_code VARCHAR(10);
    user_province_code VARCHAR(10);
    user_region_code VARCHAR(10);
BEGIN
    -- Step 1: Auto-populate geographic hierarchy if any codes are missing
    -- Ensures complete PSGC compliance and data consistency
    IF NEW.barangay_code IS NULL OR NEW.city_municipality_code IS NULL OR 
       NEW.province_code IS NULL OR NEW.region_code IS NULL THEN
       
        -- Retrieve user's assigned barangay for geographic inheritance
        SELECT ba.barangay_code
        INTO user_barangay_code
        FROM auth_barangay_accounts ba
        WHERE ba.user_id = auth.uid();

        -- If user has barangay assignment, resolve complete PSGC hierarchy
        IF user_barangay_code IS NOT NULL THEN
            -- Resolve full geographic chain: Barangay → City → Province → Region
            SELECT 
                b.code,                    -- Barangay code (10 digits)
                c.code,                    -- City/Municipality code (6 digits)
                p.code,                    -- Province code (4 digits, NULL for independent cities)
                r.code                     -- Region code (2 digits)
            INTO
                NEW.barangay_code,
                NEW.city_municipality_code,
                NEW.province_code,
                NEW.region_code
            FROM psgc_barangays b
            JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
            LEFT JOIN psgc_provinces p ON c.province_code = p.code  -- LEFT JOIN for independent cities
            JOIN psgc_regions r ON COALESCE(p.region_code, c.region_code) = r.code
            WHERE b.code = user_barangay_code;
        END IF;
    END IF;

    -- Step 2: Generate unique hierarchical household code if not provided
    -- Format: RRPPMMBBB-SSSS-TTTT-HHHH (e.g., 137404001-0001-0001-0123)
    IF NEW.code IS NULL THEN
        NEW.code := generate_hierarchical_household_id(
            NEW.barangay_code,     -- PSGC barangay code
            NEW.subdivision_id,    -- Subdivision reference
            NEW.street_id,         -- Street reference
            NEW.house_number       -- Actual house number
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
    -- Priority 1: Inherit complete address from household (family-based registration)
    -- This ensures household members share the same geographic and street-level address
    IF NEW.household_code IS NOT NULL THEN
        SELECT
            h.barangay_code,           -- PSGC barangay code
            h.city_municipality_code,  -- PSGC city code
            h.province_code,           -- PSGC province code (NULL for independent cities)
            h.region_code,             -- PSGC region code
            h.street_id,               -- Specific street reference
            h.subdivision_id           -- Specific subdivision reference
        INTO
            NEW.barangay_code,
            NEW.city_municipality_code,
            NEW.province_code,
            NEW.region_code,
            NEW.street_id,
            NEW.subdivision_id
        FROM households h
        WHERE h.code = NEW.household_code;

        -- If household found, address inheritance complete
        IF FOUND THEN
            RETURN NEW;
        END IF;
    END IF;

    -- Priority 2: Fallback to user's barangay assignment (individual registration)
    -- Used when resident is not part of existing household
    SELECT ba.barangay_code
    INTO user_barangay_code
    FROM auth_barangay_accounts ba
    WHERE ba.user_id = auth.uid();

    -- Resolve PSGC hierarchy from user's assigned barangay
    IF user_barangay_code IS NOT NULL THEN
        SELECT
            r.code,                                                    -- Region code
            CASE WHEN c.is_independent THEN NULL ELSE p.code END,     -- Province code (NULL for independent cities)
            c.code                                                     -- City/Municipality code
        INTO
            region_code,
            province_code,
            city_code
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        LEFT JOIN psgc_provinces p ON c.province_code = p.code
        JOIN psgc_regions r ON COALESCE(p.region_code, c.region_code) = r.code
        WHERE b.code = user_barangay_code;

        -- Auto-populate geographic hierarchy from user assignment
        -- Ensures barangay-level data access control and statistical accuracy
        NEW.barangay_code := user_barangay_code;
        NEW.city_municipality_code := city_code;
        NEW.province_code := province_code;
        NEW.region_code := region_code;
        -- Note: street_id and subdivision_id remain NULL for individual registration
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9.5 AUDIT AND TRACKING FUNCTIONS



-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_audit_logs (
        table_name,               -- Source table name from trigger context
        record_id,               -- Primary key of affected record
        operation,               -- Operation type: INSERT, UPDATE, DELETE
        old_values,              -- JSON snapshot before change (UPDATE/DELETE only)
        new_values,              -- JSON snapshot after change (INSERT/UPDATE only)
        user_id,                 -- User performing the operation
        barangay_code           -- Geographic context for audit isolation
    ) VALUES (
        TG_TABLE_NAME,                                    -- Table name from trigger context
        COALESCE(NEW.id, OLD.id),                        -- Record ID (NEW for INSERT/UPDATE, OLD for DELETE)
        TG_OP,                                            -- Operation type from trigger context
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)    -- Complete record state before deletion
             ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE'   -- Complete record state after modification
             THEN to_jsonb(NEW) ELSE NULL END,
        -- User attribution with fallback hierarchy
        COALESCE(
            NEW.created_by,                               -- Record's created_by field (INSERT)
            OLD.created_by,                               -- Previous created_by (UPDATE/DELETE)
            (current_setting('request.jwt.claims', true)::jsonb->>'sub')::UUID  -- JWT fallback
        ),
        COALESCE(NEW.barangay_code, OLD.barangay_code)   -- Geographic context for isolation
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
    -- INSERT Operation: Initialize all user tracking fields
    IF TG_OP = 'INSERT' THEN
        -- Set created_by to current user if not explicitly provided
        IF NEW.created_by IS NULL THEN
            NEW.created_by := auth.uid();
        END IF;
        -- Always set updated_by and updated_at for new records
        NEW.updated_by := auth.uid();
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    -- UPDATE Operation: Maintain updated_by and updated_at only
    -- Note: created_by is never modified to preserve creation attribution
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_by := auth.uid();   -- Track who made the modification
        NEW.updated_at := NOW();       -- Track when the modification occurred
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9.6 TRIGGER DEFINITIONS


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
    EXECUTE FUNCTION auto_populate_name();


-- Update household name when resident head's last name changes
CREATE OR REPLACE FUNCTION update_name_on_resident_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Detect household head changes or head's last name modifications
    IF (NEW.relationship_to_head = 'head' OR OLD.relationship_to_head = 'head') 
       AND (NEW.last_name IS DISTINCT FROM OLD.last_name) THEN
        
        -- Update household name using current head's last name
        UPDATE households 
        SET name = (
            SELECT TRIM(
                r.last_name
            ) || ' Residence'  -- Standard DILG household naming format
            FROM residents r
            WHERE r.household_code = NEW.household_code
            AND r.relationship_to_head = 'head'
            AND r.is_active = true
            LIMIT 1  -- Ensure only one household head
        )
        WHERE code = NEW.household_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Household name synchronization trigger: Updates household names when head changes
CREATE TRIGGER trigger_update_name_on_resident_change
    AFTER UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_name_on_resident_change();

-- =============================================================================
-- USER TRACKING TRIGGERS: Automatic user attribution for all table operations
-- =============================================================================
-- These triggers ensure complete accountability by automatically populating
-- created_by, updated_by, and updated_at fields across all data tables.
-- Essential for Data Privacy Act compliance and audit trail requirements.

-- Sectoral information user tracking
CREATE TRIGGER trigger_resident_sectoral_info_user_tracking
    BEFORE INSERT OR UPDATE ON resident_sectoral_info
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Migration information user tracking  
CREATE TRIGGER trigger_resident_migrant_info_user_tracking
    BEFORE INSERT OR UPDATE ON resident_migrant_info
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Resident relationships user tracking
CREATE TRIGGER trigger_resident_relationships_user_tracking
    BEFORE INSERT OR UPDATE ON resident_relationships
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Authentication user profiles tracking
CREATE TRIGGER trigger_auth_user_profiles_user_tracking
    BEFORE INSERT OR UPDATE ON auth_user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Barangay accounts user tracking
CREATE TRIGGER trigger_barangay_accounts_user_tracking
    BEFORE INSERT OR UPDATE ON auth_barangay_accounts
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Geographic subdivisions user tracking
CREATE TRIGGER trigger_geo_subdivisions_user_tracking
    BEFORE INSERT OR UPDATE ON geo_subdivisions
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Geographic streets user tracking
CREATE TRIGGER trigger_geo_streets_user_tracking
    BEFORE INSERT OR UPDATE ON geo_streets
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- =============================================================================
-- GEOGRAPHIC HIERARCHY AUTO-POPULATION TRIGGERS
-- =============================================================================
-- These triggers automatically resolve and populate complete PSGC geographic
-- hierarchies (Region → Province → City → Barangay) for subdivisions and streets.
-- Ensures geographic data consistency and supports accurate statistical reporting.

-- Subdivision geographic hierarchy auto-population
CREATE TRIGGER trigger_geo_subdivisions_auto_populate_hierarchy
    BEFORE INSERT OR UPDATE ON geo_subdivisions
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_geo_hierarchy();

-- Street geographic hierarchy auto-population
CREATE TRIGGER trigger_geo_streets_auto_populate_hierarchy
    BEFORE INSERT OR UPDATE ON geo_streets
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_geo_hierarchy();

-- SECTION 13: INDEXES

-- 13.1 CORE OPERATIONAL INDEXES


-- Primary barangay filtering index: Critical for geographic access control
-- Used in virtually all resident queries for barangay-level data isolation
CREATE INDEX idx_residents_barangay ON residents(barangay_code);

-- Household membership index: Links residents to their households
-- Essential for household composition queries and family relationship analysis
CREATE INDEX idx_residents_household ON residents(household_code);

-- 13.1.1 SYSTEM INDEXES



-- PhilSys partial index: Optimized storage for residents with PhilSys IDs
-- Conditional index reduces storage overhead while maintaining query performance
CREATE INDEX idx_residents_philsys_last4 ON residents(philsys_last4) WHERE philsys_last4 IS NOT NULL;

-- Birthdate index: Essential for age calculations and demographic analysis
-- Supports sectoral classification and statistical reporting requirements
CREATE INDEX idx_residents_birthdate ON residents(birthdate);
-- Note: Age index removed - age is now computed dynamically from birthdate for accuracy

-- 13.2 DEMOGRAPHIC INDEXES


-- Composite demographic indexes for multi-field filtering
-- Employment analysis by barangay: Critical for labor force statistics
CREATE INDEX idx_residents_barangay_employment ON residents(barangay_code, employment_status);

-- Civil status by barangay: Marriage and family structure analysis
CREATE INDEX idx_residents_barangay_civil_status ON residents(barangay_code, civil_status);

-- Education by barangay: Educational attainment and completion tracking
CREATE INDEX idx_residents_barangay_education ON residents(barangay_code, education_attainment, is_graduate);

-- Individual demographic field indexes for national-level aggregation
CREATE INDEX idx_residents_sex ON residents(sex);                                -- Gender distribution analysis
CREATE INDEX idx_residents_civil_status ON residents(civil_status);            -- Marital status statistics
CREATE INDEX idx_residents_citizenship ON residents(citizenship);               -- Citizenship verification
CREATE INDEX idx_residents_registered_voter ON residents(is_voter);  -- Voter registration tracking
CREATE INDEX idx_residents_education_attainment ON residents(education_attainment); -- Educational statistics
CREATE INDEX idx_residents_employment_status ON residents(employment_status);   -- Employment rate calculations
CREATE INDEX idx_residents_ethnicity ON residents(ethnicity);                   -- Cultural diversity tracking
CREATE INDEX idx_residents_religion ON residents(religion);                     -- Religious affiliation analysis

-- 13.3 OCCUPATIONAL INDEXES


-- Resident occupational classification indexes
CREATE INDEX idx_residents_psoc_code ON residents(psoc_code);     -- Specific occupation code lookup
CREATE INDEX idx_residents_psoc_level ON residents(psoc_level);   -- PSOC hierarchy level filtering

-- PSOC reference table indexes for occupation name resolution

-- 13.4 BIRTH PLACE INDEXES


-- Birth place PSGC code index: Primary identifier for place of birth analysis
-- Supports migration pattern studies and population mobility tracking
CREATE INDEX idx_residents_birth_place_code ON residents(birth_place_code);

-- Birth place hierarchy level index: Filters by geographic specificity
-- Enables analysis at different PSGC levels (region, province, city, barangay)
CREATE INDEX idx_residents_birth_place_level ON residents(birth_place_level);

-- Composite birth place index: Optimizes queries filtering by both code and level
-- Essential for detailed migration analysis and demographic cross-tabulation
CREATE INDEX idx_residents_birth_place_code_level ON residents(birth_place_code, birth_place_level);

-- Note: birth_place_full index removed - field converted to computed API view for performance

-- 13.5 GEOGRAPHIC INDEXES

CREATE INDEX idx_residents_region ON residents(region_code);
CREATE INDEX idx_residents_province ON residents(province_code);
CREATE INDEX idx_residents_city_municipality ON residents(city_municipality_code);
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

-- 13.6 HOUSEHOLD INDEXES

CREATE INDEX idx_households_barangay ON households(barangay_code);
CREATE INDEX idx_households_subdivision ON households(subdivision_id);
CREATE INDEX idx_households_street ON households(street_id);
CREATE INDEX idx_household_members_household ON household_members(household_code);
CREATE INDEX idx_household_members_resident ON household_members(resident_id);
CREATE INDEX idx_household_members_active ON household_members(is_active);
CREATE INDEX idx_households_type ON households(household_type);
CREATE INDEX idx_households_tenure ON households(tenure_status);
CREATE INDEX idx_households_unit ON households(household_unit);
CREATE INDEX idx_households_income_class ON households(income_class);
CREATE INDEX idx_households_monthly_income ON households(monthly_income);
CREATE INDEX idx_households_no_of_household_members ON households(no_of_household_members);
CREATE INDEX idx_households_is_active ON households(is_active);
CREATE INDEX idx_households_monthly_income_class ON households(monthly_income, income_class);

-- 13.7 RELATIONSHIP INDEXES

CREATE INDEX idx_relationships_resident_a ON resident_relationships(resident_a_id);
CREATE INDEX idx_relationships_resident_b ON resident_relationships(resident_b_id);
CREATE INDEX idx_relationships_type ON resident_relationships(relationship_type);
CREATE INDEX idx_household_members_position ON household_members(family_position);

-- 13.8 USER AND SECURITY INDEXES

CREATE INDEX idx_auth_user_profiles_role ON auth_user_profiles(role_id);
CREATE INDEX idx_barangay_accounts_user ON auth_barangay_accounts(user_id);
CREATE INDEX idx_barangay_accounts_barangay ON auth_barangay_accounts(barangay_code);

-- 13.9 SYSTEM AND AUDIT INDEXES

CREATE INDEX idx_system_audit_logs_table_record ON system_audit_logs(table_name, record_id);
CREATE INDEX idx_system_audit_logs_user ON system_audit_logs(user_id);
CREATE INDEX idx_system_audit_logs_created_at ON system_audit_logs(created_at);
CREATE INDEX idx_system_audit_logs_barangay ON system_audit_logs(barangay_code);
CREATE INDEX idx_dashboard_summaries_barangay ON system_dashboard_summaries(barangay_code);
CREATE INDEX idx_dashboard_summaries_date ON system_dashboard_summaries(calculation_date);

-- 13.10 SECTORAL INFORMATION INDEXES

CREATE INDEX idx_sectoral_resident ON resident_sectoral_info(resident_id);
CREATE INDEX idx_sectoral_labor_force ON resident_sectoral_info(is_labor_force);
CREATE INDEX idx_sectoral_employed ON resident_sectoral_info(is_labor_force_employed);
CREATE INDEX idx_sectoral_ofw ON resident_sectoral_info(is_overseas_filipino_worker);
CREATE INDEX idx_sectoral_pwd ON resident_sectoral_info(is_person_with_disability);
CREATE INDEX idx_sectoral_senior ON resident_sectoral_info(is_senior_citizen);
CREATE INDEX idx_sectoral_solo_parent ON resident_sectoral_info(is_solo_parent);
CREATE INDEX idx_sectoral_indigenous ON resident_sectoral_info(is_indigenous_people);
CREATE INDEX idx_sectoral_migrant ON resident_sectoral_info(is_migrant);

-- 13.11 MIGRANT INFORMATION INDEXES

CREATE INDEX idx_migrant_resident ON resident_migrant_info(resident_id);
CREATE INDEX idx_migrant_previous_region ON resident_migrant_info(previous_region_code);
CREATE INDEX idx_migrant_previous_province ON resident_migrant_info(previous_province_code);
CREATE INDEX idx_migrant_previous_city ON resident_migrant_info(previous_city_municipality_code);
CREATE INDEX idx_migrant_previous_barangay ON resident_migrant_info(previous_barangay_code);
CREATE INDEX idx_migrant_date_transfer ON resident_migrant_info(date_of_transfer);
CREATE INDEX idx_migrant_intention_return ON resident_migrant_info(is_intending_to_return);
CREATE INDEX idx_migrant_length_stay_previous ON resident_migrant_info(length_of_stay_previous_months);
CREATE INDEX idx_migrant_duration_current ON resident_migrant_info(duration_of_stay_current_months);



-- 13.13 MISCELLANEOUS INDEXES

CREATE INDEX idx_residents_religion_others ON residents(religion_others_specify);

-- SECTION 14: DATA CONSTRAINTS

-- 14.1 DATE AND TIME CONSTRAINTS
ALTER TABLE residents ADD CONSTRAINT valid_birthdate
    CHECK (birthdate <= CURRENT_DATE AND birthdate >= '1900-01-01');

-- 14.2 PHYSICAL CHARACTERISTICS CONSTRAINTS
ALTER TABLE residents ADD CONSTRAINT valid_height
    CHECK (height IS NULL OR (height >= 50 AND height <= 300));

ALTER TABLE residents ADD CONSTRAINT valid_weight
    CHECK (weight IS NULL OR (weight >= 10 AND weight <= 500));

-- 14.3 CIVIL STATUS CONSTRAINTS
ALTER TABLE residents ADD CONSTRAINT valid_civil_status_others_specify
    CHECK (
        (civil_status = 'others' AND civil_status_others_specify IS NOT NULL AND TRIM(civil_status_others_specify) != '') OR
        (civil_status != 'others')
    );

-- 14.4 BIRTH PLACE CONSTRAINTS
ALTER TABLE residents ADD CONSTRAINT valid_birth_place_level_required
    CHECK (
        (birth_place_code IS NULL AND birth_place_level IS NULL) OR
        (birth_place_code IS NOT NULL AND birth_place_level IS NOT NULL)
    );

-- 14.5 IDENTITY DOCUMENT CONSTRAINTS
ALTER TABLE residents ADD CONSTRAINT valid_philsys_last4
    CHECK (philsys_last4 IS NULL OR LENGTH(philsys_last4) = 4);

-- 14.6 HOUSEHOLD CONSTRAINTS
ALTER TABLE households ADD CONSTRAINT valid_monthly_income
    CHECK (monthly_income >= 0);

ALTER TABLE households ADD CONSTRAINT valid_no_of_household_members
    CHECK (no_of_household_members >= 0);

ALTER TABLE households ADD CONSTRAINT valid_no_of_families
    CHECK (no_of_families >= 1);

ALTER TABLE households ADD CONSTRAINT required_house_number
    CHECK (house_number IS NOT NULL AND TRIM(house_number) != '');

ALTER TABLE households ADD CONSTRAINT required_street
    CHECK (street_id IS NOT NULL);


-- SECTION 15: ROW LEVEL SECURITY (RLS)

-- 15.1 ENABLE RLS ON ALL TABLES

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

-- Core Data Tables
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

-- 15.2 RLS POLICIES FOR REFERENCE DATA


-- PSGC Geographic Reference Data: Public read access for all users, admin-only modifications
-- These tables support address validation, geographic filtering, and statistical aggregation
CREATE POLICY "Public read psgc_regions" ON psgc_regions FOR SELECT USING (true);
CREATE POLICY "Admin write psgc_regions" ON psgc_regions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles up
        JOIN auth_roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name IN ('Super Admin', 'Barangay Admin')
    )
);

-- Provinces, cities, and barangays: Public read access for geographic dropdowns and validation
CREATE POLICY "Public read psgc_provinces" ON psgc_provinces FOR SELECT USING (true);
CREATE POLICY "Public read psgc_cities" ON psgc_cities_municipalities FOR SELECT USING (true);
CREATE POLICY "Public read psgc_barangays" ON psgc_barangays FOR SELECT USING (true);

-- PSOC Occupational Classification Data: Public read access for employment classification
-- These tables support occupation dropdowns, employment analysis, and PSOC code validation
CREATE POLICY "Public read psoc_major_groups" ON psoc_major_groups FOR SELECT USING (true);                   -- Level 1: Major occupational categories
CREATE POLICY "Public read psoc_sub_major_groups" ON psoc_sub_major_groups FOR SELECT USING (true);           -- Level 2: Sub-major occupational groups
CREATE POLICY "Public read psoc_minor_groups" ON psoc_minor_groups FOR SELECT USING (true);                   -- Level 3: Minor occupational groups
CREATE POLICY "Public read psoc_unit_groups" ON psoc_unit_groups FOR SELECT USING (true);                     -- Level 4: Unit occupational groups
CREATE POLICY "Public read psoc_unit_sub_groups" ON psoc_unit_sub_groups FOR SELECT USING (true);             -- Level 5: Detailed occupational classifications
CREATE POLICY "Public read psoc_position_titles" ON psoc_position_titles FOR SELECT USING (true);             -- Specific job titles within occupations
CREATE POLICY "Public read psoc_cross_references" ON psoc_occupation_cross_references FOR SELECT USING (true); -- Occupational relationships and mappings

-- 15.3 RLS POLICIES FOR USER MANAGEMENT


-- System roles: Restricted to super administrators only
-- Prevents unauthorized role creation or modification
CREATE POLICY "Super admin only roles" ON auth_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles up
        JOIN auth_roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'Super Admin'
    )
);

-- Security Management Policies


-- User Profile Self-Management: Users control their own profile data
CREATE POLICY "Users can view own profile" ON auth_user_profiles
    FOR SELECT USING (auth.uid() = id);        -- Users can view their own profile only

CREATE POLICY "Users can update own profile" ON auth_user_profiles
    FOR UPDATE USING (auth.uid() = id);        -- Users can modify their own profile only

-- 15.4 RLS POLICIES FOR MAIN DATA TABLES


-- Residents: Multi-level geographic access control based on user's assigned level
-- Supports barangay-level data sovereignty while allowing higher-level aggregation
CREATE POLICY "Multi-level geographic access for residents" ON residents
    FOR ALL USING (
        -- Hierarchical geographic access: users can access data at their level or below
        CASE user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = user_barangay_code()           -- Barangay-only access
            WHEN 'city' THEN city_municipality_code = user_city_code()         -- City-wide access
            WHEN 'province' THEN province_code = user_province_code()          -- Province-wide access
            WHEN 'region' THEN region_code = user_region_code()                -- Region-wide access
            WHEN 'national' THEN true                                               -- National-level access
            ELSE false                                                               -- No access by default
        END
    );

-- Households: Geographic access control matching resident-level restrictions
-- Ensures household data sovereignty aligns with resident access patterns
CREATE POLICY "Multi-level geographic access for households" ON households
    FOR ALL USING (
        -- Geographic jurisdiction matching for household data access
        CASE user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = user_barangay_code()           -- Barangay household access
            WHEN 'city' THEN city_municipality_code = user_city_code()         -- City household access
            WHEN 'province' THEN province_code = user_province_code()          -- Provincial household access
            WHEN 'region' THEN region_code = user_region_code()                -- Regional household access
            WHEN 'national' THEN true                                               -- National household access
            ELSE false                                                               -- Default: no access
        END
    );

-- Household Members: Access control via household geographic filtering
-- Ensures family relationship data access follows household jurisdiction rules
CREATE POLICY "Multi-level geographic access for household_members" ON household_members
    FOR ALL USING (
        household_code IN (
            SELECT h.code
            FROM households h
            WHERE CASE user_access_level()::json->>'level'
                WHEN 'barangay' THEN h.barangay_code = user_barangay_code()       -- Access via barangay households
                WHEN 'city' THEN h.city_municipality_code = user_city_code()     -- Access via city households
                WHEN 'province' THEN h.province_code = user_province_code()      -- Access via provincial households
                WHEN 'region' THEN h.region_code = user_region_code()            -- Access via regional households
                WHEN 'national' THEN true                                             -- Access to all household members
                ELSE false                                                             -- Default: no access
            END
        )
    );

-- 15.5 RLS POLICIES FOR GEOGRAPHIC DATA


-- Multi-level geographic access for geo_subdivisions
CREATE POLICY "Multi-level geographic access for geo_subdivisions" ON geo_subdivisions
    FOR ALL USING (
        -- Allow access based on user's geographic access level
        CASE user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = user_barangay_code()
            WHEN 'city' THEN city_municipality_code = user_city_code()
            WHEN 'province' THEN province_code = user_province_code()
            WHEN 'region' THEN region_code = user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- Multi-level geographic access for geo_streets
CREATE POLICY "Multi-level geographic access for geo_streets" ON geo_streets
    FOR ALL USING (
        -- Allow access based on user's geographic access level
        CASE user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = user_barangay_code()
            WHEN 'city' THEN city_municipality_code = user_city_code()
            WHEN 'province' THEN province_code = user_province_code()
            WHEN 'region' THEN region_code = user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- 12.6 RLS POLICIES FOR SUPPLEMENTARY TABLES

-- Multi-level geographic access for resident_sectoral_info
CREATE POLICY "Multi-level geographic access for resident_sectoral_info" ON resident_sectoral_info
    FOR ALL USING (
        resident_id IN (
            SELECT r.id
            FROM residents r
            WHERE CASE user_access_level()::json->>'level'
                WHEN 'barangay' THEN r.barangay_code = user_barangay_code()
                WHEN 'city' THEN r.city_municipality_code = user_city_code()
                WHEN 'province' THEN r.province_code = user_province_code()
                WHEN 'region' THEN r.region_code = user_region_code()
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
            WHERE CASE user_access_level()::json->>'level'
                WHEN 'barangay' THEN r.barangay_code = user_barangay_code()
                WHEN 'city' THEN r.city_municipality_code = user_city_code()
                WHEN 'province' THEN r.province_code = user_province_code()
                WHEN 'region' THEN r.region_code = user_region_code()
                WHEN 'national' THEN true -- National users see all
                ELSE false -- No access by default
            END
        )
    );

-- 12.7 RLS POLICIES FOR SYSTEM TABLES

-- Multi-level geographic access for system_audit_logs
CREATE POLICY "Multi-level geographic access for system_audit_logs" ON system_audit_logs
    FOR SELECT USING (
        -- Allow access based on user's geographic access level
        CASE user_access_level()::json->>'level'
            WHEN 'barangay' THEN barangay_code = user_barangay_code()
            WHEN 'city' THEN city_municipality_code = user_city_code()
            WHEN 'province' THEN province_code = user_province_code()
            WHEN 'region' THEN region_code = user_region_code()
            WHEN 'national' THEN true -- National users see all
            ELSE false -- No access by default
        END
    );

-- SECTION 16: VIEWS AND SEARCH FUNCTIONS



-- 16.1 PSOC OCCUPATION SEARCH VIEW


CREATE VIEW psoc_occupation_search AS
SELECT
    usg.code as occupation_code,
    'unit_sub_group' as level_type,
    usg.title as occupation_title,
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
    5 as hierarchy_level
FROM psoc_unit_sub_groups usg
JOIN psoc_unit_groups ug ON usg.unit_code = ug.code
JOIN psoc_minor_groups ming ON ug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

UNION ALL

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
    6 as hierarchy_level
FROM psoc_occupation_cross_references cr
JOIN psoc_unit_groups ug ON cr.unit_group_code = ug.code -- Original unit group
JOIN psoc_unit_groups rug ON cr.related_unit_code = rug.code -- Related unit group
JOIN psoc_minor_groups ming ON rug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code

ORDER BY hierarchy_level, occupation_title;

-- 16.2 ADDRESS HIERARCHY VIEW


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
    CASE
        WHEN c.is_independent = true AND r.name IS NOT NULL THEN
            CONCAT(b.name, ', ', c.name, ', ', r.name)
        WHEN c.is_independent = true AND r.name IS NULL THEN
            CONCAT(b.name, ', ', c.name)
        ELSE
            CONCAT(b.name, ', ', c.name, ', ', COALESCE(p.name, ''), ', ', COALESCE(r.name, 'Unknown Region'))
    END AS full_address
FROM psgc_barangays b
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
LEFT JOIN geo_subdivisions s ON b.code = s.barangay_code
ORDER BY COALESCE(r.name, 'ZZ'), COALESCE(p.name, ''), c.name, b.name;

-- 16.3 HOUSEHOLD SEARCH VIEW


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
    CONCAT_WS(', ',
        NULLIF(TRIM(h.house_number), ''),
        NULLIF(TRIM(s.name), ''),
        NULLIF(TRIM(sub.name), ''),
        TRIM(b.name),
        TRIM(c.name),
        CASE WHEN p.name IS NOT NULL THEN TRIM(p.name) ELSE NULL END,
        TRIM(r.name)
    ) as full_address,
    h.barangay_code,
    h.city_municipality_code,
    h.province_code,
    h.region_code,
    h.no_of_household_members,
    h.created_at
FROM households h
LEFT JOIN geo_streets s ON h.street_id = s.id
LEFT JOIN geo_subdivisions sub ON h.subdivision_id = sub.id
JOIN psgc_barangays b ON h.barangay_code = b.code
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
WHERE h.is_active = true;

-- 16.4 BIRTH PLACE OPTIONS VIEW


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

-- 16.5 ENHANCED VIEWS WITH COMPLETE INFORMATION


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
    si.is_labor_force_employed,
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
    COALESCE(r.first_name, '') || ' ' || COALESCE(r.last_name, '') as head_full_name,
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

-- 16.6 SEARCH FUNCTIONS



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
    no_of_household_members INTEGER,
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
        hs.no_of_household_members,
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

-- -----------------------------------------------------
-- SECTION 16.7: SERVER-SIDE API OPTIMIZED FLAT VIEWS
-- -----------------------------------------------------


-- 16.7.1 RESIDENTS WITH COMPLETE GEOGRAPHIC INFO


CREATE OR REPLACE VIEW api_residents_with_geography AS
SELECT 
    -- Core resident fields (excluding household_code to avoid duplicate)
    r.id,
    r.philsys_card_number_hash,
    r.philsys_last4,
    r.first_name,
    r.middle_name,
    r.last_name,
    r.extension_name,
    r.birthdate,
    r.birth_place_code,
    r.birth_place_level,
    r.birth_place_name,
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
    r.employment_code,
    r.employment_name,
    r.mobile_number,
    r.telephone_number,
    r.email,
    r.mother_maiden_first,
    r.mother_maiden_middle,
    r.mother_maiden_last,
    -- r.household_code excluded to avoid duplicate with h.code AS household_code
    r.street_id,
    r.subdivision_id,
    r.barangay_code,
    r.city_municipality_code,
    -- r.province_code and r.region_code excluded to avoid duplicates with ah.* columns
    r.citizenship,
    r.is_voter,
    r.is_resident_voter,
    r.last_voted_date,
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
        WHEN r.birth_place_name IS NOT NULL THEN r.birth_place_name
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
    h.no_of_household_members AS household_no_of_household_members,
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
        NULLIF(r.first_name, ''),
        NULLIF(r.middle_name, ''), 
        NULLIF(r.last_name, ''),
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

-- 16.7.2 HOUSEHOLDS WITH COMPLETE MEMBER INFO


CREATE OR REPLACE VIEW api_households_with_members AS
SELECT 
    -- Core household fields (excluding geographic columns to avoid conflicts with ah.*)
    h.code,
    h.house_number,
    h.street_id,
    h.subdivision_id,
    h.barangay_code, -- Keep for JOINs, conflicts resolved with ah prefix
    -- h.city_municipality_code, h.province_code, h.region_code excluded to avoid conflicts
    h.no_of_families,
    h.no_of_household_members,
    h.no_of_migrants,
    h.household_type,
    h.tenure_status,
    h.tenure_others_specify,
    h.household_unit,
    h.name,
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
    head.first_name AS head_first_name,
    head.middle_name AS head_middle_name,
    head.last_name AS head_last_name,
    head.extension_name AS head_extension_name,
    CONCAT_WS(' ', 
        NULLIF(head.first_name, ''),
        NULLIF(head.middle_name, ''),
        NULLIF(head.last_name, ''),
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
        COUNT(*) FILTER (WHERE r.is_voter = true) AS voter_count
    FROM residents r
    LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
    GROUP BY household_code
) member_stats ON h.code = member_stats.household_code;

-- 16.7.3 DASHBOARD STATS VIEW (Pre-aggregated)


CREATE OR REPLACE VIEW api_dashboard_stats AS
SELECT 
    r.barangay_code,
    
    -- Basic counts
    COUNT(*) AS total_residents,
    COUNT(*) FILTER (WHERE sex = 'male') AS male_residents,
    COUNT(*) FILTER (WHERE sex = 'female') AS female_residents,
    
    -- Age groups (dependency ratio standard)
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) <= 14) AS young_dependents,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) BETWEEN 15 AND 64) AS working_age,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) >= 65) AS old_dependents,
    
    -- Legacy age groups (for backward compatibility)
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) < 18) AS minors,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) BETWEEN 18 AND 59) AS adults,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) >= 60) AS seniors,
    
    -- Special categories
    COUNT(*) FILTER (WHERE si.is_person_with_disability = true) AS pwd_residents,
    COUNT(*) FILTER (WHERE si.is_solo_parent = true) AS solo_parents,
    COUNT(*) FILTER (WHERE si.is_overseas_filipino_worker = true) AS ofw_residents,
    COUNT(*) FILTER (WHERE si.is_indigenous_people = true) AS indigenous_residents,
    
    -- Voting
    COUNT(*) FILTER (WHERE r.is_voter = true) AS registered_voters,
    COUNT(*) FILTER (WHERE r.is_resident_voter = true) AS resident_voters,
    
    -- Employment
    COUNT(*) FILTER (WHERE si.is_labor_force = true) AS labor_force,
    COUNT(*) FILTER (WHERE si.is_labor_force_employed = true) AS employed,
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
    MAX(ah.barangay_name) AS barangay_name,
    
    -- Household counts (from separate query)
    COALESCE(h.total_households, 0) AS total_households

FROM residents r
LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
LEFT JOIN address_hierarchy ah ON r.barangay_code = ah.barangay_code
LEFT JOIN (
    SELECT 
        barangay_code,
        COUNT(*) AS total_households
    FROM households 
    WHERE is_active = true
    GROUP BY barangay_code
) h ON r.barangay_code = h.barangay_code
GROUP BY r.barangay_code, h.total_households;

-- 16.7.4 ADDRESS SEARCH VIEW (Optimized for barangay search)


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

-- ========================================================================
-- SECTION 17: PERMISSIONS AND GRANTS
-- ========================================================================

-- 17.1 ANONYMOUS USER PERMISSIONS
-- Revoke all permissions from anonymous users first
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant SELECT only on reference tables for anonymous users
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

-- 17.2 AUTHENTICATED USER PERMISSIONS
-- Grant full access to authenticated users (controlled by RLS)
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

-- Grant SELECT on reference tables
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
GRANT SELECT ON auth_roles TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant SELECT on views
GRANT SELECT ON psoc_occupation_search TO authenticated;
GRANT SELECT ON address_hierarchy TO authenticated;
GRANT SELECT ON birth_place_options TO authenticated;
GRANT SELECT ON household_search TO authenticated;
GRANT SELECT ON settings_management_summary TO authenticated;
GRANT SELECT ON residents_with_sectoral TO authenticated;
GRANT SELECT ON households_complete TO authenticated;
GRANT SELECT ON migrants_complete TO authenticated;
GRANT SELECT ON household_income_analytics TO authenticated;
GRANT SELECT ON api_residents_with_geography TO authenticated;
GRANT SELECT ON api_households_with_members TO authenticated;
GRANT SELECT ON api_dashboard_stats TO authenticated;
GRANT SELECT ON api_address_search TO authenticated;

-- Grant EXECUTE on functions
GRANT EXECUTE ON FUNCTION search_birth_places(TEXT, birth_place_level_enum, VARCHAR(10), INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_birth_place_details(VARCHAR(10), birth_place_level_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION search_occupations(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupation_details(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_households(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_household_for_resident(VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION populate_user_tracking_fields() TO authenticated;

-- ========================================================================
-- SECTION 18: INITIAL DATA AND COMMENTS
-- ========================================================================

-- 18.1 DEFAULT ROLES - CONSOLIDATED
-- Removed duplicate insertions - see consolidated roles at end of file

-- 18.2 SCHEMA COMMENTS AND DOCUMENTATION
COMMENT ON SCHEMA public IS 'RBI System v2.8 - Records of Barangay Inhabitant System Database Schema';

-- Table comments
COMMENT ON TABLE residents IS 'Core resident profiles with comprehensive demographic data (DILG RBI Form compliant)';
COMMENT ON TABLE households IS 'Household entities with hierarchical IDs and complete address management';
COMMENT ON TABLE household_members IS 'Junction table linking residents to households with relationship tracking';
COMMENT ON TABLE resident_relationships IS 'Family and social relationships between residents';
COMMENT ON TABLE resident_sectoral_info IS 'Sectoral classifications and social program eligibility';
COMMENT ON TABLE resident_migrant_info IS 'Migration history and OFW tracking information';
COMMENT ON TABLE auth_user_profiles IS 'User profiles with multi-level geographic access control';
COMMENT ON TABLE auth_barangay_accounts IS 'Barangay-level user accounts with geographic assignment';
COMMENT ON TABLE auth_roles IS 'System roles defining user permissions and access levels';
COMMENT ON TABLE geo_subdivisions IS 'Local geographic subdivisions within barangays';
COMMENT ON TABLE geo_streets IS 'Street directory for detailed address management';
COMMENT ON TABLE system_audit_logs IS 'Comprehensive audit trail for all data modifications';
COMMENT ON TABLE system_dashboard_summaries IS 'Pre-aggregated statistics for dashboard performance';
COMMENT ON TABLE system_schema_versions IS 'Database schema version tracking';

-- View comments
COMMENT ON VIEW psoc_occupation_search IS 'Flattened PSOC hierarchy for unified occupation search';
COMMENT ON VIEW address_hierarchy IS 'Complete PSGC geographic hierarchy for address management';
COMMENT ON VIEW birth_place_options IS 'Unified PSGC locations for birth place selection';
COMMENT ON VIEW household_search IS 'Household search with complete address formatting';
COMMENT ON VIEW residents_with_sectoral IS 'Residents with computed sectoral classifications';
COMMENT ON VIEW households_complete IS 'Complete household data with member statistics';
COMMENT ON VIEW migrants_complete IS 'Migration data with complete resident profiles';
COMMENT ON VIEW household_income_analytics IS 'Income distribution analysis by household';
COMMENT ON VIEW api_residents_with_geography IS 'API-optimized resident data with geographic joins';
COMMENT ON VIEW api_households_with_members IS 'API-optimized household data with member counts';
COMMENT ON VIEW api_dashboard_stats IS 'Pre-aggregated dashboard statistics by barangay';
COMMENT ON VIEW api_address_search IS 'Optimized address search for API endpoints';

-- Column comments for critical fields
COMMENT ON COLUMN residents.id IS 'Unique identifier using UUID v4';
COMMENT ON COLUMN residents.philsys_card_number_hash IS 'SHA-256 hash of PhilSys number for security';
COMMENT ON COLUMN residents.philsys_last4 IS 'Last 4 digits of PhilSys for user-friendly lookup';
COMMENT ON COLUMN residents.barangay_code IS 'Auto-populated from user session (10-digit PSGC code)';
COMMENT ON COLUMN residents.psoc_code IS 'PSOC occupation code from any hierarchy level';
COMMENT ON COLUMN residents.birth_place_code IS 'PSGC code for birth location (any level)';
COMMENT ON COLUMN residents.civil_status_others_specify IS 'Required when civil_status = "others"';
COMMENT ON COLUMN residents.is_graduate IS 'true = graduated, false = undergraduate/ongoing';

COMMENT ON COLUMN households.code IS 'Hierarchical ID: PSGC-SUBD-STRT-HNUM format';
COMMENT ON COLUMN households.barangay_code IS 'Auto-populated from user session';
COMMENT ON COLUMN households.income_class IS 'Auto-computed from monthly_income';
COMMENT ON COLUMN households.name IS 'Auto-generated from head surname + "Residence"';
COMMENT ON COLUMN households.address IS 'Auto-assembled from address components';

-- Function comments
COMMENT ON FUNCTION generate_hierarchical_household_id IS 'Generates hierarchical household IDs using PSGC-based structure';
COMMENT ON FUNCTION auto_populate_geo_hierarchy IS 'Resolves complete PSGC hierarchy from barangay code';
COMMENT ON FUNCTION auto_populate_household_address IS 'Assembles complete address from components';
COMMENT ON FUNCTION auto_populate_name IS 'Generates household name from head surname';
COMMENT ON FUNCTION auto_populate_resident_full_name IS 'Auto-populates full name from name components';
COMMENT ON FUNCTION search_birth_places IS 'Search birth places across all PSGC levels';
COMMENT ON FUNCTION search_occupations IS 'Search occupations across PSOC hierarchy';
COMMENT ON FUNCTION search_households IS 'Search households with RLS filtering';

-- 18.3 SCHEMA VERSION
INSERT INTO system_schema_versions (version, description)
VALUES ('2.8', 'Complete schema with field standardization, auto-population, and enterprise security')
ON CONFLICT (version) DO NOTHING;

-- ========================================================================
-- SECTION 19: SECURITY INITIALIZATION  
-- ========================================================================

-- 19.1 PSOC UNIFIED SEARCH VIEW
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
    SELECT occupation_title INTO v_title
    FROM psoc_unified_search
    WHERE psoc_code = p_psoc_code
    LIMIT 1;
    
    RETURN v_title;
END;
$$ LANGUAGE plpgsql;

-- Function to search PSOC occupations
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
        CASE WHEN pus.occupation_title ILIKE p_search_term THEN 0 ELSE 1 END,
        pus.psoc_level DESC,
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

COMMENT ON VIEW psoc_unified_search IS 'Unified view for searching across all PSOC hierarchy levels';
COMMENT ON FUNCTION get_psoc_title IS 'Returns occupation title for any PSOC code';
COMMENT ON FUNCTION search_psoc_occupations IS 'Search function for UI autocomplete';
COMMENT ON VIEW residents_with_occupation IS 'Residents joined with occupation details';



-- =============================================================================
-- SECTION: SUPABASE AUTH INTEGRATION
-- Functions and triggers for Supabase authentication
-- =============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_default_role_id UUID;
BEGIN
    -- Get the default role (barangay_admin since only admins can register)
    SELECT id INTO v_default_role_id 
    FROM auth_roles 
    WHERE name = 'barangay_admin'
    LIMIT 1;
    
    -- If no default role exists, get any admin role
    IF v_default_role_id IS NULL THEN
        SELECT id INTO v_default_role_id 
        FROM auth_roles 
        WHERE name IN ('barangay_admin', 'super_admin')
        LIMIT 1;
    END IF;
    
    -- Insert the user profile
    INSERT INTO auth_user_profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        role_id,
        barangay_code,
        is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        NEW.raw_user_meta_data->>'phone',
        v_default_role_id,
        NEW.raw_user_meta_data->>'barangay_code',
        true
    ) ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- CONSOLIDATED DEFAULT ROLES
-- Single source of truth for all system roles
-- Note: 'resident' role removed - only admins can self-register, others must be invited
INSERT INTO auth_roles (name, description, permissions) VALUES
    ('super_admin', 'System Administrator with full access', '{"all": true}'),
    ('region_admin', 'Regional Administrator', '{"residents": ["read", "create", "update"], "households": ["read", "create", "update"], "reports": ["read", "create"], "analytics": ["view"]}'),
    ('province_admin', 'Provincial Administrator', '{"residents": ["read", "create", "update"], "households": ["read", "create", "update"], "reports": ["read"]}'),
    ('city_admin', 'City/Municipality Administrator', '{"residents": ["read", "create", "update"], "households": ["read", "create", "update"]}'),
    ('barangay_admin', 'Barangay Administrator with full local management', '{"residents": ["read", "create", "update", "delete"], "households": ["read", "create", "update", "delete"], "reports": ["read", "create"], "manage_users": true, "manage_residents": true, "manage_households": true, "view_analytics": true}'),
    ('barangay_staff', 'Barangay Staff/Clerk - invited by admin only', '{"residents": ["read", "create", "update"], "households": ["read", "create", "update"], "manage_residents": true, "manage_households": true}')
ON CONFLICT (name) DO NOTHING;

-- END OF COMPLETE SCHEMA DEFINITION
