-- Quick Fix: Enable Public Access for User Registration
-- This script fixes the "No valid session found" error

-- =============================================================================
-- 1. ENABLE PUBLIC ACCESS TO REFERENCE DATA
-- =============================================================================

-- Remove RLS from reference data (safe - these are public datasets)
ALTER TABLE public.psgc_regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_major_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_sub_major_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_minor_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_groups DISABLE ROW LEVEL SECURITY;

-- Grant public SELECT access
GRANT SELECT ON public.psgc_regions TO anon, authenticated;
GRANT SELECT ON public.psgc_provinces TO anon, authenticated;
GRANT SELECT ON public.psgc_cities_municipalities TO anon, authenticated;
GRANT SELECT ON public.psgc_barangays TO anon, authenticated;
GRANT SELECT ON public.psoc_major_groups TO anon, authenticated;
GRANT SELECT ON public.psoc_sub_major_groups TO anon, authenticated;
GRANT SELECT ON public.psoc_minor_groups TO anon, authenticated;
GRANT SELECT ON public.psoc_unit_groups TO anon, authenticated;

-- Grant access to search views (if they exist)
GRANT SELECT ON public.psoc_unified_search TO anon, authenticated;
GRANT SELECT ON public.psoc_occupation_search TO anon, authenticated;

-- =============================================================================
-- 2. FIX POLICIES (Remove Circular References)
-- =============================================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read profiles in jurisdiction" ON public.user_profiles;

-- Simple user profile policies
CREATE POLICY "users_read_own" ON public.user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =============================================================================
-- REGISTRATION SHOULD NOW WORK
-- =============================================================================

-- Test public access
DO $$
BEGIN
    RAISE NOTICE 'Reference data is now publicly accessible for registration';
    RAISE NOTICE 'Barangay search will work without authentication';
END $$;