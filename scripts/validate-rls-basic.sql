-- Basic RLS Validation - Run this first
-- Test 1: Verify policy exists and is active
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'households';

-- Test 2: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'households';