-- Migration: Add atomic user creation function
-- This migration implements the create_user_with_profile function as documented in
-- docs/USER_CREATION_IMPLEMENTATION_PLAN.md

-- Create comprehensive user profile creation function
CREATE OR REPLACE FUNCTION create_user_with_profile(
    user_id UUID,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    barangay_code VARCHAR(10),
    role_name VARCHAR(50)
) RETURNS JSON AS $$
DECLARE
    role_record auth_roles%ROWTYPE;
    address_hierarchy RECORD;
    profile_record auth_user_profiles%ROWTYPE;
BEGIN
    -- Step 1: Validate user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        RAISE EXCEPTION 'User not found in authentication system with ID: %', user_id;
    END IF;
    
    -- Step 2: Get role by name with validation
    SELECT * INTO role_record FROM auth_roles WHERE name = role_name;
    IF role_record.id IS NULL THEN
        RAISE EXCEPTION 'Role "%" not found in system', role_name;
    END IF;
    
    -- Step 3: Validate and get complete address hierarchy
    SELECT 
        b.code as barangay_code,
        b.name as barangay_name,
        c.code as city_code,
        c.name as city_name,
        c.type as city_type,
        c.is_independent as city_is_independent,
        p.code as province_code,
        p.name as province_name,
        r.code as region_code,
        r.name as region_name
    INTO address_hierarchy
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON c.code = b.city_municipality_code
    JOIN psgc_provinces p ON p.code = c.province_code
    JOIN psgc_regions r ON r.code = p.region_code
    WHERE b.code = barangay_code AND b.is_active = true;
    
    IF address_hierarchy.barangay_code IS NULL THEN
        RAISE EXCEPTION 'Invalid or inactive barangay code: %', barangay_code;
    END IF;
    
    -- Step 4: Create user profile with complete hierarchy
    INSERT INTO auth_user_profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        role_id,
        barangay_code,
        city_municipality_code,
        province_code,
        region_code,
        is_active
    ) VALUES (
        user_id,
        email,
        first_name,
        last_name,
        phone,
        role_record.id,
        address_hierarchy.barangay_code,
        address_hierarchy.city_code,
        address_hierarchy.province_code,
        address_hierarchy.region_code,
        true
    ) RETURNING * INTO profile_record;
    
    -- Step 5: Return comprehensive success response
    RETURN json_build_object(
        'success', true,
        'profile_id', profile_record.id,
        'user_data', json_build_object(
            'email', profile_record.email,
            'first_name', profile_record.first_name,
            'last_name', profile_record.last_name,
            'phone', profile_record.phone,
            'is_active', profile_record.is_active
        ),
        'role_data', json_build_object(
            'id', role_record.id,
            'name', role_record.name,
            'description', role_record.description
        ),
        'location_data', json_build_object(
            'barangay_code', address_hierarchy.barangay_code,
            'barangay_name', address_hierarchy.barangay_name,
            'city_code', address_hierarchy.city_code,
            'city_name', address_hierarchy.city_name,
            'city_type', address_hierarchy.city_type,
            'province_code', address_hierarchy.province_code,
            'province_name', address_hierarchy.province_name,
            'region_code', address_hierarchy.region_code,
            'region_name', address_hierarchy.region_name
        ),
        'created_at', profile_record.created_at,
        'message', 'User profile created successfully'
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'A user profile with this information already exists',
            'error_code', 'DUPLICATE_PROFILE',
            'details', SQLERRM
        );
    WHEN foreign_key_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Referenced data not found (user, role, or location)',
            'error_code', 'INVALID_REFERENCE',
            'details', SQLERRM
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'details', 'Unexpected error during profile creation'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user exists with retry logic
CREATE OR REPLACE FUNCTION verify_auth_user_exists(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN := false;
    retry_count INTEGER := 0;
    max_retries INTEGER := 3;
BEGIN
    -- Check if user exists in auth.users table
    WHILE NOT user_exists AND retry_count < max_retries LOOP
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            retry_count := retry_count + 1;
            -- Wait before retry (PostgreSQL sleep in seconds)
            PERFORM pg_sleep(0.5 * retry_count); -- 0.5s, 1s, 1.5s delays
        END IF;
    END LOOP;
    
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION verify_auth_user_exists TO authenticated;

-- Add function documentation
COMMENT ON FUNCTION create_user_with_profile IS 
'Creates a complete user profile with role assignment and geographic hierarchy validation. 
Handles all foreign key constraints and provides comprehensive error handling.
Returns JSON with success status and complete user data or error details.';

COMMENT ON FUNCTION verify_auth_user_exists IS
'Helper function to verify user exists in auth.users with built-in retry logic
for handling Supabase Auth timing issues.';