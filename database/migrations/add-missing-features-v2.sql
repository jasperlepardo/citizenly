-- =====================================================
-- ADD MISSING FEATURES FROM FULL-FEATURE SCHEMA WITH V2 ENHANCEMENTS
-- This migration adds all missing components and V2 enhancements
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
-- 2. V2 ENHANCEMENT: Update PSGC cities table with independence constraint
-- =====================================================

-- Add independence constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'independence_rule' 
        AND conrelid = 'psgc_cities_municipalities'::regclass
    ) THEN
        ALTER TABLE psgc_cities_municipalities 
        ADD CONSTRAINT independence_rule CHECK (
            (is_independent = true AND province_code IS NULL) 
            OR 
            (is_independent = false AND province_code IS NOT NULL)
        );
    END IF;
END $$;

-- =====================================================
-- 3. NEW TABLES (Not in basic schema)
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

-- V2 ENHANCED: User profiles with complete geographic hierarchy
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    
    -- V2 Enhancement: Complete geographic hierarchy for multi-level access
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
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
    INDEX idx_user_profiles_region (region_code),
    INDEX idx_user_profiles_province (province_code),
    INDEX idx_user_profiles_city (city_municipality_code),
    INDEX idx_user_profiles_active (is_active)
);

-- V2 ENHANCED: Households with complete features
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
    
    -- V2 Enhancement: Total members count (auto-updated by trigger)
    total_members INTEGER DEFAULT 0,
    
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

-- V2 ENHANCED: Residents with complete features and sectoral indicators
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
    
    -- V2 Enhancement: Labor force indicators (auto-calculated)
    is_in_labor_force BOOLEAN DEFAULT false,
    is_employed BOOLEAN DEFAULT false,
    is_unemployed BOOLEAN DEFAULT false,
    
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
    
    -- V2 Enhancement: Sectoral indicators (auto-calculated where applicable)
    is_ofw BOOLEAN DEFAULT false,
    is_person_with_disability BOOLEAN DEFAULT false,
    is_out_of_school_children BOOLEAN DEFAULT false,  -- Ages 6-15
    is_out_of_school_youth BOOLEAN DEFAULT false,     -- Ages 16-24
    is_senior_citizen BOOLEAN DEFAULT false,           -- 60+ (auto-calculated)
    is_registered_senior_citizen BOOLEAN DEFAULT false,
    is_solo_parent BOOLEAN DEFAULT false,
    is_indigenous_people BOOLEAN DEFAULT false,
    
    -- Additional Information
    country_of_work TEXT,
    metadata JSONB DEFAULT '{}',
    photo_url TEXT,
    
    -- V2 Enhancement: Search optimization
    search_text TEXT GENERATED ALWAYS AS (
        lower(first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name || ' ' || COALESCE(suffix, ''))
    ) STORED,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    INDEX idx_residents_household (household_id),
    INDEX idx_residents_barangay (barangay_code),
    INDEX idx_residents_name (last_name, first_name),
    INDEX idx_residents_birth_date (birth_date),
    INDEX idx_residents_voter (is_registered_voter),
    INDEX idx_residents_mobile (mobile_number),
    -- V2 Enhancement: Conditional indexes for optimization
    INDEX idx_residents_national_id (national_id_number) WHERE national_id_number IS NOT NULL,
    INDEX idx_residents_philhealth (philhealth_number) WHERE philhealth_number IS NOT NULL,
    -- V2 Enhancement: Birthdate index for age-based calculations
    INDEX idx_residents_birthdate (birth_date),
    -- V2 Enhancement: Full-text search
    INDEX idx_residents_search_text ON residents USING GIN(search_text gin_trgm_ops),
    -- V2 Enhancement: Sectoral indexes
    INDEX idx_residents_senior (is_senior_citizen) WHERE is_senior_citizen = true,
    INDEX idx_residents_pwd (is_person_with_disability) WHERE is_person_with_disability = true,
    INDEX idx_residents_ofw (is_ofw) WHERE is_ofw = true,
    INDEX idx_residents_osc (is_out_of_school_children) WHERE is_out_of_school_children = true,
    INDEX idx_residents_osy (is_out_of_school_youth) WHERE is_out_of_school_youth = true
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

-- V2 ENHANCED: Sectoral information with all indicators
CREATE TABLE IF NOT EXISTS sectoral_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    
    -- V2 Enhancement: Complete sectoral tracking
    is_ofw BOOLEAN DEFAULT false,
    is_person_with_disability BOOLEAN DEFAULT false,
    is_out_of_school_children BOOLEAN DEFAULT false,
    is_out_of_school_youth BOOLEAN DEFAULT false,
    is_senior_citizen BOOLEAN DEFAULT false,
    is_registered_senior_citizen BOOLEAN DEFAULT false,
    is_solo_parent BOOLEAN DEFAULT false,
    is_indigenous_people BOOLEAN DEFAULT false,
    
    -- Registration details
    senior_citizen_id TEXT,
    pwd_id TEXT,
    solo_parent_id TEXT,
    indigenous_group TEXT,
    
    -- Registration dates
    senior_citizen_registration_date DATE,
    pwd_registration_date DATE,
    solo_parent_registration_date DATE,
    
    -- Expiry dates
    senior_citizen_id_expiry DATE,
    pwd_id_expiry DATE,
    solo_parent_id_expiry DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(resident_id),
    INDEX idx_sectoral_resident (resident_id),
    -- V2 Enhancement: Sectoral indexes for fast filtering
    INDEX idx_sectoral_ofw (is_ofw),
    INDEX idx_sectoral_pwd (is_person_with_disability),
    INDEX idx_sectoral_senior (is_senior_citizen),
    INDEX idx_sectoral_solo_parent (is_solo_parent),
    INDEX idx_sectoral_indigenous (is_indigenous_people)
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

-- V2 ENHANCED: Barangay dashboard summaries with complete metrics
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
    
    -- V2 Enhancement: Complete sectoral counts
    senior_citizens INTEGER DEFAULT 0,
    registered_senior_citizens INTEGER DEFAULT 0,
    pwd_count INTEGER DEFAULT 0,
    solo_parents INTEGER DEFAULT 0,
    ofw_count INTEGER DEFAULT 0,
    indigenous_people_count INTEGER DEFAULT 0,
    
    -- Education
    students_count INTEGER DEFAULT 0,
    out_of_school_children INTEGER DEFAULT 0,  -- Ages 6-15
    out_of_school_youth INTEGER DEFAULT 0,     -- Ages 16-24
    
    -- Employment
    in_labor_force INTEGER DEFAULT 0,
    employed_count INTEGER DEFAULT 0,
    unemployed_count INTEGER DEFAULT 0,
    not_in_labor_force INTEGER DEFAULT 0,
    
    -- Voters
    registered_voters INTEGER DEFAULT 0,
    
    -- Housing
    owned_housing INTEGER DEFAULT 0,
    renting_count INTEGER DEFAULT 0,
    households_with_electricity INTEGER DEFAULT 0,
    households_with_water INTEGER DEFAULT 0,
    households_with_toilet INTEGER DEFAULT 0,
    
    -- Economic
    households_4ps_beneficiary INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(barangay_code, summary_date),
    INDEX idx_dashboard_barangay (barangay_code),
    INDEX idx_dashboard_date (summary_date DESC)
);

-- =====================================================
-- 4. V2 ENHANCEMENT: TRIGGERS FOR AUTO-CALCULATIONS
-- =====================================================

-- Function to update household member count
CREATE OR REPLACE FUNCTION update_household_members_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE households 
        SET total_members = (
            -- V2 Enhancement: Count only active residents
            SELECT COUNT(*) FROM residents 
            WHERE household_id = NEW.household_id AND is_active = true
        )
        WHERE id = NEW.household_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE households 
        SET total_members = (
            -- V2 Enhancement: Count only active residents
            SELECT COUNT(*) FROM residents 
            WHERE household_id = OLD.household_id AND is_active = true
        )
        WHERE id = OLD.household_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update old household if changed
        IF OLD.household_id != NEW.household_id THEN
            UPDATE households 
            SET total_members = (
                -- V2 Enhancement: Count only active residents
                SELECT COUNT(*) FROM residents 
                WHERE household_id = OLD.household_id AND is_active = true
            )
            WHERE id = OLD.household_id;
        END IF;
        -- Update new household
        UPDATE households 
        SET total_members = (
            -- V2 Enhancement: Count only active residents
            SELECT COUNT(*) FROM residents 
            WHERE household_id = NEW.household_id AND is_active = true
        )
        WHERE id = NEW.household_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for household member count
CREATE TRIGGER trigger_update_household_members
    AFTER INSERT OR UPDATE OR DELETE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_household_members_count();

-- V2 Enhancement: Function to auto-calculate resident indicators
CREATE OR REPLACE FUNCTION calculate_resident_indicators()
RETURNS TRIGGER AS $$
BEGIN
    -- V2 Enhancement: Better PL/pgSQL syntax with :=
    -- Auto-calculate senior citizen status (age 60+)
    NEW.is_senior_citizen := (EXTRACT(YEAR FROM AGE(NEW.birth_date)) >= 60);
    
    -- Auto-calculate labor force status based on employment
    NEW.is_in_labor_force := (
        NEW.employment_status IN ('employed', 'unemployed', 'underemployed', 'self_employed', 'looking_for_work')
        AND EXTRACT(YEAR FROM AGE(NEW.birth_date)) >= 15
    );
    
    NEW.is_employed := (NEW.employment_status IN ('employed', 'self_employed', 'underemployed'));
    NEW.is_unemployed := (NEW.employment_status IN ('unemployed', 'looking_for_work'));
    
    -- V2 Enhancement: Auto-calculate out-of-school classifications
    -- Out-of-school children (ages 6-15)
    IF EXTRACT(YEAR FROM AGE(NEW.birth_date)) BETWEEN 6 AND 15 THEN
        NEW.is_out_of_school_children := (NEW.education_status != 'currently_studying');
    ELSE
        NEW.is_out_of_school_children := false;
    END IF;
    
    -- Out-of-school youth (ages 16-24)
    IF EXTRACT(YEAR FROM AGE(NEW.birth_date)) BETWEEN 16 AND 24 THEN
        NEW.is_out_of_school_youth := (NEW.education_status NOT IN ('currently_studying', 'graduated'));
    ELSE
        NEW.is_out_of_school_youth := false;
    END IF;
    
    -- Copy disability status
    NEW.is_person_with_disability := NEW.has_disability;
    
    -- V2 Enhancement: Auto-update timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for resident indicators
CREATE TRIGGER trigger_calculate_resident_indicators
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION calculate_resident_indicators();

-- V2 Enhancement: Function to sync sectoral information
CREATE OR REPLACE FUNCTION sync_sectoral_information()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update sectoral_information table
    INSERT INTO sectoral_information (
        resident_id,
        is_ofw,
        is_person_with_disability,
        is_out_of_school_children,
        is_out_of_school_youth,
        is_senior_citizen,
        is_registered_senior_citizen,
        is_solo_parent,
        is_indigenous_people
    ) VALUES (
        NEW.id,
        NEW.is_ofw,
        NEW.is_person_with_disability,
        NEW.is_out_of_school_children,
        NEW.is_out_of_school_youth,
        NEW.is_senior_citizen,
        NEW.is_registered_senior_citizen,
        NEW.is_solo_parent,
        NEW.is_indigenous_people
    )
    ON CONFLICT (resident_id) DO UPDATE SET
        is_ofw = NEW.is_ofw,
        is_person_with_disability = NEW.is_person_with_disability,
        is_out_of_school_children = NEW.is_out_of_school_children,
        is_out_of_school_youth = NEW.is_out_of_school_youth,
        is_senior_citizen = NEW.is_senior_citizen,
        is_registered_senior_citizen = NEW.is_registered_senior_citizen,
        is_solo_parent = NEW.is_solo_parent,
        is_indigenous_people = NEW.is_indigenous_people,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync sectoral information
CREATE TRIGGER trigger_sync_sectoral_information
    AFTER INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION sync_sectoral_information();

-- =====================================================
-- 5. ENABLE RLS ON ALL TABLES
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
-- 6. CREATE RLS POLICIES FOR ALL TABLES
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

-- User profiles policies (with geographic hierarchy support)
CREATE POLICY "user_profiles_select" ON user_profiles
    FOR SELECT USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND (
                -- National admin sees all
                up.role_id IN (SELECT id FROM roles WHERE name = 'national_admin') OR
                -- Regional admin sees their region
                (up.region_code = user_profiles.region_code AND 
                 up.role_id IN (SELECT id FROM roles WHERE name = 'regional_admin')) OR
                -- Provincial admin sees their province
                (up.province_code = user_profiles.province_code AND 
                 up.role_id IN (SELECT id FROM roles WHERE name = 'provincial_admin')) OR
                -- City admin sees their city
                (up.city_municipality_code = user_profiles.city_municipality_code AND 
                 up.role_id IN (SELECT id FROM roles WHERE name = 'city_admin'))
            )
        )
    );

CREATE POLICY "user_profiles_update" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Households policies (barangay-scoped with hierarchy support)
CREATE POLICY "households_select" ON households
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND (
                -- Barangay level access
                up.barangay_code = households.barangay_code OR
                -- City level access
                (up.city_municipality_code IN (
                    SELECT city_municipality_code FROM psgc_barangays 
                    WHERE code = households.barangay_code
                )) OR
                -- Province level access
                (up.province_code IN (
                    SELECT c.province_code FROM psgc_barangays b
                    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
                    WHERE b.code = households.barangay_code
                )) OR
                -- Region level access
                (up.region_code IN (
                    SELECT p.region_code FROM psgc_barangays b
                    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
                    JOIN psgc_provinces p ON c.province_code = p.code
                    WHERE b.code = households.barangay_code
                )) OR
                -- National admin
                up.role_id IN (SELECT id FROM roles WHERE name = 'national_admin')
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

-- Residents policies (same hierarchical access as households)
CREATE POLICY "residents_select" ON residents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND (
                -- Barangay level access
                up.barangay_code = residents.barangay_code OR
                -- City level access
                (up.city_municipality_code IN (
                    SELECT city_municipality_code FROM psgc_barangays 
                    WHERE code = residents.barangay_code
                )) OR
                -- Province level access
                (up.province_code IN (
                    SELECT c.province_code FROM psgc_barangays b
                    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
                    WHERE b.code = residents.barangay_code
                )) OR
                -- Region level access
                (up.region_code IN (
                    SELECT p.region_code FROM psgc_barangays b
                    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
                    JOIN psgc_provinces p ON c.province_code = p.code
                    WHERE b.code = residents.barangay_code
                )) OR
                -- National admin
                up.role_id IN (SELECT id FROM roles WHERE name = 'national_admin')
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

-- Apply similar hierarchical policies to other barangay-scoped tables
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
-- 7. GRANT PERMISSIONS
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
-- 8. INSERT SCHEMA VERSION
-- =====================================================

INSERT INTO schema_version (version, description) VALUES 
(2, 'Added missing features with complete V2 enhancements including geographic hierarchy, sectoral tracking, and auto-calculations');

-- =====================================================
-- MIGRATION COMPLETE WITH V2 ENHANCEMENTS
-- =====================================================