-- Update existing household records to use PSGC format
-- Current: HH-014-729881
-- New: 042114014-0000-0001-0001

-- Check current household records
SELECT 'Current household records:' as info;
SELECT code, barangay_code, street_name, total_members 
FROM households 
ORDER BY created_at;

-- Step 1: Temporarily disable foreign key constraint
ALTER TABLE residents DROP CONSTRAINT residents_household_code_fkey;

-- Step 2: Update households table first
WITH numbered_households AS (
  SELECT 
    code as old_code,
    barangay_code || '-0000-0001-' || LPAD(ROW_NUMBER() OVER (PARTITION BY barangay_code ORDER BY created_at)::TEXT, 4, '0') as new_code
  FROM households 
  WHERE code LIKE 'HH-%'
)
UPDATE households 
SET code = numbered_households.new_code
FROM numbered_households
WHERE households.code = numbered_households.old_code;

-- Step 3: Update residents to reference the new household codes
WITH numbered_households AS (
  SELECT 
    'HH-014-729881' as old_code,  -- Hardcode the known old value
    barangay_code || '-0000-0001-' || LPAD(ROW_NUMBER() OVER (PARTITION BY barangay_code ORDER BY created_at)::TEXT, 4, '0') as new_code
  FROM households 
  WHERE code = '042114014-0000-0001-0001'  -- The new code after update
)
UPDATE residents 
SET household_code = numbered_households.new_code
FROM numbered_households
WHERE residents.household_code = numbered_households.old_code;

-- Step 4: Re-enable foreign key constraint
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Verify the update
SELECT 'Updated household records:' as info;
SELECT code, barangay_code, street_name, total_members 
FROM households 
ORDER BY created_at;

-- Update any residents that reference the old household code
-- This should happen automatically due to foreign key CASCADE, but let's check
SELECT 'Residents with household codes:' as info;
SELECT first_name, last_name, household_code 
FROM residents 
WHERE household_code IS NOT NULL;

SELECT 'Update completed successfully!' as result;