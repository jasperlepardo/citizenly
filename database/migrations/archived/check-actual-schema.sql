-- Check actual database schema structure
-- Run this in Supabase SQL Editor to see what's really in the database

-- 1. Check if relationship_to_head exists in residents table
SELECT 
    'residents table columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'residents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check household_members table structure
SELECT 
    'household_members table columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'household_members' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check households table structure
SELECT 
    'households table columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'households' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check what data exists in your household
SELECT 
    'actual household data' as check_type,
    *
FROM households 
WHERE barangay_code = '042114014'
LIMIT 5;

-- 5. Check if there are any residents linked to this household
SELECT 
    'residents in household' as check_type,
    id,
    first_name,
    last_name,
    household_code
FROM residents 
WHERE household_code = '042114014-0000-0001-0001'
LIMIT 5;

-- 6. Check household_members for this household
SELECT 
    'household_members data' as check_type,
    *
FROM household_members 
WHERE household_code = '042114014-0000-0001-0001'
LIMIT 5;