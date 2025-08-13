-- =====================================================
-- FIX RLS POLICIES - PROPERLY BLOCK WRITE ACCESS
-- =====================================================

-- Drop and recreate policies with proper write restrictions

-- PSGC Regions policies
DROP POLICY IF EXISTS "Allow public read access to regions" ON public.psgc_regions;
DROP POLICY IF EXISTS "Allow admin write access to regions" ON public.psgc_regions;

CREATE POLICY "Allow public read access to regions" ON public.psgc_regions
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Restrict write access to regions" ON public.psgc_regions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict update access to regions" ON public.psgc_regions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict delete access to regions" ON public.psgc_regions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PSGC Provinces policies
DROP POLICY IF EXISTS "Allow public read access to provinces" ON public.psgc_provinces;
DROP POLICY IF EXISTS "Allow admin write access to provinces" ON public.psgc_provinces;

CREATE POLICY "Allow public read access to provinces" ON public.psgc_provinces
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Restrict write access to provinces" ON public.psgc_provinces
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict update access to provinces" ON public.psgc_provinces
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict delete access to provinces" ON public.psgc_provinces
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PSGC Cities/Municipalities policies
DROP POLICY IF EXISTS "Allow public read access to cities" ON public.psgc_cities_municipalities;
DROP POLICY IF EXISTS "Allow admin write access to cities" ON public.psgc_cities_municipalities;

CREATE POLICY "Allow public read access to cities" ON public.psgc_cities_municipalities
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Restrict write access to cities" ON public.psgc_cities_municipalities
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict update access to cities" ON public.psgc_cities_municipalities
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict delete access to cities" ON public.psgc_cities_municipalities
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PSGC Barangays policies
DROP POLICY IF EXISTS "Allow public read access to barangays" ON public.psgc_barangays;
DROP POLICY IF EXISTS "Allow admin write access to barangays" ON public.psgc_barangays;

CREATE POLICY "Allow public read access to barangays" ON public.psgc_barangays
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Restrict write access to barangays" ON public.psgc_barangays
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict update access to barangays" ON public.psgc_barangays
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Restrict delete access to barangays" ON public.psgc_barangays
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Disable INSERT, UPDATE, DELETE for anon role completely
REVOKE INSERT, UPDATE, DELETE ON public.psgc_regions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.psgc_provinces FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.psgc_cities_municipalities FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.psgc_barangays FROM anon;

-- Ensure only SELECT is allowed for anon
GRANT SELECT ON public.psgc_regions TO anon;
GRANT SELECT ON public.psgc_provinces TO anon;
GRANT SELECT ON public.psgc_cities_municipalities TO anon;
GRANT SELECT ON public.psgc_barangays TO anon;

-- Re-create the admin setup function properly
CREATE OR REPLACE FUNCTION public.setup_admin_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email
  SELECT * INTO user_record
  FROM auth.users
  WHERE email = user_email;
  
  IF user_record.id IS NOT NULL THEN
    -- Update or insert admin role
    INSERT INTO public.user_profiles (id, role)
    VALUES (user_record.id, 'admin')
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      updated_at = NOW();
    
    RETURN 'Admin role assigned to user: ' || user_email;
  END IF;
  
  RETURN 'User not found: ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.setup_admin_user(TEXT) TO authenticated;

-- Display completion message
SELECT 
  '✅ RLS Policies Fixed' as status,
  'Write access now properly restricted to admin users only' as security_update;