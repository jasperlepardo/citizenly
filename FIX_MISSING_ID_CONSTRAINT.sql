-- Fix missing user_profiles.id foreign key constraint
-- The error shows user_profiles_id_fkey is expected but missing

-- 1. Clean up duplicate barangay_code constraints first
DO $$
BEGIN
    -- Drop the duplicate constraint (keep the newer one)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_barangay'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT fk_user_profiles_barangay;
    END IF;
END $$;

-- 2. Add the missing id constraint that links to auth.users
-- This is the constraint that was causing the error
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Verify all constraints are correct
SELECT 'Missing ID constraint added!' as message;

-- Show updated constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='user_profiles'
ORDER BY tc.constraint_name;