-- Diagnose the actual foreign key issue
-- The constraint exists but something is still failing

-- 1. Check ALL constraints on user_profiles (including the id constraint)
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_type
FROM 
    information_schema.table_constraints AS tc 
    LEFT JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.table_name='user_profiles'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 2. Check if the constraint is properly formed by checking auth.users table
SELECT 'Checking auth.users table...' as step;
SELECT count(*) as auth_users_count FROM auth.users;

-- 3. Test if we can manually verify the constraint
SELECT 'Testing constraint validation...' as step;

-- 4. Check what happens when we try to insert a valid user_profile
-- Let's see what user IDs exist in auth.users that we could test with
SELECT 'Sample auth user IDs:' as step;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Clean up the duplicate barangay constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_barangay'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT fk_user_profiles_barangay;
        RAISE NOTICE 'Dropped duplicate fk_user_profiles_barangay constraint';
    END IF;
END $$;