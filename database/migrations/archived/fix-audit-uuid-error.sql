-- Fix "record_id is of type uuid but expression is of type text" error
-- The system_audit_logs table expects UUID but households uses VARCHAR(50) code

BEGIN;

-- Option 1: Modify the audit logs table to use TEXT instead of UUID for record_id
-- This is the most flexible solution since different tables have different PK types

ALTER TABLE system_audit_logs ALTER COLUMN record_id TYPE TEXT;

-- Update the audit trigger function to work with TEXT record_id
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    record_pk TEXT;
    user_barangay_code VARCHAR(10);
    user_city_code VARCHAR(10);
    user_province_code VARCHAR(10);
    user_region_code VARCHAR(10);
BEGIN
    -- Determine the primary key value based on table name
    CASE TG_TABLE_NAME
        WHEN 'households' THEN 
            record_pk := COALESCE(NEW.code, OLD.code);
        ELSE 
            record_pk := COALESCE(NEW.id::TEXT, OLD.id::TEXT);
    END CASE;

    -- Get user's geographic context for audit isolation
    SELECT 
        barangay_code,
        city_municipality_code,
        province_code,
        region_code
    INTO 
        user_barangay_code,
        user_city_code,
        user_province_code,
        user_region_code
    FROM auth_user_profiles 
    WHERE id = auth.uid();

    INSERT INTO system_audit_logs (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        user_id,
        barangay_code,
        city_municipality_code,
        province_code,
        region_code,
        ip_address,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        record_pk,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid(),
        COALESCE(
            CASE TG_TABLE_NAME
                WHEN 'households' THEN COALESCE(NEW.barangay_code, OLD.barangay_code)
                ELSE COALESCE(NEW.barangay_code, OLD.barangay_code)
            END,
            user_barangay_code
        ),
        COALESCE(
            CASE TG_TABLE_NAME
                WHEN 'households' THEN COALESCE(NEW.city_municipality_code, OLD.city_municipality_code)
                ELSE COALESCE(NEW.city_municipality_code, OLD.city_municipality_code)
            END,
            user_city_code
        ),
        COALESCE(
            CASE TG_TABLE_NAME
                WHEN 'households' THEN COALESCE(NEW.province_code, OLD.province_code)
                ELSE COALESCE(NEW.province_code, OLD.province_code)
            END,
            user_province_code
        ),
        COALESCE(
            CASE TG_TABLE_NAME
                WHEN 'households' THEN COALESCE(NEW.region_code, OLD.region_code)
                ELSE COALESCE(NEW.region_code, OLD.region_code)
            END,
            user_region_code
        ),
        inet_client_addr(),
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Verify the fix
SELECT 'Audit log UUID fix completed successfully!' as status;

-- Check the updated column type
SELECT 
    column_name, 
    data_type, 
    character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'system_audit_logs' 
AND column_name = 'record_id';