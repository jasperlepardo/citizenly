-- COMPREHENSIVE DATABASE ALIGNMENT CHECK SCRIPT
-- Run this script section by section and send Claude the results for analysis
-- Each section checks specific alignment points identified in the deep dive analysis

-- =============================================================================
-- SECTION 1: AUTH_USER_PROFILES TABLE STRUCTURE CHECK
-- =============================================================================
SELECT 
  '🔍 AUTH_USER_PROFILES STRUCTURE CHECK' as section_title,
  '' as spacing;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'auth_user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 2: HOUSEHOLDS TABLE STRUCTURE CHECK
-- =============================================================================
SELECT 
  '' as spacing,
  '🏠 HOUSEHOLDS TABLE STRUCTURE CHECK' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'households' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 3: RESIDENTS TABLE STRUCTURE CHECK
-- =============================================================================
SELECT 
  '' as spacing,
  '👤 RESIDENTS TABLE STRUCTURE CHECK' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'residents' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 4: SECTORAL AND MIGRATION TABLES CHECK
-- =============================================================================
SELECT 
  '' as spacing,
  '📊 SECTORAL AND MIGRATION TABLES CHECK' as section_title,
  '' as spacing2;

-- Check if these critical tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('resident_sectoral_info', 'resident_migrant_info', 'household_members', 'resident_relationships')
ORDER BY table_name;

-- =============================================================================
-- SECTION 5: RESIDENT_SECTORAL_INFO STRUCTURE (if exists)
-- =============================================================================
SELECT 
  '' as spacing,
  '🎯 RESIDENT_SECTORAL_INFO STRUCTURE' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'resident_sectoral_info' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 6: RESIDENT_MIGRANT_INFO STRUCTURE (if exists)
-- =============================================================================
SELECT 
  '' as spacing,
  '🚀 RESIDENT_MIGRANT_INFO STRUCTURE' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'resident_migrant_info' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 7: ALL ENUM TYPES VERIFICATION
-- =============================================================================
SELECT 
  '' as spacing,
  '🎨 ALL ENUM TYPES VERIFICATION' as section_title,
  '' as spacing2;

SELECT 
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%_enum'
GROUP BY t.typname
ORDER BY t.typname;

-- =============================================================================
-- SECTION 8: GEOGRAPHIC REFERENCE TABLES CHECK
-- =============================================================================
SELECT 
  '' as spacing,
  '🗺️ GEOGRAPHIC REFERENCE TABLES' as section_title,
  '' as spacing2;

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t.table_name AND t2.table_schema = 'public') > 0 as exists,
  CASE 
    WHEN table_name = 'psgc_regions' THEN (SELECT COUNT(*) FROM psgc_regions)
    WHEN table_name = 'psgc_provinces' THEN (SELECT COUNT(*) FROM psgc_provinces)  
    WHEN table_name = 'psgc_cities_municipalities' THEN (SELECT COUNT(*) FROM psgc_cities_municipalities)
    WHEN table_name = 'psgc_barangays' THEN (SELECT COUNT(*) FROM psgc_barangays)
    ELSE 0
  END as row_count
FROM (
  VALUES 
    ('psgc_regions'),
    ('psgc_provinces'),
    ('psgc_cities_municipalities'), 
    ('psgc_barangays')
) AS t(table_name);

-- =============================================================================
-- SECTION 9: PSOC OCCUPATION TABLES CHECK
-- =============================================================================
SELECT 
  '' as spacing,
  '💼 PSOC OCCUPATION TABLES' as section_title,
  '' as spacing2;

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t.table_name AND t2.table_schema = 'public') > 0 as exists,
  CASE 
    WHEN table_name = 'psoc_major_groups' THEN (SELECT COUNT(*) FROM psoc_major_groups)
    WHEN table_name = 'psoc_sub_major_groups' THEN (SELECT COUNT(*) FROM psoc_sub_major_groups)
    WHEN table_name = 'psoc_minor_groups' THEN (SELECT COUNT(*) FROM psoc_minor_groups)
    WHEN table_name = 'psoc_unit_groups' THEN (SELECT COUNT(*) FROM psoc_unit_groups)
    WHEN table_name = 'psoc_unit_sub_groups' THEN (SELECT COUNT(*) FROM psoc_unit_sub_groups)
    WHEN table_name = 'psoc_position_titles' THEN (SELECT COUNT(*) FROM psoc_position_titles)
    ELSE 0
  END as row_count
FROM (
  VALUES 
    ('psoc_major_groups'),
    ('psoc_sub_major_groups'),
    ('psoc_minor_groups'),
    ('psoc_unit_groups'),
    ('psoc_unit_sub_groups'),
    ('psoc_position_titles')
) AS t(table_name);

-- =============================================================================
-- SECTION 10: LOCAL GEOGRAPHIC TABLES STRUCTURE
-- =============================================================================
SELECT 
  '' as spacing,
  '🏘️ GEO_SUBDIVISIONS TABLE STRUCTURE' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'geo_subdivisions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 11: GEO_STREETS TABLE STRUCTURE
-- =============================================================================
SELECT 
  '' as spacing,
  '🛣️ GEO_STREETS TABLE STRUCTURE' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'geo_streets' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 12: HOUSEHOLD_MEMBERS TABLE STRUCTURE
-- =============================================================================
SELECT 
  '' as spacing,
  '👨‍👩‍👧‍👦 HOUSEHOLD_MEMBERS TABLE STRUCTURE' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'household_members' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 13: RESIDENT_RELATIONSHIPS TABLE STRUCTURE
-- =============================================================================
SELECT 
  '' as spacing,
  '👫 RESIDENT_RELATIONSHIPS TABLE STRUCTURE' as section_title,
  '' as spacing2;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type 
  END as full_type
FROM information_schema.columns 
WHERE table_name = 'resident_relationships' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 14: TABLE EXISTENCE AND ROW COUNT SUMMARY
-- =============================================================================
SELECT 
  '' as spacing,
  '📊 ALL TABLES SUMMARY' as section_title,
  '' as spacing2;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as exists,
  CASE 
    WHEN table_name = 'auth_user_profiles' THEN (SELECT COUNT(*) FROM auth_user_profiles)
    WHEN table_name = 'households' THEN (SELECT COUNT(*) FROM households)
    WHEN table_name = 'residents' THEN (SELECT COUNT(*) FROM residents)
    WHEN table_name = 'resident_sectoral_info' THEN (SELECT COUNT(*) FROM resident_sectoral_info)
    WHEN table_name = 'resident_migrant_info' THEN (SELECT COUNT(*) FROM resident_migrant_info)
    WHEN table_name = 'household_members' THEN (SELECT COUNT(*) FROM household_members)
    WHEN table_name = 'resident_relationships' THEN (SELECT COUNT(*) FROM resident_relationships)
    WHEN table_name = 'geo_subdivisions' THEN (SELECT COUNT(*) FROM geo_subdivisions)
    WHEN table_name = 'geo_streets' THEN (SELECT COUNT(*) FROM geo_streets)
    WHEN table_name = 'psgc_regions' THEN (SELECT COUNT(*) FROM psgc_regions)
    WHEN table_name = 'psgc_provinces' THEN (SELECT COUNT(*) FROM psgc_provinces)
    WHEN table_name = 'psgc_cities_municipalities' THEN (SELECT COUNT(*) FROM psgc_cities_municipalities)
    WHEN table_name = 'psgc_barangays' THEN (SELECT COUNT(*) FROM psgc_barangays)
    WHEN table_name = 'psoc_major_groups' THEN (SELECT COUNT(*) FROM psoc_major_groups)
    WHEN table_name = 'psoc_sub_major_groups' THEN (SELECT COUNT(*) FROM psoc_sub_major_groups)
    WHEN table_name = 'psoc_minor_groups' THEN (SELECT COUNT(*) FROM psoc_minor_groups)
    WHEN table_name = 'psoc_unit_groups' THEN (SELECT COUNT(*) FROM psoc_unit_groups)
    WHEN table_name = 'psoc_unit_sub_groups' THEN (SELECT COUNT(*) FROM psoc_unit_sub_groups)
    WHEN table_name = 'psoc_position_titles' THEN (SELECT COUNT(*) FROM psoc_position_titles)
    ELSE 0
  END as row_count
FROM (
  VALUES 
    -- Core data tables
    ('auth_user_profiles'),
    ('households'),
    ('residents'),
    ('resident_sectoral_info'),
    ('resident_migrant_info'),
    ('household_members'),
    ('resident_relationships'),
    -- Local geographic tables
    ('geo_subdivisions'),
    ('geo_streets'),
    -- PSGC reference tables
    ('psgc_regions'),
    ('psgc_provinces'),
    ('psgc_cities_municipalities'),
    ('psgc_barangays'),
    -- PSOC reference tables
    ('psoc_major_groups'),
    ('psoc_sub_major_groups'),
    ('psoc_minor_groups'),
    ('psoc_unit_groups'),
    ('psoc_unit_sub_groups'),
    ('psoc_position_titles')
) AS t(table_name)
ORDER BY 
  CASE 
    WHEN table_name LIKE 'auth_%' THEN 1
    WHEN table_name IN ('households', 'residents') THEN 2
    WHEN table_name LIKE 'resident_%' THEN 3
    WHEN table_name LIKE 'household_%' THEN 4
    WHEN table_name LIKE 'geo_%' THEN 5
    WHEN table_name LIKE 'psgc_%' THEN 6
    WHEN table_name LIKE 'psoc_%' THEN 7
    ELSE 8
  END,
  table_name;

-- =============================================================================
-- SECTION 15: CRITICAL CONSTRAINTS AND RELATIONSHIPS CHECK
-- =============================================================================
SELECT 
  '' as spacing,
  '🔗 FOREIGN KEY CONSTRAINTS CHECK' as section_title,
  '' as spacing2;

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('households', 'residents', 'resident_sectoral_info', 'resident_migrant_info', 'household_members', 'resident_relationships', 'geo_subdivisions', 'geo_streets')
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================================================
-- SECTION 16: DATA INTEGRITY AND COMPLETENESS CHECK
-- =============================================================================
SELECT 
  '' as spacing,
  '🎯 DATA COMPLETENESS CHECK' as section_title,
  '' as spacing2;

-- Check critical data relationships
SELECT 
  'households' as table_name,
  COUNT(*) as total_records,
  COUNT(household_head_id) as records_with_head,
  COUNT(household_type) as records_with_type,
  COUNT(tenure_status) as records_with_tenure
FROM households
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'households');

SELECT 
  'residents' as table_name,
  COUNT(*) as total_records,
  COUNT(household_code) as records_with_household,
  COUNT(education_attainment) as records_with_education,
  COUNT(employment_status) as records_with_employment
FROM residents
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'residents');

SELECT 
  'geo_subdivisions' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_records,
  COUNT(description) as records_with_description
FROM geo_subdivisions
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geo_subdivisions');

SELECT 
  'geo_streets' as table_name,
  COUNT(*) as total_records,
  COUNT(subdivision_id) as records_with_subdivision,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_records
FROM geo_streets
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geo_streets');