-- Fix api_dashboard_stats view to include all dependency ratio fields
-- Run this in Supabase SQL Editor

DROP VIEW IF EXISTS api_dashboard_stats CASCADE;

CREATE OR REPLACE VIEW api_dashboard_stats AS
SELECT 
    r.barangay_code,
    
    -- Basic counts
    COUNT(*) AS total_residents,
    COUNT(*) FILTER (WHERE sex = 'male') AS male_residents,
    COUNT(*) FILTER (WHERE sex = 'female') AS female_residents,
    
    -- Age groups (dependency ratio standard)
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) <= 14) AS young_dependents,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) BETWEEN 15 AND 64) AS working_age,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) >= 65) AS old_dependents,
    
    -- Legacy age groups (for backward compatibility)
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) < 18) AS minors,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) BETWEEN 18 AND 59) AS adults,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate::DATE)) >= 60) AS seniors,
    
    -- Special categories
    COUNT(*) FILTER (WHERE si.is_person_with_disability = true) AS pwd_residents,
    COUNT(*) FILTER (WHERE si.is_solo_parent = true) AS solo_parents,
    COUNT(*) FILTER (WHERE si.is_overseas_filipino_worker = true) AS ofw_residents,
    COUNT(*) FILTER (WHERE si.is_indigenous_people = true) AS indigenous_residents,
    
    -- Voting
    COUNT(*) FILTER (WHERE r.is_voter = true) AS registered_voters,
    COUNT(*) FILTER (WHERE r.is_resident_voter = true) AS resident_voters,
    
    -- Employment
    COUNT(*) FILTER (WHERE si.is_labor_force = true) AS labor_force,
    COUNT(*) FILTER (WHERE si.is_labor_force_employed = true) AS employed,
    COUNT(*) FILTER (WHERE si.is_unemployed = true) AS unemployed,
    COUNT(*) FILTER (WHERE si.is_out_of_school_youth = true) AS out_of_school_youth,
    
    -- Education levels (top 5)
    COUNT(*) FILTER (WHERE education_attainment = 'elementary') AS elementary_education,
    COUNT(*) FILTER (WHERE education_attainment = 'high_school') AS high_school_education,  
    COUNT(*) FILTER (WHERE education_attainment = 'college') AS college_education,
    COUNT(*) FILTER (WHERE education_attainment = 'vocational') AS vocational_education,
    COUNT(*) FILTER (WHERE education_attainment = 'post_graduate') AS post_graduate_education,
    
    -- Civil status
    COUNT(*) FILTER (WHERE civil_status = 'single') AS single_residents,
    COUNT(*) FILTER (WHERE civil_status = 'married') AS married_residents,
    COUNT(*) FILTER (WHERE civil_status = 'widowed') AS widowed_residents,
    COUNT(*) FILTER (WHERE civil_status = 'divorced') AS divorced_residents,
    
    -- Geographic info (from first resident in barangay)
    MAX(ah.region_name) AS region_name,
    MAX(ah.province_name) AS province_name,
    MAX(ah.city_name) AS city_name,
    MAX(ah.barangay_name) AS barangay_name,
    
    -- Household counts (from separate query)
    COALESCE(h.total_households, 0) AS total_households
FROM residents r
LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
LEFT JOIN address_hierarchy ah ON r.barangay_code = ah.barangay_code
LEFT JOIN (
    SELECT 
        barangay_code,
        COUNT(*) AS total_households
    FROM households 
    WHERE is_active = true
    GROUP BY barangay_code
) h ON r.barangay_code = h.barangay_code
WHERE r.is_active = true
GROUP BY r.barangay_code, h.total_households;

-- Grant necessary permissions
GRANT SELECT ON api_dashboard_stats TO authenticated;
GRANT SELECT ON api_dashboard_stats TO anon;