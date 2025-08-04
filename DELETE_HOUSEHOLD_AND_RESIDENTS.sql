-- Delete household and residents records
-- This will clean up the test data
-- Run this in your Supabase SQL Editor

-- Check current records before deletion
SELECT 'Current household records:' as info;
SELECT code, barangay_code, street_name, total_members, household_head_id, created_at 
FROM households 
ORDER BY created_at;

-- Check residents with household assignments
SELECT 'Current resident records with household_code:' as info;
SELECT id, first_name, last_name, household_code, created_at 
FROM residents 
WHERE household_code IS NOT NULL
ORDER BY created_at;

-- Step 1: Remove household head references first
-- This clears the household_head_id foreign key constraint
UPDATE households SET household_head_id = NULL WHERE household_head_id IS NOT NULL;

-- Step 2: Delete residents (now safe since household_head_id is cleared)
DELETE FROM residents WHERE household_code IS NOT NULL;

-- Step 3: Delete all households
DELETE FROM households;

-- Verify deletion
SELECT 'After deletion - Household count:' as info, COUNT(*) as count FROM households;
SELECT 'After deletion - Residents with household_code:' as info, COUNT(*) as count FROM residents WHERE household_code IS NOT NULL;
SELECT 'After deletion - All residents count:' as info, COUNT(*) as count FROM residents;

SELECT 'All household and resident records deleted successfully!' as result;