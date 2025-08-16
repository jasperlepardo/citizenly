-- Security Issues Fix - Database Audit Remediation (Corrected)
-- Addresses security definer views and missing RLS policies
-- Generated: 2025-01-15

-- =============================================================================
-- PART 1: FIX SECURITY DEFINER VIEWS
-- =============================================================================

-- The audit report identified views with SECURITY DEFINER that should use SECURITY INVOKER
-- This ensures views use the permissions of the querying user, not the view creator

-- Drop and recreate views with SECURITY INVOKER (safer default)
-- Only fixing views that actually exist in the schema

-- 1. psoc_occupation_search
DROP VIEW IF EXISTS psoc_occupation_search CASCADE;
CREATE VIEW psoc_occupation_search 
WITH (security_invoker = true) AS
SELECT
    usg.code as occupation_code,
    'unit_sub_group' as level_type,
    usg.title as occupation_title,
    usg.title as occupation_description,
    mg.code as major_group_code,
    mg.title as major_group_title,
    smg.code as sub_major_group_code,
    smg.title as sub_major_group_title,
    ming.code as minor_group_code,
    ming.title as minor_group_title,
    ug.code as unit_group_code,
    ug.title as unit_group_title,
    usg.code as unit_sub_group_code,
    usg.title as unit_sub_group_title,
    mg.title || ' > ' || smg.title || ' > ' || ming.title || ' > ' || ug.title || ' > ' || usg.title as full_hierarchy,
    5 as hierarchy_level
FROM psoc_unit_sub_groups usg
JOIN psoc_unit_groups ug ON usg.unit_code = ug.code
JOIN psoc_minor_groups ming ON ug.minor_code = ming.code
JOIN psoc_sub_major_groups smg ON ming.sub_major_code = smg.code
JOIN psoc_major_groups mg ON smg.major_code = mg.code;

-- 2. address_hierarchy  
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

-- 3. household_search
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

-- 4. birth_place_options
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

-- 5. settings_management_summary  
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

-- 6. residents_with_sectoral
DROP VIEW IF EXISTS residents_with_sectoral CASCADE;
CREATE VIEW residents_with_sectoral 
WITH (security_invoker = true) AS
SELECT 
    r.*,
    si.is_person_with_disability,
    si.is_overseas_filipino_worker,
    si.is_senior_citizen,
    si.is_registered_senior_citizen,
    si.is_solo_parent,
    si.is_indigenous_people,
    si.is_migrant,
    si.is_labor_force,
    si.is_labor_force_employed,
    si.is_out_of_school_children,
    si.is_out_of_school_youth,
    si.created_at as sectoral_created_at,
    si.updated_at as sectoral_updated_at
FROM residents r
LEFT JOIN resident_sectoral_info si ON r.id = si.resident_id;

-- 7. household_income_analytics
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
GRANT SELECT ON psoc_occupation_search TO authenticated;
GRANT SELECT ON address_hierarchy TO authenticated;
GRANT SELECT ON household_search TO authenticated;
GRANT SELECT ON birth_place_options TO authenticated;
GRANT SELECT ON settings_management_summary TO authenticated;
GRANT SELECT ON residents_with_sectoral TO authenticated;
GRANT SELECT ON household_income_analytics TO authenticated;

-- Grant SELECT to anon for public reference data
GRANT SELECT ON address_hierarchy TO anon;
GRANT SELECT ON psoc_occupation_search TO anon;
GRANT SELECT ON birth_place_options TO anon;

-- =============================================================================
-- PART 4: REFRESH VIEW PERMISSIONS AND DEPENDENCIES
-- =============================================================================

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
    'psoc_occupation_search', 'address_hierarchy', 'household_search',
    'birth_place_options', 'settings_management_summary', 'residents_with_sectoral',
    'household_income_analytics'
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