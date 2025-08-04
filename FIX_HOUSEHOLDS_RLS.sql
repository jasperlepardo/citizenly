-- Fix RLS Policy for households table
-- Run this in your Supabase SQL Editor

-- Check current household policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'households';

-- Check current user_profiles data to understand the issue
SELECT id, barangay_code, is_active, role_id, email, first_name, last_name
FROM user_profiles 
LIMIT 5;

-- Check if roles table exists and has data
SELECT id, name FROM roles LIMIT 10;

-- Drop existing household policy
DROP POLICY IF EXISTS households_barangay_access ON households;
DROP POLICY IF EXISTS households_barangay_policy ON households;
DROP POLICY IF EXISTS "Barangay access for households" ON households;

-- Create a simpler, more permissive policy for testing
CREATE POLICY "Enable all operations for authenticated users in same barangay" ON households
    FOR ALL 
    TO authenticated 
    USING (
        barangay_code IN (
            SELECT up.barangay_code 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
            -- Remove the is_active requirement for now to test
        )
    )
    WITH CHECK (
        barangay_code IN (
            SELECT up.barangay_code 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
            -- Remove the is_active requirement for now to test
        )
    );

-- Verify the new policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'households';

SELECT 'Households RLS policy simplified. Try creating household again.' as message;