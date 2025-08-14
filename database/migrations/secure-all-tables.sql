-- =====================================================
-- ENABLE RLS ON ALL TABLES IN THE DATABASE SCHEMA
-- =====================================================

-- =====================================================
-- 1. REFERENCE DATA TABLES (PSGC & PSOC)
-- =====================================================

-- PSGC Tables - Enable RLS
ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_regions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psgc_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psgc_barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays FORCE ROW LEVEL SECURITY;

-- PSOC Tables - Enable RLS
ALTER TABLE public.psoc_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_major_groups FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psoc_sub_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_sub_major_groups FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psoc_minor_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_minor_groups FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psoc_unit_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_groups FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psoc_unit_sub_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_sub_groups FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psoc_position_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_position_titles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.psoc_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_cross_references FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 2. ACCESS CONTROL TABLES
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;

-- user_profiles already has RLS enabled in schema
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CORE ENTITIES
-- =====================================================

-- households already has RLS enabled in schema
-- ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.households FORCE ROW LEVEL SECURITY;

-- residents already has RLS enabled in schema
-- ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.residents FORCE ROW LEVEL SECURITY;

ALTER TABLE public.resident_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resident_relationships FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 4. REVOKE ALL PERMISSIONS FROM ANONYMOUS USERS
-- =====================================================

-- Remove ALL permissions from anon role
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- =====================================================
-- 5. GRANT APPROPRIATE READ-ONLY ACCESS
-- =====================================================

-- Geographic reference data - Public read access
GRANT SELECT ON public.psgc_regions TO anon;
GRANT SELECT ON public.psgc_provinces TO anon;
GRANT SELECT ON public.psgc_cities_municipalities TO anon;
GRANT SELECT ON public.psgc_barangays TO anon;

-- Occupation reference data - Public read access
GRANT SELECT ON public.psoc_major_groups TO anon;
GRANT SELECT ON public.psoc_sub_major_groups TO anon;
GRANT SELECT ON public.psoc_minor_groups TO anon;
GRANT SELECT ON public.psoc_unit_groups TO anon;
GRANT SELECT ON public.psoc_unit_sub_groups TO anon;
GRANT SELECT ON public.psoc_position_titles TO anon;
GRANT SELECT ON public.psoc_cross_references TO anon;

-- Views - Public read access
GRANT SELECT ON public.psgc_address_hierarchy TO anon;
GRANT SELECT ON public.psoc_occupation_search TO anon;

-- =====================================================
-- 6. CREATE RLS POLICIES FOR REFERENCE TABLES
-- =====================================================

-- PSGC Tables - Allow public read, restrict write to admin
CREATE POLICY "Allow public read access to regions" ON public.psgc_regions
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Restrict write access to regions" ON public.psgc_regions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name IN ('super_admin', 'barangay_admin')
    )
  );

CREATE POLICY "Allow public read access to provinces" ON public.psgc_provinces
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to cities" ON public.psgc_cities_municipalities
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to barangays" ON public.psgc_barangays
  FOR SELECT TO authenticated, anon USING (true);

-- PSOC Tables - Allow public read, restrict write to admin
CREATE POLICY "Allow public read access to psoc_major_groups" ON public.psoc_major_groups
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to psoc_sub_major_groups" ON public.psoc_sub_major_groups
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to psoc_minor_groups" ON public.psoc_minor_groups
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to psoc_unit_groups" ON public.psoc_unit_groups
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to psoc_unit_sub_groups" ON public.psoc_unit_sub_groups
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to psoc_position_titles" ON public.psoc_position_titles
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow public read access to psoc_cross_references" ON public.psoc_cross_references
  FOR SELECT TO authenticated, anon USING (true);

-- Roles table - Restrict to admin users only
CREATE POLICY "Admin only access to roles" ON public.roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'super_admin'
    )
  );

-- Resident relationships - Barangay scoped
CREATE POLICY "Barangay scoped relationships" ON public.resident_relationships
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.residents res
      JOIN public.user_profiles up ON up.barangay_code = res.barangay_code
      WHERE res.id = resident_id AND up.id = auth.uid()
    )
  );

-- =====================================================
-- 7. GRANT AUTHENTICATED USER PERMISSIONS
-- =====================================================

-- Reference data - All authenticated users can read
GRANT SELECT ON public.psgc_regions TO authenticated;
GRANT SELECT ON public.psgc_provinces TO authenticated;
GRANT SELECT ON public.psgc_cities_municipalities TO authenticated;
GRANT SELECT ON public.psgc_barangays TO authenticated;

GRANT SELECT ON public.psoc_major_groups TO authenticated;
GRANT SELECT ON public.psoc_sub_major_groups TO authenticated;
GRANT SELECT ON public.psoc_minor_groups TO authenticated;
GRANT SELECT ON public.psoc_unit_groups TO authenticated;
GRANT SELECT ON public.psoc_unit_sub_groups TO authenticated;
GRANT SELECT ON public.psoc_position_titles TO authenticated;
GRANT SELECT ON public.psoc_cross_references TO authenticated;

-- Core tables - Controlled by RLS policies
GRANT ALL ON public.residents TO authenticated;
GRANT ALL ON public.households TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.resident_relationships TO authenticated;

-- Admin tables - Limited access
GRANT SELECT ON public.roles TO authenticated;

-- Views
GRANT SELECT ON public.psgc_address_hierarchy TO authenticated;
GRANT SELECT ON public.psoc_occupation_search TO authenticated;
GRANT SELECT ON public.barangay_quick_stats TO authenticated;
GRANT SELECT ON public.performance_overview TO authenticated;

-- =====================================================
-- 8. SEQUENCE PERMISSIONS
-- =====================================================

-- Grant usage on sequences for authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 
  '✅ ALL TABLES SECURED WITH RLS' as status,
  'Reference data: Public read access' as psgc_psoc_access,
  'Core data: Barangay-scoped access' as resident_data_access,
  'Admin data: Super admin only' as admin_access;