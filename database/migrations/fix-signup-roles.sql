-- Fix Signup Roles - Make signup code work with our database structure
-- This adds the missing role and function that the signup code expects

-- =============================================================================
-- 1. ADD MISSING ROLE NAME
-- =============================================================================

-- Add the 'resident' role that the signup code is looking for
INSERT INTO public.roles (name, permissions)
VALUES ('resident', '{"residents": ["read", "create", "update"]}')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 2. CREATE THE RPC FUNCTION THAT SIGNUP EXPECTS
-- =============================================================================

-- Create the role assignment function that the signup code calls
CREATE OR REPLACE FUNCTION assign_user_role_for_barangay(
    p_user_id UUID,
    p_barangay_code TEXT
) RETURNS UUID AS $$
DECLARE
    role_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Check if barangay already has an admin
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up 
        JOIN roles r ON r.name = 'barangay_admin'
        WHERE up.barangay_code = p_barangay_code 
        AND up.role_name = 'barangay_admin'
        AND up.is_active = true
    ) INTO admin_exists;
    
    -- Assign role based on whether admin exists
    IF admin_exists THEN
        -- Give regular resident role
        SELECT id INTO role_id FROM roles WHERE name = 'resident' LIMIT 1;
    ELSE
        -- Give admin role (first user becomes admin)
        SELECT id INTO role_id FROM roles WHERE name = 'barangay_admin' LIMIT 1;
    END IF;
    
    RETURN role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION assign_user_role_for_barangay(UUID, TEXT) TO authenticated;

-- =============================================================================
-- 3. FIX USER_PROFILES TABLE TO MATCH SIGNUP EXPECTATIONS
-- =============================================================================

-- Add role_id column to user_profiles (signup code expects this)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Update existing profiles to have role_id
UPDATE public.user_profiles 
SET role_id = r.id 
FROM public.roles r 
WHERE r.name = 'barangay_user' 
AND user_profiles.role_id IS NULL;

-- =============================================================================
-- TEST
-- =============================================================================

SELECT 'Signup roles and function created. Registration should work now.' as status;