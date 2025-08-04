-- Test Auto-Admin Assignment Function
-- This script tests the auto admin assignment functionality

-- Test 1: Check if function exists
SELECT proname, pronamespace::regnamespace as schema 
FROM pg_proc 
WHERE proname = 'assign_user_role_for_barangay';

-- Test 2: Check available roles
SELECT id, name, description FROM roles ORDER BY name;

-- Test 3: Test function with a mock barangay (should return admin role since no admin exists)
SELECT assign_user_role_for_barangay(
    '00000000-0000-0000-0000-000000000001'::UUID, 
    'TEST001'
) as assigned_role_id;

-- Test 4: Get role name for the returned ID
SELECT r.name as role_name, r.description 
FROM roles r 
WHERE r.id = (
    SELECT assign_user_role_for_barangay(
        '00000000-0000-0000-0000-000000000001'::UUID, 
        'TEST001'
    )
);

-- Test 5: Check if any existing admins exist for test barangay
SELECT 'Existing admins for TEST001:' as info;
SELECT up.id, up.first_name, up.last_name, r.name as role_name
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE up.barangay_code = 'TEST001' 
AND r.name = 'barangay_admin'
AND up.is_active = true;

SELECT 'Auto-admin assignment function test complete!' as status;