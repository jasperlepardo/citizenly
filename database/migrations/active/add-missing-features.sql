-- =====================================================
-- ADD MISSING FEATURES FROM FULL-FEATURE SCHEMA
-- This migration adds only the missing components
-- while preserving existing PSGC/PSOC data
-- =====================================================

-- First, drop the tables you're OK to recreate
DROP TABLE IF EXISTS residents CASCADE;
DROP TABLE IF EXISTS resident_relationships CASCADE;
DROP TABLE IF EXISTS households CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- 1. MISSING ENUMS (Add only if not exists)
-- =====================================================

-- Check and create missing enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sex_enum') THEN
        CREATE TYPE sex_enum AS ENUM ('male', 'female');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'civil_status_enum') THEN
        CREATE TYPE civil_status_enum AS ENUM (
            'single', 'married', 'widowed', 'divorced', 
            'separated', 'annulled', 'registered_partnership', 'live_in'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'citizenship_enum') THEN
        CREATE TYPE citizenship_enum AS ENUM (
            'filipino', 'dual_citizen', 'foreign_national'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'education_level_enum') THEN
        CREATE TYPE education_level_enum AS ENUM (
            'no_formal_education', 'elementary', 'high_school', 
            'college', 'post_graduate', 'vocational', 
            'graduate', 'undergraduate'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'education_status_enum') THEN
        CREATE TYPE education_status_enum AS ENUM (
            'currently_studying', 'not_studying', 'graduated', 'dropped_out'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status_enum') THEN
        CREATE TYPE employment_status_enum AS ENUM (
            'employed', 'unemployed', 'underemployed', 'self_employed',
            'student', 'retired', 'homemaker', 'unable_to_work',
            'looking_for_work', 'not_in_labor_force'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_type_enum') THEN
        CREATE TYPE blood_type_enum AS ENUM (
            'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'religion_enum') THEN
        CREATE TYPE religion_enum AS ENUM (
            'roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian',
            'aglipayan_church', 'seventh_day_adventist', 'bible_baptist_church',
            'jehovahs_witnesses', 'church_of_jesus_christ_latter_day_saints',
            'united_church_of_christ_philippines', 'protestant', 'buddhism',
            'baptist', 'methodist', 'pentecostal', 'evangelical', 'mormon',
            'orthodox', 'hinduism', 'judaism', 'indigenous_beliefs',
            'atheist', 'agnostic', 'none', 'prefer_not_to_say', 'other'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'disability_enum') THEN
        CREATE TYPE disability_enum AS ENUM (
            'none', 'visual', 'hearing', 'mobility', 'cognitive',
            'self_care', 'communication', 'multiple'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'household_relationship_enum') THEN
        CREATE TYPE household_relationship_enum AS ENUM (
            'head', 'spouse', 'child', 'parent', 'sibling', 
            'grandparent', 'grandchild', 'in_law', 'other_relative',
            'non_relative', 'boarder', 'domestic_helper'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ownership_status_enum') THEN
        CREATE TYPE ownership_status_enum AS ENUM (
            'owned', 'renting', 'informal_settler', 'government_housing',
            'company_provided', 'inherited', 'caretaker', 'other'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'structure_type_enum') THEN
        CREATE TYPE structure_type_enum AS ENUM (
            'single_house', 'duplex', 'apartment', 'condo', 'townhouse',
            'boarding_house', 'institutional', 'commercial', 'mixed_use', 'other'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sectoral_group_enum') THEN
        CREATE TYPE sectoral_group_enum AS ENUM (
            'senior_citizen', 'pwd', 'solo_parent', 'ofw_family',
            'indigenous_people', 'farmers', 'fisherfolk', 'urban_poor'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'id_type_enum') THEN
        CREATE TYPE id_type_enum AS ENUM (
            'national_id', 'philhealth', 'sss', 'gsis', 'tin',
            'voters_id', 'drivers_license', 'passport', 'postal_id',
            'barangay_id', 'senior_citizen_id', 'pwd_id', 'other'
        );
    END IF;
END $$;

-- =====================================================
-- 2. NEW TABLES (Not in basic schema)
-- =====================================================

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Barangay accounts (linking barangays to user accounts)
CREATE TABLE IF NOT EXISTS barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barangay_code TEXT NOT NULL REFERENCES psgc_barangays(code),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES auth.users(id),
    
    UNIQUE(barangay_code, user_id),
    INDEX idx_barangay_accounts_user (user_id),
    INDEX idx_barangay_accounts_barangay (barangay_code)
);

-- Enhanced user profiles with geographic hierarchy
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    -- Geographic hierarchy for multi-level access
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    is_active BOOLEAN DEFAULT true,
    phone_number TEXT,
    position TEXT,
    department TEXT,
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    INDEX idx_user_profiles_role (role_id),
    INDEX idx_user_profiles_barangay (barangay_code),
    INDEX idx_user_profiles_active (is_active)
);

-- Enhanced households table
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_number TEXT NOT NULL,
    barangay_code TEXT NOT NULL REFERENCES psgc_barangays(code),
    
    -- Location details
    purok TEXT,
    subdivision_id UUID,
    street_id UUID,
    house_number TEXT,
    building_name TEXT,
    unit_number TEXT,
    floor_number TEXT,
    block_number TEXT,
    lot_number TEXT,
    
    -- Coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Housing details
    ownership_status ownership_status_enum,
    structure_type structure_type_enum,
    year_constructed INTEGER,
    number_of_rooms INTEGER,
    has_electricity BOOLEAN,
    has_water_supply BOOLEAN,
    has_toilet BOOLEAN,
    
    -- Economic indicators
    monthly_income_bracket TEXT,
    receives_4ps BOOLEAN DEFAULT false,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(household_number, barangay_code),
    INDEX idx_households_barangay (barangay_code),
    INDEX idx_households_purok (purok),
    INDEX idx_households_subdivision (subdivision_id),
    INDEX idx_households_4ps (receives_4ps)
);

-- Enhanced residents table
CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    barangay_code TEXT NOT NULL REFERENCES psgc_barangays(code),
    
    -- Personal Information
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    suffix TEXT,
    nickname TEXT,
    
    -- Demographics
    sex sex_enum NOT NULL,
    birth_date DATE NOT NULL,
    birth_place TEXT,
    civil_status civil_status_enum,
    citizenship citizenship_enum DEFAULT 'filipino',
    
    -- Contact Information
    mobile_number TEXT,
    email TEXT,
    
    -- Education
    education_level education_level_enum,
    education_status education_status_enum,
    school_name TEXT,
    
    -- Employment
    employment_status employment_status_enum,
    occupation TEXT,
    occupation_code TEXT REFERENCES psoc_unit_sub_groups(code),
    employer_name TEXT,
    employer_address TEXT,
    monthly_income DECIMAL(12, 2),
    
    -- Health Information
    blood_type blood_type_enum,
    has_disability BOOLEAN DEFAULT false,
    disability_type disability_enum[],
    is_pregnant BOOLEAN DEFAULT false,
    
    -- Identity & Registration
    religion religion_enum,
    is_registered_voter BOOLEAN DEFAULT false,
    voter_id_number TEXT,
    precinct_number TEXT,
    
    -- Government IDs
    national_id_number TEXT,
    philhealth_number TEXT,
    sss_number TEXT,
    gsis_number TEXT,
    tin_number TEXT,
    
    -- Additional Information
    is_ofw BOOLEAN DEFAULT false,
    country_of_work TEXT,
    metadata JSONB DEFAULT '{}',
    photo_url TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    INDEX idx_residents_household (household_id),
    INDEX idx_residents_barangay (barangay_code),
    INDEX idx_residents_name (last_name, first_name),
    INDEX idx_residents_birth_date (birth_date),
    INDEX idx_residents_voter (is_registered_voter)
);

-- Household members relationship table
CREATE TABLE IF NOT EXISTS household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    relationship_to_head household_relationship_enum NOT NULL,
    is_head BOOLEAN DEFAULT false,
    moved_in_date DATE,
    moved_out_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(household_id, resident_id),
    INDEX idx_household_members_household (household_id),
    INDEX idx_household_members_resident (resident_id),
    INDEX idx_household_members_active (is_active)
);

-- Resident relationships
CREATE TABLE IF NOT EXISTS resident_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    related_resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(resident_id, related_resident_id, relationship_type),
    CHECK (resident_id != related_resident_id)
);

-- Subdivisions/Villages
CREATE TABLE IF NOT EXISTS subdivisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barangay_code TEXT NOT NULL REFERENCES psgc_barangays(code),
    name TEXT NOT NULL,
    type TEXT, -- subdivision, village, compound, etc.
    total_units INTEGER,
    year_established INTEGER,
    developer_name TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(barangay_code, name),
    INDEX idx_subdivisions_barangay (barangay_code)
);

-- Street names
CREATE TABLE IF NOT EXISTS street_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barangay_code TEXT NOT NULL REFERENCES psgc_barangays(code),
    street_name TEXT NOT NULL,
    alternative_name TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(barangay_code, street_name),
    INDEX idx_street_names_barangay (barangay_code)
);

-- Sectoral information
CREATE TABLE IF NOT EXISTS sectoral_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    sector sectoral_group_enum NOT NULL,
    registration_number TEXT,
    registration_date DATE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(resident_id, sector),
    INDEX idx_sectoral_resident (resident_id),
    INDEX idx_sectoral_sector (sector)
);

-- Migrant/Transient information
CREATE TABLE IF NOT EXISTS migrant_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    origin_province TEXT,
    origin_city TEXT,
    origin_barangay TEXT,
    date_arrived DATE,
    reason_for_migration TEXT,
    intended_length_of_stay TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(resident_id),
    INDEX idx_migrant_resident (resident_id)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_logs_table (table_name),
    INDEX idx_audit_logs_record (record_id),
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_created (created_at DESC)
);

-- Barangay dashboard summaries (materialized for performance)
CREATE TABLE IF NOT EXISTS barangay_dashboard_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barangay_code TEXT NOT NULL REFERENCES psgc_barangays(code),
    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Population stats
    total_population INTEGER DEFAULT 0,
    total_households INTEGER DEFAULT 0,
    total_families INTEGER DEFAULT 0,
    male_count INTEGER DEFAULT 0,
    female_count INTEGER DEFAULT 0,
    
    -- Age distribution
    age_0_5 INTEGER DEFAULT 0,
    age_6_12 INTEGER DEFAULT 0,
    age_13_17 INTEGER DEFAULT 0,
    age_18_35 INTEGER DEFAULT 0,
    age_36_59 INTEGER DEFAULT 0,
    age_60_plus INTEGER DEFAULT 0,
    
    -- Special sectors
    senior_citizens INTEGER DEFAULT 0,
    pwd_count INTEGER DEFAULT 0,
    solo_parents INTEGER DEFAULT 0,
    ofw_count INTEGER DEFAULT 0,
    
    -- Education
    students_count INTEGER DEFAULT 0,
    out_of_school_youth INTEGER DEFAULT 0,
    
    -- Employment
    employed_count INTEGER DEFAULT 0,
    unemployed_count INTEGER DEFAULT 0,
    
    -- Voters
    registered_voters INTEGER DEFAULT 0,
    
    -- Housing
    owned_housing INTEGER DEFAULT 0,
    renting_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(barangay_code, summary_date),
    INDEX idx_dashboard_barangay (barangay_code),
    INDEX idx_dashboard_date (summary_date DESC)
);

-- =====================================================
-- 3. ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE schema_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_version FORCE ROW LEVEL SECURITY;

ALTER TABLE barangay_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE households FORCE ROW LEVEL SECURITY;

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents FORCE ROW LEVEL SECURITY;

ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members FORCE ROW LEVEL SECURITY;

ALTER TABLE resident_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_relationships FORCE ROW LEVEL SECURITY;

ALTER TABLE subdivisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdivisions FORCE ROW LEVEL SECURITY;

ALTER TABLE street_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE street_names FORCE ROW LEVEL SECURITY;

ALTER TABLE sectoral_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectoral_information FORCE ROW LEVEL SECURITY;

ALTER TABLE migrant_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE migrant_information FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE barangay_dashboard_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_dashboard_summaries FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Barangay accounts policies
CREATE POLICY "barangay_accounts_select" ON barangay_accounts
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role_id IN (
                SELECT id FROM roles WHERE name IN ('admin', 'national_admin')
            )
        )
    );

-- User profiles policies
CREATE POLICY "user_profiles_select" ON user_profiles
    FOR SELECT USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role_id IN (
                SELECT id FROM roles WHERE name IN ('admin', 'national_admin')
            )
        )
    );

CREATE POLICY "user_profiles_update" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Households policies (barangay-scoped)
CREATE POLICY "households_select" ON households
    FOR SELECT USING (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role_id IN (
                SELECT id FROM roles WHERE name IN ('admin', 'national_admin')
            )
        )
    );

CREATE POLICY "households_insert" ON households
    FOR INSERT WITH CHECK (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "households_update" ON households
    FOR UPDATE USING (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Residents policies (barangay-scoped)
CREATE POLICY "residents_select" ON residents
    FOR SELECT USING (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role_id IN (
                SELECT id FROM roles WHERE name IN ('admin', 'national_admin')
            )
        )
    );

CREATE POLICY "residents_insert" ON residents
    FOR INSERT WITH CHECK (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "residents_update" ON residents
    FOR UPDATE USING (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Apply similar policies to other new tables
-- (Following the same pattern for brevity)

-- Audit logs - admin only
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role_id IN (
                SELECT id FROM roles WHERE name IN ('admin', 'national_admin')
            )
        )
    );

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Revoke all from anon on new tables
REVOKE ALL ON schema_version FROM anon;
REVOKE ALL ON barangay_accounts FROM anon;
REVOKE ALL ON user_profiles FROM anon;
REVOKE ALL ON households FROM anon;
REVOKE ALL ON residents FROM anon;
REVOKE ALL ON household_members FROM anon;
REVOKE ALL ON resident_relationships FROM anon;
REVOKE ALL ON subdivisions FROM anon;
REVOKE ALL ON street_names FROM anon;
REVOKE ALL ON sectoral_information FROM anon;
REVOKE ALL ON migrant_information FROM anon;
REVOKE ALL ON audit_logs FROM anon;
REVOKE ALL ON barangay_dashboard_summaries FROM anon;

-- Grant to authenticated users (RLS will control actual access)
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON households TO authenticated;
GRANT SELECT, INSERT, UPDATE ON residents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON household_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON resident_relationships TO authenticated;
GRANT SELECT ON barangay_accounts TO authenticated;
GRANT SELECT ON subdivisions TO authenticated;
GRANT SELECT ON street_names TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sectoral_information TO authenticated;
GRANT SELECT, INSERT, UPDATE ON migrant_information TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON barangay_dashboard_summaries TO authenticated;

-- =====================================================
-- 6. INSERT SCHEMA VERSION
-- =====================================================

INSERT INTO schema_version (version, description) VALUES 
(1, 'Added missing features from full-feature schema while preserving PSGC/PSOC data');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================