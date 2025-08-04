-- =====================================================
-- FIXED HOUSEHOLDS TABLE REFACTOR
-- Handles missing columns and constraints properly
-- =====================================================

BEGIN;

-- Step 1: Check and add total_members column first if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'total_members'
    ) THEN
        ALTER TABLE households ADD COLUMN total_members INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_members column to households table';
    ELSE
        RAISE NOTICE 'total_members column already exists';
    END IF;
END
$$;

-- Step 2: Drop existing triggers and functions that reference household_id
DROP TRIGGER IF EXISTS trg_update_household_member_count ON residents;
DROP FUNCTION IF EXISTS update_household_member_count();

-- Step 3: Drop foreign key constraints from residents table
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_household_id_fkey;

-- Step 4: Drop existing indexes that will be recreated
DROP INDEX IF EXISTS idx_households_barangay;
DROP INDEX IF EXISTS idx_households_number;
DROP INDEX IF EXISTS idx_households_code;
DROP INDEX IF EXISTS idx_residents_household;
DROP INDEX IF EXISTS idx_residents_household_code;
DROP INDEX IF EXISTS idx_residents_name;
DROP INDEX IF EXISTS idx_residents_mobile;

-- Step 5: Add the new 'code' column to households table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'code'
    ) THEN
        ALTER TABLE households ADD COLUMN code VARCHAR(50);
        RAISE NOTICE 'Added code column to households table';
    ELSE
        RAISE NOTICE 'code column already exists';
    END IF;
END
$$;

-- Step 6: Populate the code column with household_number values (if household_number exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'household_number'
    ) THEN
        UPDATE households SET code = household_number WHERE code IS NULL;
        RAISE NOTICE 'Populated code column from household_number';
    ELSE
        -- If no household_number, generate codes based on row number
        UPDATE households SET code = 'HH-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0') 
        WHERE code IS NULL;
        RAISE NOTICE 'Generated new codes for households';
    END IF;
END
$$;

-- Step 7: Make code NOT NULL
ALTER TABLE households ALTER COLUMN code SET NOT NULL;

-- Step 8: Check if we need to drop the old primary key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'households' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE households DROP CONSTRAINT households_pkey;
        RAISE NOTICE 'Dropped old primary key constraint';
    END IF;
END
$$;

-- Step 9: Set code as new primary key
ALTER TABLE households ADD PRIMARY KEY (code);

-- Step 10: Drop the household_number column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'household_number'
    ) THEN
        ALTER TABLE households DROP COLUMN household_number;
        RAISE NOTICE 'Dropped household_number column';
    END IF;
END
$$;

-- Step 11: Drop the old id column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'id'
    ) THEN
        ALTER TABLE households DROP COLUMN id;
        RAISE NOTICE 'Dropped old id column';
    END IF;
END
$$;

-- Step 12: Add household_code column to residents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' AND column_name = 'household_code'
    ) THEN
        ALTER TABLE residents ADD COLUMN household_code VARCHAR(50);
        RAISE NOTICE 'Added household_code column to residents table';
    ELSE
        RAISE NOTICE 'household_code column already exists';
    END IF;
END
$$;

-- Step 13: Populate household_code from existing household_id relationships (if household_id exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' AND column_name = 'household_id'
    ) THEN
        -- This might fail if households.id was already dropped, so we wrap it in a nested block
        BEGIN
            UPDATE residents 
            SET household_code = h.code 
            FROM households h 
            WHERE residents.household_id = h.id 
            AND residents.household_id IS NOT NULL;
            RAISE NOTICE 'Populated household_code from household_id relationships';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not populate household_code from household_id: %', SQLERRM;
        END;
    END IF;
END
$$;

-- Step 14: Drop the old household_id column from residents if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' AND column_name = 'household_id'
    ) THEN
        ALTER TABLE residents DROP COLUMN household_id;
        RAISE NOTICE 'Dropped household_id column from residents';
    END IF;
END
$$;

-- Step 15: Add foreign key constraint for household_code
ALTER TABLE residents ADD CONSTRAINT residents_household_code_fkey 
    FOREIGN KEY (household_code) REFERENCES households(code);

-- Step 16: Handle household_head_id references
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'households' AND column_name = 'household_head_id'
    ) THEN
        -- Check if constraint exists and drop it
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'households' 
            AND constraint_name = 'households_household_head_id_fkey'
        ) THEN
            ALTER TABLE households DROP CONSTRAINT households_household_head_id_fkey;
        END IF;
        
        -- Re-add the constraint
        ALTER TABLE households ADD CONSTRAINT households_household_head_id_fkey 
            FOREIGN KEY (household_head_id) REFERENCES residents(id);
        
        RAISE NOTICE 'Updated household_head_id foreign key constraint';
    END IF;
END
$$;

-- Step 17: Recreate indexes with new column names
CREATE INDEX IF NOT EXISTS idx_households_barangay ON households(barangay_code);
CREATE INDEX IF NOT EXISTS idx_households_code ON households(code);
CREATE INDEX IF NOT EXISTS idx_residents_household_code ON residents(household_code);
CREATE INDEX IF NOT EXISTS idx_residents_name ON residents(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_residents_mobile ON residents(mobile_number);

-- Step 18: Recreate the household member count function and trigger
CREATE OR REPLACE FUNCTION update_household_member_count()
RETURNS TRIGGER AS $$
BEGIN
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
        IF OLD.household_code IS DISTINCT FROM NEW.household_code THEN
            IF OLD.household_code IS NOT NULL THEN
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
        
        IF NEW.household_code IS NOT NULL THEN
            UPDATE households 
            SET total_members = (
                SELECT COUNT(*) 
                FROM residents 
                WHERE household_code = NEW.household_code 
                AND is_active = true
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

-- Step 19: Update RLS policies
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

-- Step 20: Refresh member counts for all households
UPDATE households 
SET total_members = (
    SELECT COUNT(*) 
    FROM residents 
    WHERE household_code = households.code 
    AND is_active = true
);

COMMIT;

-- Success message
SELECT 'Migration completed successfully!' as result;
SELECT 'New households table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;