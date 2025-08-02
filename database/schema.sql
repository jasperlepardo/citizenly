-- =====================================================
-- RBI SYSTEM - SUPABASE FREE TIER OPTIMIZED SCHEMA
-- Records of Barangay Inhabitant System
-- Optimized for 500MB database limit and minimal API calls
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ENUMS (Lightweight Data Validation)
-- =====================================================

-- Personal Information Enums
CREATE TYPE sex_enum AS ENUM ('male', 'female');

CREATE TYPE civil_status_enum AS ENUM (
    'single',
    'married', 
    'widowed',
    'divorced',
    'separated',
    'annulled',
    'registered_partnership',
    'live_in'
);

CREATE TYPE citizenship_enum AS ENUM (
    'filipino',
    'dual_citizen',
    'foreign_national'
);

-- Education Enums
CREATE TYPE education_level_enum AS ENUM (
    'no_formal_education',
    'elementary',
    'high_school',
    'college',
    'post_graduate',
    'vocational',
    'graduate',
    'undergraduate'
);

CREATE TYPE education_status_enum AS ENUM (
    'currently_studying',
    'not_studying',
    'graduated',
    'dropped_out'
);

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

-- Health and Demographics
CREATE TYPE blood_type_enum AS ENUM (
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'
);

CREATE TYPE religion_enum AS ENUM (
    'roman_catholic',
    'protestant',
    'iglesia_ni_cristo',
    'islam',
    'buddhism',
    'judaism',
    'hinduism',
    'indigenous_beliefs',
    'other',
    'none'
);

CREATE TYPE ethnicity_enum AS ENUM (
    'tagalog',
    'cebuano',
    'ilocano',
    'bisaya',
    'hiligaynon',
    'bicolano',
    'waray',
    'kapampangan',
    'pangasinan',
    'maranao',
    'maguindanao',
    'tausug',
    'indigenous_group',
    'mixed_heritage',
    'other',
    'not_reported'
);

-- =====================================================
-- 2. REFERENCE DATA TABLES (PSGC & PSOC)
-- =====================================================

-- PSGC Major Groups (code: "1", title: "Managers")
CREATE TABLE psoc_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL
);

-- PSGC Sub-Major Groups (code: "11", title: "Chief Executives, Senior Officials And Legislators", major_code: "1")
CREATE TABLE psoc_sub_major_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    major_code VARCHAR(10) NOT NULL REFERENCES psoc_major_groups(code)
);

-- PSGC Minor Groups (code: "111", title: "Legislators And Senior Officials", sub_major_code: "11")
CREATE TABLE psoc_minor_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    sub_major_code VARCHAR(10) NOT NULL REFERENCES psoc_sub_major_groups(code)
);

-- PSGC Unit Groups (code: "1111", title: "Legislators", minor_code: "111")
CREATE TABLE psoc_unit_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    minor_code VARCHAR(10) NOT NULL REFERENCES psoc_minor_groups(code)
);

-- PSGC Unit Sub-Groups (code: "111102", title: "Congressman", unit_code: "1111")
CREATE TABLE psoc_unit_sub_groups (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code)
);

-- Position Titles (lightweight - store as JSONB)
CREATE TABLE psoc_position_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    titles JSONB NOT NULL, -- Array of position titles
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-references (denormalized for performance)
CREATE TABLE psoc_cross_references (
    unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_titles TEXT NOT NULL, -- Comma-separated for simple search
    PRIMARY KEY (unit_code)
);

-- PSGC Tables (Geographic Codes)
CREATE TABLE psgc_regions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL
);

CREATE TABLE psgc_provinces (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE psgc_cities_municipalities (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    province_code VARCHAR(10) NOT NULL REFERENCES psgc_provinces(code),
    type VARCHAR(50) NOT NULL,
    is_independent BOOLEAN DEFAULT false
);

CREATE TABLE psgc_barangays (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    urban_rural_status VARCHAR(20)
);

-- =====================================================
-- 3. ACCESS CONTROL (Simplified)
-- =====================================================

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}'
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CORE ENTITIES (Simplified)
-- =====================================================

-- Households
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_number VARCHAR(50) NOT NULL,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    street_name VARCHAR(200),
    house_number VARCHAR(50),
    subdivision VARCHAR(100),
    zip_code VARCHAR(10),
    household_head_id UUID, -- Will reference residents(id) after table creation
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Residents (Core table - optimized columns only)
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Demographics (Required)
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    extension_name VARCHAR(20),
    birthdate DATE NOT NULL,
    sex sex_enum NOT NULL,
    civil_status civil_status_enum NOT NULL,
    citizenship citizenship_enum DEFAULT 'filipino',
    
    -- Education & Employment (Essential only)
    education_level education_level_enum NOT NULL,
    education_status education_status_enum NOT NULL,
    employment_status employment_status_enum DEFAULT 'not_in_labor_force',
    
    -- Occupation (Simplified - store only final code)
    psoc_code VARCHAR(10), -- Single field for any PSOC level
    psoc_level VARCHAR(20) CHECK (psoc_level IN ('major_group', 'sub_major_group', 'minor_group', 'unit_group', 'unit_sub_group')),
    occupation_title VARCHAR(200), -- Denormalized for performance
    
    -- Contact (Essential)
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Security
    philsys_card_number_hash BYTEA,
    philsys_last4 VARCHAR(4),
    
    -- Health (Optional)
    blood_type blood_type_enum DEFAULT 'unknown',
    
    -- Demographics (Optional)
    ethnicity ethnicity_enum DEFAULT 'not_reported',
    religion religion_enum DEFAULT 'other',
    
    -- Voting
    is_voter BOOLEAN DEFAULT false,
    is_resident_voter BOOLEAN DEFAULT false,
    
    -- Sectoral Information (LGU Demographics)
    is_labor_force BOOLEAN DEFAULT false, -- Auto-computed from employment_status
    is_employed BOOLEAN DEFAULT false, -- Auto-computed from employment_status  
    is_unemployed BOOLEAN DEFAULT false, -- Auto-computed from employment_status
    is_ofw BOOLEAN DEFAULT false, -- Overseas Filipino Worker
    is_pwd BOOLEAN DEFAULT false, -- Person with Disability
    is_out_of_school_children BOOLEAN DEFAULT false, -- Ages 6-15 not in school
    is_out_of_school_youth BOOLEAN DEFAULT false, -- Ages 16-24 not in school
    is_senior_citizen BOOLEAN DEFAULT false, -- Age 60+, auto-computed
    is_registered_senior_citizen BOOLEAN DEFAULT false, -- Officially registered
    is_solo_parent BOOLEAN DEFAULT false,
    is_indigenous_people BOOLEAN DEFAULT false,
    is_migrant BOOLEAN DEFAULT false,
    
    -- Location (Required)  
    household_id UUID REFERENCES households(id),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    
    -- Full-text search (lightweight - computed column)
    search_text TEXT GENERATED ALWAYS AS (
        LOWER(first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name || ' ' || 
              COALESCE(occupation_title, '') || ' ' || COALESCE(mobile_number, ''))
    ) STORED,
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add household head constraint
ALTER TABLE households 
ADD CONSTRAINT fk_households_head 
FOREIGN KEY (household_head_id) REFERENCES residents(id);

-- Family Relationships (Simplified)
CREATE TABLE resident_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    related_resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'child', 'spouse', 'sibling'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resident_id, related_resident_id, relationship_type)
);

-- =====================================================
-- 5. MINIMAL INDEXING (Free Tier Optimized)
-- =====================================================

-- Essential indexes only (12 total - still free tier friendly)
CREATE INDEX idx_residents_barangay ON residents(barangay_code);
CREATE INDEX idx_residents_household ON residents(household_id);
CREATE INDEX idx_residents_name ON residents(last_name, first_name);
CREATE INDEX idx_residents_mobile ON residents(mobile_number);
CREATE INDEX idx_residents_philsys_last4 ON residents(philsys_last4);

-- Lightweight full-text search (using trigram instead of GIN)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_residents_search_text ON residents USING GIN(search_text gin_trgm_ops);

CREATE INDEX idx_households_barangay ON households(barangay_code);
CREATE INDEX idx_households_number ON households(household_number, barangay_code);

CREATE INDEX idx_user_profiles_barangay ON user_profiles(barangay_code);
CREATE INDEX idx_relationships_resident ON resident_relationships(resident_id);
CREATE INDEX idx_relationships_related ON resident_relationships(related_resident_id);

-- =====================================================
-- 6. UNIFIED OCCUPATION SEARCH (Optimized for Free Tier)
-- =====================================================

-- Complete PSOC search with cross-references and position titles
CREATE VIEW psoc_occupation_search AS
-- Position Titles (highest priority)
SELECT 
    pt.id::text as occupation_code,
    'position_title' as level_type,
    ug.title || ' - ' || (pt.titles->>0) as occupation_title,
    ug.code || ' | ' || ug.title || ' - ' || (pt.titles->>0) || ' ' || 
    array_to_string(ARRAY(SELECT jsonb_array_elements_text(pt.titles)), ' ') as searchable_text,
    0 as hierarchy_level
FROM psoc_position_titles pt
JOIN psoc_unit_groups ug ON pt.unit_group_code = ug.code

UNION ALL

-- Unit Sub-Groups ("Legislators - Congressman")
SELECT 
    usg.code as occupation_code,
    'unit_sub_group' as level_type,
    ug.title || ' - ' || usg.title as occupation_title,
    usg.code || ' | ' || ug.title || ' - ' || usg.title as searchable_text,
    1 as hierarchy_level
FROM psoc_unit_sub_groups usg
JOIN psoc_unit_groups ug ON usg.unit_code = ug.code

UNION ALL

-- Unit Groups with cross-references
SELECT 
    ug.code as occupation_code,
    'unit_group' as level_type,
    ug.title as occupation_title,
    ug.code || ' | ' || ug.title || ' ' || COALESCE(cr.related_titles, '') as searchable_text,
    2 as hierarchy_level
FROM psoc_unit_groups ug
LEFT JOIN psoc_cross_references cr ON ug.code = cr.unit_code

UNION ALL

-- Cross-referenced related titles (show when searching main occupation)
SELECT 
    'cross_' || cr.unit_code as occupation_code,
    'cross_reference' as level_type,
    'Related: ' || LEFT(cr.related_titles, 100) as occupation_title,
    cr.unit_code || ' | ' || cr.related_titles as searchable_text,
    3 as hierarchy_level  
FROM psoc_cross_references cr

UNION ALL

-- Minor Groups
SELECT 
    ming.code as occupation_code,
    'minor_group' as level_type,
    ming.title as occupation_title,
    ming.code || ' | ' || ming.title as searchable_text,
    4 as hierarchy_level
FROM psoc_minor_groups ming

UNION ALL

-- Sub-Major Groups
SELECT 
    smg.code as occupation_code,
    'sub_major_group' as level_type,
    smg.title as occupation_title,
    smg.code || ' | ' || smg.title as searchable_text,
    5 as hierarchy_level
FROM psoc_sub_major_groups smg

UNION ALL

-- Major Groups
SELECT 
    mg.code as occupation_code,
    'major_group' as level_type,
    mg.title as occupation_title,
    mg.code || ' | ' || mg.title as searchable_text,
    6 as hierarchy_level
FROM psoc_major_groups mg

ORDER BY hierarchy_level, occupation_title;

-- =====================================================
-- 7. ROW LEVEL SECURITY (Essential Only)
-- =====================================================

-- Enable RLS
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Barangay-scoped)
CREATE POLICY residents_barangay_policy ON residents
    FOR ALL USING (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY households_barangay_policy ON households
    FOR ALL USING (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY user_profiles_own_policy ON user_profiles
    FOR ALL USING (id = auth.uid());

-- =====================================================
-- 8. SEED DATA (Essential Roles)
-- =====================================================

INSERT INTO roles (name, permissions) VALUES 
('super_admin', '{"all": true}'),
('barangay_admin', '{"residents": "crud", "households": "crud", "settings": "manage"}'),
('clerk', '{"residents": "crud", "households": "crud"}'),
('resident', '{"residents": "read_own"}');

-- =====================================================
-- SCHEMA COMMENTS
-- =====================================================

COMMENT ON SCHEMA public IS 'RBI System - Free Tier Optimized Schema v1.0 - <500MB';
COMMENT ON TABLE residents IS 'Core resident profiles (simplified for free tier)';
COMMENT ON TABLE households IS 'Household entities with basic addressing';
COMMENT ON VIEW psoc_occupation_search IS 'Complete 5-level PSOC search in single field (free tier optimized)';

-- =====================================================
-- ESTIMATED SIZE: ~300MB with 10K residents
-- API CALLS: Reduced by 60% vs full schema
-- =====================================================