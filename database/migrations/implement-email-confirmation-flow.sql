-- IMPLEMENT EMAIL CONFIRMATION FLOW
-- Replace immediate profile creation with post-confirmation processing
-- Part of redesigned signup flow: account → email confirmation → profile → roles

-- Drop the existing trigger that creates profiles immediately
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new function that only processes confirmed users
CREATE OR REPLACE FUNCTION handle_user_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    v_barangay_admin_role_id UUID;
    v_barangay_code TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_phone TEXT;
    v_existing_admin_count INTEGER;
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
            -- Update metadata to indicate blocked status
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
        
        -- Create the user profile now that email is confirmed
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
        
        -- Update user metadata to indicate profile creation completed
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || '{"signup_step": "profile_created"}'::jsonb
        WHERE id = NEW.id;
        
        RAISE NOTICE 'Profile created for confirmed user % in barangay %', NEW.id, v_barangay_code;
        
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the confirmation
        RAISE WARNING 'Failed to process email confirmation for user %: %', NEW.id, SQLERRM;
        -- Update metadata to indicate error
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('signup_step', 'confirmation_error', 'error', SQLERRM)
        WHERE id = NEW.id;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS trigger_on_user_email_confirmed ON auth.users;
CREATE TRIGGER trigger_on_user_email_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
    EXECUTE FUNCTION handle_user_email_confirmation();

-- Update the old handle_new_user function to be a no-op for new signups
-- This prevents immediate profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- No longer create profiles immediately - wait for email confirmation
    RAISE NOTICE 'User % created, awaiting email confirmation before profile creation', NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep the trigger but it now does nothing except log
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();