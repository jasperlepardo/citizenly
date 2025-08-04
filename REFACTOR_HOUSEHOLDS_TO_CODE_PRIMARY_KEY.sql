-- =====================================================
-- REFACTOR HOUSEHOLDS TABLE TO USE CODE AS PRIMARY KEY
-- Similar to PSGC/PSOC pattern
-- =====================================================

BEGIN;

-- Step 1: Drop existing triggers and functions that reference household_id
DROP TRIGGER IF EXISTS trg_update_household_member_count ON residents;
DROP FUNCTION IF EXISTS update_household_member_count();

-- Step 2: Drop foreign key constraints from residents table
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_id_fkey;

-- Step 3: Drop existing indexes that will be recreated
DROP INDEX IF EXISTS idx_households_barangay;
DROP INDEX IF EXISTS idx_households_number;
DROP INDEX IF EXISTS idx_households_code;
DROP INDEX IF EXISTS idx_residents_household;
DROP INDEX IF EXISTS idx_residents_household_code;
DROP INDEX IF EXISTS idx_residents_name;
DROP INDEX IF EXISTS idx_residents_mobile;

-- Step 4: Add the new 'code' column to households table
ALTER TABLE households ADD COLUMN code VARCHAR(50);

-- Step 5: Populate the code column with household_number values
UPDATE households SET code = household_number WHERE code IS NULL;

-- Step 6: Make code NOT NULL and set as primary key
ALTER TABLE households ALTER COLUMN code SET NOT NULL;

-- Step 7: Drop the old primary key and set code as new primary key
ALTER TABLE households DROP CONSTRAINT households_pkey;
ALTER TABLE households ADD PRIMARY KEY (code);

-- Step 8: Drop the household_number column (now redundant)
ALTER TABLE households DROP COLUMN household_number;

-- Step 9: Drop the old id column
ALTER TABLE households DROP COLUMN id;

-- Step 10: Add household_code column to residents table
ALTER TABLE residents ADD COLUMN household_code VARCHAR(50);

-- Step 11: Populate household_code from existing household_id relationships
UPDATE residents 
SET household_code = h.code 
FROM households h 
WHERE residents.household_id IS NOT NULL 
AND EXISTS (
    SELECT 1 FROM households h2 WHERE h2.code = h.code
);

-- Step 12: Drop the old household_id column from residents
ALTER TABLE residents DROP COLUMN household_id;

-- Step 13: Add foreign key constraint for household_code
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Step 14: Update household_head_id references
-- First, add a temporary column for the new reference
ALTER TABLE households ADD COLUMN temp_household_head_id UUID;

-- Copy existing household_head_id values
UPDATE households SET temp_household_head_id = household_head_id;

-- Drop the old household_head_id column
ALTER TABLE households DROP COLUMN household_head_id;

-- Rename temp column to household_head_id
ALTER TABLE households RENAME COLUMN temp_household_head_id TO household_head_id;

-- Add foreign key constraint for household_head_id
ALTER TABLE households ADD CONSTRAINT households_household_head_id_fkey 
    FOREIGN KEY (household_head_id) REFERENCES residents(id);

-- Step 15: Recreate indexes with new column names
CREATE INDEX IF NOT EXISTS idx_households_barangay ON households(barangay_code);
CREATE INDEX IF NOT EXISTS idx_households_code ON households(code);
CREATE INDEX IF NOT EXISTS idx_residents_household_code ON residents(household_code);
CREATE INDEX IF NOT EXISTS idx_residents_name ON residents(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_residents_mobile ON residents(mobile_number);

-- Step 16: Recreate the household member count function and trigger
CREATE OR REPLACE FUNCTION update_household_member_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if total_members column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'total_members'
    ) THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_code = NEW.household_code 
                AND is_active = true
            )
            WHERE code = NEW.household_code;
        ELSIF TG_OP = 'UPDATE' THEN
            -- Update both old and new households if household changed
            IF OLD.household_code != NEW.household_code THEN
                UPDATE households 
                SET total_members = (
                    SELECT COUNT(*) 
                    FROM residents 
                    WHERE household_code = OLD.household_code 
                    AND is_active = true
                )
                WHERE code = OLD.household_code;
            END IF;
            
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_code = NEW.household_code 
                AND is_active = true
            )
            WHERE code = NEW.household_code;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_code = OLD.household_code 
                AND is_active = true
            )
            WHERE code = OLD.household_code;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic member count updates
CREATE TRIGGER trg_update_household_member_count
    AFTER INSERT OR UPDATE OR DELETE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_household_member_count();

-- Step 17: Update RLS policies to use new column names
DROP POLICY IF EXISTS households_policy ON households;
CREATE POLICY households_policy ON households
    FOR ALL USING (
        barangay_code IN (
            SELECT up.barangay_code 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
            AND up.is_active = true
        )
    );

-- Step 18: Add total_members column if it doesn't exist and refresh member counts
DO $$
BEGIN
    -- Add total_members column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'total_members'
    ) THEN
        ALTER TABLE households ADD COLUMN total_members INTEGER DEFAULT 0;
    END IF;
END
$$;

-- Refresh member counts for all households
UPDATE households 
SET total_members = (
    SELECT COUNT(*) 
    FROM residents 
    WHERE household_code = households.code 
    AND is_active = true
);

COMMIT;

-- Verification queries (run these separately after the migration)
-- SELECT 'Households table structure:' as info;
-- Query to check households table structure:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'households' 
-- ORDER BY ordinal_position;

-- SELECT 'Residents table structure (household reference):' as info;
-- Query to check residents table structure:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'residents' AND column_name LIKE '%household%'
-- ORDER BY ordinal_position;

-- Sample data queries (run these separately after the migration):
-- SELECT 'Sample households:' as info;
-- SELECT code, barangay_code, street_name, total_members 
-- FROM households 
-- LIMIT 5;

-- SELECT 'Sample residents with household_code:' as info;
-- SELECT first_name, last_name, household_code, barangay_code 
-- FROM residents 
-- WHERE household_code IS NOT NULL 
-- LIMIT 5;