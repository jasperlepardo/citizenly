-- =====================================================
-- FINAL WORKING MIGRATION - ACTUALLY TRANSFORM THE SCHEMA
-- This will work step by step with proper error handling
-- =====================================================

-- Step 1: Add the code column
ALTER TABLE households ADD COLUMN code VARCHAR(50);

-- Step 2: Populate code column from household_number
UPDATE households SET code = household_number WHERE code IS NULL;

-- Step 3: Handle empty table case - generate codes if no household_number
WITH numbered_households AS (
  SELECT id, 'HH-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0') as new_code
  FROM households 
  WHERE code IS NULL
)
UPDATE households 
SET code = numbered_households.new_code
FROM numbered_households
WHERE households.id = numbered_households.id;

-- Step 4: Make code NOT NULL
ALTER TABLE households ALTER COLUMN code SET NOT NULL;

-- Step 5: Add household_code column to residents if it doesn't exist
ALTER TABLE residents ADD COLUMN IF NOT EXISTS household_code VARCHAR(50);

-- Step 6: Update residents to use household_code instead of household_id
UPDATE residents 
SET household_code = h.code 
FROM households h 
WHERE residents.household_id = h.id 
AND residents.household_code IS NULL;

-- Step 7: Drop the old foreign key constraint FIRST
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_id_fkey;

-- Step 8: Add unique constraint to code (required before making it primary key)
ALTER TABLE households ADD CONSTRAINT households_code_unique UNIQUE (code);

-- Step 9: Drop the existing primary key constraint (now safe)
ALTER TABLE households DROP CONSTRAINT households_pkey;

-- Step 10: Add code as the new primary key
ALTER TABLE households ADD PRIMARY KEY (code);

-- Step 11: Add new foreign key constraint
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Step 12: Drop the old household_id column from residents
ALTER TABLE residents DROP COLUMN household_id;

-- Step 13: Drop the old household_number column from households
ALTER TABLE households DROP COLUMN household_number;

-- Step 14: Drop the old id column from households  
ALTER TABLE households DROP COLUMN id;

-- Step 15: Add total_members column if it doesn't exist
ALTER TABLE households ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0;

-- Step 16: Create indexes
CREATE INDEX IF NOT EXISTS idx_households_code ON households(code);
CREATE INDEX IF NOT EXISTS idx_households_barangay ON households(barangay_code);
CREATE INDEX IF NOT EXISTS idx_residents_household_code ON residents(household_code);

-- Step 17: Update household_head_id foreign key constraint
ALTER TABLE households DROP CONSTRAINT IF EXISTS households_household_head_id_fkey;
ALTER TABLE households ADD CONSTRAINT households_household_head_id_fkey 
    FOREIGN KEY (household_head_id) REFERENCES residents(id);

-- Verification
SELECT 'Migration completed! New schema:' as result;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;