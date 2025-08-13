-- =============================================================================
-- REMOVE UNNECESSARY SUPABASE OBJECTS
-- This script removes encryption-related and unused objects safely
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: DROP ENCRYPTION-RELATED TABLES
-- =============================================================================
DROP TABLE IF EXISTS system_encryption_keys CASCADE;
DROP TABLE IF EXISTS system_key_rotation_history CASCADE;

-- =============================================================================
-- STEP 2: DROP PROBLEMATIC VIEWS (These are causing your API errors)
-- =============================================================================
DROP VIEW IF EXISTS residents_decrypted CASCADE;
DROP VIEW IF EXISTS residents_masked CASCADE;

-- =============================================================================
-- STEP 3: DROP ENCRYPTION-RELATED FUNCTIONS
-- =============================================================================
DROP FUNCTION IF EXISTS encrypt_pii(text, varchar) CASCADE;
DROP FUNCTION IF EXISTS decrypt_pii(bytea, varchar) CASCADE;
DROP FUNCTION IF EXISTS create_search_hash(text, text) CASCADE;
DROP FUNCTION IF EXISTS get_active_encryption_key() CASCADE;
DROP FUNCTION IF EXISTS trigger_encrypt_resident_pii() CASCADE;

-- =============================================================================
-- STEP 4: DROP UNNECESSARY/DUPLICATE VIEWS
-- =============================================================================
-- These appear to be duplicates or unused analytics
DROP VIEW IF EXISTS household_income_analytics CASCADE;
DROP VIEW IF EXISTS migrants_complete CASCADE;
DROP VIEW IF EXISTS settings_management_summary CASCADE;

-- =============================================================================
-- STEP 5: CLEAN UP ANY VIEWS THAT MIGHT BE BROKEN
-- =============================================================================
-- Recreate api_residents_with_geography without encryption references
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
-- STEP 6: RECREATE api_households_with_members WITHOUT ENCRYPTION
-- =============================================================================
DROP VIEW IF EXISTS api_households_with_members CASCADE;
CREATE OR REPLACE VIEW api_households_with_members AS
SELECT 
    -- Core household fields
    h.code,
    h.house_number,
    h.name,
    h.monthly_income,
    h.income_class,
    h.household_head_id,
    h.is_active,
    h.created_at,
    h.updated_at,
    
    -- Geographic hierarchy
    ah.region_name,
    ah.province_name,
    ah.city_name,
    ah.barangay_name,
    
    -- Household head information (without encryption)
    head.id AS head_id,
    head.first_name AS head_first_name,
    head.middle_name AS head_middle_name,
    head.last_name AS head_last_name,
    head.extension_name AS head_extension_name,
    CONCAT_WS(' ', 
        NULLIF(head.first_name, ''),
        NULLIF(head.middle_name, ''),
        NULLIF(head.last_name, ''),
        NULLIF(head.extension_name, '')
    ) AS head_full_name,
    head.sex AS head_sex,
    head.birthdate AS head_birthdate

FROM households h
LEFT JOIN address_hierarchy ah ON h.barangay_code = ah.barangay_code
LEFT JOIN residents head ON h.household_head_id = head.id;

-- =============================================================================
-- STEP 7: VERIFY CLEANUP
-- =============================================================================
DO $$
DECLARE
    encryption_objects_count INT;
BEGIN
    -- Count remaining encryption-related objects
    SELECT COUNT(*) INTO encryption_objects_count
    FROM (
        SELECT table_name FROM information_schema.tables 
        WHERE table_name LIKE '%encrypt%' OR table_name LIKE '%key_rotation%'
        UNION ALL
        SELECT routine_name FROM information_schema.routines 
        WHERE routine_name LIKE '%encrypt%' OR routine_name LIKE '%decrypt%'
        UNION ALL
        SELECT table_name FROM information_schema.views 
        WHERE table_name LIKE '%decrypt%' OR table_name LIKE '%mask%'
    ) AS encryption_check;
    
    IF encryption_objects_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All encryption objects removed ✓';
    ELSE
        RAISE NOTICE 'WARNING: % encryption objects still remain', encryption_objects_count;
    END IF;
END $$;

COMMIT;

-- =============================================================================
-- POST-CLEANUP VERIFICATION QUERIES
-- Run these after the cleanup to verify everything works
-- =============================================================================

-- Test 1: Check that main views work
-- SELECT COUNT(*) FROM api_residents_with_geography;

-- Test 2: Check that main tables still exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('residents', 'households', 'psgc_barangays');

-- Test 3: Verify no encryption functions remain
-- SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%encrypt%' OR routine_name LIKE '%decrypt%';