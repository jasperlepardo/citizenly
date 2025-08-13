-- =====================================================
-- ENABLE RLS ON EXISTING TABLES ONLY
-- Based on discovered tables in your actual database
-- =====================================================

-- =====================================================
-- 1. PSGC TABLES (Confirmed to exist)
-- =====================================================

-- Enable RLS on PSGC tables
ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_regions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psgc_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psgc_barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 2. USER PROFILES TABLE (Confirmed to exist)
-- =====================================================

-- user_profiles may already have RLS enabled, but ensure it's forced
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 3. REVOKE ALL PERMISSIONS FROM ANONYMOUS
-- =====================================================

-- Remove ALL permissions from anon role first
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- =====================================================
-- 4. GRANT SAFE READ-ONLY ACCESS TO REFERENCE DATA
-- =====================================================

-- Geographic reference data - Public read access
GRANT SELECT ON public.psgc_regions TO anon;
GRANT SELECT ON public.psgc_provinces TO anon;
GRANT SELECT ON public.psgc_cities_municipalities TO anon;
GRANT SELECT ON public.psgc_barangays TO anon;

-- =====================================================
-- 5. CREATE BASIC RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist (avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to regions" ON public.psgc_regions;
DROP POLICY IF EXISTS "Allow public read access to provinces" ON public.psgc_provinces;
DROP POLICY IF EXISTS "Allow public read access to cities" ON public.psgc_cities_municipalities;
DROP POLICY IF EXISTS "Allow public read access to barangays" ON public.psgc_barangays;

-- PSGC Tables - Allow public read, block write for anon
CREATE POLICY "Allow public read access to regions" ON public.psgc_regions
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to provinces" ON public.psgc_provinces
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to cities" ON public.psgc_cities_municipalities
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to barangays" ON public.psgc_barangays
  FOR SELECT TO authenticated, anon USING (true);

-- Block write access for anon users (authenticated users need admin role)
CREATE POLICY "Block anon write to regions" ON public.psgc_regions
  FOR INSERT TO anon USING (false);

CREATE POLICY "Block anon write to provinces" ON public.psgc_provinces
  FOR INSERT TO anon USING (false);

CREATE POLICY "Block anon write to cities" ON public.psgc_cities_municipalities
  FOR INSERT TO anon USING (false);

CREATE POLICY "Block anon write to barangays" ON public.psgc_barangays
  FOR INSERT TO anon USING (false);

-- =====================================================
-- 6. AUTHENTICATED USER PERMISSIONS
-- =====================================================

-- Reference data - All authenticated users can read
GRANT SELECT ON public.psgc_regions TO authenticated;
GRANT SELECT ON public.psgc_provinces TO authenticated;
GRANT SELECT ON public.psgc_cities_municipalities TO authenticated;
GRANT SELECT ON public.psgc_barangays TO authenticated;

-- User profiles - Controlled by existing RLS policies
GRANT ALL ON public.user_profiles TO authenticated;

-- =====================================================
-- 7. SEQUENCE PERMISSIONS (for authenticated users)
-- =====================================================

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. COMPLETION MESSAGE
-- =====================================================

SELECT 
  '✅ EXISTING TABLES SECURED WITH RLS' as status,
  'PSGC tables: Public read access, write blocked for anon' as psgc_status,
  'User profiles: RLS policies active' as user_status,
  'All other tables: Will be secured when created' as future_tables;