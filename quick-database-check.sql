-- =============================================================================
-- QUICK DATABASE CHECK
-- Simple queries to check your database status without syntax errors
-- Run these one by one in Supabase SQL Editor
-- =============================================================================

-- 1. BASIC TABLE CHECK - Do your main tables exist?
SELECT 'Table Existence Check' as check_name;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('residents', 'households', 'psgc_regions', 'psgc_barangays', 'psoc_major_groups')
ORDER BY table_name;

-- 2. RESIDENTS TABLE STRUCTURE - What columns exist?
SELECT 'Residents Table Structure' as check_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'residents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. DATA COUNT CHECK - Do you have data?
SELECT 'Data Count Check' as check_name;
SELECT 'residents' as table_name, count(*) as rows FROM residents
UNION ALL
SELECT 'psgc_regions', count(*) FROM psgc_regions
UNION ALL
SELECT 'psgc_barangays', count(*) FROM psgc_barangays
UNION ALL
SELECT 'psoc_major_groups', count(*) FROM psoc_major_groups
UNION ALL
SELECT 'auth_roles', count(*) FROM auth_roles;

-- 4. PSOC CHECK - Does the unified view exist?
SELECT 'PSOC View Check' as check_name;
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'psoc_occupations' AND table_schema = 'public'
    ) THEN 'psoc_occupations view EXISTS ✓' 
    ELSE 'psoc_occupations view MISSING - Run fix-missing-psoc-tables.sql' 
    END as status;

-- 5. ENCRYPTION CLEANUP CHECK - Any encryption leftovers?
SELECT 'Encryption Cleanup Check' as check_name;
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name LIKE '%encryption%' AND table_schema = 'public'
    ) THEN 'Found encryption tables - Run cleanup script' 
    ELSE 'No encryption tables found ✓' 
    END as encryption_tables_status;

-- 6. ENCRYPTION COLUMNS CHECK
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' 
          AND column_name LIKE '%encrypted%' 
          AND table_schema = 'public'
    ) THEN 'Found encrypted columns in residents - Run cleanup script' 
    ELSE 'No encrypted columns in residents ✓' 
    END as encryption_columns_status;

-- 7. ESSENTIAL FUNCTIONS CHECK
SELECT 'Essential Functions Check' as check_name;
SELECT 
    routine_name as function_name,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('search_psoc_occupations', 'get_psoc_title', 'auto_populate_resident_full_name');

-- 8. PROBLEMATIC VIEWS CHECK
SELECT 'Problematic Views Check' as check_name;
SELECT 
    table_name as view_name,
    'May contain encryption references' as warning
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%decrypt%' OR table_name LIKE '%masked%' OR table_name LIKE '%encrypt%');

-- =============================================================================
-- INTERPRETATION GUIDE:
-- =============================================================================
-- If you see:
-- - "psoc_occupations view MISSING" → Run fix-missing-psoc-tables.sql
-- - "Found encryption tables/columns" → Run database-cleanup-migration.sql
-- - "0 rows" for psgc_regions/barangays → Need to import PSGC reference data
-- - "0 rows" for auth_roles → Need to create basic user roles
-- - Missing functions → Run the appropriate fix scripts
-- =============================================================================