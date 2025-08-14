-- FIX PROFILE CREATION FOR AUTO-CONFIRMED USERS
-- The existing trigger only works for UPDATE (NULL -> timestamp)
-- But auto-confirm sets email_confirmed_at on INSERT

-- Update the handle_new_user function to create profiles for auto-confirmed users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_barangay_admin_role_id UUID;
    v_barangay_code TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_phone TEXT;
    v_existing_admin_count INTEGER;
BEGIN
    -- Check if user is auto-confirmed (email_confirmed_at is set on insert)
    IF NEW.email_confirmed_at IS NOT NULL THEN
        -- Extract signup data from user metadata
        v_barangay_code := NEW.raw_user_meta_data->>'barangay_code';
        v_first_name := NEW.raw_user_meta_data->>'first_name';
        v_last_name := NEW.raw_user_meta_data->>'last_name';
        v_phone := NEW.raw_user_meta_data->>'phone';
        
        -- Skip if no barangay data (not from our signup)
        IF v_barangay_code IS NULL OR v_first_name IS NULL THEN
            RAISE NOTICE 'User % auto-confirmed but missing signup metadata', NEW.id;
            RETURN NEW;
        END IF;
        
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
        
        -- Create the user profile for auto-confirmed user
        INSERT INTO auth_user_profiles (
            id,
            email,
            first_name,
            last_name,
            phone,
            role_id,
            barangay_code,
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
            is_active = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Profile created for auto-confirmed user % in barangay %', NEW.id, v_barangay_code;
    ELSE
        -- User not confirmed yet, wait for email confirmation
        RAISE NOTICE 'User % created, awaiting email confirmation before profile creation', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();