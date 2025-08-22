-- Migration: Update all enums to match exact schema definition
-- Date: 2025-08-22
-- Description: Drop all existing enums and recreate them to match the exact schema definition

-- Start transaction for atomic migration
BEGIN;

-- Step 1: Create temporary columns to store current values
ALTER TABLE residents ADD COLUMN citizenship_temp TEXT;
ALTER TABLE residents ADD COLUMN blood_type_temp TEXT;
ALTER TABLE residents ADD COLUMN ethnicity_temp TEXT;

-- Step 2: Copy current values to temporary columns
UPDATE residents SET citizenship_temp = citizenship::TEXT;
UPDATE residents SET blood_type_temp = blood_type::TEXT;
UPDATE residents SET ethnicity_temp = ethnicity::TEXT;

-- Step 3: Drop columns that use the enums
ALTER TABLE residents DROP COLUMN citizenship;
ALTER TABLE residents DROP COLUMN blood_type;
ALTER TABLE residents DROP COLUMN ethnicity;

-- Step 4: Drop all existing enum types
DROP TYPE IF EXISTS citizenship_enum;
DROP TYPE IF EXISTS blood_type_enum;
DROP TYPE IF EXISTS ethnicity_enum;

-- Step 5: Create the exact enum types from schema
CREATE TYPE citizenship_enum AS ENUM ('filipino', 'dual_citizen', 'foreigner');

CREATE TYPE blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

CREATE TYPE ethnicity_enum AS ENUM (
    -- Major ethnic groups
    'tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bikolano', 'waray', 'kapampangan', 'pangasinense',
    -- Muslim/Moro groups  
    'maranao', 'maguindanao', 'tausug', 'yakan', 'samal', 'badjao',
    -- Indigenous Peoples
    'aeta', 'agta', 'ati', 'batak', 'bukidnon', 'gaddang', 'higaonon', 'ibaloi', 'ifugao', 'igorot',
    'ilongot', 'isneg', 'ivatan', 'kalinga', 'kankanaey', 'mangyan', 'mansaka', 'palawan', 'subanen',
    'tboli', 'teduray', 'tumandok',
    -- Other groups
    'chinese', 'others'
);

-- Step 6: Add columns back with new enum types and defaults
ALTER TABLE residents ADD COLUMN citizenship citizenship_enum DEFAULT 'filipino';
ALTER TABLE residents ADD COLUMN blood_type blood_type_enum;
ALTER TABLE residents ADD COLUMN ethnicity ethnicity_enum;

-- Step 7: Map old values to new enum values
-- Citizenship mapping
UPDATE residents SET citizenship = 
    CASE 
        WHEN citizenship_temp = 'filipino' THEN 'filipino'::citizenship_enum
        WHEN citizenship_temp = 'dual_citizen' THEN 'dual_citizen'::citizenship_enum
        WHEN citizenship_temp = 'foreign_national' THEN 'foreigner'::citizenship_enum
        WHEN citizenship_temp = 'foreigner' THEN 'foreigner'::citizenship_enum
        -- Default to filipino for any other values
        ELSE 'filipino'::citizenship_enum
    END
WHERE citizenship_temp IS NOT NULL;

-- Blood type mapping
UPDATE residents SET blood_type = 
    CASE 
        WHEN blood_type_temp = 'A+' THEN 'A+'::blood_type_enum
        WHEN blood_type_temp = 'A-' THEN 'A-'::blood_type_enum
        WHEN blood_type_temp = 'B+' THEN 'B+'::blood_type_enum
        WHEN blood_type_temp = 'B-' THEN 'B-'::blood_type_enum
        WHEN blood_type_temp = 'AB+' THEN 'AB+'::blood_type_enum
        WHEN blood_type_temp = 'AB-' THEN 'AB-'::blood_type_enum
        WHEN blood_type_temp = 'O+' THEN 'O+'::blood_type_enum
        WHEN blood_type_temp = 'O-' THEN 'O-'::blood_type_enum
        -- 'unknown' maps to null since it's not in the schema enum
        ELSE NULL
    END
WHERE blood_type_temp IS NOT NULL AND blood_type_temp != 'unknown';

-- Ethnicity mapping
UPDATE residents SET ethnicity = 
    CASE 
        WHEN ethnicity_temp = 'tagalog' THEN 'tagalog'::ethnicity_enum
        WHEN ethnicity_temp = 'cebuano' THEN 'cebuano'::ethnicity_enum
        WHEN ethnicity_temp = 'ilocano' THEN 'ilocano'::ethnicity_enum
        WHEN ethnicity_temp = 'bisaya' THEN 'bisaya'::ethnicity_enum
        WHEN ethnicity_temp = 'hiligaynon' THEN 'hiligaynon'::ethnicity_enum
        WHEN ethnicity_temp = 'bikolano' THEN 'bikolano'::ethnicity_enum
        WHEN ethnicity_temp = 'waray' THEN 'waray'::ethnicity_enum
        WHEN ethnicity_temp = 'kapampangan' THEN 'kapampangan'::ethnicity_enum
        WHEN ethnicity_temp = 'pangasinense' THEN 'pangasinense'::ethnicity_enum
        WHEN ethnicity_temp = 'maranao' THEN 'maranao'::ethnicity_enum
        WHEN ethnicity_temp = 'maguindanao' THEN 'maguindanao'::ethnicity_enum
        WHEN ethnicity_temp = 'tausug' THEN 'tausug'::ethnicity_enum
        WHEN ethnicity_temp = 'yakan' THEN 'yakan'::ethnicity_enum
        WHEN ethnicity_temp = 'samal' THEN 'samal'::ethnicity_enum
        WHEN ethnicity_temp = 'badjao' THEN 'badjao'::ethnicity_enum
        WHEN ethnicity_temp = 'aeta' THEN 'aeta'::ethnicity_enum
        WHEN ethnicity_temp = 'agta' THEN 'agta'::ethnicity_enum
        WHEN ethnicity_temp = 'ati' THEN 'ati'::ethnicity_enum
        WHEN ethnicity_temp = 'batak' THEN 'batak'::ethnicity_enum
        WHEN ethnicity_temp = 'bukidnon' THEN 'bukidnon'::ethnicity_enum
        WHEN ethnicity_temp = 'gaddang' THEN 'gaddang'::ethnicity_enum
        WHEN ethnicity_temp = 'higaonon' THEN 'higaonon'::ethnicity_enum
        WHEN ethnicity_temp = 'ibaloi' THEN 'ibaloi'::ethnicity_enum
        WHEN ethnicity_temp = 'ifugao' THEN 'ifugao'::ethnicity_enum
        WHEN ethnicity_temp = 'igorot' THEN 'igorot'::ethnicity_enum
        WHEN ethnicity_temp = 'ilongot' THEN 'ilongot'::ethnicity_enum
        WHEN ethnicity_temp = 'isneg' THEN 'isneg'::ethnicity_enum
        WHEN ethnicity_temp = 'ivatan' THEN 'ivatan'::ethnicity_enum
        WHEN ethnicity_temp = 'kalinga' THEN 'kalinga'::ethnicity_enum
        WHEN ethnicity_temp = 'kankanaey' THEN 'kankanaey'::ethnicity_enum
        WHEN ethnicity_temp = 'mangyan' THEN 'mangyan'::ethnicity_enum
        WHEN ethnicity_temp = 'mansaka' THEN 'mansaka'::ethnicity_enum
        WHEN ethnicity_temp = 'palawan' THEN 'palawan'::ethnicity_enum
        WHEN ethnicity_temp = 'subanen' THEN 'subanen'::ethnicity_enum
        WHEN ethnicity_temp = 'tboli' THEN 'tboli'::ethnicity_enum
        WHEN ethnicity_temp = 'teduray' THEN 'teduray'::ethnicity_enum
        WHEN ethnicity_temp = 'tumandok' THEN 'tumandok'::ethnicity_enum
        WHEN ethnicity_temp = 'chinese' THEN 'chinese'::ethnicity_enum
        -- Map 'other', 'not_reported', and any unmapped values to 'others'
        ELSE 'others'::ethnicity_enum
    END
WHERE ethnicity_temp IS NOT NULL;

-- Step 8: Drop temporary columns
ALTER TABLE residents DROP COLUMN citizenship_temp;
ALTER TABLE residents DROP COLUMN blood_type_temp;
ALTER TABLE residents DROP COLUMN ethnicity_temp;

COMMIT;

-- Verify the migration
SELECT 'Migration completed successfully. Current enum values:' as status;
SELECT 'citizenship_enum values:' as enum_type;
SELECT unnest(enum_range(NULL::citizenship_enum)) as enum_values;
SELECT 'blood_type_enum values:' as enum_type;
SELECT unnest(enum_range(NULL::blood_type_enum)) as enum_values;
SELECT 'ethnicity_enum values:' as enum_type;
SELECT unnest(enum_range(NULL::ethnicity_enum)) as enum_values;