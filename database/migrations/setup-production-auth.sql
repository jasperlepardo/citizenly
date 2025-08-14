-- =============================================================================
-- PRODUCTION-READY AUTHENTICATION & ACCESS CONTROL SETUP
-- =============================================================================
-- This script sets up secure authentication using Supabase Auth with proper
-- Row Level Security policies for the RBI System
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. USER PROFILE MANAGEMENT
-- =============================================================================

-- Create user roles enum first
CREATE TYPE user_role AS ENUM (
    'super_admin',       -- System-wide access
    'region_admin',      -- Regional access
    'province_admin',    -- Provincial access  
    'city_admin',        -- City/Municipality access
    'barangay_admin',    -- Barangay administrative access
    'barangay_user',     -- Regular barangay user
    'read_only'          -- Read-only access
);

-- Create user_profiles table that extends Supabase auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    mobile_number TEXT,
    role_name user_role NOT NULL DEFAULT 'barangay_user',
    barangay_code TEXT REFERENCES public.psgc_barangays(code),
    city_municipality_code TEXT REFERENCES public.psgc_cities_municipalities(code),
    province_code TEXT REFERENCES public.psgc_provinces(code),
    region_code TEXT REFERENCES public.psgc_regions(code),
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. REFERENCE DATA RLS POLICIES (Production-Safe)
-- =============================================================================

-- Enable RLS on all reference data tables
ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_sub_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_minor_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_groups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read reference data (required for dropdowns/search)
-- PSGC Reference Data Policies
CREATE POLICY "Authenticated users can read regions" ON public.psgc_regions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read provinces" ON public.psgc_provinces
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read cities" ON public.psgc_cities_municipalities
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read barangays" ON public.psgc_barangays
    FOR SELECT TO authenticated USING (true);

-- PSOC Reference Data Policies
CREATE POLICY "Authenticated users can read PSOC major groups" ON public.psoc_major_groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read PSOC sub major groups" ON public.psoc_sub_major_groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read PSOC minor groups" ON public.psoc_minor_groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read PSOC unit groups" ON public.psoc_unit_groups
    FOR SELECT TO authenticated USING (true);

-- Allow public read access to unified search views (these are safe for anonymous access)
GRANT SELECT ON public.psoc_unified_search TO anon;
GRANT SELECT ON public.psoc_occupation_search TO anon;
GRANT SELECT ON public.address_hierarchy TO anon;

-- =============================================================================
-- 3. USER PROFILE RLS POLICIES
-- =============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT TO authenticated 
    USING (auth.uid() = id);

-- Users can update their own profile (except role and access controls)
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role_name = (SELECT role_name FROM public.user_profiles WHERE id = auth.uid()) AND
        barangay_code = (SELECT barangay_code FROM public.user_profiles WHERE id = auth.uid())
    );

-- Admins can read profiles within their jurisdiction
CREATE POLICY "Admins can read profiles in jurisdiction" ON public.user_profiles
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND (
                admin_profile.role_name = 'super_admin' OR
                (admin_profile.role_name = 'region_admin' AND admin_profile.region_code = user_profiles.region_code) OR
                (admin_profile.role_name = 'province_admin' AND admin_profile.province_code = user_profiles.province_code) OR
                (admin_profile.role_name = 'city_admin' AND admin_profile.city_municipality_code = user_profiles.city_municipality_code) OR
                (admin_profile.role_name = 'barangay_admin' AND admin_profile.barangay_code = user_profiles.barangay_code)
            )
        )
    );

-- =============================================================================
-- 4. APPLICATION DATA RLS POLICIES
-- =============================================================================

-- Residents Table RLS
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Users can only see residents in their assigned barangay/jurisdiction
CREATE POLICY "Users see residents in jurisdiction" ON public.residents
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND (
                user_profiles.role_name = 'super_admin' OR
                (user_profiles.role_name = 'region_admin' AND user_profiles.region_code = residents.region_code) OR
                (user_profiles.role_name = 'province_admin' AND user_profiles.province_code = residents.province_code) OR
                (user_profiles.role_name = 'city_admin' AND user_profiles.city_municipality_code = residents.city_municipality_code) OR
                (user_profiles.role_name IN ('barangay_admin', 'barangay_user') AND user_profiles.barangay_code = residents.barangay_code)
            )
            AND user_profiles.is_active = true
        )
    );

-- Users can insert residents in their assigned barangay
CREATE POLICY "Users can insert residents in jurisdiction" ON public.residents
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.barangay_code = residents.barangay_code
            AND user_profiles.role_name IN ('barangay_admin', 'barangay_user')
            AND user_profiles.is_active = true
        )
    );

-- Users can update residents in their assigned barangay
CREATE POLICY "Users can update residents in jurisdiction" ON public.residents
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.barangay_code = residents.barangay_code
            AND user_profiles.role_name IN ('barangay_admin', 'barangay_user')
            AND user_profiles.is_active = true
        )
    )
    WITH CHECK (
        barangay_code = (SELECT barangay_code FROM public.user_profiles WHERE id = auth.uid())
    );

-- Households Table RLS (similar pattern)
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see households in jurisdiction" ON public.households
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.barangay_code = households.barangay_code
            AND user_profiles.is_active = true
        )
    );

-- =============================================================================
-- 5. AUTOMATIC USER PROFILE CREATION
-- =============================================================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        role_name,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        'barangay_user',
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 6. UTILITY FUNCTIONS
-- =============================================================================

-- Function to check if user has admin access to a barangay
CREATE OR REPLACE FUNCTION public.user_has_barangay_access(target_barangay_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND (
            role_name = 'super_admin' OR
            barangay_code = target_barangay_code
        )
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's accessible barangays
CREATE OR REPLACE FUNCTION public.get_user_accessible_barangays()
RETURNS TABLE(barangay_code TEXT, barangay_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT b.code, b.name
    FROM public.psgc_barangays b
    INNER JOIN public.user_profiles up ON (
        up.id = auth.uid() AND
        (
            up.role_name = 'super_admin' OR
            up.barangay_code = b.code
        ) AND
        up.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes on user_profiles for RLS performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_barangay_code ON public.user_profiles(barangay_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_active ON public.user_profiles(role_name, is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_region_code ON public.user_profiles(region_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_province_code ON public.user_profiles(province_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city_code ON public.user_profiles(city_municipality_code);

-- Indexes on residents for RLS performance  
CREATE INDEX IF NOT EXISTS idx_residents_barangay_code ON public.residents(barangay_code);
CREATE INDEX IF NOT EXISTS idx_residents_region_code ON public.residents(region_code);
CREATE INDEX IF NOT EXISTS idx_residents_created_by ON public.residents(created_by);

-- Indexes on households for RLS performance
CREATE INDEX IF NOT EXISTS idx_households_barangay_code ON public.households(barangay_code);

-- =============================================================================
-- 8. GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT UPDATE(first_name, last_name, mobile_number, updated_at) ON public.user_profiles TO authenticated;

-- Grant access to reference data
GRANT SELECT ON public.psgc_regions TO authenticated;
GRANT SELECT ON public.psgc_provinces TO authenticated;
GRANT SELECT ON public.psgc_cities_municipalities TO authenticated;
GRANT SELECT ON public.psgc_barangays TO authenticated;
GRANT SELECT ON public.psoc_major_groups TO authenticated;
GRANT SELECT ON public.psoc_sub_major_groups TO authenticated;
GRANT SELECT ON public.psoc_minor_groups TO authenticated;
GRANT SELECT ON public.psoc_unit_groups TO authenticated;

-- Grant access to application data
GRANT ALL ON public.residents TO authenticated;
GRANT ALL ON public.households TO authenticated;

-- Grant access to utility functions
GRANT EXECUTE ON FUNCTION public.user_has_barangay_access(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_accessible_barangays() TO authenticated;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
-- This script creates a production-ready authentication system with:
-- ✓ Proper Supabase Auth integration
-- ✓ Secure Row Level Security policies
-- ✓ Role-based access control
-- ✓ Automatic user profile creation
-- ✓ Geographic jurisdiction enforcement
-- ✓ Performance optimizations
-- =============================================================================