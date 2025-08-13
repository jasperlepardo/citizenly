-- SIGNUP FIX WITH VALID BARANGAY HANDLING
-- This resolves the barangay foreign key constraint issue

-- =============================================================================
-- 1. FIND A VALID BARANGAY CODE FOR TESTING
-- =============================================================================

-- First, let's find a valid barangay code for testing
DO $$
DECLARE
    valid_barangay_code TEXT;
BEGIN
    SELECT code INTO valid_barangay_code 
    FROM public.psgc_barangays 
    LIMIT 1;
    
    IF valid_barangay_code IS NOT NULL THEN
        RAISE NOTICE 'Found valid barangay code for testing: %', valid_barangay_code;
    ELSE
        RAISE NOTICE 'No barangay codes found in psgc_barangays table';
    END IF;
END $$;

-- =============================================================================
-- 2. MAKE BARANGAY_CODE NULLABLE FOR SIGNUP
-- =============================================================================

-- Temporarily make barangay_code nullable to allow signup without selecting barangay
ALTER TABLE public.user_profiles ALTER COLUMN barangay_code DROP NOT NULL;

-- =============================================================================
-- 3. CREATE SIGNUP-FRIENDLY PROFILE CREATION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_profile_signup(
    profile_id UUID,
    profile_email TEXT,
    profile_first_name TEXT,
    profile_last_name TEXT,
    profile_mobile TEXT DEFAULT NULL,
    profile_barangay_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    default_role_id UUID;
    validated_barangay_code TEXT;
BEGIN
    -- Get or create resident role
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'resident';
    
    IF default_role_id IS NULL THEN
        INSERT INTO public.roles (name, permissions) 
        VALUES ('resident', '{"residents": ["read", "create", "update"]}')
        RETURNING id INTO default_role_id;
    END IF;
    
    -- Validate barangay code if provided
    IF profile_barangay_code IS NOT NULL THEN
        SELECT code INTO validated_barangay_code 
        FROM public.psgc_barangays 
        WHERE code = profile_barangay_code;
        
        -- If barangay doesn't exist, set to NULL instead of failing
        IF validated_barangay_code IS NULL THEN
            RAISE NOTICE 'Invalid barangay code %, setting to NULL', profile_barangay_code;
            validated_barangay_code := NULL;
        ELSE
            validated_barangay_code := profile_barangay_code;
        END IF;
    ELSE
        validated_barangay_code := NULL;
    END IF;
    
    -- Insert with validated barangay code
    INSERT INTO public.user_profiles (
        id, email, first_name, last_name, mobile_number, barangay_code, role_id, is_active
    ) VALUES (
        profile_id, profile_email, profile_first_name, profile_last_name, 
        profile_mobile, validated_barangay_code, default_role_id, true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        mobile_number = EXCLUDED.mobile_number,
        barangay_code = EXCLUDED.barangay_code,
        updated_at = NOW();
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION public.create_profile_signup(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;

-- =============================================================================
-- 4. TEST WITH NULL BARANGAY (SHOULD WORK)
-- =============================================================================

DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    result_id UUID;
BEGIN
    -- Test without barangay code
    SELECT public.create_profile_signup(
        test_id,
        'test@example.com',
        'Test',
        'User',
        '09123456789',
        NULL  -- No barangay code
    ) INTO result_id;
    
    IF result_id = test_id THEN
        RAISE NOTICE '✓ Profile creation (no barangay) test PASSED';
        DELETE FROM public.user_profiles WHERE id = test_id;
    ELSE
        RAISE EXCEPTION '✗ Profile creation test FAILED';
    END IF;
END $$;

-- =============================================================================
-- 5. TEST WITH VALID BARANGAY (IF EXISTS)
-- =============================================================================

DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    result_id UUID;
    valid_barangay TEXT;
BEGIN
    -- Get a valid barangay code
    SELECT code INTO valid_barangay 
    FROM public.psgc_barangays 
    LIMIT 1;
    
    IF valid_barangay IS NOT NULL THEN
        -- Test with valid barangay code
        SELECT public.create_profile_signup(
            test_id,
            'test2@example.com',
            'Test',
            'User2',
            '09123456789',
            valid_barangay
        ) INTO result_id;
        
        IF result_id = test_id THEN
            RAISE NOTICE '✓ Profile creation (with barangay %) test PASSED', valid_barangay;
            DELETE FROM public.user_profiles WHERE id = test_id;
        ELSE
            RAISE EXCEPTION '✗ Profile creation with barangay test FAILED';
        END IF;
    ELSE
        RAISE NOTICE 'No valid barangay codes available for testing';
    END IF;
END $$;

-- =============================================================================
-- STATUS
-- =============================================================================

SELECT 'Profile creation fixed to handle invalid barangay codes gracefully.' as status;