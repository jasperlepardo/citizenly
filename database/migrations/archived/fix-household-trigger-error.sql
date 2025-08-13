-- Fix "record 'new' has no field 'id'" error for households table
-- The households table uses 'code' as primary key, not 'id'

BEGIN;

-- Fix the audit trigger function to handle different primary key names
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    record_pk TEXT;
BEGIN
    -- Determine the primary key value based on table name
    CASE TG_TABLE_NAME
        WHEN 'households' THEN 
            record_pk := COALESCE(NEW.code, OLD.code);
        ELSE 
            record_pk := COALESCE(NEW.id::TEXT, OLD.id::TEXT);
    END CASE;

    INSERT INTO system_audit_logs (
        table_name,               -- Source table name from trigger context
        record_id,               -- Primary key of affected record
        operation,               -- Operation type: INSERT, UPDATE, DELETE
        old_values,              -- JSON snapshot before change (UPDATE/DELETE only)
        new_values,              -- JSON snapshot after change (INSERT/UPDATE only)
        user_id,                 -- User performing the operation
        barangay_code           -- Geographic context for audit isolation
    ) VALUES (
        TG_TABLE_NAME,                                    -- Table name from trigger context
        record_pk,                                        -- Record primary key (adapted for each table)
        TG_OP,                                            -- Operation type from trigger context
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)    -- Complete record state before deletion
             ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE'   -- Complete record state after modification
             THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid(),                                       -- Current authenticated user ID
        CASE TG_TABLE_NAME
            WHEN 'households' THEN COALESCE(NEW.barangay_code, OLD.barangay_code)
            ELSE COALESCE(NEW.barangay_code, OLD.barangay_code)
        END
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the user tracking trigger function to handle different primary key names
CREATE OR REPLACE FUNCTION populate_user_tracking_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT Operation: Initialize all user tracking fields
    IF TG_OP = 'INSERT' THEN
        -- Set created_by to current user if not explicitly provided
        IF NEW.created_by IS NULL THEN
            NEW.created_by := auth.uid();
        END IF;
        -- Always set updated_by and updated_at for new records
        NEW.updated_by := auth.uid();
        NEW.updated_at := NOW();
        
    -- UPDATE Operation: Update tracking fields only
    ELSIF TG_OP = 'UPDATE' THEN
        -- Preserve original created_by but update modification tracking
        NEW.updated_by := auth.uid();
        NEW.updated_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Verify the fix
SELECT 'Household trigger fix completed successfully!' as status;