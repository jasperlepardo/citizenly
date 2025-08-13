-- =============================================================================
-- MIGRATE TO CLEAN STRUCTURE
-- Convert your encrypted database to plain text structure
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: ADD PLAIN TEXT COLUMNS TO RESIDENTS TABLE
-- =============================================================================

-- Add the plain text columns that your clean schema expects
ALTER TABLE residents ADD COLUMN IF NOT EXISTS name VARCHAR(300);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS telephone_number VARCHAR(20);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS mother_maiden_first VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS mother_maiden_middle VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS mother_maiden_last VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS philsys_card_number VARCHAR(20);

-- =============================================================================
-- STEP 2: CHECK IF YOU HAVE ANY RESIDENT DATA TO MIGRATE
-- =============================================================================

DO $$
DECLARE
    resident_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO resident_count FROM residents;
    RAISE NOTICE 'Found % residents in database', resident_count;
    
    IF resident_count = 0 THEN
        RAISE NOTICE 'No resident data to migrate - safe to proceed with structure change';
    ELSE
        RAISE NOTICE 'WARNING: You have % residents with encrypted data that may be lost', resident_count;
        RAISE NOTICE 'Consider backing up your database before proceeding';
    END IF;
END $$;

-- =============================================================================
-- STEP 3: SET DEFAULT VALUES FOR REQUIRED FIELDS
-- =============================================================================

-- Set temporary default values for NOT NULL fields
UPDATE residents 
SET first_name = 'Unknown', 
    last_name = 'Unknown' 
WHERE first_name IS NULL OR last_name IS NULL;

-- Make the required columns NOT NULL to match schema
ALTER TABLE residents ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE residents ALTER COLUMN last_name SET NOT NULL;

-- =============================================================================
-- STEP 4: DROP ENCRYPTION-RELATED COLUMNS
-- =============================================================================

-- Drop encrypted columns (this will lose any encrypted data!)
ALTER TABLE residents DROP COLUMN IF EXISTS name_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS name_hash CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS philsys_card_number_hash CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS first_name_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS first_name_hash CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS middle_name_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS last_name_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS last_name_hash CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS email_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS email_hash CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS mobile_number_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS mobile_number_hash CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS telephone_number_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS mother_maiden_first_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS mother_maiden_middle_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS mother_maiden_last_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS is_data_encrypted CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS encryption_key_version CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS encrypted_at CASCADE;
ALTER TABLE residents DROP COLUMN IF EXISTS encrypted_by CASCADE;

-- =============================================================================
-- STEP 5: DROP ENCRYPTION TABLES AND FUNCTIONS
-- =============================================================================

DROP TABLE IF EXISTS system_encryption_keys CASCADE;
DROP TABLE IF EXISTS system_key_rotation_history CASCADE;
DROP FUNCTION IF EXISTS encrypt_pii(text, varchar) CASCADE;
DROP FUNCTION IF EXISTS decrypt_pii(bytea, varchar) CASCADE;
DROP FUNCTION IF EXISTS create_search_hash(text, text) CASCADE;
DROP FUNCTION IF EXISTS get_active_encryption_key() CASCADE;
DROP FUNCTION IF EXISTS trigger_encrypt_resident_pii() CASCADE;

-- =============================================================================
-- STEP 6: DROP PROBLEMATIC VIEWS
-- =============================================================================

DROP VIEW IF EXISTS residents_decrypted CASCADE;
DROP VIEW IF EXISTS residents_masked CASCADE;

-- =============================================================================
-- STEP 7: RECREATE ESSENTIAL VIEWS WITH PLAIN TEXT COLUMNS
-- =============================================================================

-- Recreate api_residents_with_geography view
DROP VIEW IF EXISTS api_residents_with_geography CASCADE;
CREATE OR REPLACE VIEW api_residents_with_geography AS
SELECT 
    -- Core resident fields (using actual column names)
    r.id,
    r.philsys_card_number,
    r.philsys_last4,
    r.first_name,
    r.middle_name,
    r.last_name,
    r.extension_name,
    r.birthdate,
    r.sex,
    r.civil_status,
    r.mobile_number,
    r.telephone_number,
    r.email,
    r.barangay_code,
    r.city_municipality_code,
    r.province_code,
    r.region_code,
    r.household_code,
    r.is_active,
    r.created_at,
    r.updated_at,
    
    -- Geographic hierarchy
    ah.region_name,
    ah.province_name, 
    ah.city_name,
    ah.barangay_name,
    ah.full_address AS complete_geographic_address,
    
    -- Computed full name
    CONCAT_WS(' ', 
        NULLIF(r.first_name, ''),
        NULLIF(r.middle_name, ''), 
        NULLIF(r.last_name, ''),
        NULLIF(r.extension_name, '')
    ) AS full_name

FROM residents r
LEFT JOIN households h ON r.household_code = h.code
LEFT JOIN address_hierarchy ah ON r.barangay_code = ah.barangay_code;

-- =============================================================================
-- STEP 8: UPDATE AUTO-POPULATE FUNCTION FOR PLAIN TEXT
-- =============================================================================

CREATE OR REPLACE FUNCTION auto_populate_resident_full_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate full name from plain text components
    NEW.name := TRIM(CONCAT_WS(' ', 
        NULLIF(NEW.first_name, ''), 
        NULLIF(NEW.middle_name, ''), 
        NULLIF(NEW.last_name, ''),
        NULLIF(NEW.extension_name, '')
    ));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trigger_auto_populate_resident_full_name ON residents;
CREATE TRIGGER trigger_auto_populate_resident_full_name
    BEFORE INSERT OR UPDATE OF first_name, middle_name, last_name, extension_name
    ON residents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_resident_full_name();

-- =============================================================================
-- STEP 9: VERIFICATION
-- =============================================================================

DO $$
DECLARE
    new_column_count INTEGER;
    encryption_column_count INTEGER;
BEGIN
    -- Count plain text columns
    SELECT COUNT(*) INTO new_column_count
    FROM information_schema.columns 
    WHERE table_name = 'residents' 
      AND column_name IN ('first_name', 'last_name', 'email', 'mobile_number');
    
    -- Count remaining encryption columns
    SELECT COUNT(*) INTO encryption_column_count
    FROM information_schema.columns 
    WHERE table_name = 'residents' 
      AND column_name LIKE '%encrypted%';
    
    RAISE NOTICE 'Migration Results:';
    RAISE NOTICE '  Plain text columns: %', new_column_count;
    RAISE NOTICE '  Encryption columns remaining: %', encryption_column_count;
    
    IF new_column_count >= 4 AND encryption_column_count = 0 THEN
        RAISE NOTICE 'SUCCESS: Migration completed ✓';
    ELSE
        RAISE NOTICE 'WARNING: Migration may be incomplete';
    END IF;
END $$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION TEST QUERIES
-- =============================================================================

-- Test 1: Check new structure
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'residents' ORDER BY column_name;

-- Test 2: Try inserting a test resident
-- INSERT INTO residents (first_name, last_name, birthdate, sex, barangay_code, city_municipality_code, region_code)
-- VALUES ('Test', 'User', '1990-01-01', 'male', '137404001', '137404', '13');

-- Test 3: Check the API view works
-- SELECT COUNT(*) FROM api_residents_with_geography;