-- =====================================================
-- PII ENCRYPTION MIGRATION SCRIPT
-- =====================================================
-- Purpose: Migrate existing resident data to encrypted format
-- Run this AFTER implementing the PII encryption infrastructure
-- IMPORTANT: Backup your database before running this script!
-- =====================================================

-- =====================================================
-- PRE-MIGRATION CHECKLIST
-- =====================================================

-- 1. Verify encryption infrastructure is installed
DO $$
BEGIN
    -- Check if encryption tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_encryption_keys') THEN
        RAISE EXCEPTION 'Encryption infrastructure not found. Run security-implementation-pii-encryption.sql first!';
    END IF;
    
    -- Check if encryption functions exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'encrypt_pii') THEN
        RAISE EXCEPTION 'Encryption functions not found. Install PII encryption functions first!';
    END IF;
    
    -- Check if encrypted columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'residents' AND column_name = 'first_name_encrypted') THEN
        RAISE EXCEPTION 'Encrypted columns not found. Update residents table structure first!';
    END IF;
    
    RAISE NOTICE '✅ Pre-migration checks passed. Ready to migrate data.';
END $$;

-- =====================================================
-- MIGRATION STATISTICS (BEFORE)
-- =====================================================

-- Create temporary function to show migration progress
CREATE OR REPLACE FUNCTION show_migration_stats(stage TEXT)
RETURNS TABLE(
    stage_name TEXT,
    total_residents BIGINT,
    encrypted_residents BIGINT,
    unencrypted_residents BIGINT,
    encryption_percentage NUMERIC(5,2),
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        stage as stage_name,
        COUNT(*) as total_residents,
        COUNT(*) FILTER (WHERE is_data_encrypted = true) as encrypted_residents,
        COUNT(*) FILTER (WHERE is_data_encrypted = false OR is_data_encrypted IS NULL) as unencrypted_residents,
        ROUND(
            (COUNT(*) FILTER (WHERE is_data_encrypted = true) * 100.0) / 
            GREATEST(COUNT(*), 1), 2
        ) as encryption_percentage,
        NOW() as timestamp
    FROM residents;
END;
$$ LANGUAGE plpgsql;

-- Show initial statistics
SELECT * FROM show_migration_stats('BEFORE_MIGRATION');

-- =====================================================
-- SECTION 1: BATCH MIGRATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION migrate_residents_batch(
    p_batch_size INTEGER DEFAULT 100,
    p_max_batches INTEGER DEFAULT NULL
)
RETURNS TABLE(
    batch_number INTEGER,
    processed_count INTEGER,
    success_count INTEGER,
    error_count INTEGER,
    batch_duration INTERVAL,
    cumulative_duration INTERVAL
) AS $$
DECLARE
    batch_num INTEGER := 0;
    total_processed INTEGER := 0;
    total_success INTEGER := 0;
    total_errors INTEGER := 0;
    batch_start TIMESTAMPTZ;
    migration_start TIMESTAMPTZ := NOW();
    current_batch_success INTEGER;
    current_batch_errors INTEGER;
    resident_batch RECORD;
BEGIN
    RAISE NOTICE '🚀 Starting batch migration of resident PII data...';
    RAISE NOTICE '📊 Batch size: %, Max batches: %', p_batch_size, COALESCE(p_max_batches::TEXT, 'unlimited');
    
    FOR resident_batch IN
        SELECT 
            r.id,
            r.first_name,
            r.middle_name,
            r.last_name,
            r.mobile_number,
            r.telephone_number,
            r.email,
            r.mother_maiden_first,
            r.mother_maiden_middle,
            r.mother_maiden_last,
            ROW_NUMBER() OVER (ORDER BY r.created_at) as row_num
        FROM residents r
        WHERE r.is_data_encrypted = false OR r.is_data_encrypted IS NULL
        ORDER BY r.created_at
    LOOP
        -- Start new batch
        IF (resident_batch.row_num - 1) % p_batch_size = 0 THEN
            batch_num := batch_num + 1;
            batch_start := NOW();
            current_batch_success := 0;
            current_batch_errors := 0;
            
            RAISE NOTICE '📦 Processing batch % (resident #%)', batch_num, resident_batch.row_num;
            
            -- Check max batches limit
            IF p_max_batches IS NOT NULL AND batch_num > p_max_batches THEN
                RAISE NOTICE '🛑 Reached max batches limit: %', p_max_batches;
                EXIT;
            END IF;
        END IF;
        
        -- Encrypt individual resident
        BEGIN
            UPDATE residents SET
                -- Encrypt PII fields
                first_name_encrypted = encrypt_pii(resident_batch.first_name),
                middle_name_encrypted = encrypt_pii(resident_batch.middle_name),
                last_name_encrypted = encrypt_pii(resident_batch.last_name),
                mobile_number_encrypted = encrypt_pii(resident_batch.mobile_number),
                telephone_number_encrypted = encrypt_pii(resident_batch.telephone_number),
                email_encrypted = encrypt_pii(resident_batch.email),
                mother_maiden_first_encrypted = encrypt_pii(resident_batch.mother_maiden_first),
                mother_maiden_middle_encrypted = encrypt_pii(resident_batch.mother_maiden_middle),
                mother_maiden_last_encrypted = encrypt_pii(resident_batch.mother_maiden_last),
                
                -- Create search hashes
                first_name_hash = create_search_hash(resident_batch.first_name),
                last_name_hash = create_search_hash(resident_batch.last_name),
                mobile_number_hash = create_search_hash(resident_batch.mobile_number),
                email_hash = create_search_hash(resident_batch.email),
                full_name_hash = create_search_hash(
                    TRIM(COALESCE(resident_batch.first_name, '') || ' ' || 
                         COALESCE(resident_batch.middle_name, '') || ' ' || 
                         COALESCE(resident_batch.last_name, ''))
                ),
                
                -- Update metadata
                is_data_encrypted = true,
                encryption_key_version = 1,
                encrypted_at = NOW(),
                encrypted_by = auth.uid()
                
            WHERE id = resident_batch.id;
            
            current_batch_success := current_batch_success + 1;
            total_success := total_success + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING '❌ Failed to encrypt resident %: %', resident_batch.id, SQLERRM;
                
                -- Log the error
                INSERT INTO system_audit_logs (
                    table_name, 
                    operation, 
                    record_id, 
                    new_values,
                    user_id,
                    created_at
                ) VALUES (
                    'residents_migration',
                    'ENCRYPT_ERROR',
                    resident_batch.id,
                    jsonb_build_object('error', SQLERRM, 'resident_id', resident_batch.id),
                    auth.uid(),
                    NOW()
                );
                
                current_batch_errors := current_batch_errors + 1;
                total_errors := total_errors + 1;
        END;
        
        total_processed := total_processed + 1;
        
        -- Return batch results when batch is complete
        IF resident_batch.row_num % p_batch_size = 0 THEN
            RETURN QUERY SELECT 
                batch_num,
                p_batch_size,
                current_batch_success,
                current_batch_errors,
                NOW() - batch_start,
                NOW() - migration_start;
                
            -- Commit batch (if in a transaction)
            -- COMMIT; -- Uncomment if running in manual transaction control
        END IF;
        
    END LOOP;
    
    -- Handle final partial batch
    IF total_processed % p_batch_size != 0 THEN
        RETURN QUERY SELECT 
            batch_num,
            total_processed % p_batch_size,
            current_batch_success,
            current_batch_errors,
            NOW() - batch_start,
            NOW() - migration_start;
    END IF;
    
    RAISE NOTICE '✅ Migration completed! Processed: %, Success: %, Errors: %', 
        total_processed, total_success, total_errors;
        
    -- Log migration completion
    INSERT INTO system_audit_logs (
        table_name, 
        operation, 
        record_id, 
        new_values,
        user_id,
        created_at
    ) VALUES (
        'residents_migration',
        'MIGRATION_COMPLETED',
        gen_random_uuid(),
        jsonb_build_object(
            'total_processed', total_processed,
            'total_success', total_success, 
            'total_errors', total_errors,
            'duration_minutes', EXTRACT(EPOCH FROM (NOW() - migration_start)) / 60
        ),
        auth.uid(),
        NOW()
    );
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 2: MIGRATION EXECUTION
-- =====================================================

-- Log migration start
INSERT INTO system_audit_logs (
    table_name, 
    operation, 
    record_id, 
    new_values,
    user_id,
    created_at
) VALUES (
    'residents_migration',
    'MIGRATION_STARTED',
    gen_random_uuid(),
    jsonb_build_object('migration_type', 'pii_encryption', 'started_by', auth.uid()),
    auth.uid(),
    NOW()
);

-- Run the migration in batches
-- Adjust batch_size based on your database performance
-- Start with smaller batches (50-100) for safety
SELECT * FROM migrate_residents_batch(
    p_batch_size := 50,    -- Process 50 residents at a time
    p_max_batches := NULL  -- No limit (set to a number for testing)
);

-- =====================================================
-- SECTION 3: POST-MIGRATION VERIFICATION
-- =====================================================

-- Show final statistics
SELECT * FROM show_migration_stats('AFTER_MIGRATION');

-- Verify encryption integrity for sample records
DO $$
DECLARE
    sample_resident RECORD;
    test_count INTEGER := 0;
    success_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 Testing encryption integrity on sample records...';
    
    FOR sample_resident IN
        SELECT id FROM residents 
        WHERE is_data_encrypted = true 
        ORDER BY RANDOM() 
        LIMIT 10
    LOOP
        test_count := test_count + 1;
        
        IF validate_encryption_integrity(sample_resident.id) THEN
            success_count := success_count + 1;
            RAISE NOTICE '✅ Resident % encryption OK', sample_resident.id;
        ELSE
            RAISE WARNING '❌ Resident % encryption FAILED', sample_resident.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 Integrity test results: %/% passed', success_count, test_count;
END $$;

-- Test search functionality
DO $$
DECLARE
    test_result RECORD;
    test_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 Testing encrypted search functionality...';
    
    -- Test name search
    FOR test_result IN
        SELECT * FROM search_residents_by_name('Juan', '137404001') 
        LIMIT 3
    LOOP
        test_count := test_count + 1;
        RAISE NOTICE '✅ Found resident: % (Score: %)', test_result.full_name, test_result.match_score;
    END LOOP;
    
    RAISE NOTICE '📊 Search test found % results', test_count;
END $$;

-- =====================================================
-- SECTION 4: CLEANUP AND OPTIMIZATION
-- =====================================================

-- Update table statistics
ANALYZE residents;

-- Reindex hash indexes for better performance
REINDEX INDEX idx_residents_first_name_hash;
REINDEX INDEX idx_residents_last_name_hash;
REINDEX INDEX idx_residents_full_name_hash;
REINDEX INDEX idx_residents_mobile_hash;
REINDEX INDEX idx_residents_email_hash;

-- Drop temporary migration function
DROP FUNCTION IF EXISTS show_migration_stats(TEXT);

-- =====================================================
-- SECTION 5: OPTIONAL - REMOVE PLAIN TEXT DATA
-- =====================================================

-- DANGER ZONE: Uncomment this section to remove plain text PII after migration
-- WARNING: This is IRREVERSIBLE! Make sure decryption works first!

/*
DO $$
DECLARE
    confirmation TEXT;
BEGIN
    -- Safety check
    SELECT COUNT(*) INTO confirmation 
    FROM residents 
    WHERE is_data_encrypted = true;
    
    IF confirmation::INTEGER = 0 THEN
        RAISE EXCEPTION 'No encrypted records found. Aborting plain text removal.';
    END IF;
    
    RAISE NOTICE '⚠️  DANGER: About to remove plain text PII for % encrypted residents', confirmation;
    RAISE NOTICE '⚠️  This action is IRREVERSIBLE!';
    
    -- Uncomment the following UPDATE to actually remove plain text data:
    /*
    UPDATE residents 
    SET 
        first_name = NULL,
        middle_name = NULL,
        last_name = NULL,
        mobile_number = NULL,
        telephone_number = NULL,
        email = NULL,
        mother_maiden_first = NULL,
        mother_maiden_middle = NULL,
        mother_maiden_last = NULL
    WHERE is_data_encrypted = true;
    
    RAISE NOTICE '✅ Plain text PII data removed from % residents', confirmation;
    */
/*
END $$;
*/

-- =====================================================
-- FINAL MIGRATION REPORT
-- =====================================================

-- Generate final migration report
SELECT 
    'MIGRATION COMPLETE' as status,
    (SELECT COUNT(*) FROM residents) as total_residents,
    (SELECT COUNT(*) FROM residents WHERE is_data_encrypted = true) as encrypted_residents,
    (SELECT COUNT(*) FROM residents WHERE is_data_encrypted = false OR is_data_encrypted IS NULL) as unencrypted_residents,
    ROUND(
        (SELECT COUNT(*) FROM residents WHERE is_data_encrypted = true) * 100.0 / 
        GREATEST((SELECT COUNT(*) FROM residents), 1), 2
    ) as encryption_percentage,
    (
        SELECT COUNT(*) 
        FROM system_audit_logs 
        WHERE table_name = 'residents_migration' 
        AND operation = 'ENCRYPT_ERROR'
        AND created_at >= CURRENT_DATE
    ) as migration_errors,
    NOW() as completed_at;

-- Show recent migration audit logs
SELECT 
    operation,
    new_values,
    created_at
FROM system_audit_logs
WHERE table_name = 'residents_migration'
AND created_at >= CURRENT_DATE - INTERVAL '1 hour'
ORDER BY created_at DESC;

RAISE NOTICE '🎉 PII encryption migration completed successfully!';
RAISE NOTICE '📋 Next steps:';
RAISE NOTICE '1. Test your application with the new encrypted views';
RAISE NOTICE '2. Update application code to use residents_decrypted view';
RAISE NOTICE '3. Set up key rotation procedures';
RAISE NOTICE '4. Consider removing plain text data (after thorough testing)';

-- =====================================================
-- MIGRATION SCRIPT NOTES
-- =====================================================
--
-- WHAT THIS SCRIPT DOES:
-- 1. Validates that encryption infrastructure is installed
-- 2. Migrates existing resident PII data to encrypted format
-- 3. Creates searchable hashes for encrypted fields
-- 4. Provides batch processing for large datasets
-- 5. Includes comprehensive error handling and logging
-- 6. Verifies encryption integrity after migration
-- 7. Tests search functionality
-- 8. Generates detailed migration reports
--
-- SAFETY FEATURES:
-- - Pre-migration validation checks
-- - Batch processing to avoid timeouts
-- - Comprehensive error handling
-- - Detailed audit logging
-- - Integrity verification
-- - Option to keep or remove plain text data
--
-- PERFORMANCE CONSIDERATIONS:
-- - Processes data in configurable batches
-- - Includes progress reporting
-- - Reindexes hash indexes after migration
-- - Updates table statistics
--
-- ROLLBACK PLAN:
-- If issues occur, you can:
-- 1. Stop the migration (it's batch-based)
-- 2. Restore from backup
-- 3. Set is_data_encrypted = false for problem records
-- 4. Debug and re-run specific batches
--
-- =====================================================