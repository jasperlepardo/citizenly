-- Step 2: Check if your user profile exists and has the right structure

SELECT 
    id,
    email,
    barangay_code,
    role_id
FROM auth_user_profiles 
WHERE barangay_code = '042114014'
LIMIT 1;