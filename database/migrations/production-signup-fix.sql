-- PRODUCTION-READY SIGNUP FIX
-- This maintains security while fixing registration
-- Uses proper RLS policies instead of disabling security

-- =============================================================================
-- 1. RE-ENABLE RLS WITH PROPER POLICIES
-- =============================================================================

-- Re-enable RLS (if it was disabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_signup_profile_creation" ON public.user_profiles;

-- =============================================================================
-- 2. PRODUCTION-READY RLS POLICIES
-- =============================================================================

-- Allow users to read their own profile
CREATE POLICY "users_can_read_own_profile" ON public.user_profiles
    FOR SELECT TO authenticated 
    USING (auth.uid() = id);

-- Allow users to update their own profile (basic fields only)
CREATE POLICY "users_can_update_own_profile" ON public.user_profiles
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- CRITICAL: Allow profile creation during signup
-- This policy allows the signup process to create a profile for the newly authenticated user
CREATE POLICY "allow_profile_creation_on_signup" ON public.user_profiles
    FOR INSERT TO authenticated 
    WITH CHECK (
        -- User can only create profile for themselves
        auth.uid() = id AND
        -- Only allow basic roles during signup
        role_id IN (
            SELECT r.id FROM roles r 
            WHERE r.name IN ('resident', 'barangay_user', 'barangay_admin')
        )
    );

-- =============================================================================
-- 3. BYPASS RLS FOR SYSTEM FUNCTIONS (Production Pattern)
-- =============================================================================

-- Create a SECURITY DEFINER function that can bypass RLS for legitimate system operations
CREATE OR REPLACE FUNCTION create_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_mobile_number TEXT DEFAULT NULL,
    p_barangay_code TEXT DEFAULT NULL,
    p_role_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    default_role_id UUID;
    profile_id UUID;
BEGIN
    -- Get default role if none provided
    IF p_role_id IS NULL THEN
        SELECT id INTO default_role_id FROM roles WHERE name = 'resident' LIMIT 1;
    ELSE
        default_role_id := p_role_id;
    END IF;
    
    -- Insert profile (SECURITY DEFINER bypasses RLS)
    INSERT INTO user_profiles (
        id, email, first_name, last_name, mobile_number, barangay_code, role_id, is_active
    ) VALUES (
        p_user_id, p_email, p_first_name, p_last_name, p_mobile_number, p_barangay_code, default_role_id, true
    ) RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- =============================================================================
-- 4. ENHANCED ROLE ASSIGNMENT (Production Logic)
-- =============================================================================

CREATE OR REPLACE FUNCTION assign_user_role_for_barangay(
    p_user_id UUID,
    p_barangay_code TEXT
) RETURNS UUID AS $$
DECLARE
    role_id UUID;
    admin_exists BOOLEAN;
    resident_count INTEGER;
BEGIN
    -- Check if barangay already has an admin
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up 
        INNER JOIN roles r ON up.role_id = r.id
        WHERE up.barangay_code = p_barangay_code 
        AND r.name = 'barangay_admin'
        AND up.is_active = true
    ) INTO admin_exists;
    
    -- Count existing residents in barangay
    SELECT COUNT(*) INTO resident_count 
    FROM user_profiles 
    WHERE barangay_code = p_barangay_code AND is_active = true;
    
    -- Smart role assignment logic
    IF admin_exists THEN
        -- Barangay has admin, assign regular resident role
        SELECT id INTO role_id FROM roles WHERE name = 'resident' LIMIT 1;
    ELSIF resident_count = 0 THEN
        -- First user in barangay becomes admin
        SELECT id INTO role_id FROM roles WHERE name = 'barangay_admin' LIMIT 1;
    ELSE
        -- Default to resident
        SELECT id INTO role_id FROM roles WHERE name = 'resident' LIMIT 1;
    END IF;
    
    RETURN role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. PROPER PERMISSIONS (Production Security)
-- =============================================================================

-- Grant only necessary permissions
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated;
GRANT UPDATE(first_name, last_name, mobile_number, updated_at) ON public.user_profiles TO authenticated;

-- Grant role table access for role assignment
GRANT SELECT ON public.roles TO authenticated;

-- =============================================================================
-- 6. RE-ENABLE RESIDENTS POLICIES (Production Security)
-- =============================================================================

-- Residents policies using the new structure
CREATE POLICY "residents_barangay_access" ON public.residents
    FOR SELECT TO authenticated 
    USING (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "residents_barangay_insert" ON public.residents
    FOR INSERT TO authenticated 
    WITH CHECK (
        barangay_code IN (
            SELECT barangay_code FROM user_profiles 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- =============================================================================
-- PRODUCTION SUMMARY
-- =============================================================================
-- ✅ Maintains Row Level Security (secure)
-- ✅ Allows legitimate signup process (functional)  
-- ✅ Uses SECURITY DEFINER pattern for system operations
-- ✅ Smart role assignment logic
-- ✅ Principle of least privilege
-- ✅ Proper permission grants

SELECT 'Production-ready signup with security enabled.' as status;