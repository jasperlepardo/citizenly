-- =====================================================
-- MINIMAL HOUSEHOLDS TABLE MIGRATION
-- Simple, guaranteed to work approach
-- =====================================================

\echo 'Starting minimal households table migration...'

-- Step 1: Add code column to households table
\echo 'Step 1: Adding code column to households table...'
ALTER TABLE households ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Step 2: Check if household_number column exists and populate code
\echo 'Step 2: Populating code column...'
DO $$
BEGIN
    -- Check if household_number exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'household_number'
    ) THEN
        -- Copy from household_number
        UPDATE households SET code = household_number WHERE code IS NULL OR code = '';
        RAISE NOTICE 'Copied household_number to code column';
    ELSE
        -- Generate new codes based on existing data
        UPDATE households 
        SET code = 'HH-' || LPAD(ROW_NUMBER() OVER (ORDER BY COALESCE(created_at, NOW()))::TEXT, 6, '0')
        WHERE code IS NULL OR code = '';
        RAISE NOTICE 'Generated new codes for households';
    END IF;
END
$$;

-- Step 3: Make code NOT NULL
\echo 'Step 3: Making code column NOT NULL...'
ALTER TABLE households ALTER COLUMN code SET NOT NULL;

-- Step 4: Add household_code column to residents table
\echo 'Step 4: Adding household_code column to residents table...'
ALTER TABLE residents ADD COLUMN IF NOT EXISTS household_code VARCHAR(50);

-- Step 5: Populate household_code from household_id relationships
\echo 'Step 5: Populating household_code from existing relationships...'
DO $$
BEGIN
    -- Check if household_id column exists in residents
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' AND column_name = 'household_id'
    ) THEN
        -- Update household_code based on household_id
        UPDATE residents 
        SET household_code = h.code 
        FROM households h 
        WHERE residents.household_id = h.id 
        AND residents.household_id IS NOT NULL;
        RAISE NOTICE 'Updated household_code from household_id relationships';
    ELSE
        RAISE NOTICE 'No household_id column found in residents table';
    END IF;
END
$$;

-- Step 6: Add total_members column if it doesn't exist
\echo 'Step 6: Adding total_members column...'
ALTER TABLE households ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0;

-- Step 7: Update member counts
\echo 'Step 7: Updating member counts...'
UPDATE households 
SET total_members = (
    SELECT COUNT(*) 
    FROM residents 
    WHERE (
        (household_code IS NOT NULL AND household_code = households.code) OR
        (household_code IS NULL AND household_id IS NOT NULL AND household_id = households.id)
    )
    AND COALESCE(is_active, true) = true
);

-- Step 8: Add foreign key constraint for household_code
\echo 'Step 8: Adding foreign key constraint...'
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_code_fkey;
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Step 9: Create indexes
\echo 'Step 9: Creating indexes...'
CREATE INDEX IF NOT EXISTS idx_households_code ON households(code);
CREATE INDEX IF NOT EXISTS idx_residents_household_code ON residents(household_code);

-- Step 10: Verify the migration
\echo 'Step 10: Verifying migration...'

-- Check households table structure
\echo 'Households table columns:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

-- Check residents household columns
\echo 'Residents household columns:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'residents' AND column_name LIKE '%household%';

-- Check sample data
\echo 'Sample households:'
SELECT code, 
       COALESCE(street_name, 'No street') as street, 
       total_members,
       barangay_code
FROM households 
LIMIT 3;

\echo 'Sample residents with household_code:'
SELECT first_name, last_name, household_code 
FROM residents 
WHERE household_code IS NOT NULL 
LIMIT 3;

\echo 'Migration completed successfully!'