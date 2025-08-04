-- Simple update for the existing household record
-- From: HH-014-729881
-- To: 042114014-0000-0001-0001

-- Check current records
SELECT 'Before update:' as info;
SELECT code, barangay_code FROM households;
SELECT first_name, last_name, household_code FROM residents WHERE household_code IS NOT NULL;

-- Step 1: Temporarily drop the foreign key constraint
ALTER TABLE residents DROP CONSTRAINT residents_household_code_fkey;

-- Step 2: Update the household code
UPDATE households 
SET code = '042114014-0000-0001-0001' 
WHERE code = 'HH-014-729881';

-- Step 3: Update residents to use the new household code
UPDATE residents 
SET household_code = '042114014-0000-0001-0001' 
WHERE household_code = 'HH-014-729881';

-- Step 4: Re-add the foreign key constraint
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Verify the update
SELECT 'After update:' as info;
SELECT code, barangay_code FROM households;
SELECT first_name, last_name, household_code FROM residents WHERE household_code IS NOT NULL;

SELECT 'Update completed successfully!' as result;