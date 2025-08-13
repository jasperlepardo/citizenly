-- =============================================================================
-- DATABASE INSPECTION SCRIPT
-- This script helps you understand what's currently in your database
-- Run these queries in your Supabase SQL editor or psql
-- =============================================================================

-- 1. CHECK ALL TABLES IN YOUR DATABASE
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'auth', 'storage', 'supabase_functions', 'extensions', 'graphql', 'graphql_public', 'net', 'pgbouncer', 'pgsodium', 'realtime', 'supabase_migrations', 'vault')
ORDER BY table_schema, table_name;

-- 2. CHECK RESIDENTS TABLE STRUCTURE
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'residents' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. CHECK FOR ENCRYPTION-RELATED TABLES (SHOULD BE EMPTY AFTER CLEANUP)
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%encryption%' 
   OR table_name LIKE '%key_rotation%'
   AND table_schema = 'public';

-- 4. CHECK FOR ENCRYPTION-RELATED COLUMNS (SHOULD BE EMPTY AFTER CLEANUP)
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name LIKE '%encrypted%' 
   OR column_name LIKE '%_hash'
   OR column_name LIKE '%encryption%'
   AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 5. CHECK ALL VIEWS
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 6. CHECK ALL FUNCTIONS
SELECT 
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 7. CHECK FOR ENCRYPTION-RELATED FUNCTIONS (SHOULD BE EMPTY AFTER CLEANUP)
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%encrypt%' 
   OR routine_name LIKE '%decrypt%'
   OR routine_name LIKE '%hash%'
   AND routine_schema = 'public';

-- 8. CHECK RLS POLICIES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. CHECK INDEXES
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 10. CHECK TRIGGERS
SELECT 
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 11. CHECK SAMPLE DATA IN MAIN TABLES
SELECT 'residents' as table_name, count(*) as row_count FROM residents
UNION ALL
SELECT 'households', count(*) FROM households
UNION ALL
SELECT 'psgc_regions', count(*) FROM psgc_regions
UNION ALL
SELECT 'psgc_provinces', count(*) FROM psgc_provinces
UNION ALL
SELECT 'psgc_cities_municipalities', count(*) FROM psgc_cities_municipalities
UNION ALL
SELECT 'psgc_barangays', count(*) FROM psgc_barangays
UNION ALL
SELECT 'psoc_occupations', count(*) FROM psoc_occupations
UNION ALL
SELECT 'auth_user_profiles', count(*) FROM auth_user_profiles
UNION ALL
SELECT 'auth_roles', count(*) FROM auth_roles;

-- 12. CHECK FOR ORPHANED ENCRYPTION REFERENCES IN COMMENTS
SELECT 
    obj_description(c.oid) as table_comment,
    t.table_name
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
  AND obj_description(c.oid) LIKE '%encrypt%'
ORDER BY t.table_name;