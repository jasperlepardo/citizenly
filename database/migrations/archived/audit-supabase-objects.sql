-- =============================================================================
-- SUPABASE OBJECTS AUDIT
-- Check what tables, functions, and views you currently have
-- This helps identify what can be safely removed
-- =============================================================================

-- 1. LIST ALL YOUR TABLES
SELECT 
    'TABLES' as object_type,
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. LIST ALL YOUR FUNCTIONS
SELECT 
    'FUNCTIONS' as object_type,
    routine_name as name,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. LIST ALL YOUR VIEWS
SELECT 
    'VIEWS' as object_type,
    table_name as name,
    'VIEW' as type
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. CHECK FOR EMPTY TABLES (candidates for removal)
SELECT 'EMPTY TABLES CHECK' as check_type;