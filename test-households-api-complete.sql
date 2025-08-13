-- Complete test of the households API flow to identify remaining issues

-- 1. Verify the view exists and has data
SELECT 
    'View exists and has data' as test_name,
    COUNT(*) as household_count
FROM api_households_with_members 
WHERE barangay_code = '042114014';

-- 2. Check the user profile structure the API expects
SELECT 
    'User profile for API' as test_name,
    id,
    email,
    barangay_code,
    role_id,
    created_at
FROM auth_user_profiles 
WHERE barangay_code = '042114014'
LIMIT 1;

-- 3. Check if auth_roles table has the required structure
SELECT 
    'Auth roles table check' as test_name,
    id,
    role_name,
    access_level
FROM auth_roles
LIMIT 5;

-- 4. Test the exact query flow the API uses
-- Simulate what happens when API gets user profile by auth.uid()
DO $$
DECLARE
    test_user_id UUID;
    user_profile RECORD;
    role_data RECORD;
BEGIN
    -- Get a test user ID (replace with actual user ID if needed)
    SELECT id INTO test_user_id FROM auth_user_profiles WHERE barangay_code = '042114014' LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Simulate the API user profile lookup
        SELECT 
            barangay_code, 
            city_municipality_code, 
            province_code, 
            region_code, 
            role_id
        INTO user_profile
        FROM auth_user_profiles 
        WHERE id = test_user_id;
        
        RAISE NOTICE 'User profile found: barangay=%, role_id=%', user_profile.barangay_code, user_profile.role_id;
        
        -- Simulate the role lookup
        SELECT access_level INTO role_data
        FROM auth_roles 
        WHERE id = user_profile.role_id;
        
        RAISE NOTICE 'Role data found: access_level=%', role_data.access_level;
        
        -- Test the final query with barangay access level
        IF role_data.access_level = 'barangay' OR role_data.access_level IS NULL THEN
            RAISE NOTICE 'Would query: SELECT * FROM api_households_with_members WHERE barangay_code = %', user_profile.barangay_code;
        END IF;
    ELSE
        RAISE NOTICE 'No user found with barangay_code 042114014';
    END IF;
END
$$;

-- 5. Check if there are any permission/RLS issues with the view
SELECT 
    'Direct view access test' as test_name,
    code,
    barangay_code,
    head_resident,
    member_count
FROM api_households_with_members
LIMIT 3;