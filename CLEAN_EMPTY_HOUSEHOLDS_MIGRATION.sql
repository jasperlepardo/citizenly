-- =====================================================
-- CLEAN MIGRATION FOR EMPTY HOUSEHOLDS TABLE
-- Since table is empty, we can do a clean restructure
-- =====================================================

BEGIN;

-- Step 1: Show current structure
SELECT 'Current households table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

-- Step 2: Drop all existing constraints and indexes first
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_id_fkey;
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_code_fkey;
ALTER TABLE households DROP CONSTRAINT IF EXISTS households_pkey;
ALTER TABLE households DROP CONSTRAINT IF EXISTS households_household_head_id_fkey;

-- Drop indexes
DROP INDEX IF EXISTS idx_households_barangay;
DROP INDEX IF EXISTS idx_households_number;
DROP INDEX IF EXISTS idx_households_code;
DROP INDEX IF EXISTS idx_residents_household;
DROP INDEX IF EXISTS idx_residents_household_code;

-- Step 3: Clean up columns (since table is empty, this is safe)
-- Drop old columns if they exist
ALTER TABLE households DROP COLUMN IF EXISTS id;
ALTER TABLE households DROP COLUMN IF EXISTS household_number;
ALTER TABLE residents DROP COLUMN IF EXISTS household_id;

-- Step 4: Ensure we have the right columns
-- Add code column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'code'
    ) THEN
        ALTER TABLE households ADD COLUMN code VARCHAR(50);
    END IF;
END
$$;

-- Add household_code to residents if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' AND column_name = 'household_code'
    ) THEN
        ALTER TABLE residents ADD COLUMN household_code VARCHAR(50);
    END IF;
END
$$;

-- Add total_members if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'total_members'
    ) THEN
        ALTER TABLE households ADD COLUMN total_members INTEGER DEFAULT 0;
    END IF;
END
$$;

-- Step 5: Set proper constraints
ALTER TABLE households ALTER COLUMN code SET NOT NULL;
ALTER TABLE households ADD PRIMARY KEY (code);

-- Step 6: Add foreign key constraints
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Add household_head_id constraint if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'household_head_id'
    ) THEN
        ALTER TABLE households ADD CONSTRAINT households_household_head_id_fkey 
            FOREIGN KEY (household_head_id) REFERENCES residents(id);
    END IF;
END
$$;

-- Step 7: Create indexes
CREATE INDEX idx_households_code ON households(code);
CREATE INDEX idx_households_barangay ON households(barangay_code);
CREATE INDEX idx_residents_household_code ON residents(household_code);
CREATE INDEX IF NOT EXISTS idx_residents_name ON residents(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_residents_mobile ON residents(mobile_number);

-- Step 8: Create or update the trigger function
CREATE OR REPLACE FUNCTION update_household_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.household_code IS NOT NULL THEN
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_code = NEW.household_code 
                AND COALESCE(is_active, true) = true
            )
            WHERE code = NEW.household_code;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update both old and new households if household changed
        IF OLD.household_code IS DISTINCT FROM NEW.household_code THEN
            IF OLD.household_code IS NOT NULL THEN
                UPDATE households 
                SET total_members = (
                    SELECT COUNT(*) 
                    FROM residents 
                    WHERE household_code = OLD.household_code 
                    AND COALESCE(is_active, true) = true
                )
                WHERE code = OLD.household_code;
            END IF;
        END IF;
        
        IF NEW.household_code IS NOT NULL THEN
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_code = NEW.household_code 
                AND COALESCE(is_active, true) = true
            )
            WHERE code = NEW.household_code;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.household_code IS NOT NULL THEN
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_code = OLD.household_code 
                AND COALESCE(is_active, true) = true
            )
            WHERE code = OLD.household_code;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_update_household_member_count ON residents;
CREATE TRIGGER trg_update_household_member_count
    AFTER INSERT OR UPDATE OR DELETE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_household_member_count();

-- Step 9: Update RLS policies
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

COMMIT;

-- Final verification
SELECT 'Final households table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

SELECT 'Primary key:' as info;
SELECT constraint_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'households' 
AND constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'households' AND constraint_type = 'PRIMARY KEY'
);

SELECT 'Foreign key constraints:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'households' OR tc.table_name = 'residents')
    AND (kcu.column_name LIKE '%household%' OR ccu.column_name LIKE '%household%');

SELECT 'Clean migration completed successfully!' as result;