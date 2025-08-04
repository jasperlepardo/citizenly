-- ALTERNATIVE: Fix RLS by using a different approach
-- This uses a service role approach or bypasses RLS with proper function

-- Option 1: Create a function that bypasses RLS for signup
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  mobile_number TEXT,
  barangay_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with elevated privileges
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert the profile (this will bypass RLS because of SECURITY DEFINER)
  INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    mobile_number,
    barangay_code,
    status,
    created_at
  ) VALUES (
    user_id,
    user_email,
    first_name,
    last_name,
    mobile_number,
    barangay_code,
    'pending_approval',
    NOW()
  );
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'message', 'Profile created successfully'
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error details
  SELECT json_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Test message
SELECT 'Created signup function. You can now use this function instead of direct insert.' as message;