-- =====================================================
-- COMPLETE HOUSEHOLDS TABLE MIGRATION
-- Remove old columns and finalize the schema
-- =====================================================

BEGIN;

-- Step 1: Verify current state
SELECT 'Current households columns before cleanup:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

-- Step 2: Ensure code column is populated from household_number if needed
UPDATE households 
SET code = household_number 
WHERE code IS NULL AND household_number IS NOT NULL;

-- Step 3: Make sure all households have a code
UPDATE households 
SET code = 'HH-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE code IS NULL;

-- Step 4: Make code NOT NULL
ALTER TABLE households ALTER COLUMN code SET NOT NULL;

-- Step 5: Drop existing primary key constraint on id
ALTER TABLE households DROP CONSTRAINT IF EXISTS households_pkey;

-- Step 6: Add primary key constraint on code
ALTER TABLE households ADD PRIMARY KEY (code);

-- Step 7: Update any foreign key references from residents
-- First, populate household_code from household_id if not already done
UPDATE residents 
SET household_code = h.code 
FROM households h 
WHERE residents.household_id = h.id 
AND residents.household_code IS NULL
AND residents.household_id IS NOT NULL;

-- Step 8: Drop foreign key constraint on household_id
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_id_fkey;

-- Step 9: Drop the old household_id column from residents
ALTER TABLE residents DROP COLUMN IF EXISTS household_id;

-- Step 10: Add foreign key constraint for household_code
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_code_fkey;
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Step 11: Drop the old household_number column from households
ALTER TABLE households DROP COLUMN IF EXISTS household_number;

-- Step 12: Drop the old id column from households
ALTER TABLE households DROP COLUMN IF EXISTS id;

-- Step 13: Update household_head_id references if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'household_head_id'
    ) THEN
        -- Drop and recreate the constraint
        ALTER TABLE households DROP CONSTRAINT IF EXISTS households_household_head_id_fkey;
        ALTER TABLE households ADD CONSTRAINT households_household_head_id_fkey 
            FOREIGN KEY (household_head_id) REFERENCES residents(id);
    END IF;
END
$$;

-- Step 14: Create indexes
CREATE INDEX IF NOT EXISTS idx_households_code ON households(code);
CREATE INDEX IF NOT EXISTS idx_households_barangay ON households(barangay_code);
CREATE INDEX IF NOT EXISTS idx_residents_household_code ON residents(household_code);

-- Step 15: Update member counts
UPDATE households 
SET total_members = (
    SELECT COUNT(*) 
    FROM residents 
    WHERE household_code = households.code 
    AND COALESCE(is_active, true) = true
);

COMMIT;

-- Verification
SELECT 'Final households table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

SELECT 'Primary key constraint:' as info;
SELECT constraint_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'households' 
AND constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'households' AND constraint_type = 'PRIMARY KEY'
);

SELECT 'Sample household data:' as info;
SELECT code, barangay_code, street_name, total_members 
FROM households 
LIMIT 3;

SELECT 'Migration completed successfully!' as result;