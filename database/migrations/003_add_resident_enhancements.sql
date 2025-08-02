-- =====================================================
-- RESIDENT ENHANCEMENTS MIGRATION
-- Migration 003: Add missing resident fields and migrant tracking
-- =====================================================

-- =====================================================
-- 1. UPDATE RELIGION ENUM WITH COMPLETE OPTIONS
-- =====================================================

-- First, create a new religion enum with all specified options
CREATE TYPE religion_enum_new AS ENUM (
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

-- Update the residents table to use the new enum
ALTER TABLE residents 
    ALTER COLUMN religion DROP DEFAULT,
    ALTER COLUMN religion TYPE religion_enum_new USING religion::text::religion_enum_new,
    ALTER COLUMN religion SET DEFAULT 'prefer_not_to_say';

-- Drop the old enum
DROP TYPE religion_enum;

-- Rename the new enum
ALTER TYPE religion_enum_new RENAME TO religion_enum;

-- =====================================================
-- 2. ADD MISSING FIELDS TO RESIDENTS TABLE
-- =====================================================

-- Personal Information additions
ALTER TABLE residents ADD COLUMN birthplace TEXT;
ALTER TABLE residents ADD COLUMN salary DECIMAL(12,2) DEFAULT 0.00; -- Replace monthly_income
ALTER TABLE residents ADD COLUMN religion_others_specify TEXT; -- For "Others" religion option

-- Physical characteristics (move from future additions to current)
ALTER TABLE residents ALTER COLUMN height_m TYPE DECIMAL(4,2); -- Already exists, just ensure precision
ALTER TABLE residents ALTER COLUMN weight_kg TYPE DECIMAL(5,2); -- Already exists, just ensure precision
-- complexion already exists as TEXT

-- Rename monthly_income to salary for consistency
ALTER TABLE residents RENAME COLUMN monthly_income TO salary;

-- =====================================================
-- 3. MIGRANT INFORMATION TABLE
-- =====================================================

CREATE TABLE migrant_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    
    -- Previous Residence Information
    previous_region_code VARCHAR(10) REFERENCES psgc_regions(code),
    previous_province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    previous_city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    previous_barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    previous_street_name VARCHAR(200),
    previous_house_number VARCHAR(50),
    previous_subdivision VARCHAR(100),
    previous_zip_code VARCHAR(10),
    previous_complete_address TEXT, -- For non-PSGC addresses
    
    -- Migration Details
    length_of_stay_previous_months INTEGER, -- Length of stay in previous residence (in months)
    reason_for_leaving TEXT, -- Reason for leaving previous residence
    date_of_transfer DATE, -- Date of transfer to current barangay
    reason_for_transferring TEXT, -- Reason for transferring to this barangay
    duration_of_stay_current_months INTEGER, -- Duration of stay in current barangay (in months)
    
    -- Return Intention
    intention_to_return BOOLEAN, -- true = Yes, false = No, null = undecided
    intention_notes TEXT, -- Additional notes about return intention
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per resident
    UNIQUE(resident_id)
);

-- =====================================================
-- 4. UPDATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Update the household income calculation to use salary instead of monthly_income
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
            SELECT COALESCE(SUM(r.salary), 0.00)
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

-- Function to auto-populate migrant status and create migrant_information record
CREATE OR REPLACE FUNCTION handle_migrant_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update sectoral information if migrant flag changes
    UPDATE sectoral_information 
    SET is_migrant = COALESCE(
        (SELECT COUNT(*) > 0 FROM migrant_information WHERE resident_id = NEW.id),
        false
    ),
    updated_at = NOW()
    WHERE resident_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update migrant status when migrant_information changes
CREATE TRIGGER trigger_handle_migrant_status
    AFTER INSERT OR UPDATE OR DELETE ON migrant_information
    FOR EACH ROW
    EXECUTE FUNCTION handle_migrant_status();

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Resident additional field indexes
CREATE INDEX idx_residents_birthplace ON residents(birthplace);
CREATE INDEX idx_residents_salary ON residents(salary);
CREATE INDEX idx_residents_religion_others ON residents(religion_others_specify);

-- Migrant information indexes
CREATE INDEX idx_migrant_resident ON migrant_information(resident_id);
CREATE INDEX idx_migrant_previous_region ON migrant_information(previous_region_code);
CREATE INDEX idx_migrant_previous_province ON migrant_information(previous_province_code);
CREATE INDEX idx_migrant_previous_city ON migrant_information(previous_city_municipality_code);
CREATE INDEX idx_migrant_previous_barangay ON migrant_information(previous_barangay_code);
CREATE INDEX idx_migrant_date_transfer ON migrant_information(date_of_transfer);
CREATE INDEX idx_migrant_intention_return ON migrant_information(intention_to_return);
CREATE INDEX idx_migrant_length_stay_previous ON migrant_information(length_of_stay_previous_months);
CREATE INDEX idx_migrant_duration_current ON migrant_information(duration_of_stay_current_months);

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on migrant_information table
ALTER TABLE migrant_information ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for migrant information
CREATE POLICY "Barangay access for migrant_information" ON migrant_information
    FOR ALL USING (
        resident_id IN (
            SELECT r.id 
            FROM residents r
            JOIN barangay_accounts ba ON r.barangay_code = ba.barangay_code 
            WHERE ba.user_id = auth.uid()
        )
    );

-- =====================================================
-- 7. AUDIT TRIGGERS
-- =====================================================

-- Add audit trigger for migrant_information
CREATE TRIGGER audit_migrant_information
    AFTER INSERT OR UPDATE OR DELETE ON migrant_information
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Add updated_at trigger for migrant_information
CREATE TRIGGER update_migrant_information_updated_at
    BEFORE UPDATE ON migrant_information
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ENHANCED VIEWS
-- =====================================================

-- Update residents_with_sectoral view to include migrant information
DROP VIEW IF EXISTS residents_with_sectoral;
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
LEFT JOIN sectoral_information si ON r.id = si.resident_id
LEFT JOIN migrant_information mi ON r.id = mi.resident_id;

-- Create a view for complete migrant information with address details
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
FROM migrant_information mi
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

-- =====================================================
-- 9. VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate migrant information consistency
CREATE OR REPLACE FUNCTION validate_migrant_information()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure date_of_transfer is not in the future
    IF NEW.date_of_transfer > CURRENT_DATE THEN
        RAISE EXCEPTION 'Date of transfer cannot be in the future';
    END IF;
    
    -- Ensure length of stay is positive
    IF NEW.length_of_stay_previous_months IS NOT NULL AND NEW.length_of_stay_previous_months < 0 THEN
        RAISE EXCEPTION 'Length of stay in previous residence must be positive';
    END IF;
    
    -- Ensure duration of stay in current barangay is positive
    IF NEW.duration_of_stay_current_months IS NOT NULL AND NEW.duration_of_stay_current_months < 0 THEN
        RAISE EXCEPTION 'Duration of stay in current barangay must be positive';
    END IF;
    
    -- If date_of_transfer is provided, calculate duration automatically
    IF NEW.date_of_transfer IS NOT NULL THEN
        NEW.duration_of_stay_current_months := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.date_of_transfer)) * 12 + 
                                               EXTRACT(MONTH FROM AGE(CURRENT_DATE, NEW.date_of_transfer));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for migrant information validation
CREATE TRIGGER trigger_validate_migrant_information
    BEFORE INSERT OR UPDATE ON migrant_information
    FOR EACH ROW
    EXECUTE FUNCTION validate_migrant_information();

-- =====================================================
-- 10. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE migrant_information IS 'Detailed migration history and information for residents flagged as migrants';
COMMENT ON COLUMN migrant_information.length_of_stay_previous_months IS 'Duration in previous residence in months';
COMMENT ON COLUMN migrant_information.duration_of_stay_current_months IS 'Auto-calculated duration in current barangay based on date_of_transfer';
COMMENT ON COLUMN migrant_information.intention_to_return IS 'true=Yes, false=No, null=Undecided';

COMMENT ON COLUMN residents.birthplace IS 'Place of birth (free text)';
COMMENT ON COLUMN residents.salary IS 'Monthly salary/income in PHP';
COMMENT ON COLUMN residents.religion_others_specify IS 'Specification when religion is "others"';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================