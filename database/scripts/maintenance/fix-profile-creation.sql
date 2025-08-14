-- Fix Profile Creation - Allow signup to create user profiles
-- This fixes the RLS policy conflict during registration

-- =============================================================================
-- 1. ALLOW PROFILE CREATION DURING SIGNUP
-- =============================================================================

-- Add policy to allow users to create their own profile during signup
CREATE POLICY "allow_profile_creation_on_signup" ON public.user_profiles
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

-- Also allow the trigger function to insert profiles
GRANT INSERT ON public.user_profiles TO authenticated;

-- =============================================================================
-- 2. PREVENT DUPLICATE PROFILES (handle trigger vs manual insert conflict)
-- =============================================================================

-- Modify the trigger to handle the case where profile might already exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if it doesn't already exist
    INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        role_name,
        barangay_code,
        email_verified
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        'barangay_user'::user_role,
        NEW.raw_user_meta_data->>'barangay_code',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent duplicate if signup code already created it
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. ALTERNATIVE: DISABLE TRIGGER DURING SIGNUP
-- =============================================================================

-- If conflicts persist, we can temporarily disable the auto-trigger
-- and let the signup code handle everything
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================================================
-- 4. FIX ROLE ASSIGNMENT FUNCTION
-- =============================================================================

-- Update the role assignment function to handle role_name enum properly
CREATE OR REPLACE FUNCTION assign_user_role_for_barangay(
    p_user_id UUID,
    p_barangay_code TEXT
) RETURNS UUID AS $$
DECLARE
    role_id UUID;
    admin_exists BOOLEAN;
    assigned_role_name TEXT;
BEGIN
    -- Check if barangay already has an admin
    SELECT EXISTS(
        SELECT 1 FROM user_profiles 
        WHERE barangay_code = p_barangay_code 
        AND role_name = 'barangay_admin'
        AND is_active = true
    ) INTO admin_exists;
    
    -- Assign role based on whether admin exists
    IF admin_exists THEN
        -- Give regular resident role
        assigned_role_name := 'resident';
        SELECT id INTO role_id FROM roles WHERE name = 'resident' LIMIT 1;
    ELSE
        -- Give admin role (first user becomes admin)
        assigned_role_name := 'barangay_admin';
        SELECT id INTO role_id FROM roles WHERE name = 'barangay_admin' LIMIT 1;
    END IF;
    
    -- Update the user's role_name enum as well
    UPDATE user_profiles 
    SET role_name = assigned_role_name::user_role,
        role_id = role_id
    WHERE id = p_user_id;
    
    RETURN role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TEST
-- =============================================================================

SELECT 'Profile creation policies fixed. Registration should work now.' as status;