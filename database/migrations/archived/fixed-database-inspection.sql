-- =============================================================================
-- FIXED DATABASE INSPECTION SCRIPT
-- Removed RAISE NOTICE statements that cause syntax errors
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
    'RESIDENTS TABLE STRUCTURE' as section_name,
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
SELECT 
    'ENCRYPTION TABLES CHECK' as section_name,
    table_name,
    'Found - Should be removed' as status
FROM information_schema.tables 
WHERE (table_name LIKE '%encryption%' 
   OR table_name LIKE '%key_rotation%')
   AND table_schema = 'public'
UNION ALL
SELECT 
    'ENCRYPTION TABLES CHECK',
    'No encryption tables found',
    'CLEAN ✓'
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE (table_name LIKE '%encryption%' 
       OR table_name LIKE '%key_rotation%')
       AND table_schema = 'public'
);

-- 4. CHECK FOR ENCRYPTION-RELATED COLUMNS (SHOULD BE EMPTY AFTER CLEANUP)
SELECT 
    'ENCRYPTION COLUMNS CHECK' as section_name,
    table_name,
    column_name,
    'Found - Should be removed' as status
FROM information_schema.columns 
WHERE (column_name LIKE '%encrypted%' 
   OR column_name LIKE '%_hash'
   OR column_name LIKE '%encryption%')
   AND table_schema = 'public'
UNION ALL
SELECT 
    'ENCRYPTION COLUMNS CHECK',
    'No encryption columns found',
    '',
    'CLEAN ✓'
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE (column_name LIKE '%encrypted%' 
       OR column_name LIKE '%_hash'
       OR column_name LIKE '%encryption%')
       AND table_schema = 'public'
)
ORDER BY section_name, table_name, column_name;

-- 5. CHECK ALL VIEWS
SELECT 
    'VIEWS CHECK' as section_name,
    table_name as view_name,
    LEFT(view_definition, 100) as definition_preview
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 6. CHECK ALL FUNCTIONS
SELECT 
    'FUNCTIONS CHECK' as section_name,
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 7. CHECK FOR ENCRYPTION-RELATED FUNCTIONS (SHOULD BE EMPTY AFTER CLEANUP)
SELECT 
    'ENCRYPTION FUNCTIONS CHECK' as section_name,
    routine_name,
    'Found - Should be removed' as status
FROM information_schema.routines 
WHERE (routine_name LIKE '%encrypt%' 
   OR routine_name LIKE '%decrypt%'
   OR routine_name LIKE '%hash%')
   AND routine_schema = 'public'
UNION ALL
SELECT 
    'ENCRYPTION FUNCTIONS CHECK',
    'No encryption functions found',
    'CLEAN ✓'
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE (routine_name LIKE '%encrypt%' 
       OR routine_name LIKE '%decrypt%'
       OR routine_name LIKE '%hash%')
       AND routine_schema = 'public'
)
ORDER BY section_name, routine_name;

-- 8. CHECK RLS POLICIES
SELECT 
    'RLS POLICIES CHECK' as section_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. CHECK INDEXES
SELECT 
    'INDEXES CHECK' as section_name,
    schemaname,
    tablename,
    indexname,
    LEFT(indexdef, 80) as index_definition
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 10. CHECK TRIGGERS
SELECT 
    'TRIGGERS CHECK' as section_name,
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    LEFT(action_statement, 60) as action_preview
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 11. CHECK SAMPLE DATA IN MAIN TABLES
SELECT 
    'DATA COUNT CHECK' as section_name,
    'residents' as table_name, 
    count(*) as row_count,
    CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END as status
FROM residents
UNION ALL
SELECT 'DATA COUNT CHECK', 'households', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END FROM households
UNION ALL
SELECT 'DATA COUNT CHECK', 'psgc_regions', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY - NEEDS REFERENCE DATA' ELSE 'HAS DATA' END FROM psgc_regions
UNION ALL
SELECT 'DATA COUNT CHECK', 'psgc_provinces', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY - NEEDS REFERENCE DATA' ELSE 'HAS DATA' END FROM psgc_provinces
UNION ALL
SELECT 'DATA COUNT CHECK', 'psgc_cities_municipalities', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY - NEEDS REFERENCE DATA' ELSE 'HAS DATA' END FROM psgc_cities_municipalities
UNION ALL
SELECT 'DATA COUNT CHECK', 'psgc_barangays', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY - NEEDS REFERENCE DATA' ELSE 'HAS DATA' END FROM psgc_barangays
UNION ALL
SELECT 'DATA COUNT CHECK', 'auth_user_profiles', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END FROM auth_user_profiles
UNION ALL
SELECT 'DATA COUNT CHECK', 'auth_roles', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY - NEEDS BASIC ROLES' ELSE 'HAS DATA' END FROM auth_roles
ORDER BY section_name, table_name;

-- 12. CHECK PSOC HIERARCHY TABLES SPECIFICALLY
SELECT 
    'PSOC HIERARCHY CHECK' as section_name,
    'psoc_major_groups' as table_name, 
    count(*) as row_count,
    CASE WHEN count(*) = 0 THEN 'EMPTY - RUN fix-missing-psoc-tables.sql' ELSE 'HAS DATA' END as status
FROM psoc_major_groups
UNION ALL
SELECT 'PSOC HIERARCHY CHECK', 'psoc_sub_major_groups', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END FROM psoc_sub_major_groups
UNION ALL
SELECT 'PSOC HIERARCHY CHECK', 'psoc_minor_groups', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END FROM psoc_minor_groups
UNION ALL
SELECT 'PSOC HIERARCHY CHECK', 'psoc_unit_groups', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END FROM psoc_unit_groups
UNION ALL
SELECT 'PSOC HIERARCHY CHECK', 'psoc_unit_sub_groups', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END FROM psoc_unit_sub_groups
UNION ALL
SELECT 'PSOC HIERARCHY CHECK', 'psoc_position_titles', count(*), CASE WHEN count(*) = 0 THEN 'EMPTY' ELSE 'HAS DATA' END FROM psoc_position_titles
ORDER BY section_name, table_name;

-- 13. CHECK IF PSOC_OCCUPATIONS VIEW EXISTS
SELECT 
    'PSOC UNIFIED VIEW CHECK' as section_name,
    table_name as view_name,
    'EXISTS ✓' as status,
    '' as action_needed
FROM information_schema.views 
WHERE table_name = 'psoc_occupations' 
  AND table_schema = 'public'
UNION ALL
SELECT 
    'PSOC UNIFIED VIEW CHECK',
    'psoc_occupations',
    'MISSING ❌',
    'RUN fix-missing-psoc-tables.sql'
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name = 'psoc_occupations' 
      AND table_schema = 'public'
)
ORDER BY section_name, view_name;

-- 14. CHECK FOR ESSENTIAL FUNCTIONS YOUR APP NEEDS
SELECT 
    'ESSENTIAL FUNCTIONS CHECK' as section_name,
    'search_psoc_occupations' as function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'search_psoc_occupations' 
          AND routine_schema = 'public'
    ) THEN 'EXISTS ✓' ELSE 'MISSING - RUN fix-missing-psoc-tables.sql' END as status
UNION ALL
SELECT 
    'ESSENTIAL FUNCTIONS CHECK',
    'get_psoc_title',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_psoc_title' 
          AND routine_schema = 'public'
    ) THEN 'EXISTS ✓' ELSE 'MISSING - RUN fix-missing-psoc-tables.sql' END
UNION ALL
SELECT 
    'ESSENTIAL FUNCTIONS CHECK',
    'auto_populate_resident_full_name',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'auto_populate_resident_full_name' 
          AND routine_schema = 'public'
    ) THEN 'EXISTS ✓' ELSE 'MISSING - Check schema.sql' END
ORDER BY section_name, function_name;

-- 15. CHECK FOR PROBLEMATIC VIEWS THAT REFERENCE ENCRYPTION
SELECT 
    'PROBLEMATIC VIEWS CHECK' as section_name,
    table_name as view_name,
    'Contains encryption references - May cause errors' as status
FROM information_schema.views 
WHERE table_schema = 'public'
  AND (view_definition LIKE '%decrypt_pii%' 
       OR view_definition LIKE '%encrypt_pii%'
       OR view_definition LIKE '%_encrypted%'
       OR view_definition LIKE '%_hash%'
       OR table_name LIKE '%decrypt%'
       OR table_name LIKE '%masked%')
UNION ALL
SELECT 
    'PROBLEMATIC VIEWS CHECK',
    'No problematic views found',
    'CLEAN ✓'
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public'
      AND (view_definition LIKE '%decrypt_pii%' 
           OR view_definition LIKE '%encrypt_pii%'
           OR view_definition LIKE '%_encrypted%'
           OR view_definition LIKE '%_hash%'
           OR table_name LIKE '%decrypt%'
           OR table_name LIKE '%masked%')
)
ORDER BY section_name, view_name;

-- 16. FINAL STATUS SUMMARY
SELECT 
    'DATABASE STATUS SUMMARY' as section_name,
    'Tables' as object_type,
    count(*) as total_count,
    'info' as category
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'DATABASE STATUS SUMMARY',
    'Views',
    count(*),
    'info'
FROM information_schema.views 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'DATABASE STATUS SUMMARY',
    'Functions',
    count(*),
    'info'
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
UNION ALL
SELECT 
    'DATABASE STATUS SUMMARY',
    'RLS Policies',
    count(*),
    'info'
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY section_name, object_type;

-- 17. ACTION ITEMS SUMMARY
SELECT 
    'ACTION ITEMS SUMMARY' as section_name,
    'Priority' as priority,
    'Action Needed' as action_needed,
    'Script to Run' as script_name
UNION ALL
SELECT 
    'ACTION ITEMS SUMMARY',
    'HIGH',
    'Fix PSOC tables if missing',
    'fix-missing-psoc-tables.sql'
UNION ALL
SELECT 
    'ACTION ITEMS SUMMARY',
    'HIGH',
    'Clean encryption artifacts if found',
    'database-cleanup-migration.sql'
UNION ALL
SELECT 
    'ACTION ITEMS SUMMARY',
    'MEDIUM',
    'Import PSGC reference data if empty',
    'Need PSGC import script'
UNION ALL
SELECT 
    'ACTION ITEMS SUMMARY',
    'MEDIUM',
    'Create basic auth roles if empty',
    'Need roles setup script'
UNION ALL
SELECT 
    'ACTION ITEMS SUMMARY',
    'LOW',
    'Fix API routes to match schema',
    'fix-api-routes.js'
ORDER BY section_name, priority;