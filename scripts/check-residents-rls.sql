-- Check residents table RLS status and policies
-- Test 1: Check if RLS is enabled on residents
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'residents';

-- Test 2: Check what policies exist on residents table
SELECT 
    policyname, 
    permissive, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'residents';