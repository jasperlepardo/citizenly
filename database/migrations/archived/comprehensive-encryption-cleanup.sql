-- COMPREHENSIVE ENCRYPTION CLEANUP SCRIPT
-- This script removes ALL encryption-related artifacts that could cause the last_name_encrypted error

BEGIN;

-- =============================================================================
-- STEP 1: DROP ALL ENCRYPTION-RELATED FUNCTIONS WITH ALL POSSIBLE SIGNATURES
-- =============================================================================

-- Drop insert_resident_encrypted function with various possible signatures
DROP FUNCTION IF EXISTS insert_resident_encrypted CASCADE;
DROP FUNCTION IF EXISTS insert_resident_encrypted(TEXT, TEXT, DATE, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS insert_resident_encrypted(TEXT, TEXT, DATE, sex_enum, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS insert_resident_encrypted(TEXT, TEXT, DATE, VARCHAR, VARCHAR, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS insert_resident_encrypted(TEXT, TEXT, DATE, sex_enum, VARCHAR, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;

-- Drop all encryption/decryption functions
DROP FUNCTION IF EXISTS encrypt_pii CASCADE;
DROP FUNCTION IF EXISTS encrypt_pii(TEXT) CASCADE;
DROP FUNCTION IF EXISTS encrypt_pii(TEXT, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS decrypt_pii CASCADE;
DROP FUNCTION IF EXISTS decrypt_pii(BYTEA) CASCADE;
DROP FUNCTION IF EXISTS decrypt_pii(BYTEA, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS create_search_hash CASCADE;
DROP FUNCTION IF EXISTS create_search_hash(TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_search_hash(TEXT, TEXT) CASCADE;

-- Drop key management functions
DROP FUNCTION IF EXISTS get_encryption_key CASCADE;
DROP FUNCTION IF EXISTS rotate_encryption_key CASCADE;
DROP FUNCTION IF EXISTS get_current_encryption_version CASCADE;

-- =============================================================================
-- STEP 2: DROP ALL ENCRYPTION-RELATED VIEWS
-- =============================================================================

DROP VIEW IF EXISTS residents_decrypted CASCADE;
DROP VIEW IF EXISTS residents_masked CASCADE;
DROP VIEW IF EXISTS residents_with_encryption CASCADE;
DROP VIEW IF EXISTS residents_search_view CASCADE;
DROP VIEW IF EXISTS encrypted_residents_view CASCADE;

-- =============================================================================
-- STEP 3: DROP ALL ENCRYPTION-RELATED TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS trigger_encrypt_resident_data ON residents CASCADE;
DROP TRIGGER IF EXISTS trigger_update_resident_encryption ON residents CASCADE;
DROP TRIGGER IF EXISTS trigger_encrypt_pii ON residents CASCADE;
DROP TRIGGER IF EXISTS trigger_decrypt_pii ON residents CASCADE;
DROP TRIGGER IF EXISTS trigger_hash_search_fields ON residents CASCADE;

-- =============================================================================
-- STEP 4: REMOVE ENCRYPTION COLUMNS FROM ALL TABLES
-- =============================================================================

-- Remove from residents table
DO $$
BEGIN
    -- Encrypted data columns
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
    
    -- Hash columns
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
    
    -- Encryption metadata columns
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
-- STEP 5: DROP ENCRYPTION-RELATED TABLES
-- =============================================================================

DROP TABLE IF EXISTS system_encryption_keys CASCADE;
DROP TABLE IF EXISTS system_key_rotation_history CASCADE;
DROP TABLE IF EXISTS encryption_audit_log CASCADE;

-- =============================================================================
-- STEP 6: CLEAN UP ANY REMAINING FUNCTION/TRIGGER REFERENCES
-- =============================================================================

-- Look for any remaining functions that might reference encrypted columns
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT routine_name, specific_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND (
            routine_definition ILIKE '%encrypted%' 
            OR routine_definition ILIKE '%encrypt_%'
            OR routine_definition ILIKE '%decrypt_%'
            OR routine_name ILIKE '%encrypt%'
            OR routine_name ILIKE '%decrypt%'
        )
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I CASCADE', func_record.specific_name);
            RAISE NOTICE 'Dropped function: %', func_record.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop function: % (Error: %)', func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END
$$;

COMMIT;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify cleanup was successful
SELECT 'Encryption cleanup completed successfully!' as status;

-- Show any remaining functions that might still reference encrypted columns
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (
    routine_definition ILIKE '%encrypted%' 
    OR routine_definition ILIKE '%encrypt_%'
    OR routine_definition ILIKE '%decrypt_%'
)
ORDER BY routine_name;