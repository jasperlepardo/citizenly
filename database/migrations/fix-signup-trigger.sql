-- Fix signup trigger to work with unconfirmed users
-- The trigger should create profiles for users regardless of confirmation status

-- First, let's create a robust trigger function that handles all cases
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_default_role_id UUID;
    v_profile_exists BOOLEAN := FALSE;
BEGIN
    -- Log the trigger execution for debugging
    RAISE LOG 'handle_new_user_signup triggered for user: %', NEW.id;
    
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM auth_user_profiles WHERE id = NEW.id) INTO v_profile_exists;
    
    IF v_profile_exists THEN
        RAISE LOG 'Profile already exists for user: %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Get the default role (barangay_admin since only admins can register)
    SELECT id INTO v_default_role_id 
    FROM auth_roles 
    WHERE name = 'barangay_admin'
    LIMIT 1;
    
    -- If no default role exists, get any admin role as fallback
    IF v_default_role_id IS NULL THEN
        SELECT id INTO v_default_role_id 
        FROM auth_roles 
        WHERE name IN ('barangay_admin', 'super_admin')
        LIMIT 1;
    END IF;
    
    -- If still no role found, log error but don't fail
    IF v_default_role_id IS NULL THEN
        RAISE WARNING 'No admin role found for user profile creation: %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Insert the user profile
    -- Use ON CONFLICT DO UPDATE to handle any race conditions
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
        COALESCE(NEW.email, 'unknown@example.com'),
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.email, 'unknown'), '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        NEW.raw_user_meta_data->>'phone',
        v_default_role_id,
        NEW.raw_user_meta_data->>'barangay_code',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error with full context but don't fail the signup
        RAISE WARNING 'Failed to create user profile for %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger that fires on INSERT
-- This will work for both confirmed and unconfirmed users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_signup();

-- Create a helper function to manually trigger profile creation for existing users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS TABLE(user_id UUID, status TEXT) AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    profile_count INT;
BEGIN
    -- Process all users without profiles
    FOR user_record IN 
        SELECT u.* FROM auth.users u 
        LEFT JOIN auth_user_profiles p ON u.id = p.id 
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Call the trigger function logic manually
            INSERT INTO auth_user_profiles (
                id, email, first_name, last_name, role_id, is_active, created_at, updated_at
            )
            SELECT 
                user_record.id,
                COALESCE(user_record.email, 'unknown@example.com'),
                COALESCE(user_record.raw_user_meta_data->>'first_name', split_part(COALESCE(user_record.email, 'unknown'), '@', 1)),
                COALESCE(user_record.raw_user_meta_data->>'last_name', 'User'),
                (SELECT id FROM auth_roles WHERE name = 'barangay_admin' LIMIT 1),
                true,
                NOW(),
                NOW()
            WHERE NOT EXISTS (SELECT 1 FROM auth_user_profiles WHERE id = user_record.id);
            
            user_id := user_record.id;
            status := 'created';
            RETURN NEXT;
            
        EXCEPTION WHEN others THEN
            user_id := user_record.id;
            status := 'failed: ' || SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix for existing users
SELECT * FROM create_missing_profiles();