-- Fix the auto_populate_resident_full_name trigger function
-- The function was trying to access non-existent fields like NEW.first_name
-- when only encrypted fields exist (first_name_encrypted)

CREATE OR REPLACE FUNCTION auto_populate_resident_full_name()
RETURNS TRIGGER AS $$
DECLARE
    first_name_text TEXT;
    middle_name_text TEXT;  
    last_name_text TEXT;
    full_name_text TEXT;
BEGIN
    -- Get first name (only encrypted field exists)
    first_name_text := CASE 
        WHEN NEW.first_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.first_name_encrypted)
        ELSE NULL
    END;
    
    -- Get middle name (only encrypted field exists)
    middle_name_text := CASE 
        WHEN NEW.middle_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.middle_name_encrypted)  
        ELSE NULL
    END;
    
    -- Get last name (only encrypted field exists)
    last_name_text := CASE 
        WHEN NEW.last_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.last_name_encrypted)
        ELSE NULL
    END;
    
    -- Build full name
    full_name_text := TRIM(CONCAT_WS(' ', 
        first_name_text,
        middle_name_text,
        last_name_text
    ));
    
    -- Set the full name (encrypted)
    IF full_name_text IS NOT NULL AND full_name_text != '' THEN
        NEW.full_name_encrypted := encrypt_pii(full_name_text);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;