-- =====================================================
-- RBI SYSTEM - PRODUCTION-READY SCHEMA V2.0
-- Records of Barangay Inhabitant System
-- Updated based on comprehensive migration learnings
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =====================================================
-- 1. ENUMS (Unchanged - proven effective)
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
-- 2. PSOC REFERENCE DATA (Occupation Codes)
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

-- Cross-references for related occupations
CREATE TABLE psoc_occupation_cross_references (
    unit_group_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_unit_code VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code),
    related_occupation_title VARCHAR(200) NOT NULL,
    PRIMARY KEY (unit_group_code, related_unit_code)
);

-- =====================================================
-- 3. PSGC REFERENCE DATA (Geographic Codes) - UPDATED
-- =====================================================

-- PSGC Regions (17 regions total)
CREATE TABLE psgc_regions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSGC Provinces (Updated based on migration learnings)
CREATE TABLE psgc_provinces (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSGC Cities/Municipalities (Updated with independence handling)
CREATE TABLE psgc_cities_municipalities (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'municipality',
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    is_independent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- CRITICAL CONSTRAINT: Independence rule enforced
    CONSTRAINT independence_rule CHECK (
        (is_independent = true AND province_code IS NULL) 
        OR 
        (is_independent = false AND province_code IS NOT NULL)
    )
);

-- PSGC Barangays (Updated with better validation)
CREATE TABLE psgc_barangays (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    urban_rural_status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. COMPREHENSIVE ADDRESS HIERARCHY VIEW
-- =====================================================

-- Complete address hierarchy for dropdowns and validation
CREATE VIEW psgc_address_hierarchy AS
SELECT 
    r.code as region_code,
    r.name as region_name,
    p.code as province_code,
    p.name as province_name,
    c.code as city_municipality_code,
    c.name as city_municipality_name,
    c.type as city_municipality_type,
    c.is_independent,
    b.code as barangay_code,
    b.name as barangay_name,
    b.urban_rural_status,
    -- Full address string
    r.name || ', ' || 
    CASE 
        WHEN c.is_independent THEN c.name 
        ELSE p.name || ', ' || c.name 
    END || ', ' || b.name as full_address
FROM psgc_regions r
JOIN psgc_provinces p ON r.code = p.region_code
JOIN psgc_cities_municipalities c ON p.code = c.province_code OR c.is_independent = true
JOIN psgc_barangays b ON c.code = b.city_municipality_code
ORDER BY r.name, p.name, c.name, b.name;

-- =====================================================
-- 5. ACCESS CONTROL (Production-Ready)
-- =====================================================

-- Roles table with detailed permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    
    -- Geographic access control
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    
    -- Profile management
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. CORE ENTITIES (Enhanced)
-- =====================================================

-- Households with complete addressing
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_number VARCHAR(50) NOT NULL,
    
    -- Complete geographic hierarchy (denormalized for performance)
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    
    -- Address details
    street_name VARCHAR(200),
    house_number VARCHAR(50),
    subdivision VARCHAR(100),
    zip_code VARCHAR(10),
    
    -- Household management
    household_head_id UUID, -- References residents(id)
    total_members INTEGER DEFAULT 0,
    
    -- System fields
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint per barangay
    UNIQUE(household_number, barangay_code)
);

-- Residents (Production-ready with all learnings)
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Demographics (Required)
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    extension_name VARCHAR(20), -- Jr., Sr., III, etc.
    birthdate DATE NOT NULL,
    sex sex_enum NOT NULL,
    civil_status civil_status_enum NOT NULL,
    citizenship citizenship_enum DEFAULT 'filipino',
    
    -- Contact Information
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Education & Employment
    education_level education_level_enum NOT NULL,
    education_status education_status_enum NOT NULL,
    employment_status employment_status_enum DEFAULT 'not_in_labor_force',
    
    -- Occupation (Flexible PSOC reference)
    psoc_code VARCHAR(10), -- Any level of PSOC hierarchy
    psoc_level VARCHAR(20) CHECK (psoc_level IN ('major_group', 'sub_major_group', 'minor_group', 'unit_group', 'unit_sub_group')),
    occupation_title VARCHAR(200), -- Denormalized for performance
    occupation_details TEXT, -- Additional occupation information
    
    -- Health Information
    blood_type blood_type_enum DEFAULT 'unknown',
    
    -- Cultural Information
    ethnicity ethnicity_enum DEFAULT 'not_reported',
    religion religion_enum DEFAULT 'other',
    
    -- Voting Information
    is_voter BOOLEAN DEFAULT false,
    is_resident_voter BOOLEAN DEFAULT false,
    voter_id_number VARCHAR(50),
    
    -- Government IDs (Hashed for security)
    philsys_card_number_hash BYTEA,
    philsys_last4 VARCHAR(4), -- For verification without storing full number
    
    -- Sectoral Classification (LGU Requirements)
    is_labor_force BOOLEAN DEFAULT false,
    is_employed BOOLEAN DEFAULT false,
    is_unemployed BOOLEAN DEFAULT false,
    is_ofw BOOLEAN DEFAULT false, -- Overseas Filipino Worker
    is_pwd BOOLEAN DEFAULT false, -- Person with Disability
    is_out_of_school_children BOOLEAN DEFAULT false, -- Ages 6-15 not in school
    is_out_of_school_youth BOOLEAN DEFAULT false, -- Ages 16-24 not in school
    is_senior_citizen BOOLEAN DEFAULT false, -- Age 60+
    is_registered_senior_citizen BOOLEAN DEFAULT false,
    is_solo_parent BOOLEAN DEFAULT false,
    is_indigenous_people BOOLEAN DEFAULT false,
    is_migrant BOOLEAN DEFAULT false,
    
    -- Location (Required)
    household_id UUID REFERENCES households(id),
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    
    -- Full-text search (auto-generated)
    search_text TEXT GENERATED ALWAYS AS (
        LOWER(
            first_name || ' ' || 
            COALESCE(middle_name, '') || ' ' || 
            last_name || ' ' || 
            COALESCE(extension_name, '') || ' ' ||
            COALESCE(occupation_title, '') || ' ' || 
            COALESCE(mobile_number, '') || ' ' ||
            COALESCE(voter_id_number, '')
        )
    ) STORED,
    
    -- System fields
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add household head constraint after residents table is created
ALTER TABLE households 
ADD CONSTRAINT fk_households_head 
FOREIGN KEY (household_head_id) REFERENCES residents(id);

-- Family Relationships
CREATE TABLE resident_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    related_resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'child', 'spouse', 'sibling', 'other'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resident_id, related_resident_id, relationship_type)
);

-- =====================================================
-- 7. PERFORMANCE INDEXES (Optimized)
-- =====================================================

-- Residents indexes (most critical)
CREATE INDEX idx_residents_barangay ON residents(barangay_code);
CREATE INDEX idx_residents_household ON residents(household_id);
CREATE INDEX idx_residents_name ON residents(last_name, first_name);
CREATE INDEX idx_residents_mobile ON residents(mobile_number);
CREATE INDEX idx_residents_birthdate ON residents(birthdate);
CREATE INDEX idx_residents_philsys_last4 ON residents(philsys_last4) WHERE philsys_last4 IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_residents_search_text ON residents USING GIN(search_text gin_trgm_ops);

-- Household indexes
CREATE INDEX idx_households_barangay ON households(barangay_code);
CREATE INDEX idx_households_number ON households(household_number, barangay_code);

-- Geographic hierarchy indexes
CREATE INDEX idx_psgc_cities_province ON psgc_cities_municipalities(province_code);
CREATE INDEX idx_psgc_barangays_city ON psgc_barangays(city_municipality_code);

-- User access indexes
CREATE INDEX idx_user_profiles_barangay ON user_profiles(barangay_code);
CREATE INDEX idx_user_profiles_role ON user_profiles(role_id);

-- Relationship indexes
CREATE INDEX idx_relationships_resident ON resident_relationships(resident_id);
CREATE INDEX idx_relationships_related ON resident_relationships(related_resident_id);

-- =====================================================
-- 8. ADVANCED OCCUPATION SEARCH VIEW
-- =====================================================

-- Unified occupation search view (all PSOC levels + cross-references)
CREATE VIEW psoc_occupation_search AS
-- Unit Sub-Groups (Most specific - highest priority)
SELECT 
    usg.code as occupation_code,
    'unit_sub_group' as level_type,
    usg.title as occupation_title,
    ug.title || ' - ' || usg.title as full_title,
    usg.code || ' | ' || ug.title || ' - ' || usg.title as searchable_text,
    1 as hierarchy_level,
    ug.code as parent_code
FROM psoc_unit_sub_groups usg
JOIN psoc_unit_groups ug ON usg.unit_code = ug.code

UNION ALL

-- Unit Groups
SELECT 
    ug.code as occupation_code,
    'unit_group' as level_type,
    ug.title as occupation_title,
    ug.title as full_title,
    ug.code || ' | ' || ug.title || 
    COALESCE(' ' || string_agg(ocr.related_occupation_title, ' '), '') as searchable_text,
    2 as hierarchy_level,
    mg.code as parent_code
FROM psoc_unit_groups ug
JOIN psoc_minor_groups mg ON ug.minor_code = mg.code
LEFT JOIN psoc_occupation_cross_references ocr ON ug.code = ocr.unit_group_code
GROUP BY ug.code, ug.title, mg.code

UNION ALL

-- Minor Groups
SELECT 
    ming.code as occupation_code,
    'minor_group' as level_type,
    ming.title as occupation_title,
    ming.title as full_title,
    ming.code || ' | ' || ming.title as searchable_text,
    3 as hierarchy_level,
    smg.code as parent_code
FROM psoc_minor_groups ming
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code

UNION ALL

-- Sub-Major Groups
SELECT 
    smg.code as occupation_code,
    'sub_major_group' as level_type,
    smg.title as occupation_title,
    smg.title as full_title,
    smg.code || ' | ' || smg.title as searchable_text,
    4 as hierarchy_level,
    maj.code as parent_code
FROM psoc_sub_major_groups smg
JOIN psoc_major_groups maj ON smg.major_code = maj.code

UNION ALL

-- Major Groups
SELECT 
    maj.code as occupation_code,
    'major_group' as level_type,
    maj.title as occupation_title,
    maj.title as full_title,
    maj.code || ' | ' || maj.title as searchable_text,
    5 as hierarchy_level,
    NULL as parent_code
FROM psoc_major_groups maj

ORDER BY hierarchy_level, occupation_title;

-- =====================================================
-- 9. ROW LEVEL SECURITY (Production-Ready)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for residents (barangay-scoped access)
CREATE POLICY residents_barangay_access ON residents
    FOR ALL USING (
        barangay_code IN (
            SELECT up.barangay_code 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
            AND up.is_active = true
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'super_admin'
        )
    );

-- RLS Policies for households
CREATE POLICY households_barangay_access ON households
    FOR ALL USING (
        barangay_code IN (
            SELECT up.barangay_code 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
            AND up.is_active = true
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'super_admin'
        )
    );

-- RLS Policy for user profiles (own profile only)
CREATE POLICY user_profiles_own_access ON user_profiles
    FOR ALL USING (id = auth.uid());

-- =====================================================
-- 10. TRIGGERS FOR AUTO-COMPUTED FIELDS
-- =====================================================

-- Function to update sectoral classifications based on age and employment
CREATE OR REPLACE FUNCTION update_resident_sectoral_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate age
    NEW.is_senior_citizen := (EXTRACT(YEAR FROM AGE(NEW.birthdate)) >= 60);
    
    -- Update employment flags
    NEW.is_employed := (NEW.employment_status IN ('employed', 'self_employed'));
    NEW.is_unemployed := (NEW.employment_status = 'unemployed');
    NEW.is_labor_force := (NEW.employment_status IN ('employed', 'unemployed', 'underemployed', 'self_employed', 'looking_for_work'));
    
    -- Update out of school classifications based on age and education status
    IF EXTRACT(YEAR FROM AGE(NEW.birthdate)) BETWEEN 6 AND 15 THEN
        NEW.is_out_of_school_children := (NEW.education_status != 'currently_studying');
    ELSE
        NEW.is_out_of_school_children := false;
    END IF;
    
    IF EXTRACT(YEAR FROM AGE(NEW.birthdate)) BETWEEN 16 AND 24 THEN
        NEW.is_out_of_school_youth := (NEW.education_status NOT IN ('currently_studying', 'graduated'));
    ELSE
        NEW.is_out_of_school_youth := false;
    END IF;
    
    -- Update timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_resident_sectoral_info
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_resident_sectoral_info();

-- Function to update household member count
CREATE OR REPLACE FUNCTION update_household_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE households 
        SET total_members = (
            SELECT COUNT(*) 
            FROM residents 
            WHERE household_id = NEW.household_id 
            AND is_active = true
        )
        WHERE id = NEW.household_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update both old and new households if household changed
        IF OLD.household_id != NEW.household_id THEN
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_id = OLD.household_id 
                AND is_active = true
            )
            WHERE id = OLD.household_id;
        END IF;
        
        UPDATE households 
        SET total_members = (
            SELECT COUNT(*) 
            FROM residents 
            WHERE household_id = NEW.household_id 
            AND is_active = true
        )
        WHERE id = NEW.household_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE households 
        SET total_members = (
            SELECT COUNT(*) 
            FROM residents 
            WHERE household_id = OLD.household_id 
            AND is_active = true
        )
        WHERE id = OLD.household_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create household member count trigger
CREATE TRIGGER trigger_update_household_member_count
    AFTER INSERT OR UPDATE OR DELETE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_household_member_count();

-- =====================================================
-- 11. SEED DATA (Essential Roles)
-- =====================================================

INSERT INTO roles (name, description, permissions) VALUES 
('super_admin', 'System Administrator - Full Access', '{"all": true}'),
('regional_admin', 'Regional Administrator', '{"residents": "crud", "households": "crud", "users": "manage", "reports": "all"}'),
('provincial_admin', 'Provincial Administrator', '{"residents": "crud", "households": "crud", "users": "view", "reports": "provincial"}'),
('city_admin', 'City/Municipality Administrator', '{"residents": "crud", "households": "crud", "reports": "city"}'),
('barangay_admin', 'Barangay Administrator', '{"residents": "crud", "households": "crud", "reports": "barangay"}'),
('clerk', 'Data Entry Clerk', '{"residents": "crud", "households": "crud"}'),
('viewer', 'Read-Only Access', '{"residents": "read", "households": "read"}'),
('resident', 'Resident Self-Service', '{"residents": "read_own"}');

-- Create some sample regions for testing (will be replaced by CSV import)
INSERT INTO psgc_regions (code, name) VALUES 
('NCR', 'National Capital Region'),
('13', 'National Capital Region') -- Alternative code format
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 12. UTILITY FUNCTIONS
-- =====================================================

-- Function to get complete address
CREATE OR REPLACE FUNCTION get_complete_address(barangay_code_param VARCHAR(10))
RETURNS TEXT AS $$
DECLARE
    address_parts TEXT[];
    result TEXT;
BEGIN
    SELECT ARRAY[r.name, 
                 CASE WHEN c.is_independent THEN NULL ELSE p.name END,
                 c.name, 
                 b.name]
    INTO address_parts
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    LEFT JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON COALESCE(p.region_code, '13') = r.code
    WHERE b.code = barangay_code_param;
    
    SELECT array_to_string(array_remove(address_parts, NULL), ', ') INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate barangay exists and get hierarchy
CREATE OR REPLACE FUNCTION validate_barangay_hierarchy(barangay_code_param VARCHAR(10))
RETURNS TABLE(
    region_code VARCHAR(10),
    region_name VARCHAR(200),
    province_code VARCHAR(10),
    province_name VARCHAR(200),
    city_code VARCHAR(10),
    city_name VARCHAR(200),
    barangay_name VARCHAR(200),
    is_independent BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.code,
        r.name,
        p.code,
        p.name,
        c.code,
        c.name,
        b.name,
        c.is_independent
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    LEFT JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON COALESCE(p.region_code, '13') = r.code
    WHERE b.code = barangay_code_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEMA COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA public IS 'RBI System - Production Schema v2.0 - Updated based on migration learnings';
COMMENT ON TABLE residents IS 'Core resident profiles with complete demographic and sectoral information';
COMMENT ON TABLE households IS 'Household entities with complete addressing and member management';
COMMENT ON TABLE psgc_cities_municipalities IS 'Cities/Municipalities with independence constraint for Metro Manila and HUCs';
COMMENT ON VIEW psgc_address_hierarchy IS 'Complete address hierarchy for dropdowns and validation';
COMMENT ON VIEW psoc_occupation_search IS 'Unified occupation search across all PSOC levels with cross-references';
COMMENT ON CONSTRAINT independence_rule ON psgc_cities_municipalities IS 'Ensures independent cities have no province, non-independent cities have provinces';

-- =====================================================
-- PERFORMANCE ESTIMATES
-- =====================================================
-- Expected capacity: 100K+ residents with <2GB database size
-- Optimized for: Fast address dropdowns, resident search, reporting
-- Migration compatibility: Handles Metro Manila districts, special provinces
-- Security: Row-level security with geographic scoping
-- =====================================================