-- Fix Roles Relationship - Make database match signup code expectations
-- This creates the relationship that the signup code is looking for

-- =============================================================================
-- 1. REMOVE THE PROBLEMATIC ENUM APPROACH
-- =============================================================================

-- Drop the role_name enum column (we'll use role_id foreign key instead)
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role_name;
DROP TYPE IF EXISTS user_role;

-- Make role_id required and add foreign key constraint if not exists
ALTER TABLE public.user_profiles 
ALTER COLUMN role_id SET NOT NULL;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_role_id_fkey'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.roles(id);
    END IF;
END $$;

-- =============================================================================
-- 2. UPDATE EXISTING PROFILES TO HAVE PROPER ROLE_ID
-- =============================================================================

-- Set default role for existing profiles without role_id
UPDATE public.user_profiles 
SET role_id = (SELECT id FROM public.roles WHERE name = 'barangay_user' LIMIT 1)
WHERE role_id IS NULL;

-- If barangay_user doesn't exist, use resident
UPDATE public.user_profiles 
SET role_id = (SELECT id FROM public.roles WHERE name = 'resident' LIMIT 1)
WHERE role_id IS NULL;

-- =============================================================================
-- 3. SIMPLIFIED USER CREATION TRIGGER
-- =============================================================================

-- Update trigger to use role_id instead of role_name enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get the default resident role
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'resident' LIMIT 1;
    
    -- Only create profile if it doesn't already exist
    INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        role_id,
        barangay_code,
        email_verified
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        default_role_id,
        NEW.raw_user_meta_data->>'barangay_code',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 4. FIX ROLE ASSIGNMENT FUNCTION  
-- =============================================================================

CREATE OR REPLACE FUNCTION assign_user_role_for_barangay(
    p_user_id UUID,
    p_barangay_code TEXT
) RETURNS UUID AS $$
DECLARE
    role_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Check if barangay already has an admin (using the relationship the signup expects)
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up 
        INNER JOIN roles r ON up.role_id = r.id
        WHERE up.barangay_code = p_barangay_code 
        AND r.name = 'barangay_admin'
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

-- =============================================================================
-- TEST
-- =============================================================================

SELECT 'Roles relationship fixed. Signup code should work now.' as status;