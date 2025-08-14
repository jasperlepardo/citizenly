-- Fix Duplicate Profile Creation
-- Handles the case where both trigger and signup code try to create profiles

-- =============================================================================
-- 1. DISABLE THE TRIGGER (Let signup handle it)
-- =============================================================================

-- Since signup code is working now, disable the trigger to prevent duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================================================
-- 2. MAKE PROFILE CREATION IDEMPOTENT
-- =============================================================================

-- Update the system function to handle existing profiles gracefully
CREATE OR REPLACE FUNCTION public.create_user_profile_system(
    user_id UUID,
    user_email TEXT,
    first_name TEXT,
    last_name TEXT,
    mobile_number TEXT DEFAULT NULL,
    barangay_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    assigned_role_id UUID;
    profile_id UUID;
    existing_profile UUID;
BEGIN
    -- Check if profile already exists
    SELECT id INTO existing_profile 
    FROM public.user_profiles 
    WHERE id = user_id;
    
    -- If profile exists, just return it
    IF existing_profile IS NOT NULL THEN
        RETURN existing_profile;
    END IF;
    
    -- Get the appropriate role
    SELECT assign_user_role_for_barangay(user_id, barangay_code) INTO assigned_role_id;
    
    -- Create the profile
    INSERT INTO public.user_profiles (
        id,
        email, 
        first_name,
        last_name,
        mobile_number,
        barangay_code,
        role_id,
        is_active,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        first_name,
        last_name,
        mobile_number,
        barangay_code,
        assigned_role_id,
        true,
        false,
        NOW(),
        NOW()
    ) 
    ON CONFLICT (id) DO UPDATE SET
        -- Update with latest info if there was a race condition
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        mobile_number = EXCLUDED.mobile_number,
        barangay_code = EXCLUDED.barangay_code,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Profile creation failed for user %: %', user_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. ALSO MAKE THE SIGNUP CODE MORE ROBUST
-- =============================================================================

-- Alternative approach: Use UPSERT in the signup code
-- This function handles the INSERT with conflict resolution
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
    profile_id UUID,
    profile_email TEXT,
    profile_first_name TEXT,
    profile_last_name TEXT,
    profile_mobile_number TEXT,
    profile_barangay_code TEXT,
    profile_role_id UUID
) RETURNS UUID AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, email, first_name, last_name, mobile_number, barangay_code, role_id, is_active
    ) VALUES (
        profile_id, profile_email, profile_first_name, profile_last_name, 
        profile_mobile_number, profile_barangay_code, profile_role_id, true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        mobile_number = EXCLUDED.mobile_number,
        barangay_code = EXCLUDED.barangay_code,
        role_id = EXCLUDED.role_id,
        updated_at = NOW();
        
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.upsert_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- =============================================================================
-- FINAL STATUS
-- =============================================================================

SELECT 'Duplicate profile creation fixed. Registration should work cleanly now.' as status;