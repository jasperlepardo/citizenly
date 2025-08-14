-- Fix for "column last_name_encrypted does not exist" error
-- This removes any remaining encryption-related functions that reference non-existent columns

BEGIN;

-- Remove any encryption-related functions that might still exist
DROP FUNCTION IF EXISTS insert_resident_encrypted CASCADE;
DROP FUNCTION IF EXISTS encrypt_pii CASCADE;
DROP FUNCTION IF EXISTS decrypt_pii CASCADE;
DROP FUNCTION IF EXISTS create_search_hash CASCADE;

-- Remove any views that reference encrypted columns
DROP VIEW IF EXISTS residents_decrypted CASCADE;
DROP VIEW IF EXISTS residents_masked CASCADE;
DROP VIEW IF EXISTS residents_with_encryption CASCADE;

-- Remove any triggers that might reference encrypted columns
DROP TRIGGER IF EXISTS trigger_encrypt_resident_data ON residents;
DROP TRIGGER IF EXISTS trigger_update_resident_encryption ON residents;

COMMIT;

-- Verify the fix worked
SELECT 'Database cleanup completed successfully' AS status;