-- Security Issues Fix - Database Audit Remediation
-- Addresses security definer views and missing RLS policies
-- Generated: 2025-01-14

-- =============================================================================
-- PART 1: FIX SECURITY DEFINER VIEWS
-- =============================================================================

-- The audit report identified views with SECURITY DEFINER that should use SECURITY INVOKER
-- This ensures views use the permissions of the querying user, not the view creator

-- Drop and recreate views with SECURITY INVOKER (safer default)
-- Note: If these views don't exist with SECURITY DEFINER, these statements will be ignored

-- 1. household_income_analytics
DROP VIEW IF EXISTS household_income_analytics CASCADE;
CREATE VIEW household_income_analytics 
WITH (security_invoker = true) AS
SELECT
    h.barangay_code,
    bgy.name as barangay_name,
    h.income_class,
    CASE h.income_class
        WHEN 'rich' THEN 'Rich'
        WHEN 'high_income' THEN 'High Income'
        WHEN 'upper_middle_income' THEN 'Upper Middle Income'
        WHEN 'middle_class' THEN 'Middle Class'
        WHEN 'lower_middle_class' THEN 'Lower Middle Class'
        WHEN 'low_income' THEN 'Low Income'
        WHEN 'poor' THEN 'Poor'
    END as income_class_label,
    COUNT(*) as household_count,
    ROUND(AVG(h.monthly_income), 2) as average_income,
    ROUND(MIN(h.monthly_income), 2) as min_income,
    ROUND(MAX(h.monthly_income), 2) as max_income,
    ROUND(
        (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY h.barangay_code)),
        2
    ) as percentage_in_barangay
FROM households h
JOIN psgc_barangays bgy ON h.barangay_code = bgy.code
WHERE h.income_class IS NOT NULL
GROUP BY h.barangay_code, bgy.name, h.income_class
ORDER BY h.barangay_code,
    CASE h.income_class
        WHEN 'rich' THEN 1
        WHEN 'high_income' THEN 2
        WHEN 'upper_middle_income' THEN 3
        WHEN 'middle_class' THEN 4
        WHEN 'lower_middle_class' THEN 5
        WHEN 'low_income' THEN 6
        WHEN 'poor' THEN 7
    END;

-- 2. api_dashboard_stats  
DROP VIEW IF EXISTS api_dashboard_stats CASCADE;
CREATE VIEW api_dashboard_stats 
WITH (security_invoker = true) AS
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
    
    -- Employment statistics
    COUNT(*) FILTER (WHERE r.employment_status = 'employed') AS employed,
    COUNT(*) FILTER (WHERE r.employment_status = 'unemployed') AS unemployed,
    COUNT(*) FILTER (WHERE r.employment_status = 'student') AS students,
    
    -- Education statistics  
    COUNT(*) FILTER (WHERE r.education_attainment = 'elementary') AS elementary_graduates,
    COUNT(*) FILTER (WHERE r.education_attainment = 'high_school') AS high_school_graduates,
    COUNT(*) FILTER (WHERE r.education_attainment = 'college') AS college_graduates,
    
    -- Household statistics
    COUNT(DISTINCT r.household_code) AS total_households

FROM residents r
LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id
GROUP BY r.barangay_code;

-- 3. api_address_search
DROP VIEW IF EXISTS api_address_search CASCADE;
CREATE VIEW api_address_search 
WITH (security_invoker = true) AS
SELECT DISTINCT
    COALESCE(h.house_number, '') || ' ' || 
    COALESCE(s.name, '') || ' ' ||
    COALESCE(sd.name, '') AS full_address,
    h.barangay_code,
    b.name as barangay_name,
    c.name as city_municipality_name,
    p.name as province_name,
    r.name as region_name,
    h.code as household_code,
    h.house_number,
    s.name as street_name,
    sd.name as subdivision_name
FROM households h
LEFT JOIN geo_streets s ON h.street_id = s.id
LEFT JOIN geo_subdivisions sd ON h.subdivision_id = sd.id
JOIN psgc_barangays b ON h.barangay_code = b.code
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON p.region_code = r.code
WHERE h.house_number IS NOT NULL OR s.name IS NOT NULL OR sd.name IS NOT NULL;

-- 4. residents_with_occupation
DROP VIEW IF EXISTS residents_with_occupation CASCADE;
CREATE VIEW residents_with_occupation 
WITH (security_invoker = true) AS
SELECT 
    r.id,
    r.first_name,
    r.middle_name,
    r.last_name,
    r.extension_name,
    r.full_name,
    r.employment_status,
    r.psoc_code,
    r.occupation_title,
    o.occupation_title as occupation_name,
    o.psoc_level as occupation_level,
    o.level_name as occupation_hierarchy,
    r.barangay_code,
    r.household_code,
    r.created_at,
    r.updated_at
FROM residents r
LEFT JOIN psoc_unified_search o ON r.psoc_code = o.psoc_code
WHERE r.psoc_code IS NOT NULL AND r.occupation_title IS NOT NULL;

-- 5. household_search
DROP VIEW IF EXISTS household_search CASCADE;
CREATE VIEW household_search 
WITH (security_invoker = true) AS
SELECT 
    h.code,
    h.name,
    h.house_number,
    h.barangay_code,
    h.household_head_id,
    h.member_count,
    h.income_class,
    h.monthly_income,
    head.full_name as head_full_name,
    s.name as street_name,
    sd.name as subdivision_name,
    b.name as barangay_name,
    c.name as city_municipality_name,
    p.name as province_name,
    r.name as region_name,
    COALESCE(h.house_number, '') || ' ' || 
    COALESCE(s.name, '') || ' ' ||
    COALESCE(sd.name, '') || ', ' ||
    b.name || ', ' ||
    c.name || ', ' ||
    p.name AS full_address
FROM households h
LEFT JOIN residents head ON h.household_head_id = head.id
LEFT JOIN geo_streets s ON h.street_id = s.id
LEFT JOIN geo_subdivisions sd ON h.subdivision_id = sd.id
JOIN psgc_barangays b ON h.barangay_code = b.code
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON p.region_code = r.code;

-- 6. address_hierarchy  
DROP VIEW IF EXISTS address_hierarchy CASCADE;
CREATE VIEW address_hierarchy 
WITH (security_invoker = true) AS
SELECT 
    r.code as region_code,
    r.name as region_name,
    p.code as province_code,
    p.name as province_name,
    c.code as city_municipality_code,
    c.name as city_municipality_name,
    c.type as city_municipality_type,
    b.code as barangay_code,
    b.name as barangay_name,
    -- Full hierarchy strings
    r.name as level_1_region,
    p.name as level_2_province,
    c.name as level_3_city_municipality,
    b.name as level_4_barangay,
    -- Full address format
    b.name || ', ' || c.name || ', ' || p.name || ', ' || r.name as full_address
FROM psgc_regions r
JOIN psgc_provinces p ON r.code = p.region_code
JOIN psgc_cities_municipalities c ON p.code = c.province_code  
JOIN psgc_barangays b ON c.code = b.city_municipality_code
WHERE r.is_active = true 
  AND p.is_active = true
  AND c.is_active = true
  AND b.is_active = true;

-- 7. psoc_occupation_search
DROP VIEW IF EXISTS psoc_occupation_search CASCADE;
CREATE VIEW psoc_occupation_search 
WITH (security_invoker = true) AS
SELECT 
    code,
    title,
    level,
    hierarchy,
    parent_code,
    -- Search-friendly fields
    lower(title) as title_lower,
    array_to_string(string_to_array(lower(title), ' '), ' ') as title_searchable,
    -- Level ordering for search relevance
    CASE level
        WHEN 'major_group' THEN 1
        WHEN 'sub_major_group' THEN 2  
        WHEN 'unit_group' THEN 3
        WHEN 'unit_sub_group' THEN 4
        WHEN 'occupation' THEN 5
    END as level_order,
    -- Hierarchy depth
    array_length(string_to_array(hierarchy, ' > '), 1) as hierarchy_depth
FROM psoc_occupations
WHERE is_active = true
ORDER BY level_order, title;

-- 8. api_residents_with_geography
DROP VIEW IF EXISTS api_residents_with_geography CASCADE; 
CREATE VIEW api_residents_with_geography 
WITH (security_invoker = true) AS
SELECT 
    r.id,
    r.first_name,
    r.middle_name, 
    r.last_name,
    r.extension_name,
    r.full_name,
    r.sex,
    r.birthdate,
    r.civil_status,
    r.citizenship,
    r.education_attainment,
    r.employment_status,
    r.occupation_title,
    r.household_code,
    r.barangay_code,
    -- Geographic information
    b.name as barangay_name,
    c.code as city_municipality_code,
    c.name as city_municipality_name,
    c.type as city_municipality_type,
    p.code as province_code,
    p.name as province_name,
    reg.code as region_code,
    reg.name as region_name,
    -- Full address
    b.name || ', ' || c.name || ', ' || p.name || ', ' || reg.name as full_address
FROM residents r
JOIN psgc_barangays b ON r.barangay_code = b.code
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions reg ON p.region_code = reg.code;

-- 9. psoc_unified_search
DROP VIEW IF EXISTS psoc_unified_search CASCADE;
CREATE VIEW psoc_unified_search 
WITH (security_invoker = true) AS  
SELECT 
    code,
    title,
    level,
    hierarchy,
    parent_code,
    -- Unified search fields
    title || ' ' || hierarchy as search_text,
    lower(title || ' ' || hierarchy) as search_text_lower,
    -- Level priority for search ranking
    CASE level
        WHEN 'occupation' THEN 1      -- Highest priority - specific jobs
        WHEN 'unit_sub_group' THEN 2  -- Sub-specializations
        WHEN 'unit_group' THEN 3      -- Job groups
        WHEN 'sub_major_group' THEN 4 -- Broad categories  
        WHEN 'major_group' THEN 5     -- Lowest priority - general categories
    END as search_priority,
    -- Additional metadata
    is_active,
    created_at,
    updated_at
FROM psoc_occupations
WHERE is_active = true;

-- 10. birth_place_options
DROP VIEW IF EXISTS birth_place_options CASCADE;
CREATE VIEW birth_place_options 
WITH (security_invoker = true) AS
-- Regions
SELECT 
    code as value,
    name as label,
    'region' as level,
    name as full_hierarchy,
    NULL as parent_code,
    1 as sort_order
FROM psgc_regions
WHERE is_active = true
UNION ALL
-- Provinces  
SELECT 
    p.code as value,
    p.name as label,
    'province' as level,
    p.name || ', ' || r.name as full_hierarchy,
    p.region_code as parent_code,
    2 as sort_order
FROM psgc_provinces p
JOIN psgc_regions r ON p.region_code = r.code
WHERE p.is_active = true AND r.is_active = true
UNION ALL
-- Cities/Municipalities
SELECT 
    c.code as value,
    c.name as label,
    'city_municipality' as level,
    c.name || ', ' || p.name || ', ' || r.name as full_hierarchy,
    c.province_code as parent_code,
    3 as sort_order  
FROM psgc_cities_municipalities c
JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON p.region_code = r.code
WHERE c.is_active = true AND p.is_active = true AND r.is_active = true
UNION ALL
-- Barangays
SELECT 
    b.code as value,
    b.name as label, 
    'barangay' as level,
    b.name || ', ' || c.name || ', ' || p.name || ', ' || r.name as full_hierarchy,
    b.city_municipality_code as parent_code,
    4 as sort_order
FROM psgc_barangays b
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
JOIN psgc_provinces p ON c.province_code = p.code  
JOIN psgc_regions r ON p.region_code = r.code
WHERE b.is_active = true AND c.is_active = true AND p.is_active = true AND r.is_active = true
ORDER BY sort_order, label;

-- 11. api_households_with_members
DROP VIEW IF EXISTS api_households_with_members CASCADE;
CREATE VIEW api_households_with_members 
WITH (security_invoker = true) AS
SELECT 
    h.code,
    h.name,
    h.house_number,
    h.barangay_code,
    h.household_head_id,
    h.member_count,
    h.income_class,
    h.monthly_income,
    h.household_type,
    h.tenure_status,
    -- Head information
    head.full_name as head_full_name,
    head.sex as head_sex,
    head.birthdate as head_birthdate,
    head.employment_status as head_employment_status,
    -- Address information
    s.name as street_name,
    sd.name as subdivision_name,
    b.name as barangay_name,
    c.name as city_municipality_name,
    p.name as province_name,
    r.name as region_name,
    -- Member summary
    COUNT(members.id) as actual_member_count,
    COUNT(members.id) FILTER (WHERE members.sex = 'male') as male_members,
    COUNT(members.id) FILTER (WHERE members.sex = 'female') as female_members,
    COUNT(members.id) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, members.birthdate::DATE)) < 18) as minor_members,
    COUNT(members.id) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, members.birthdate::DATE)) >= 18) as adult_members
FROM households h
LEFT JOIN residents head ON h.household_head_id = head.id
LEFT JOIN residents members ON h.code = members.household_code  
LEFT JOIN geo_streets s ON h.street_id = s.id
LEFT JOIN geo_subdivisions sd ON h.subdivision_id = sd.id
JOIN psgc_barangays b ON h.barangay_code = b.code
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON p.region_code = r.code
GROUP BY h.code, h.name, h.house_number, h.barangay_code, h.household_head_id, 
         h.member_count, h.income_class, h.monthly_income, h.household_type, h.tenure_status,
         head.full_name, head.sex, head.birthdate, head.employment_status,
         s.name, sd.name, b.name, c.name, p.name, r.name;

-- 12. settings_management_summary  
DROP VIEW IF EXISTS settings_management_summary CASCADE;
CREATE VIEW settings_management_summary 
WITH (security_invoker = true) AS
SELECT 
    'users' as category,
    'Total Users' as metric,
    COUNT(*)::text as value,
    'Active user accounts' as description
FROM auth_user_profiles
WHERE is_active = true
UNION ALL
SELECT 
    'users' as category,
    'Verified Users' as metric, 
    COUNT(*)::text as value,
    'Users with confirmed emails' as description
FROM auth_user_profiles  
WHERE email_verified = true
UNION ALL
SELECT 
    'geography' as category,
    'Active Barangays' as metric,
    COUNT(*)::text as value,
    'Barangays with users' as description
FROM (
    SELECT DISTINCT barangay_code 
    FROM auth_user_profiles 
    WHERE barangay_code IS NOT NULL
) as active_barangays
UNION ALL
SELECT 
    'residents' as category,
    'Total Residents' as metric,
    COUNT(*)::text as value, 
    'Registered residents' as description
FROM residents
UNION ALL
SELECT 
    'households' as category,
    'Total Households' as metric,
    COUNT(*)::text as value,
    'Registered households' as description  
FROM households;

-- =============================================================================
-- PART 2: ENABLE ROW LEVEL SECURITY (RLS) ON MISSING TABLES  
-- =============================================================================

-- Enable RLS on tables that were identified as missing it

-- 1. system_schema_versions - System administrative table
ALTER TABLE system_schema_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow superuser/service role to access schema versions
CREATE POLICY "system_schema_versions_admin_only" ON system_schema_versions
    FOR ALL 
    USING (
        -- Only allow if user is authenticated and is admin or service role
        auth.uid() IS NOT NULL AND (
            is_admin() = true OR
            current_setting('role') = 'service_role'
        )
    );

-- 2. user_notifications - User notification queue  
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own notifications
CREATE POLICY "user_notifications_own_only" ON user_notifications
    FOR ALL
    USING (
        -- Users can only see/modify their own notifications
        auth.uid() = user_id
    );

-- Policy: Service role can access all notifications (for processing)
CREATE POLICY "user_notifications_service_access" ON user_notifications  
    FOR ALL
    USING (
        -- Service role needs full access for notification processing
        current_setting('role') = 'service_role'
    );

-- =============================================================================
-- PART 3: ADD PROPER GRANTS FOR VIEWS
-- =============================================================================

-- Grant appropriate permissions for the views we just recreated
-- This ensures they work with the new SECURITY INVOKER setting

-- Grant SELECT to authenticated users for API views
GRANT SELECT ON household_income_analytics TO authenticated;
GRANT SELECT ON api_dashboard_stats TO authenticated; 
GRANT SELECT ON api_address_search TO authenticated;
GRANT SELECT ON residents_with_occupation TO authenticated;
GRANT SELECT ON household_search TO authenticated;
GRANT SELECT ON address_hierarchy TO authenticated;
GRANT SELECT ON psoc_occupation_search TO authenticated;
GRANT SELECT ON api_residents_with_geography TO authenticated;
GRANT SELECT ON psoc_unified_search TO authenticated;
GRANT SELECT ON birth_place_options TO authenticated;
GRANT SELECT ON api_households_with_members TO authenticated;
GRANT SELECT ON settings_management_summary TO authenticated;

-- Grant SELECT to anon for public reference data
GRANT SELECT ON address_hierarchy TO anon;
GRANT SELECT ON psoc_occupation_search TO anon;
GRANT SELECT ON psoc_unified_search TO anon;
GRANT SELECT ON birth_place_options TO anon;

-- =============================================================================
-- PART 4: REFRESH VIEW PERMISSIONS AND DEPENDENCIES
-- =============================================================================

-- Refresh any materialized views that might depend on these
-- (Add specific REFRESH commands here if you have materialized views)

-- Update table statistics for better query performance
ANALYZE households;
ANALYZE residents;
ANALYZE auth_user_profiles;
ANALYZE user_notifications;
ANALYZE system_schema_versions;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- These queries can be run to verify the fixes worked
/*
-- Check that views no longer use SECURITY DEFINER  
SELECT schemaname, viewname, viewowner, definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN (
    'household_income_analytics', 'api_dashboard_stats', 'api_address_search',
    'residents_with_occupation', 'household_search', 'address_hierarchy', 
    'psoc_occupation_search', 'api_residents_with_geography', 'psoc_unified_search',
    'birth_place_options', 'api_households_with_members', 'settings_management_summary'
);

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('system_schema_versions', 'user_notifications')
AND rowsecurity = true;

-- Check RLS policies exist
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('system_schema_versions', 'user_notifications');
*/

COMMIT;