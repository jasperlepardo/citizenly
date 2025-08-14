-- =====================================================
-- SETUP AUTHENTICATION SCHEMA AND RLS FOR PSGC TABLES
-- =====================================================

-- Step 1: Create user_profiles table with role-based access
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create user_profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 4: Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 6: Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Enable RLS on all PSGC tables
ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for PSGC tables (Read access for all authenticated users, write for admins)

-- PSGC Regions policies
CREATE POLICY "Allow public read access to regions" ON public.psgc_regions
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Allow admin write access to regions" ON public.psgc_regions
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- PSGC Provinces policies
CREATE POLICY "Allow public read access to provinces" ON public.psgc_provinces
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Allow admin write access to provinces" ON public.psgc_provinces
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- PSGC Cities/Municipalities policies
CREATE POLICY "Allow public read access to cities" ON public.psgc_cities_municipalities
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Allow admin write access to cities" ON public.psgc_cities_municipalities
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- PSGC Barangays policies
CREATE POLICY "Allow public read access to barangays" ON public.psgc_barangays
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Allow admin write access to barangays" ON public.psgc_barangays
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.psgc_regions TO authenticated, anon;
GRANT SELECT ON public.psgc_provinces TO authenticated, anon;
GRANT SELECT ON public.psgc_cities_municipalities TO authenticated, anon;
GRANT SELECT ON public.psgc_barangays TO authenticated, anon;

GRANT ALL ON public.user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;

-- Step 10: Create admin user setup function (for development)
CREATE OR REPLACE FUNCTION public.setup_admin_user(user_email TEXT)
RETURNS BOOLEAN AS $$
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
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments and documentation
COMMENT ON TABLE public.user_profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN public.user_profiles.role IS 'User role: admin (full access), user (read access), guest (limited read)';
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Helper function to retrieve user role for RLS policies';
COMMENT ON FUNCTION public.setup_admin_user(TEXT) IS 'Development function to setup admin users';

-- Display completion message
SELECT 
  '✅ RLS Authentication Schema Setup Complete' as status,
  'All PSGC tables now have Row Level Security enabled' as security_status,
  'Use setup_admin_user(email) to create admin users' as admin_setup;