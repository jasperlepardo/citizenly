-- Clean Roles Fix - Handle existing policies and fix relationship
-- This safely updates the database structure

-- =============================================================================
-- 1. DROP EXISTING POLICIES TO AVOID CONFLICTS
-- =============================================================================

DROP POLICY IF EXISTS "allow_profile_creation_on_signup" ON public.user_profiles;
DROP POLICY IF EXISTS "users_read_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;

-- =============================================================================
-- 2. REMOVE ENUM APPROACH (if it exists)
-- =============================================================================

-- Drop the role_name enum column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'role_name') THEN
        ALTER TABLE public.user_profiles DROP COLUMN role_name;
    END IF;
END $$;

-- Drop the enum type if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================================================
-- 3. ENSURE ROLE_ID COLUMN EXISTS AND IS PROPERLY CONFIGURED
-- =============================================================================

-- Ensure role_id column exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_role_id_fkey'
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.roles(id);
    END IF;
END $$;

-- Update existing profiles to have proper role_id
UPDATE public.user_profiles 
SET role_id = (SELECT id FROM public.roles WHERE name = 'resident' LIMIT 1)
WHERE role_id IS NULL;

-- Make role_id required
ALTER TABLE public.user_profiles 
ALTER COLUMN role_id SET NOT NULL;

-- =============================================================================
-- 4. CREATE SIMPLE RLS POLICIES
-- =============================================================================

-- Allow users to read their own profile
CREATE POLICY "users_select_own_profile" ON public.user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON public.user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "allow_signup_profile_creation" ON public.user_profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 5. SIMPLIFIED FUNCTIONS
-- =============================================================================

-- Fixed role assignment function
CREATE OR REPLACE FUNCTION assign_user_role_for_barangay(
    p_user_id UUID,
    p_barangay_code TEXT
) RETURNS UUID AS $$
DECLARE
    role_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Check if barangay already has an admin using proper relationship
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up 
        INNER JOIN roles r ON up.role_id = r.id
        WHERE up.barangay_code = p_barangay_code 
        AND r.name = 'barangay_admin'
        AND up.is_active = true
    ) INTO admin_exists;
    
    -- Assign role based on whether admin exists
    IF admin_exists THEN
        SELECT id INTO role_id FROM roles WHERE name = 'resident' LIMIT 1;
    ELSE
        SELECT id INTO role_id FROM roles WHERE name = 'barangay_admin' LIMIT 1;
    END IF;
    
    RETURN role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simplified user creation trigger (let signup handle it)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================================================
-- TEST
-- =============================================================================

SELECT 'Database structure fixed for signup compatibility.' as status;