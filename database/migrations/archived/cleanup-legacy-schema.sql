-- =============================================================================
-- CLEANUP LEGACY SCHEMA TABLES
-- =============================================================================
-- Removes unused duplicate tables that cause confusion
-- ONLY RUN THIS AFTER CONFIRMING NO DEPENDENCIES

-- =============================================================================
-- 1. CHECK WHAT'S CURRENTLY BEING USED
-- =============================================================================

-- Check which tables actually have data
SELECT 'auth_roles' as table_name, count(*) as row_count FROM auth_roles
UNION ALL
SELECT 'auth_user_profiles' as table_name, count(*) as row_count FROM auth_user_profiles
UNION ALL  
SELECT 'roles' as table_name, count(*) as row_count FROM public.roles
UNION ALL
SELECT 'user_profiles' as table_name, count(*) as row_count FROM public.user_profiles;

-- Check what the application actually references
SELECT 
    'Current production setup uses:' as status,
    'public.roles and public.user_profiles' as active_tables;

-- =============================================================================
-- 2. REMOVE LEGACY TABLES (ONLY IF EMPTY AND UNUSED)
-- =============================================================================

-- UNCOMMENT THESE LINES ONLY AFTER VERIFYING THEY'RE EMPTY AND UNUSED:

-- DROP TABLE IF EXISTS auth_user_profiles CASCADE;
-- DROP TABLE IF EXISTS auth_roles CASCADE;
-- DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================================================
-- 3. VERIFY FINAL SCHEMA
-- =============================================================================

-- Show the clean final schema
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name IN ('roles', 'user_profiles', 'auth_roles', 'auth_user_profiles')
    AND table_schema = 'public'
ORDER BY table_name;

-- =============================================================================
-- 4. VERIFY APPLICATION REFERENCES
-- =============================================================================

-- The application should ONLY use:
-- ✅ public.roles (for role definitions and permissions)
-- ✅ public.user_profiles (for user data and role assignments)

-- If you see auth_roles or auth_user_profiles in the results above, 
-- they are legacy tables that should be cleaned up.