-- Setup Basic Roles for User Registration
-- This creates the necessary roles that the registration system expects

-- =============================================================================
-- 1. CREATE BASIC ROLES (if they don't exist)
-- =============================================================================

-- Check if we have a roles table (might be different name)
-- Create basic roles for the system

-- If using auth_roles table
INSERT INTO public.auth_roles (id, role_name, access_level, permissions, created_at)
VALUES 
    (gen_random_uuid(), 'barangay_user', 1, '{"residents": ["read", "create", "update"], "households": ["read", "create", "update"]}', NOW()),
    (gen_random_uuid(), 'barangay_admin', 2, '{"residents": ["read", "create", "update", "delete"], "households": ["read", "create", "update", "delete"], "users": ["read"]}', NOW()),
    (gen_random_uuid(), 'city_admin', 3, '{"residents": ["read", "create", "update", "delete"], "households": ["read", "create", "update", "delete"], "users": ["read", "create", "update"]}', NOW()),
    (gen_random_uuid(), 'super_admin', 5, '{"all": ["read", "create", "update", "delete"]}', NOW())
ON CONFLICT (role_name) DO NOTHING;

-- =============================================================================
-- 2. ALTERNATIVE: Create roles table if it doesn't exist
-- =============================================================================

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert basic roles
INSERT INTO public.roles (name, permissions)
VALUES 
    ('barangay_user', '{"residents": ["read", "create", "update"], "households": ["read", "create", "update"]}'),
    ('barangay_admin', '{"residents": ["read", "create", "update", "delete"], "households": ["read", "create", "update", "delete"], "users": ["read"]}'),
    ('city_admin', '{"residents": ["read", "create", "update", "delete"], "households": ["read", "create", "update", "delete"], "users": ["read", "create", "update"]}'),
    ('super_admin', '{"all": ["read", "create", "update", "delete"]}')
ON CONFLICT (name) DO NOTHING;

-- Grant access to roles table
GRANT SELECT ON public.roles TO authenticated;

-- =============================================================================
-- 3. FIX USER PROFILE CREATION (remove role dependency)
-- =============================================================================

-- Update the user profile creation function to not depend on roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        role_name,
        barangay_code,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        'barangay_user'::user_role,
        NEW.raw_user_meta_data->>'barangay_code',
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- REGISTRATION SHOULD NOW WORK
-- =============================================================================

-- Test that we have roles
DO $$
DECLARE
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM public.roles;
    RAISE NOTICE 'Created % basic roles for the system', role_count;
    
    IF role_count > 0 THEN
        RAISE NOTICE 'User registration should now work properly';
    END IF;
END $$;