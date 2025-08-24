-- Database Schema Inspection SQL Script
-- Run this directly in your Supabase SQL editor to compare with schema.sql

-- =============================================================================
-- SECTION 1: CHECK ALL TABLES
-- =============================================================================
SELECT 
  '🗂️  TABLES IN DATABASE' as section,
  '' as spacing;

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- SECTION 2: CHECK ENUM TYPES  
-- =============================================================================
SELECT 
  '' as spacing,
  '🔍 ENUM TYPES' as section,
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
-- SECTION 3: CHECK KEY TABLE STRUCTURES
-- =============================================================================

-- RESIDENTS TABLE
SELECT 
  '' as spacing,
  '📋 RESIDENTS TABLE STRUCTURE' as section,
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

-- HOUSEHOLDS TABLE  
SELECT 
  '' as spacing,
  '🏠 HOUSEHOLDS TABLE STRUCTURE' as section,
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

-- AUTH USER PROFILES TABLE
SELECT 
  '' as spacing,
  '👤 AUTH_USER_PROFILES TABLE STRUCTURE' as section,
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
WHERE table_name = 'auth_user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- SECTION 4: CHECK FOR SPECIFIC ENUM VALUES
-- =============================================================================

-- Check specific enum we're concerned about
SELECT 
  '' as spacing,
  '🎯 SPECIFIC ENUM CHECKS' as section,
  '' as spacing2;

-- Household Type Enum
SELECT 
  'household_type_enum' as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as current_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'household_type_enum';

-- Tenure Status Enum  
SELECT 
  'tenure_status_enum' as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as current_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'tenure_status_enum';

-- Income Class Enum
SELECT 
  'income_class_enum' as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as current_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'income_class_enum';

-- =============================================================================
-- SECTION 5: COMPARE TABLE COUNTS
-- =============================================================================
SELECT 
  '' as spacing,
  '📊 TABLE ROW COUNTS' as section,  
  '' as spacing2;

-- Check if tables exist and have data
SELECT 
  schemaname,
  tablename,
  n_tup_ins as total_inserts,
  n_tup_upd as total_updates,
  n_tup_del as total_deletes,
  n_live_tup as current_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;