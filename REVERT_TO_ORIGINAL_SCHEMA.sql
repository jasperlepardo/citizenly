-- REVERT TO ORIGINAL SCHEMA
-- This will remove all modifications and restore the original schema.sql structure
-- ⚠️ WARNING: This will break the current signup flow until code is updated

-- =====================================================
-- 1. DROP ADDED TABLES
-- =====================================================

-- Drop barangay_accounts table (not in original schema)
DROP TABLE IF EXISTS barangay_accounts CASCADE;

-- =====================================================
-- 2. REVERT USER_PROFILES TO ORIGINAL STRUCTURE
-- =====================================================

-- Drop added columns
ALTER TABLE user_profiles DROP COLUMN IF EXISTS mobile_number;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS status;

-- Restore role_id as NOT NULL (original constraint)
-- First, we need to set a default value for existing records
DO $$
DECLARE
    resident_role_id UUID;
BEGIN
    -- Get resident role ID
    SELECT id INTO resident_role_id FROM roles WHERE name = 'resident' LIMIT 1;
    
    IF resident_role_id IS NOT NULL THEN
        -- Update any NULL role_id values to resident
        UPDATE user_profiles SET role_id = resident_role_id WHERE role_id IS NULL;
        
        -- Make role_id NOT NULL again
        ALTER TABLE user_profiles ALTER COLUMN role_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'No resident role found - keeping role_id nullable';
    END IF;
END $$;

-- =====================================================
-- 3. CLEAN UP RLS POLICIES
-- =====================================================

-- Remove signup-specific policies (keep only original ones)
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;

-- Keep only the original policy from schema.sql
-- (user_profiles_own_policy should already exist)

-- =====================================================
-- 4. CLEAN UP DUPLICATE CONSTRAINTS
-- =====================================================

-- Remove duplicate barangay constraints
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_barangay'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT fk_user_profiles_barangay;
    END IF;
END $$;

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Show final user_profiles structure (should match original)
SELECT 'REVERTED user_profiles structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Verify barangay_accounts is gone
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'barangay_accounts')
        THEN 'ERROR: barangay_accounts still exists!'
        ELSE 'SUCCESS: barangay_accounts removed'
    END as barangay_accounts_status;

-- Show remaining foreign key constraints
SELECT 'Remaining foreign key constraints:' as info;
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

SELECT 'Schema reverted to original structure!' as status;