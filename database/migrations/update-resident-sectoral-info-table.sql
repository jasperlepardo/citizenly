-- Migration: Update resident_sectoral_info table structure
-- Remove is_labor_force field and align with provided schema

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS resident_sectoral_info CASCADE;

-- Recreate table with updated schema
CREATE TABLE resident_sectoral_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
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

-- Recreate indexes for the updated table
CREATE INDEX idx_sectoral_resident ON resident_sectoral_info(resident_id);
CREATE INDEX idx_sectoral_employed ON resident_sectoral_info(is_labor_force_employed);
CREATE INDEX idx_sectoral_ofw ON resident_sectoral_info(is_overseas_filipino_worker);
CREATE INDEX idx_sectoral_pwd ON resident_sectoral_info(is_person_with_disability);
CREATE INDEX idx_sectoral_senior ON resident_sectoral_info(is_senior_citizen);
CREATE INDEX idx_sectoral_solo_parent ON resident_sectoral_info(is_solo_parent);
CREATE INDEX idx_sectoral_indigenous ON resident_sectoral_info(is_indigenous_people);
CREATE INDEX idx_sectoral_migrant ON resident_sectoral_info(is_migrant);

-- Recreate RLS policy
CREATE POLICY "Multi-level geographic access for resident_sectoral_info" ON resident_sectoral_info
    FOR ALL USING (
        resident_id IN (
            SELECT r.id
            FROM residents r
            WHERE r.barangay_code = get_user_barangay_code()
               OR get_user_access_level() IN ('admin', 'super_admin')
               OR r.city_municipality_code = get_user_city_municipality_code()
               OR r.province_code = get_user_province_code()
               OR r.region_code = get_user_region_code()
        )
    );

-- Enable RLS
ALTER TABLE resident_sectoral_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_sectoral_info FORCE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON resident_sectoral_info TO authenticated;

-- Update auto-populate function to match new schema
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
        is_labor_force_employed,
        is_unemployed,
        is_senior_citizen,
        is_out_of_school_children,
        is_out_of_school_youth
    ) VALUES (
        NEW.id,
        -- Employment Status: Currently working in any capacity
        is_working,
        
        -- Unemployment Status: Actively seeking work but not employed
        NEW.employment_status IN ('unemployed', 'looking_for_work'),
        
        -- Senior Citizen Status: Age 60+ per RA 9994 Senior Citizens Act
        resident_age >= 60,
        
        -- Out-of-School Children: Ages 5-17, not attending school
        CASE WHEN resident_age BETWEEN 5 AND 17 
             AND NEW.education_attainment NOT IN ('elementary', 'high_school') 
             THEN true ELSE false END,
        
        -- Out-of-School Youth: Ages 18-30, not in school and not employed
        CASE WHEN resident_age BETWEEN 18 AND 30 
             AND NEW.education_attainment NOT IN ('college', 'post_graduate', 'vocational')
             AND NOT is_working
             THEN true ELSE false END
    )
    ON CONFLICT (resident_id)
    DO UPDATE SET
        -- Update all sectoral classifications when resident data changes
        is_labor_force_employed = is_working,
        is_unemployed = NEW.employment_status IN ('unemployed', 'looking_for_work'),
        is_senior_citizen = resident_age >= 60,
        is_out_of_school_children = CASE WHEN resident_age BETWEEN 5 AND 17 
                                         AND NEW.education_attainment NOT IN ('elementary', 'high_school') 
                                         THEN true ELSE false END,
        is_out_of_school_youth = CASE WHEN resident_age BETWEEN 18 AND 30 
                                       AND NEW.education_attainment NOT IN ('college', 'post_graduate', 'vocational')
                                       AND NOT is_working
                                       THEN true ELSE false END,
        -- Reset registered senior citizen if no longer senior
        is_registered_senior_citizen = CASE WHEN resident_age >= 60 
                                            THEN resident_sectoral_info.is_registered_senior_citizen 
                                            ELSE false END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_auto_populate_sectoral_info ON residents;
CREATE TRIGGER trigger_auto_populate_sectoral_info
    AFTER INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_sectoral_info();

-- Add user tracking trigger
CREATE TRIGGER trigger_resident_sectoral_info_user_tracking
    BEFORE INSERT OR UPDATE ON resident_sectoral_info
    FOR EACH ROW
    EXECUTE FUNCTION populate_user_tracking_fields();

-- Add audit trigger
CREATE TRIGGER trigger_audit_resident_sectoral_info
    AFTER INSERT OR UPDATE OR DELETE ON resident_sectoral_info
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Add updated_at trigger
CREATE TRIGGER trigger_update_resident_sectoral_info_updated_at
    BEFORE UPDATE ON resident_sectoral_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add table comment
COMMENT ON TABLE resident_sectoral_info IS 'Sectoral classifications and social program eligibility';