
CREATE OR REPLACE FUNCTION handle_user_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    v_barangay_admin_role_id UUID;
    v_barangay_code TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_phone TEXT;
    v_existing_admin_count INTEGER;
    -- Add variables for geographic codes
    v_city_code VARCHAR(10);
    v_province_code VARCHAR(10);
    v_region_code VARCHAR(10);
BEGIN
    -- Only process when email_confirmed_at changes from NULL to a timestamp
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        
        -- Extract signup data from user metadata
        v_barangay_code := NEW.raw_user_meta_data->>'barangay_code';
        v_first_name := NEW.raw_user_meta_data->>'first_name';
        v_last_name := NEW.raw_user_meta_data->>'last_name';
        v_phone := NEW.raw_user_meta_data->>'phone';
        
        -- Skip if no barangay data (not from our signup)
        IF v_barangay_code IS NULL OR v_first_name IS NULL THEN
            RAISE WARNING 'User % confirmed but missing signup metadata', NEW.id;
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
            UPDATE auth.users 
            SET raw_user_meta_data = raw_user_meta_data || '{"signup_step": "blocked_admin_exists"}'::jsonb
            WHERE id = NEW.id;
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
            city_municipality_code,    -- FIXED: Add city code
            province_code,             -- FIXED: Add province code
            region_code,               -- FIXED: Add region code
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
            v_city_code,               -- FIXED: Use derived city code
            v_province_code,           -- FIXED: Use derived province code
            v_region_code,             -- FIXED: Use derived region code
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
            city_municipality_code = EXCLUDED.city_municipality_code,   -- FIXED: Update city code
            province_code = EXCLUDED.province_code,                     -- FIXED: Update province code
            region_code = EXCLUDED.region_code,                         -- FIXED: Update region code
            is_active = true,
            updated_at = NOW();
        
        -- Update user metadata to indicate profile creation success
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || '{"signup_step": "profile_created"}'::jsonb
        WHERE id = NEW.id;
        
        RAISE NOTICE 'Profile created for user % with complete geographic hierarchy: barangay=%, city=%, province=%, region=%', 
            NEW.id, v_barangay_code, v_city_code, v_province_code, v_region_code;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;