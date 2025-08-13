-- Debug the households API issue
-- Check if the api_households_with_members view exists and what it returns

-- 1. Check if the view exists
SELECT 
    'View exists check' as test_type,
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'api_households_with_members';

-- 2. If view exists, check what it returns for your barangay
SELECT 
    'View data check' as test_type,
    *
FROM api_households_with_members 
WHERE barangay_code = '042114014'
LIMIT 5;

-- 3. Check raw households table data as comparison
SELECT 
    'Raw households table' as test_type,
    h.code,
    h.name,
    h.house_number,
    h.barangay_code,
    h.household_head_id,
    h.created_at,
    gs.name as street_name,
    gsub.name as subdivision_name,
    r.first_name || ' ' || r.last_name as head_resident_name
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
LEFT JOIN residents r ON h.household_head_id = r.id
WHERE h.barangay_code = '042114014';

-- 4. Check user profile data that the API uses
SELECT 
    'User profile data' as test_type,
    id,
    email,
    barangay_code,
    city_municipality_code,
    province_code,
    region_code,
    role
FROM auth_user_profiles 
WHERE barangay_code = '042114014'
LIMIT 3;

-- 5. Check auth_roles table for access level
SELECT 
    'Auth roles check' as test_type,
    role_name,
    access_level
FROM auth_roles;

-- 6. If the view doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'api_households_with_members') THEN
        EXECUTE '
        CREATE OR REPLACE VIEW api_households_with_members AS
        SELECT 
            h.code,
            h.name,
            h.house_number,
            h.barangay_code,
            h.city_municipality_code,
            h.province_code,
            h.region_code,
            h.created_at,
            h.updated_at,
            gs.name as street_name,
            gsub.name as subdivision,
            r.id as head_resident_id,
            r.first_name as head_resident_first_name,
            r.middle_name as head_resident_middle_name,
            r.last_name as head_resident_last_name,
            COALESCE(member_count.count, 0) as member_count
        FROM households h
        LEFT JOIN geo_streets gs ON h.street_id = gs.id
        LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
        LEFT JOIN residents r ON h.household_head_id = r.id
        LEFT JOIN (
            SELECT 
                household_code, 
                COUNT(*) as count 
            FROM residents 
            WHERE is_active = true 
            GROUP BY household_code
        ) member_count ON h.code = member_count.household_code;
        ';
        RAISE NOTICE 'Created api_households_with_members view';
    END IF;
END
$$;