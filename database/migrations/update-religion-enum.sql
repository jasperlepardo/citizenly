-- Migration: Update religion_enum to simplified version
-- Date: 2025-08-22
-- Description: Drop current religion_enum and recreate with simplified Supabase-aligned values

-- Start transaction for atomic migration
BEGIN;

-- Step 1: Update any existing data to map old values to new values (if needed)
-- First, let's see what values are currently being used
-- UPDATE residents SET religion = 'others' WHERE religion NOT IN (
--     'roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian', 'aglipayan_church',
--     'seventh_day_adventist', 'bible_baptist_church', 'jehovahs_witnesses',
--     'church_of_jesus_christ_latter_day_saints', 'united_church_of_christ_philippines', 'others'
-- );

-- Step 2: Create a temporary column to store current values
ALTER TABLE residents ADD COLUMN religion_temp TEXT;

-- Step 3: Copy current religion values to temporary column
UPDATE residents SET religion_temp = religion::TEXT;

-- Step 4: Drop the religion column (this will automatically drop the constraint)
ALTER TABLE residents DROP COLUMN religion;

-- Step 5: Drop the old enum type
DROP TYPE IF EXISTS religion_enum;

-- Step 6: Create the new simplified religion_enum
CREATE TYPE religion_enum AS ENUM (
    'roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian', 'aglipayan_church',
    'seventh_day_adventist', 'bible_baptist_church', 'jehovahs_witnesses',
    'church_of_jesus_christ_latter_day_saints', 'united_church_of_christ_philippines', 'others'
);

-- Step 7: Add the religion column back with the new enum type
ALTER TABLE residents ADD COLUMN religion religion_enum DEFAULT 'roman_catholic';

-- Step 8: Map old values to new enum values
UPDATE residents SET religion = 
    CASE 
        WHEN religion_temp = 'roman_catholic' THEN 'roman_catholic'::religion_enum
        WHEN religion_temp = 'islam' THEN 'islam'::religion_enum
        WHEN religion_temp = 'iglesia_ni_cristo' THEN 'iglesia_ni_cristo'::religion_enum
        WHEN religion_temp = 'christian' THEN 'christian'::religion_enum
        WHEN religion_temp = 'aglipayan_church' THEN 'aglipayan_church'::religion_enum
        WHEN religion_temp = 'seventh_day_adventist' THEN 'seventh_day_adventist'::religion_enum
        WHEN religion_temp = 'bible_baptist_church' THEN 'bible_baptist_church'::religion_enum
        WHEN religion_temp = 'jehovahs_witnesses' THEN 'jehovahs_witnesses'::religion_enum
        WHEN religion_temp = 'church_of_jesus_christ_latter_day_saints' THEN 'church_of_jesus_christ_latter_day_saints'::religion_enum
        WHEN religion_temp = 'united_church_of_christ_philippines' THEN 'united_church_of_christ_philippines'::religion_enum
        -- Map all other values to 'others'
        ELSE 'others'::religion_enum
    END
WHERE religion_temp IS NOT NULL;

-- Step 9: Drop the temporary column
ALTER TABLE residents DROP COLUMN religion_temp;

-- Step 10: Add NOT NULL constraint if it was there before (optional, based on your schema requirements)
-- ALTER TABLE residents ALTER COLUMN religion SET NOT NULL;

COMMIT;

-- Verify the migration
SELECT 'Migration completed successfully. Current religion enum values:' as status;
SELECT unnest(enum_range(NULL::religion_enum)) as religion_values;