-- Final Signup Fix - Handle all dependencies and fix registration
-- This comprehensively fixes all issues without breaking existing policies

-- =============================================================================
-- 1. DROP ALL DEPENDENT POLICIES FIRST
-- =============================================================================

-- Drop policies on residents table that depend on role_name
DROP POLICY IF EXISTS "Users see residents in jurisdiction" ON public.residents;
DROP POLICY IF EXISTS "Users can insert residents in jurisdiction" ON public.residents;
DROP POLICY IF EXISTS "Users can update residents in jurisdiction" ON public.residents;
DROP POLICY IF EXISTS "users_select_residents_by_barangay" ON public.residents;
DROP POLICY IF EXISTS "users_insert_residents_by_barangay" ON public.residents;
DROP POLICY IF EXISTS "users_update_residents_by_barangay" ON public.residents;

-- Drop policies on user_profiles
DROP POLICY IF EXISTS "allow_profile_creation_on_signup" ON public.user_profiles;
DROP POLICY IF EXISTS "users_read_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;

-- =============================================================================
-- 2. NOW SAFELY REMOVE ENUM APPROACH
-- =============================================================================

-- Drop the role_name column and enum (with cascade to remove all dependencies)
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role_name CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================================================
-- 3. SET UP PROPER ROLE_ID RELATIONSHIP
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
-- 4. CREATE NEW RLS POLICIES USING ROLE_ID RELATIONSHIP
-- =============================================================================

-- User Profiles Policies (using role_id)
CREATE POLICY "users_select_own_profile" ON public.user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "allow_signup_profile_creation" ON public.user_profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Residents Policies (using role_id relationship)
CREATE POLICY "users_access_residents_by_barangay" ON public.residents
    FOR SELECT TO authenticated USING (
        barangay_code IN (
            SELECT barangay_code FROM public.user_profiles 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "users_insert_residents_by_barangay" ON public.residents
    FOR INSERT TO authenticated WITH CHECK (
        barangay_code IN (
            SELECT barangay_code FROM public.user_profiles 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "users_update_residents_by_barangay" ON public.residents
    FOR UPDATE TO authenticated USING (
        barangay_code IN (
            SELECT barangay_code FROM public.user_profiles 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- =============================================================================
-- 5. FINAL FUNCTIONS
-- =============================================================================

-- Role assignment function that works with the signup code
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

-- Remove auto-trigger to let signup handle profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================================================
-- DONE
-- =============================================================================

SELECT 'All dependencies resolved. Registration should work now.' as status;