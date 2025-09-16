-- Production RLS Validation Script
-- Run this to verify the RLS policy is production ready

-- Test 1: Verify policy exists and is active
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'households';

-- Test 2: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'households';

-- Test 3: Test edge cases (run as different users)
-- These should be tested with actual user sessions:

-- 3a. Test with inactive user
-- Expected: No access
SELECT COUNT(*) as inactive_user_access 
FROM households 
-- (This needs to be run with an inactive user session)

-- 3b. Test with user without profile  
-- Expected: No access
SELECT COUNT(*) as no_profile_access
FROM households
-- (This needs to be run with a user that has no auth_user_profiles record)

-- 3c. Test geographic boundary enforcement
-- Expected: Only see households in user's geographic area
SELECT DISTINCT barangay_code, city_municipality_code, province_code
FROM households
ORDER BY barangay_code
-- (Results should match user's assigned geographic area)

-- Test 4: Performance check
-- Explain plan for typical household queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM households 
WHERE barangay_code = '042114014' 
LIMIT 10;