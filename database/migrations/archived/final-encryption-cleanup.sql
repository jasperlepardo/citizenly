-- FINAL ENCRYPTION CLEANUP - Remove remaining encryption functions
-- This targets the specific functions that are still referencing encrypted columns

BEGIN;

-- Drop the remaining encryption-related function
DROP FUNCTION IF EXISTS get_active_encryption_key CASCADE;
DROP FUNCTION IF EXISTS get_active_encryption_key() CASCADE;

-- Also drop any other encryption key functions that might exist
DROP FUNCTION IF EXISTS get_encryption_key_by_version CASCADE;
DROP FUNCTION IF EXISTS get_encryption_key_by_version(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS init_encryption_system CASCADE;
DROP FUNCTION IF EXISTS init_encryption_system() CASCADE;

-- Check if the functions that reference last_name are trying to access encrypted columns
-- Let's examine and potentially recreate them without encryption references

-- First, let's see what the problematic functions are doing
DO $$
DECLARE
    func_def TEXT;
BEGIN
    -- Check auto_populate_name function
    SELECT pg_get_functiondef(p.oid) INTO func_def
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'auto_populate_name';
    
    IF func_def ILIKE '%encrypted%' THEN
        RAISE NOTICE 'auto_populate_name function references encrypted columns - will be recreated';
        DROP FUNCTION IF EXISTS auto_populate_name CASCADE;
    END IF;
    
    -- Check update_name_on_resident_change function  
    SELECT pg_get_functiondef(p.oid) INTO func_def
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'update_name_on_resident_change';
    
    IF func_def ILIKE '%encrypted%' THEN
        RAISE NOTICE 'update_name_on_resident_change function references encrypted columns - will be recreated';
        DROP FUNCTION IF EXISTS update_name_on_resident_change CASCADE;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error checking functions: %', SQLERRM;
END
$$;

-- Recreate auto_populate_name function without encryption references (if it was dropped)
CREATE OR REPLACE FUNCTION auto_populate_name()
RETURNS TRIGGER AS $$
DECLARE
    head_last_name VARCHAR(100);
BEGIN
    SELECT 
        last_name
    INTO head_last_name
    FROM residents 
    WHERE household_code = NEW.code 
    AND relationship_to_head = 'head' 
    AND is_active = true
    LIMIT 1;
    
    IF head_last_name IS NOT NULL AND TRIM(head_last_name) != '' THEN
        NEW.name := TRIM(head_last_name) || ' Residence';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate update_name_on_resident_change function without encryption references (if it was dropped)
CREATE OR REPLACE FUNCTION update_name_on_resident_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Detect household head changes or head's last name modifications
    IF (NEW.relationship_to_head = 'head' OR OLD.relationship_to_head = 'head') 
       AND (NEW.last_name IS DISTINCT FROM OLD.last_name) THEN
        
        -- Update household name using current head's last name
        UPDATE households 
        SET name = (
            SELECT TRIM(r.last_name) || ' Residence'
            FROM residents r
            WHERE r.household_code = NEW.household_code
            AND r.relationship_to_head = 'head'
            AND r.is_active = true
            LIMIT 1
        )
        WHERE code = NEW.household_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Verify the cleanup
SELECT 'Final encryption cleanup completed!' as status;

-- Check if any functions still reference encrypted columns
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_definition ILIKE '%encrypted%' THEN 'STILL HAS ENCRYPTION REFERENCES'
        ELSE 'Clean'
    END as encryption_status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('auto_populate_name', 'update_name_on_resident_change', 'get_active_encryption_key')
ORDER BY routine_name;