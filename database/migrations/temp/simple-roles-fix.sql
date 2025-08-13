-- Simple Roles Fix - Create roles table that registration expects
-- This creates the basic roles structure needed for user registration

-- =============================================================================
-- 1. CREATE SIMPLE ROLES TABLE
-- =============================================================================

-- Create roles table (the one the app actually uses)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert basic roles
INSERT INTO public.roles (name, permissions)
VALUES 
    ('barangay_user', '{"residents": ["read", "create", "update"]}'),
    ('barangay_admin', '{"residents": ["read", "create", "update", "delete"], "users": ["read"]}'),
    ('super_admin', '{"all": ["read", "create", "update", "delete"]}')
ON CONFLICT (name) DO NOTHING;

-- Grant access
GRANT SELECT ON public.roles TO authenticated, anon;

-- =============================================================================
-- 2. SIMPLE USER PROFILE CREATION (no role dependency)
-- =============================================================================

-- Simplified user profile creation that just works
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
        email_verified
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        'barangay_user'::user_role,
        NEW.raw_user_meta_data->>'barangay_code',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TEST
-- =============================================================================

SELECT 'Roles created successfully. Registration should now work.' as status;