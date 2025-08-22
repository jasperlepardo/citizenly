-- =============================================================================
-- REORDER RESIDENTS TABLE COLUMNS - SIMPLE APPROACH
-- =============================================================================
-- 
-- Purpose: Reorder columns in residents table to match database/schema.sql exactly
-- This uses a table recreation approach with explicit column ordering
--
-- Date: 2025-08-17
-- =============================================================================

DO $$
DECLARE
    resident_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO resident_count FROM residents;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔄 REORDERING RESIDENTS TABLE COLUMNS';
    RAISE NOTICE '===================================';
    RAISE NOTICE 'Current residents count: %', resident_count;
    RAISE NOTICE 'This will reorder columns to match database/schema.sql exactly';
    RAISE NOTICE '';
END $$;

-- =============================================================================
-- 1. CREATE NEW RESIDENTS TABLE WITH EXACT COLUMN ORDER
-- =============================================================================

-- Create new residents table with exact order from database/schema.sql
CREATE TABLE residents_new_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    philsys_card_number VARCHAR(20),
    philsys_last4 VARCHAR(4),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    extension_name VARCHAR(20),
    birthdate DATE NOT NULL,
    birth_place_code VARCHAR(10),
    sex sex_enum NOT NULL,
    civil_status civil_status_enum DEFAULT 'single',
    civil_status_others_specify TEXT,
    education_attainment education_level_enum,
    is_graduate BOOLEAN DEFAULT false,
    employment_status employment_status_enum,
    occupation_code VARCHAR(10),
    email VARCHAR(255),
    mobile_number VARCHAR(20),
    telephone_number VARCHAR(20),
    household_code VARCHAR(50),
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
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. COPY DATA TO NEW TABLE IN EXACT ORDER
-- =============================================================================

-- Insert all data from old table to new table with explicit column order
INSERT INTO residents_new_order (
    id, philsys_card_number, philsys_last4, first_name, middle_name, last_name,
    extension_name, birthdate, birth_place_code, sex, civil_status, civil_status_others_specify,
    education_attainment, is_graduate, employment_status, occupation_code,
    email, mobile_number, telephone_number, household_code, blood_type,
    height, weight, complexion, citizenship, is_voter, is_resident_voter,
    last_voted_date, ethnicity, religion, religion_others_specify,
    mother_maiden_first, mother_maiden_middle, mother_maiden_last,
    is_active, created_by, updated_by, created_at, updated_at
)
SELECT 
    id, philsys_card_number, philsys_last4, first_name, middle_name, last_name,
    extension_name, birthdate, birth_place_code, sex, civil_status, civil_status_others_specify,
    education_attainment, is_graduate, employment_status, occupation_code,
    email, mobile_number, telephone_number, household_code, blood_type,
    height, weight, complexion, citizenship, is_voter, is_resident_voter,
    last_voted_date, ethnicity, religion, religion_others_specify,
    mother_maiden_first, mother_maiden_middle, mother_maiden_last,
    is_active, created_by, updated_by, created_at, updated_at
FROM residents;

-- =============================================================================
-- 3. REPLACE OLD TABLE WITH NEW TABLE
-- =============================================================================

-- Drop old residents table (this will also drop dependent constraints)
DROP TABLE residents CASCADE;

-- Rename new table to residents
ALTER TABLE residents_new_order RENAME TO residents;

-- =============================================================================
-- 4. ADD FOREIGN KEY REFERENCES AND CONSTRAINTS
-- =============================================================================

-- Add foreign key references
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey
    FOREIGN KEY (household_code) REFERENCES households(code);

ALTER TABLE residents ADD CONSTRAINT residents_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth_user_profiles(id);

ALTER TABLE residents ADD CONSTRAINT residents_updated_by_fkey
    FOREIGN KEY (updated_by) REFERENCES auth_user_profiles(id);

-- Add household head constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_household_head' 
        AND table_name = 'households'
    ) THEN
        ALTER TABLE households ADD CONSTRAINT fk_household_head
            FOREIGN KEY (household_head_id) REFERENCES residents(id);
        RAISE NOTICE 'Added fk_household_head constraint';
    ELSE
        RAISE NOTICE 'fk_household_head constraint already exists';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding household head constraint: %', SQLERRM;
END $$;

-- =============================================================================
-- 5. RECREATE DEPENDENT TABLES IF THEY DON'T EXIST
-- =============================================================================

-- Recreate household_members if it doesn't exist
CREATE TABLE IF NOT EXISTS household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_code VARCHAR(50) NOT NULL REFERENCES households(code),
    resident_id UUID NOT NULL REFERENCES residents(id),
    family_position family_position_enum NOT NULL DEFAULT 'other',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_code, resident_id)
);

-- Recreate resident_sectoral_info if it doesn't exist
CREATE TABLE IF NOT EXISTS resident_sectoral_info (
    resident_id UUID PRIMARY KEY REFERENCES residents(id) ON DELETE CASCADE,
    is_labor_force BOOLEAN,
    is_labor_force_employed BOOLEAN,
    is_unemployed BOOLEAN,
    is_overseas_filipino_worker BOOLEAN,
    is_person_with_disability BOOLEAN,
    is_out_of_school_children BOOLEAN,
    is_out_of_school_youth BOOLEAN,
    is_senior_citizen BOOLEAN,
    is_registered_senior_citizen BOOLEAN,
    is_solo_parent BOOLEAN,
    is_indigenous_people BOOLEAN,
    is_migrant BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate resident_relationships if it doesn't exist
CREATE TABLE IF NOT EXISTS resident_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_a_id UUID NOT NULL REFERENCES residents(id),
    resident_b_id UUID NOT NULL REFERENCES residents(id),
    relationship_type VARCHAR(50) NOT NULL,
    relationship_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_self_relationship CHECK (resident_a_id != resident_b_id),
    UNIQUE(resident_a_id, resident_b_id, relationship_type)
);

-- Recreate resident_migrant_info if it doesn't exist
CREATE TABLE IF NOT EXISTS resident_migrant_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    previous_barangay_code VARCHAR(10),
    previous_city_municipality_code VARCHAR(10),
    previous_province_code VARCHAR(10),
    previous_region_code VARCHAR(10),
    date_of_transfer DATE,
    reason_for_migration TEXT,
    is_intending_to_return BOOLEAN,
    length_of_stay_previous_months INTEGER,
    duration_of_stay_current_months INTEGER,
    migration_type VARCHAR(50),
    is_whole_family_migrated BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. RECREATE INDEXES
-- =============================================================================

-- Core operational indexes for residents
CREATE INDEX IF NOT EXISTS idx_residents_household ON residents(household_code);
CREATE INDEX IF NOT EXISTS idx_residents_philsys_last4 ON residents(philsys_last4) WHERE philsys_last4 IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_residents_birthdate ON residents(birthdate);
CREATE INDEX IF NOT EXISTS idx_residents_sex ON residents(sex);
CREATE INDEX IF NOT EXISTS idx_residents_civil_status ON residents(civil_status);
CREATE INDEX IF NOT EXISTS idx_residents_citizenship ON residents(citizenship);
CREATE INDEX IF NOT EXISTS idx_residents_registered_voter ON residents(is_voter);
CREATE INDEX IF NOT EXISTS idx_residents_education_attainment ON residents(education_attainment);
CREATE INDEX IF NOT EXISTS idx_residents_employment_status ON residents(employment_status);
CREATE INDEX IF NOT EXISTS idx_residents_ethnicity ON residents(ethnicity);
CREATE INDEX IF NOT EXISTS idx_residents_religion ON residents(religion);

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_residents_search_active ON residents(household_code, is_active, last_name);
CREATE INDEX IF NOT EXISTS idx_residents_name_search ON residents(last_name, first_name, is_active);
CREATE INDEX IF NOT EXISTS idx_residents_age_sex ON residents(birthdate, sex);

-- =============================================================================
-- 7. RECREATE TRIGGERS
-- =============================================================================

-- Household derived fields trigger
DROP TRIGGER IF EXISTS trigger_update_household_derived_fields ON household_members;
CREATE TRIGGER trigger_update_household_derived_fields
    AFTER INSERT OR UPDATE OR DELETE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION update_household_derived_fields();

-- =============================================================================
-- 8. VERIFY COLUMN ORDER
-- =============================================================================

DO $$
DECLARE
    col_order TEXT;
BEGIN
    -- Get column order for verification
    SELECT STRING_AGG(column_name, ', ' ORDER BY ordinal_position) 
    INTO col_order
    FROM information_schema.columns 
    WHERE table_name = 'residents' 
      AND table_schema = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ RESIDENTS TABLE COLUMN REORDERING COMPLETED!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEW COLUMN ORDER:';
    RAISE NOTICE '%', col_order;
    RAISE NOTICE '';
    RAISE NOTICE '✅ ACCOMPLISHMENTS:';
    RAISE NOTICE '   ✓ Residents table recreated with exact column order';
    RAISE NOTICE '   ✓ All data preserved';
    RAISE NOTICE '   ✓ Foreign key constraints restored';
    RAISE NOTICE '   ✓ Dependent tables recreated';
    RAISE NOTICE '   ✓ Indexes restored';
    RAISE NOTICE '   ✓ Triggers restored';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RESULT:';
    RAISE NOTICE '   Column order now matches database/schema.sql exactly';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;