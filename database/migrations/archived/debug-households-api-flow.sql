-- Debug the households API flow to see where it's failing

-- 1. Check if auth_user_profiles.user_id field exists (API looks for this)
SELECT 
    'User profile columns check' as test_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'auth_user_profiles' 
AND column_name IN ('user_id', 'id', 'barangay_code', 'role')
ORDER BY column_name;

-- 2. Check current user profiles and their structure
SELECT 
    'Current user profiles' as test_type,
    id,
    email,
    barangay_code,
    city_municipality_code,
    province_code,
    region_code,
    role,
    created_at
FROM auth_user_profiles 
ORDER BY created_at DESC
LIMIT 3;

-- 3. Check if auth_roles table exists and has access_level
SELECT 
    'Auth roles structure' as test_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'auth_roles'
ORDER BY column_name;

-- 4. Check what roles exist
SELECT 
    'Available roles' as test_type,
    role_name,
    access_level
FROM auth_roles
LIMIT 5;

-- 5. Test the exact query the API uses (assuming barangay access level)
SELECT 
    'API query simulation' as test_type,
    COUNT(*) as household_count
FROM api_households_with_members 
WHERE barangay_code = '042114014';

-- 6. Check what happens without barangay filter (in case access level is different)
SELECT 
    'All households test' as test_type,
    COUNT(*) as total_households,
    COUNT(CASE WHEN barangay_code = '042114014' THEN 1 END) as target_barangay_households
FROM api_households_with_members;