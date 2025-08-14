-- Migration: Auto-calculate Out-of-School Children (OSC) and Out-of-School Youth (OSY) flags
-- Description: Implements automatic calculation of OSC and OSY status based on age, education, and employment
-- Date: 2024-12-08

-- ============================================================================
-- FUNCTION: Calculate OSC and OSY status based on resident data
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_osc_osy_status()
RETURNS TRIGGER AS $$
DECLARE
    v_age INTEGER;
    v_education_level education_level_enum;
    v_is_graduate BOOLEAN;
    v_employment_status employment_status_enum;
    v_resident_id UUID;
    v_is_osc BOOLEAN := false;
    v_is_osy BOOLEAN := false;
BEGIN
    -- Determine which resident_id to use based on trigger context
    IF TG_TABLE_NAME = 'residents' THEN
        v_resident_id := NEW.id;
        -- Get the current age
        v_age := EXTRACT(YEAR FROM age(NEW.birthdate));
        v_education_level := NEW.education_attainment;
        v_is_graduate := NEW.is_graduate;
        v_employment_status := NEW.employment_status;
    ELSIF TG_TABLE_NAME = 'resident_sectoral_info' THEN
        v_resident_id := NEW.resident_id;
        -- Get resident data
        SELECT 
            EXTRACT(YEAR FROM age(birthdate)),
            education_attainment,
            is_graduate,
            employment_status
        INTO 
            v_age,
            v_education_level,
            v_is_graduate,
            v_employment_status
        FROM residents 
        WHERE id = v_resident_id;
    END IF;

    -- Calculate Out-of-School Children (OSC)
    -- OSC: Ages 6-14 who are not enrolled in formal education
    IF v_age >= 6 AND v_age <= 14 THEN
        -- Check if child is not in school based on employment status
        -- Assuming 'student' employment_status means enrolled in school
        IF v_employment_status != 'student' OR v_employment_status IS NULL THEN
            v_is_osc := true;
        END IF;
    END IF;

    -- Calculate Out-of-School Youth (OSY)
    -- OSY: Ages 15-24 who are:
    -- 1. Not attending school (not a student)
    -- 2. Haven't completed college or post-secondary course
    -- 3. Not employed
    IF v_age >= 15 AND v_age <= 24 THEN
        -- Check all three conditions for OSY
        IF (v_employment_status != 'student' OR v_employment_status IS NULL) -- Not attending school
           AND (v_education_level IS NULL 
                OR v_education_level IN ('elementary', 'high_school')
                OR (v_education_level IN ('college', 'post_graduate', 'vocational') AND v_is_graduate = false)) -- Haven't completed higher education
           AND (v_employment_status NOT IN ('employed', 'self_employed') OR v_employment_status IS NULL) -- Not employed
        THEN
            v_is_osy := true;
        END IF;
    END IF;

    -- Update or insert sectoral info
    IF TG_TABLE_NAME = 'residents' THEN
        -- When resident is inserted/updated, update their sectoral info
        INSERT INTO resident_sectoral_info (
            resident_id,
            is_out_of_school_children,
            is_out_of_school_youth,
            is_senior_citizen,
            created_at,
            updated_at
        ) VALUES (
            v_resident_id,
            v_is_osc,
            v_is_osy,
            v_age >= 60, -- Auto-calculate senior citizen status
            NOW(),
            NOW()
        )
        ON CONFLICT (resident_id) 
        DO UPDATE SET
            is_out_of_school_children = v_is_osc,
            is_out_of_school_youth = v_is_osy,
            is_senior_citizen = v_age >= 60,
            updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'resident_sectoral_info' THEN
        -- When sectoral info is directly modified, update the calculated fields
        NEW.is_out_of_school_children := v_is_osc;
        NEW.is_out_of_school_youth := v_is_osy;
        NEW.is_senior_citizen := v_age >= 60;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS: Apply auto-calculation to relevant tables
-- ============================================================================

-- Trigger for residents table (when resident data changes)
DROP TRIGGER IF EXISTS trigger_calculate_osc_osy_on_resident ON residents;
CREATE TRIGGER trigger_calculate_osc_osy_on_resident
    AFTER INSERT OR UPDATE OF birthdate, education_attainment, is_graduate, employment_status
    ON residents
    FOR EACH ROW
    EXECUTE FUNCTION calculate_osc_osy_status();

-- Trigger for resident_sectoral_info table (when sectoral info is inserted)
DROP TRIGGER IF EXISTS trigger_calculate_osc_osy_on_sectoral ON resident_sectoral_info;
CREATE TRIGGER trigger_calculate_osc_osy_on_sectoral
    BEFORE INSERT OR UPDATE
    ON resident_sectoral_info
    FOR EACH ROW
    EXECUTE FUNCTION calculate_osc_osy_status();

-- ============================================================================
-- FUNCTION: Batch update existing records
-- ============================================================================

CREATE OR REPLACE FUNCTION update_all_osc_osy_status()
RETURNS void AS $$
DECLARE
    v_updated_count INTEGER := 0;
BEGIN
    -- Update all existing resident_sectoral_info records
    WITH resident_calculations AS (
        SELECT 
            r.id,
            EXTRACT(YEAR FROM age(r.birthdate)) as age,
            r.education_attainment,
            r.is_graduate,
            r.employment_status,
            -- Calculate OSC
            CASE 
                WHEN EXTRACT(YEAR FROM age(r.birthdate)) BETWEEN 6 AND 14
                     AND (r.employment_status != 'student' OR r.employment_status IS NULL)
                THEN true
                ELSE false
            END as calc_is_osc,
            -- Calculate OSY
            CASE 
                WHEN EXTRACT(YEAR FROM age(r.birthdate)) BETWEEN 15 AND 24
                     AND (r.employment_status != 'student' OR r.employment_status IS NULL)
                     AND (r.education_attainment IS NULL 
                          OR r.education_attainment IN ('elementary', 'high_school')
                          OR (r.education_attainment IN ('college', 'post_graduate', 'vocational') 
                              AND r.is_graduate = false))
                     AND (r.employment_status NOT IN ('employed', 'self_employed') 
                          OR r.employment_status IS NULL)
                THEN true
                ELSE false
            END as calc_is_osy,
            -- Calculate Senior Citizen
            CASE 
                WHEN EXTRACT(YEAR FROM age(r.birthdate)) >= 60
                THEN true
                ELSE false
            END as calc_is_senior
        FROM residents r
    )
    UPDATE resident_sectoral_info rsi
    SET 
        is_out_of_school_children = rc.calc_is_osc,
        is_out_of_school_youth = rc.calc_is_osy,
        is_senior_citizen = rc.calc_is_senior,
        updated_at = NOW()
    FROM resident_calculations rc
    WHERE rsi.resident_id = rc.id
        AND (rsi.is_out_of_school_children != rc.calc_is_osc
             OR rsi.is_out_of_school_youth != rc.calc_is_osy
             OR rsi.is_senior_citizen != rc.calc_is_senior);
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    -- Insert sectoral info for residents that don't have it yet
    INSERT INTO resident_sectoral_info (
        resident_id,
        is_out_of_school_children,
        is_out_of_school_youth,
        is_senior_citizen,
        created_at,
        updated_at
    )
    SELECT 
        r.id,
        CASE 
            WHEN EXTRACT(YEAR FROM age(r.birthdate)) BETWEEN 6 AND 14
                 AND (r.employment_status != 'student' OR r.employment_status IS NULL)
            THEN true
            ELSE false
        END,
        CASE 
            WHEN EXTRACT(YEAR FROM age(r.birthdate)) BETWEEN 15 AND 24
                 AND (r.employment_status != 'student' OR r.employment_status IS NULL)
                 AND (r.education_attainment IS NULL 
                      OR r.education_attainment IN ('elementary', 'high_school')
                      OR (r.education_attainment IN ('college', 'post_graduate', 'vocational') 
                          AND r.is_graduate = false))
                 AND (r.employment_status NOT IN ('employed', 'self_employed') 
                      OR r.employment_status IS NULL)
            THEN true
            ELSE false
        END,
        EXTRACT(YEAR FROM age(r.birthdate)) >= 60,
        NOW(),
        NOW()
    FROM residents r
    LEFT JOIN resident_sectoral_info rsi ON r.id = rsi.resident_id
    WHERE rsi.id IS NULL;
    
    RAISE NOTICE 'Updated % existing records and inserted new sectoral info for residents without records', v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS: Document the implementation
-- ============================================================================

COMMENT ON FUNCTION calculate_osc_osy_status() IS 
'Automatically calculates Out-of-School Children (OSC) and Out-of-School Youth (OSY) status based on:
- OSC: Ages 6-14 not enrolled in formal education (not a student)
- OSY: Ages 15-24 who are not attending school, haven''t completed college/post-secondary, and are not employed
- Also auto-calculates senior citizen status (age >= 60)';

COMMENT ON FUNCTION update_all_osc_osy_status() IS 
'Batch function to update all existing resident_sectoral_info records with calculated OSC, OSY, and senior citizen status';

-- ============================================================================
-- EXECUTION: Run the batch update for existing records
-- ============================================================================

-- Execute the batch update to set initial values
SELECT update_all_osc_osy_status();

-- ============================================================================
-- VALIDATION: Create a view to verify the calculations
-- ============================================================================

CREATE OR REPLACE VIEW osc_osy_validation AS
SELECT 
    r.id,
    EXTRACT(YEAR FROM age(r.birthdate)) as age,
    r.employment_status,
    r.education_attainment,
    r.is_graduate,
    rsi.is_out_of_school_children,
    rsi.is_out_of_school_youth,
    rsi.is_senior_citizen,
    CASE 
        WHEN EXTRACT(YEAR FROM age(r.birthdate)) BETWEEN 6 AND 14 THEN 'OSC Age Range'
        WHEN EXTRACT(YEAR FROM age(r.birthdate)) BETWEEN 15 AND 24 THEN 'OSY Age Range'
        WHEN EXTRACT(YEAR FROM age(r.birthdate)) >= 60 THEN 'Senior Citizen'
        ELSE 'Not Applicable'
    END as age_category
FROM residents r
LEFT JOIN resident_sectoral_info rsi ON r.id = rsi.resident_id
WHERE EXTRACT(YEAR FROM age(r.birthdate)) BETWEEN 6 AND 24
   OR EXTRACT(YEAR FROM age(r.birthdate)) >= 60
ORDER BY age;

COMMENT ON VIEW osc_osy_validation IS 
'Validation view to verify OSC, OSY, and senior citizen auto-calculations are working correctly';