-- Migration: Remove redundant is_labor_force column
-- Date: 2025-01-17
-- Reason: is_labor_force is redundant as it can be derived from is_labor_force_employed OR is_unemployed

-- STEP 1: Drop the dependent view first
DROP VIEW IF EXISTS api_dashboard_stats CASCADE;

-- STEP 2: Drop any indexes on this column
DROP INDEX IF EXISTS idx_sectoral_labor_force;

-- STEP 3: Drop the column from resident_sectoral_info table
ALTER TABLE resident_sectoral_info 
DROP COLUMN IF EXISTS is_labor_force;

-- STEP 4: Recreate the api_dashboard_stats view without is_labor_force
-- Replace is_labor_force references with (is_labor_force_employed OR is_unemployed)
CREATE OR REPLACE VIEW api_dashboard_stats AS
SELECT
    -- Total counts
    COUNT(DISTINCT r.id) AS total_residents,
    COUNT(DISTINCT h.id) AS total_households,
    
    -- Demographics
    COUNT(*) FILTER (WHERE r.sex = 'male') AS male_count,
    COUNT(*) FILTER (WHERE r.sex = 'female') AS female_count,
    
    -- Age groups
    COUNT(*) FILTER (WHERE DATE_PART('year', AGE(r.birthdate)) < 18) AS children_count,
    COUNT(*) FILTER (WHERE DATE_PART('year', AGE(r.birthdate)) BETWEEN 18 AND 59) AS adults_count,
    COUNT(*) FILTER (WHERE DATE_PART('year', AGE(r.birthdate)) >= 60) AS seniors_count,
    
    -- Sectoral information (using OR condition for labor force)
    COUNT(*) FILTER (WHERE si.is_labor_force_employed = true OR si.is_unemployed = true) AS labor_force,
    COUNT(*) FILTER (WHERE si.is_labor_force_employed = true) AS employed,
    COUNT(*) FILTER (WHERE si.is_unemployed = true) AS unemployed,
    COUNT(*) FILTER (WHERE si.is_out_of_school_youth = true) AS out_of_school_youth,
    COUNT(*) FILTER (WHERE si.is_solo_parent = true) AS solo_parents,
    COUNT(*) FILTER (WHERE si.is_indigenous_people = true) AS indigenous_residents,
    COUNT(*) FILTER (WHERE si.is_person_with_disability = true) AS pwd_count
FROM
    residents r
    LEFT JOIN household_members hm ON r.id = hm.resident_id
    LEFT JOIN households h ON hm.household_code = h.household_code
    LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
WHERE
    r.is_active = true;

-- STEP 5: Update the trigger function to remove is_labor_force calculations
-- Note: You'll need to update the update_resident_sectoral_info() function separately
-- Remove the line: is_labor_force = CASE WHEN NEW.employment_status IN (...) THEN true ELSE false END

-- STEP 6: Add comment explaining the change
COMMENT ON TABLE resident_sectoral_info IS 'Sectoral information for residents. Note: is_labor_force column removed as redundant (derive from is_labor_force_employed OR is_unemployed)';

-- IMPORTANT: Test this migration in a development environment first!