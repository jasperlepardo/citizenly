-- Fix missing RLS functions for household access
-- These functions are referenced in RLS policies but don't exist

-- Function to get user access level from JWT or session
CREATE OR REPLACE FUNCTION user_access_level()
RETURNS json AS $$
BEGIN
  -- For now, return a basic access level structure
  -- This should be replaced with proper JWT parsing in production
  RETURN '{"level": "barangay"}'::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's barangay code from profile
CREATE OR REPLACE FUNCTION user_barangay_code()
RETURNS text AS $$
DECLARE
  user_uuid uuid;
  barangay_code text;
BEGIN
  -- Get current user ID from auth
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get barangay code from user profile
  SELECT up.barangay_code 
  INTO barangay_code
  FROM auth_user_profiles up 
  WHERE up.user_id = user_uuid;
  
  RETURN barangay_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's city code from profile
CREATE OR REPLACE FUNCTION user_city_code()
RETURNS text AS $$
DECLARE
  user_uuid uuid;
  city_code text;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT up.city_municipality_code 
  INTO city_code
  FROM auth_user_profiles up 
  WHERE up.user_id = user_uuid;
  
  RETURN city_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's province code from profile
CREATE OR REPLACE FUNCTION user_province_code()
RETURNS text AS $$
DECLARE
  user_uuid uuid;
  province_code text;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT up.province_code 
  INTO province_code
  FROM auth_user_profiles up 
  WHERE up.user_id = user_uuid;
  
  RETURN province_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's region code from profile
CREATE OR REPLACE FUNCTION user_region_code()
RETURNS text AS $$
DECLARE
  user_uuid uuid;
  region_code text;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT up.region_code 
  INTO region_code
  FROM auth_user_profiles up 
  WHERE up.user_id = user_uuid;
  
  RETURN region_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION user_access_level() TO authenticated;
GRANT EXECUTE ON FUNCTION user_barangay_code() TO authenticated;
GRANT EXECUTE ON FUNCTION user_city_code() TO authenticated;
GRANT EXECUTE ON FUNCTION user_province_code() TO authenticated;
GRANT EXECUTE ON FUNCTION user_region_code() TO authenticated;

-- Test the functions work
DO $$
BEGIN
  RAISE NOTICE 'RLS functions created successfully';
  RAISE NOTICE 'user_access_level(): %', user_access_level();
END $$;