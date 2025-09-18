-- Debug: Check what policies exist on all tables
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    cmd
FROM pg_policies 
ORDER BY tablename, policyname;

-- Check if our RLS functions exist
SELECT proname, prorettype::regtype 
FROM pg_proc 
WHERE proname IN ('user_barangay_code', 'user_access_level', 'is_super_admin');