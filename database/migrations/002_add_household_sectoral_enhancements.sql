-- =====================================================
-- HOUSEHOLD AND SECTORAL INFORMATION ENHANCEMENTS
-- Migration 002: Add comprehensive household fields and sectoral information
-- =====================================================

-- =====================================================
-- 1. NEW ENUM TYPES FOR HOUSEHOLD CLASSIFICATIONS
-- =====================================================

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

-- =====================================================
-- 2. SECTORAL INFORMATION TABLE
-- =====================================================

CREATE TABLE sectoral_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    
    -- Labor Force Status (automatically determined from occupation)
    is_labor_force BOOLEAN DEFAULT false,
    is_employed BOOLEAN DEFAULT false,
    is_unemployed BOOLEAN DEFAULT false,
    
    -- Special Populations
    is_ofw BOOLEAN DEFAULT false,                    -- Overseas Filipino Worker
    is_person_with_disability BOOLEAN DEFAULT false, -- PWD
    is_out_of_school_children BOOLEAN DEFAULT false, -- Out of School Children
    is_out_of_school_youth BOOLEAN DEFAULT false,    -- Out of School Youth
    is_senior_citizen BOOLEAN DEFAULT false,         -- Senior Citizen (60+)
    is_registered_senior_citizen BOOLEAN DEFAULT false, -- Registered SC
    is_solo_parent BOOLEAN DEFAULT false,            -- Solo Parent
    is_indigenous_people BOOLEAN DEFAULT false,      -- Indigenous People
    is_migrant BOOLEAN DEFAULT false,                -- Migrant
    
    -- Additional sectoral information
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per resident
    UNIQUE(resident_id)
);

-- =====================================================
-- 3. EXPAND HOUSEHOLDS TABLE
-- =====================================================

-- Add new columns to households table
ALTER TABLE households ADD COLUMN household_type household_type_enum;
ALTER TABLE households ADD COLUMN tenure_status tenure_status_enum;
ALTER TABLE households ADD COLUMN tenure_others_specify TEXT; -- For "others" specification
ALTER TABLE households ADD COLUMN household_unit household_unit_enum;

-- Household Profile Information
ALTER TABLE households ADD COLUMN no_of_families INTEGER DEFAULT 1;
ALTER TABLE households ADD COLUMN no_of_members INTEGER DEFAULT 0; -- Will be auto-calculated
ALTER TABLE households ADD COLUMN no_of_migrants INTEGER DEFAULT 0; -- Will be auto-calculated

-- Financial Information (calculated from residents' income)
ALTER TABLE households ADD COLUMN monthly_income DECIMAL(12,2) DEFAULT 0.00;

-- Household Name (derived from head's last name)
ALTER TABLE households ADD COLUMN household_name VARCHAR(100);

-- Street Name and House Number (from existing address structure)
ALTER TABLE households ADD COLUMN street_name VARCHAR(200);
ALTER TABLE households ADD COLUMN house_number VARCHAR(50);
ALTER TABLE households ADD COLUMN subdivision VARCHAR(100);

-- =====================================================
-- 4. UPDATE HOUSEHOLD_MEMBERS TABLE
-- =====================================================

-- Add family position to household members
ALTER TABLE household_members ADD COLUMN family_position family_position_enum;

-- Update the existing relationship_to_head to work with new enum
-- (We'll keep both for transition period)
ALTER TABLE household_members ADD COLUMN position_notes TEXT;

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Sectoral information indexes
CREATE INDEX idx_sectoral_resident ON sectoral_information(resident_id);
CREATE INDEX idx_sectoral_labor_force ON sectoral_information(is_labor_force);
CREATE INDEX idx_sectoral_employed ON sectoral_information(is_employed);
CREATE INDEX idx_sectoral_ofw ON sectoral_information(is_ofw);
CREATE INDEX idx_sectoral_pwd ON sectoral_information(is_person_with_disability);
CREATE INDEX idx_sectoral_senior ON sectoral_information(is_senior_citizen);
CREATE INDEX idx_sectoral_solo_parent ON sectoral_information(is_solo_parent);
CREATE INDEX idx_sectoral_indigenous ON sectoral_information(is_indigenous_people);
CREATE INDEX idx_sectoral_migrant ON sectoral_information(is_migrant);

-- Household classification indexes
CREATE INDEX idx_households_type ON households(household_type);
CREATE INDEX idx_households_tenure ON households(tenure_status);
CREATE INDEX idx_households_unit ON households(household_unit);
CREATE INDEX idx_households_no_members ON households(no_of_members);
CREATE INDEX idx_households_monthly_income ON households(monthly_income);

-- Family position indexes
CREATE INDEX idx_household_members_position ON household_members(family_position);

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS FOR AUTO-CALCULATION
-- =====================================================

-- Function to update household member counts and derived fields
CREATE OR REPLACE FUNCTION update_household_derived_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the household with calculated values
    UPDATE households 
    SET 
        no_of_members = (
            SELECT COUNT(*) 
            FROM household_members 
            WHERE household_id = COALESCE(NEW.household_id, OLD.household_id) 
            AND is_active = true
        ),
        no_of_migrants = (
            SELECT COUNT(*) 
            FROM household_members hm
            JOIN sectoral_information si ON hm.resident_id = si.resident_id
            WHERE hm.household_id = COALESCE(NEW.household_id, OLD.household_id) 
            AND hm.is_active = true 
            AND si.is_migrant = true
        ),
        monthly_income = (
            SELECT COALESCE(SUM(r.monthly_income), 0.00)
            FROM household_members hm
            JOIN residents r ON hm.resident_id = r.id
            WHERE hm.household_id = COALESCE(NEW.household_id, OLD.household_id) 
            AND hm.is_active = true
        ),
        household_name = (
            SELECT r.last_name 
            FROM residents r 
            WHERE r.id = (
                SELECT household_head_id 
                FROM households 
                WHERE id = COALESCE(NEW.household_id, OLD.household_id)
            )
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.household_id, OLD.household_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Update existing trigger or create new one
DROP TRIGGER IF EXISTS trigger_update_household_size ON household_members;
CREATE TRIGGER trigger_update_household_derived_fields
    AFTER INSERT OR UPDATE OR DELETE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION update_household_derived_fields();

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
    INSERT INTO sectoral_information (
        resident_id,
        is_labor_force,
        is_employed,
        is_unemployed,
        is_senior_citizen
    ) VALUES (
        NEW.id,
        CASE WHEN NEW.employment_status IN ('employed', 'self_employed', 'unemployed', 'looking_for_work', 'underemployed') THEN true ELSE false END,
        is_working,
        NEW.employment_status IN ('unemployed', 'looking_for_work'),
        resident_age >= 60
    )
    ON CONFLICT (resident_id) 
    DO UPDATE SET
        is_labor_force = CASE WHEN NEW.employment_status IN ('employed', 'self_employed', 'unemployed', 'looking_for_work', 'underemployed') THEN true ELSE false END,
        is_employed = is_working,
        is_unemployed = NEW.employment_status IN ('unemployed', 'looking_for_work'),
        is_senior_citizen = resident_age >= 60,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate sectoral information
CREATE TRIGGER trigger_auto_populate_sectoral_info
    AFTER INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_sectoral_info();

-- Function to update sectoral information when resident changes
CREATE OR REPLACE FUNCTION update_sectoral_derived_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Update household counts when sectoral info changes
    PERFORM update_household_derived_fields() FROM household_members 
    WHERE resident_id = NEW.resident_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sectoral information updates
CREATE TRIGGER trigger_update_sectoral_derived_fields
    AFTER UPDATE ON sectoral_information
    FOR EACH ROW
    EXECUTE FUNCTION update_sectoral_derived_fields();

-- =====================================================
-- 7. ADD MONTHLY_INCOME TO RESIDENTS TABLE
-- =====================================================

-- Add monthly income field to residents table for household calculation
ALTER TABLE residents ADD COLUMN monthly_income DECIMAL(10,2) DEFAULT 0.00;
CREATE INDEX idx_residents_monthly_income ON residents(monthly_income);

-- =====================================================
-- 8. UPDATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new sectoral_information table
ALTER TABLE sectoral_information ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for sectoral information
CREATE POLICY "Barangay access for sectoral_information" ON sectoral_information
    FOR ALL USING (
        resident_id IN (
            SELECT r.id 
            FROM residents r
            JOIN barangay_accounts ba ON r.barangay_code = ba.barangay_code 
            WHERE ba.user_id = auth.uid()
        )
    );

-- =====================================================
-- 9. AUDIT TRIGGERS FOR NEW TABLES
-- =====================================================

-- Add audit trigger for sectoral_information
CREATE TRIGGER audit_sectoral_information
    AFTER INSERT OR UPDATE OR DELETE ON sectoral_information
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Add updated_at trigger for sectoral_information
CREATE TRIGGER update_sectoral_information_updated_at
    BEFORE UPDATE ON sectoral_information
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. VIEWS FOR UI OPTIMIZATION
-- =====================================================

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
    si.notes as sectoral_notes
FROM residents r
LEFT JOIN sectoral_information si ON r.id = si.resident_id;

-- Enhanced households view with complete information
CREATE VIEW households_complete AS
SELECT 
    h.*,
    r.first_name || ' ' || r.last_name as head_full_name,
    addr.full_address,
    -- Address components
    reg.name as region_name,
    prov.name as province_name,
    city.name as city_municipality_name,
    bgy.name as barangay_name
FROM households h
LEFT JOIN residents r ON h.household_head_id = r.id
LEFT JOIN addresses addr ON h.address_id = addr.id
LEFT JOIN psgc_barangays bgy ON h.barangay_code = bgy.code
LEFT JOIN psgc_cities_municipalities city ON bgy.city_municipality_code = city.code
LEFT JOIN psgc_provinces prov ON city.province_code = prov.code
LEFT JOIN psgc_regions reg ON prov.region_code = reg.code;

-- =====================================================
-- 11. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE sectoral_information IS 'Sectoral classification and special population indicators for residents';
COMMENT ON COLUMN sectoral_information.is_labor_force IS 'Auto-determined from employment status - part of labor force if employed/unemployed/looking for work';
COMMENT ON COLUMN sectoral_information.is_senior_citizen IS 'Auto-determined from age - 60 years and above';
COMMENT ON COLUMN sectoral_information.is_registered_senior_citizen IS 'Manual field - whether senior citizen is officially registered';

COMMENT ON COLUMN households.household_type IS 'Classification of household composition (nuclear, extended, etc.)';
COMMENT ON COLUMN households.tenure_status IS 'Housing tenure arrangement (owner, renter, others)';
COMMENT ON COLUMN households.household_unit IS 'Type of housing unit (single-family house, condo, etc.)';
COMMENT ON COLUMN households.no_of_migrants IS 'Auto-calculated count of migrant household members';
COMMENT ON COLUMN households.monthly_income IS 'Auto-calculated sum of all household members monthly income';
COMMENT ON COLUMN households.household_name IS 'Auto-derived from household head last name';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================