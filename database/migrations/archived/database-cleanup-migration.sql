-- =============================================================================
-- DATABASE CLEANUP MIGRATION SCRIPT
-- This script removes any remaining encryption artifacts and ensures 
-- your database matches the cleaned schema
-- =============================================================================

-- ⚠️ IMPORTANT: BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT
-- ⚠️ Run the database-inspection.sql first to see what needs to be cleaned

BEGIN;

-- =============================================================================
-- STEP 1: DROP ENCRYPTION-RELATED TABLES (if they still exist)
-- =============================================================================

DROP TABLE IF EXISTS system_encryption_keys CASCADE;
DROP TABLE IF EXISTS system_key_rotation_history CASCADE;

-- =============================================================================
-- STEP 2: DROP ENCRYPTION-RELATED VIEWS (if they still exist)
-- =============================================================================

DROP VIEW IF EXISTS residents_decrypted CASCADE;
DROP VIEW IF EXISTS residents_masked CASCADE;
DROP VIEW IF EXISTS residents_with_encryption CASCADE;

-- =============================================================================
-- STEP 3: DROP ENCRYPTION-RELATED FUNCTIONS (if they still exist)
-- =============================================================================

DROP FUNCTION IF EXISTS encrypt_pii(TEXT, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS decrypt_pii(BYTEA, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS create_search_hash(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS insert_resident_encrypted(
    p_first_name TEXT,
    p_last_name TEXT,
    p_birthdate DATE,
    p_sex VARCHAR,
    p_barangay_code VARCHAR,
    p_middle_name TEXT,
    p_mobile_number VARCHAR,
    p_telephone_number VARCHAR,
    p_email VARCHAR,
    p_mother_maiden_first TEXT,
    p_mother_maiden_middle TEXT,
    p_mother_maiden_last TEXT,
    p_household_code VARCHAR,
    p_city_municipality_code VARCHAR,
    p_province_code VARCHAR,
    p_region_code VARCHAR
) CASCADE;

-- =============================================================================
-- STEP 4: REMOVE ENCRYPTION-RELATED COLUMNS FROM RESIDENTS TABLE (if they exist)
-- =============================================================================

-- Check and drop encrypted columns
DO $$
BEGIN
    -- Drop encrypted columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'first_name_encrypted') THEN
        ALTER TABLE residents DROP COLUMN first_name_encrypted CASCADE;
        RAISE NOTICE 'Dropped first_name_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'middle_name_encrypted') THEN
        ALTER TABLE residents DROP COLUMN middle_name_encrypted CASCADE;
        RAISE NOTICE 'Dropped middle_name_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'last_name_encrypted') THEN
        ALTER TABLE residents DROP COLUMN last_name_encrypted CASCADE;
        RAISE NOTICE 'Dropped last_name_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mobile_number_encrypted') THEN
        ALTER TABLE residents DROP COLUMN mobile_number_encrypted CASCADE;
        RAISE NOTICE 'Dropped mobile_number_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'telephone_number_encrypted') THEN
        ALTER TABLE residents DROP COLUMN telephone_number_encrypted CASCADE;
        RAISE NOTICE 'Dropped telephone_number_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'email_encrypted') THEN
        ALTER TABLE residents DROP COLUMN email_encrypted CASCADE;
        RAISE NOTICE 'Dropped email_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mother_maiden_first_encrypted') THEN
        ALTER TABLE residents DROP COLUMN mother_maiden_first_encrypted CASCADE;
        RAISE NOTICE 'Dropped mother_maiden_first_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mother_maiden_middle_encrypted') THEN
        ALTER TABLE residents DROP COLUMN mother_maiden_middle_encrypted CASCADE;
        RAISE NOTICE 'Dropped mother_maiden_middle_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mother_maiden_last_encrypted') THEN
        ALTER TABLE residents DROP COLUMN mother_maiden_last_encrypted CASCADE;
        RAISE NOTICE 'Dropped mother_maiden_last_encrypted column';
    END IF;
    
    -- Drop hash columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'first_name_hash') THEN
        ALTER TABLE residents DROP COLUMN first_name_hash CASCADE;
        RAISE NOTICE 'Dropped first_name_hash column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'last_name_hash') THEN
        ALTER TABLE residents DROP COLUMN last_name_hash CASCADE;
        RAISE NOTICE 'Dropped last_name_hash column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mobile_number_hash') THEN
        ALTER TABLE residents DROP COLUMN mobile_number_hash CASCADE;
        RAISE NOTICE 'Dropped mobile_number_hash column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'email_hash') THEN
        ALTER TABLE residents DROP COLUMN email_hash CASCADE;
        RAISE NOTICE 'Dropped email_hash column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'name_hash') THEN
        ALTER TABLE residents DROP COLUMN name_hash CASCADE;
        RAISE NOTICE 'Dropped name_hash column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'philsys_card_number_hash') THEN
        ALTER TABLE residents DROP COLUMN philsys_card_number_hash CASCADE;
        RAISE NOTICE 'Dropped philsys_card_number_hash column';
    END IF;
    
    -- Drop encryption metadata columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'is_data_encrypted') THEN
        ALTER TABLE residents DROP COLUMN is_data_encrypted CASCADE;
        RAISE NOTICE 'Dropped is_data_encrypted column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'encryption_key_version') THEN
        ALTER TABLE residents DROP COLUMN encryption_key_version CASCADE;
        RAISE NOTICE 'Dropped encryption_key_version column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'encrypted_at') THEN
        ALTER TABLE residents DROP COLUMN encrypted_at CASCADE;
        RAISE NOTICE 'Dropped encrypted_at column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'encrypted_by') THEN
        ALTER TABLE residents DROP COLUMN encrypted_by CASCADE;
        RAISE NOTICE 'Dropped encrypted_by column';
    END IF;
END
$$;

-- =============================================================================
-- STEP 5: DROP ENCRYPTION-RELATED INDEXES (if they exist)
-- =============================================================================

DROP INDEX IF EXISTS idx_encryption_keys_active_unique;
DROP INDEX IF EXISTS idx_residents_first_name_hash;
DROP INDEX IF EXISTS idx_residents_last_name_hash;
DROP INDEX IF EXISTS idx_residents_mobile_hash;
DROP INDEX IF EXISTS idx_residents_email_hash;
DROP INDEX IF EXISTS idx_residents_name_hash;
DROP INDEX IF EXISTS idx_residents_philsys_hash;

-- =============================================================================
-- STEP 6: ENSURE RESIDENTS TABLE HAS ALL REQUIRED COLUMNS FROM CLEAN SCHEMA
-- =============================================================================

-- Add any missing columns that should exist in the clean schema
DO $$
BEGIN
    -- Ensure name column exists (auto-populated by trigger)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'name') THEN
        ALTER TABLE residents ADD COLUMN name VARCHAR(300);
        RAISE NOTICE 'Added name column';
    END IF;
    
    -- Ensure all basic columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'first_name') THEN
        ALTER TABLE residents ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT 'Unknown';
        RAISE NOTICE 'Added first_name column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'middle_name') THEN
        ALTER TABLE residents ADD COLUMN middle_name VARCHAR(100);
        RAISE NOTICE 'Added middle_name column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'last_name') THEN
        ALTER TABLE residents ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT 'Unknown';
        RAISE NOTICE 'Added last_name column';
    END IF;
    
    -- Contact information columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mobile_number') THEN
        ALTER TABLE residents ADD COLUMN mobile_number VARCHAR(20);
        RAISE NOTICE 'Added mobile_number column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'telephone_number') THEN
        ALTER TABLE residents ADD COLUMN telephone_number VARCHAR(20);
        RAISE NOTICE 'Added telephone_number column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'email') THEN
        ALTER TABLE residents ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Added email column';
    END IF;
    
    -- Mother's maiden name columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mother_maiden_first') THEN
        ALTER TABLE residents ADD COLUMN mother_maiden_first VARCHAR(100);
        RAISE NOTICE 'Added mother_maiden_first column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mother_maiden_middle') THEN
        ALTER TABLE residents ADD COLUMN mother_maiden_middle VARCHAR(100);
        RAISE NOTICE 'Added mother_maiden_middle column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'mother_maiden_last') THEN
        ALTER TABLE residents ADD COLUMN mother_maiden_last VARCHAR(100);
        RAISE NOTICE 'Added mother_maiden_last column';
    END IF;
END
$$;

-- =============================================================================
-- STEP 7: UPDATE ANY VIEWS THAT REFERENCE ENCRYPTION FIELDS
-- =============================================================================

-- Recreate api_residents_with_geography view without encryption references
DROP VIEW IF EXISTS api_residents_with_geography CASCADE;

CREATE OR REPLACE VIEW api_residents_with_geography AS
SELECT 
    -- Core resident fields
    r.id,
    r.philsys_card_number,
    r.philsys_last4,
    r.first_name,
    r.middle_name,
    r.last_name,
    r.extension_name,
    r.birthdate,
    r.birth_place_code,
    r.birth_place_level,
    r.birth_place_name,
    r.sex,
    r.civil_status,
    r.civil_status_others_specify,
    r.blood_type,
    r.height,
    r.weight,
    r.complexion,
    r.education_attainment,
    r.is_graduate,
    r.employment_status,
    r.psoc_code,
    r.psoc_level,
    r.occupation_title,
    r.employment_code,
    r.employment_name,
    r.mobile_number,
    r.telephone_number,
    r.email,
    r.mother_maiden_first,
    r.mother_maiden_middle,
    r.mother_maiden_last,
    r.street_id,
    r.subdivision_id,
    r.barangay_code,
    r.city_municipality_code,
    r.province_code,
    r.region_code,
    r.zip_code,
    r.citizenship,
    r.ethnicity,
    r.religion,
    r.religion_others_specify,
    r.is_voter,
    r.is_resident_voter,
    r.last_voted_date,
    r.household_code,
    r.is_active,
    r.created_by,
    r.updated_by,
    r.created_at,
    r.updated_at,
    
    -- Geographic hierarchy
    ah.region_code,
    ah.region_name,
    ah.province_code,
    ah.province_name, 
    ah.city_code,
    ah.city_name,
    ah.city_type,
    ah.barangay_name,
    ah.full_address AS complete_geographic_address,
    
    -- Computed fields for API responses
    CONCAT_WS(' ', 
        NULLIF(r.first_name, ''),
        NULLIF(r.middle_name, ''), 
        NULLIF(r.last_name, ''),
        NULLIF(r.extension_name, '')
    ) AS full_name,
    
    -- Address components for display
    CASE 
        WHEN h.house_number IS NOT NULL THEN
            CONCAT(h.house_number, ', ', ah.barangay_name)
        ELSE
            ah.barangay_name
    END AS display_address

FROM residents r
LEFT JOIN households h ON r.household_code = h.code
LEFT JOIN address_hierarchy ah ON r.barangay_code = ah.barangay_code;

COMMENT ON VIEW api_residents_with_geography IS 'Residents with complete geographic information for API responses';

-- =============================================================================
-- STEP 8: CLEAN UP TRIGGER FUNCTIONS THAT REFERENCE ENCRYPTION
-- =============================================================================

-- Update auto_populate_resident_full_name function to work with plain text fields
CREATE OR REPLACE FUNCTION auto_populate_resident_full_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate full name from name components
    NEW.name := TRIM(CONCAT_WS(' ', 
        NULLIF(NEW.first_name, ''), 
        NULLIF(NEW.middle_name, ''), 
        NULLIF(NEW.last_name, ''),
        NULLIF(NEW.extension_name, '')
    ));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS trigger_auto_populate_resident_full_name ON residents;
CREATE TRIGGER trigger_auto_populate_resident_full_name
    BEFORE INSERT OR UPDATE OF first_name, middle_name, last_name, extension_name
    ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_resident_full_name();

-- =============================================================================
-- STEP 9: VERIFY CLEANUP
-- =============================================================================

-- Check that no encryption-related objects remain
DO $$
DECLARE
    encryption_tables INT;
    encryption_columns INT;
    encryption_functions INT;
    encryption_views INT;
BEGIN
    -- Count encryption tables
    SELECT COUNT(*) INTO encryption_tables
    FROM information_schema.tables 
    WHERE table_name LIKE '%encryption%' 
       OR table_name LIKE '%key_rotation%'
       AND table_schema = 'public';
    
    -- Count encryption columns
    SELECT COUNT(*) INTO encryption_columns
    FROM information_schema.columns 
    WHERE (column_name LIKE '%encrypted%' 
           OR column_name LIKE '%_hash'
           OR column_name LIKE '%encryption%')
       AND table_schema = 'public'
       AND table_name = 'residents';
    
    -- Count encryption functions
    SELECT COUNT(*) INTO encryption_functions
    FROM information_schema.routines 
    WHERE (routine_name LIKE '%encrypt%' 
           OR routine_name LIKE '%decrypt%'
           OR routine_name LIKE '%hash%')
       AND routine_schema = 'public';
    
    -- Count encryption views
    SELECT COUNT(*) INTO encryption_views
    FROM information_schema.views 
    WHERE (table_name LIKE '%decrypt%' 
           OR table_name LIKE '%encrypt%'
           OR table_name LIKE '%masked%')
       AND table_schema = 'public';
    
    -- Report results
    RAISE NOTICE 'Cleanup verification:';
    RAISE NOTICE '  Encryption tables remaining: %', encryption_tables;
    RAISE NOTICE '  Encryption columns remaining: %', encryption_columns;
    RAISE NOTICE '  Encryption functions remaining: %', encryption_functions;
    RAISE NOTICE '  Encryption views remaining: %', encryption_views;
    
    IF encryption_tables > 0 OR encryption_columns > 0 OR encryption_functions > 0 OR encryption_views > 0 THEN
        RAISE WARNING 'Some encryption artifacts still remain. Review manually.';
    ELSE
        RAISE NOTICE 'Database cleanup completed successfully!';
    END IF;
END
$$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION VERIFICATION
-- Run these queries to verify the cleanup was successful
-- =============================================================================

-- 1. Verify residents table structure matches schema
\d residents

-- 2. Verify no encryption artifacts remain
SELECT 'Encryption tables' as artifact_type, count(*) as count
FROM information_schema.tables 
WHERE table_name LIKE '%encryption%' OR table_name LIKE '%key_rotation%'
UNION ALL
SELECT 'Encryption columns', count(*)
FROM information_schema.columns 
WHERE column_name LIKE '%encrypted%' OR column_name LIKE '%_hash' OR column_name LIKE '%encryption%'
UNION ALL
SELECT 'Encryption functions', count(*)
FROM information_schema.routines 
WHERE routine_name LIKE '%encrypt%' OR routine_name LIKE '%decrypt%' OR routine_name LIKE '%hash%'
UNION ALL
SELECT 'Encryption views', count(*)
FROM information_schema.views 
WHERE table_name LIKE '%decrypt%' OR table_name LIKE '%encrypt%' OR table_name LIKE '%masked%';

-- 3. Test resident insertion
-- INSERT INTO residents (first_name, last_name, birthdate, sex, barangay_code, city_municipality_code, province_code, region_code)
-- VALUES ('Test', 'User', '1990-01-01', 'male', '137404001', '137404', '1374', '13');