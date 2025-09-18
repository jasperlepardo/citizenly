-- CRITICAL SECURITY FIX: Remove insecure residents policies
-- These policies allow unrestricted access which bypasses geographic security

-- Remove the insecure "allow all" policies
DROP POLICY IF EXISTS "policy_residents_select" ON residents;
DROP POLICY IF EXISTS "policy_residents_insert" ON residents;  
DROP POLICY IF EXISTS "policy_residents_update" ON residents;
DROP POLICY IF EXISTS "policy_residents_delete" ON residents;

-- Keep only: "Residents geographic access via households" (the secure one)

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'residents';