-- =====================================================
-- MINIMAL RLS FIX - ONLY EXISTING TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable RLS on the 5 existing tables
ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS (bypass for service role)
ALTER TABLE public.psgc_regions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

-- Remove ALL permissions from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Grant safe read access to geographic data
GRANT SELECT ON public.psgc_regions TO anon;
GRANT SELECT ON public.psgc_provinces TO anon;
GRANT SELECT ON public.psgc_cities_municipalities TO anon;
GRANT SELECT ON public.psgc_barangays TO anon;

-- Create basic policies
CREATE POLICY "Public read regions" ON public.psgc_regions FOR SELECT USING (true);
CREATE POLICY "Public read provinces" ON public.psgc_provinces FOR SELECT USING (true);
CREATE POLICY "Public read cities" ON public.psgc_cities_municipalities FOR SELECT USING (true);
CREATE POLICY "Public read barangays" ON public.psgc_barangays FOR SELECT USING (true);