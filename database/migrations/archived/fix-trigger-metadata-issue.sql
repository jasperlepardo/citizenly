-- Fix the trigger to check both raw_user_meta_data and user_metadata
-- Supabase stores metadata differently than expected

CREATE OR REPLACE FUNCTION handle_user_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    v_barangay_admin_role_id UUID;
    v_barangay_code TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_phone TEXT;
    v_existing_admin_count INTEGER;
    v_city_code VARCHAR(10);
    v_province_code VARCHAR(10);
    v_region_code VARCHAR(10);
    v_metadata JSONB;
BEGIN
    -- Only process when email_confirmed_at changes from NULL to a timestamp
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        
        -- Check both metadata locations (Supabase uses different fields)
        v_metadata := COALESCE(NEW.raw_user_meta_data, NEW.user_metadata);
        
        -- Extract signup data from metadata
        v_barangay_code := v_metadata->>'barangay_code';
        v_first_name := v_metadata->>'first_name';
        v_last_name := v_metadata->>'last_name';
        v_phone := v_metadata->>'phone';
        
        -- Debug log
        RAISE NOTICE 'Processing user % with metadata: %', NEW.id, v_metadata;
        RAISE NOTICE 'Extracted: barangay=%, first_name=%, last_name=%', v_barangay_code, v_first_name, v_last_name;
        
        -- Skip if no barangay data (not from our signup)
        IF v_barangay_code IS NULL OR v_first_name IS NULL THEN
            RAISE WARNING 'User % confirmed but missing signup metadata. barangay_code=%, first_name=%', NEW.id, v_barangay_code, v_first_name;
            RETURN NEW;
        END IF;
        
        -- Derive geographic hierarchy from barangay code
        SELECT 
            c.code,           -- city code
            p.code,           -- province code  
            r.code            -- region code
        INTO v_city_code, v_province_code, v_region_code
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        JOIN psgc_provinces p ON c.province_code = p.code
        JOIN psgc_regions r ON p.region_code = r.code
        WHERE b.code = v_barangay_code;
        
        RAISE NOTICE 'Geographic codes derived: city=%, province=%, region=%', v_city_code, v_province_code, v_region_code;
        
        -- Check if there's already an admin for this barangay
        SELECT COUNT(*) INTO v_existing_admin_count
        FROM auth_user_profiles aup
        JOIN auth_roles ar ON aup.role_id = ar.id
        WHERE aup.barangay_code = v_barangay_code
        AND ar.name = 'barangay_admin'
        AND aup.is_active = true;
        
        -- Block registration if admin already exists
        IF v_existing_admin_count > 0 THEN
            RAISE WARNING 'User % tried to register for barangay % but admin already exists', NEW.id, v_barangay_code;
            RETURN NEW;
        END IF;
        
        -- Get barangay admin role ID
        SELECT id INTO v_barangay_admin_role_id 
        FROM auth_roles 
        WHERE name = 'barangay_admin'
        LIMIT 1;
        
        -- Fallback to any admin role if needed
        IF v_barangay_admin_role_id IS NULL THEN
            SELECT id INTO v_barangay_admin_role_id 
            FROM auth_roles 
            WHERE name IN ('barangay_admin', 'super_admin')
            LIMIT 1;
        END IF;
        
        -- Create the user profile with complete geographic hierarchy
        INSERT INTO auth_user_profiles (
            id,
            email,
            first_name,
            last_name,
            phone,
            role_id,
            barangay_code,
            city_municipality_code,
            province_code,
            region_code,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            v_first_name,
            v_last_name,
            v_phone,
            v_barangay_admin_role_id,
            v_barangay_code,
            v_city_code,
            v_province_code,
            v_region_code,
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            role_id = EXCLUDED.role_id,
            barangay_code = EXCLUDED.barangay_code,
            city_municipality_code = EXCLUDED.city_municipality_code,
            province_code = EXCLUDED.province_code,
            region_code = EXCLUDED.region_code,
            is_active = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Profile created for user % with complete geographic hierarchy: barangay=%, city=%, province=%, region=%', 
            NEW.id, v_barangay_code, v_city_code, v_province_code, v_region_code;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_user_email_confirmation ON auth.users;
CREATE TRIGGER on_user_email_confirmation
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_email_confirmation();