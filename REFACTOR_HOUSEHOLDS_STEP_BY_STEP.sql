-- =====================================================
-- STEP-BY-STEP HOUSEHOLDS TABLE REFACTOR
-- This script can be run step by step to diagnose issues
-- =====================================================

-- First, let's check the current structure
SELECT 'Current households table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

SELECT 'Current residents table household columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'residents' AND column_name LIKE '%household%';

-- Check current constraints
SELECT 'Current foreign key constraints:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'households' OR tc.table_name = 'residents')
    AND (kcu.column_name LIKE '%household%' OR ccu.column_name LIKE '%household%');

-- Check existing indexes
SELECT 'Current indexes:' as info;
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('households', 'residents') 
    AND indexname LIKE '%household%';

-- Check if we have any data
SELECT 'Sample household data:' as info;
SELECT * FROM households LIMIT 3;

SELECT 'Sample resident data with household references:' as info;
SELECT id, first_name, last_name, household_id 
FROM residents 
WHERE household_id IS NOT NULL 
LIMIT 3;