-- Fix auto_populate_resident_full_name function to only use encrypted fields
-- This resolves the error: record "new" has no field "first_name"

CREATE OR REPLACE FUNCTION auto_populate_resident_full_name()
RETURNS TRIGGER AS $$
DECLARE
    first_name_text TEXT;
    middle_name_text TEXT;  
    last_name_text TEXT;
    full_name_text TEXT;
BEGIN
    -- Only use encrypted fields since the table doesn't have plain text name fields
    first_name_text := CASE 
        WHEN NEW.first_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.first_name_encrypted)
        ELSE NULL
    END;
    
    middle_name_text := CASE 
        WHEN NEW.middle_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.middle_name_encrypted)  
        ELSE NULL
    END;
    
    last_name_text := CASE 
        WHEN NEW.last_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.last_name_encrypted)
        ELSE NULL
    END;
    
    -- Build full name from decrypted components
    full_name_text := TRIM(COALESCE(first_name_text, ''));
    
    IF middle_name_text IS NOT NULL AND TRIM(middle_name_text) != '' THEN
        full_name_text := full_name_text || ' ' || TRIM(middle_name_text);
    END IF;
    
    IF last_name_text IS NOT NULL AND TRIM(last_name_text) != '' THEN
        full_name_text := full_name_text || ' ' || TRIM(last_name_text);
    END IF;
    
    -- Encrypt the full name and store it
    NEW.name_encrypted := encrypt_pii(full_name_text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also fix the household name update trigger function
CREATE OR REPLACE FUNCTION update_household_name_on_resident_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Detect household head changes or head's name modifications
    IF (NEW.relationship_to_head = 'head' OR OLD.relationship_to_head = 'head') 
       AND (NEW.last_name_encrypted IS DISTINCT FROM OLD.last_name_encrypted) THEN
        
        -- Update household name using current head's last name
        UPDATE households 
        SET name = (
            SELECT TRIM(decrypt_pii(r.last_name_encrypted))
            FROM residents r 
            WHERE r.household_code = NEW.household_code 
              AND r.relationship_to_head = 'head' 
              AND r.last_name_encrypted IS NOT NULL
            LIMIT 1
        )
        WHERE code = NEW.household_code;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;