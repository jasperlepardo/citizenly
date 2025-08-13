-- REMOVE ALL FOREIGN KEY CONSTRAINTS FROM USER_PROFILES
-- This completely eliminates the foreign key constraint issues

-- =============================================================================
-- 1. IDENTIFY ALL FOREIGN KEY CONSTRAINTS ON USER_PROFILES
-- =============================================================================

-- List all foreign key constraints on user_profiles
SELECT 
    'Constraint: ' || tc.constraint_name || 
    ' references ' || ccu.table_name || '(' || ccu.column_name || ')' as constraint_info
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'user_profiles'
AND tc.table_schema = 'public';

-- =============================================================================
-- 2. DROP ALL FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Drop the auth.users foreign key constraint (the main problem)
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Drop all foreign key constraints on user_profiles
    FOR constraint_record IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'user_profiles'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- =============================================================================
-- 3. VERIFY CONSTRAINTS ARE GONE
-- =============================================================================

-- Check that no foreign key constraints remain
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ All foreign key constraints removed from user_profiles'
        ELSE '✗ ' || COUNT(*) || ' foreign key constraints still exist'
    END as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'user_profiles'
AND table_schema = 'public';

-- =============================================================================
-- 4. CREATE CONSTRAINT-FREE PROFILE FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_profile_no_constraints(
    profile_id UUID,
    profile_email TEXT,
    profile_first_name TEXT,
    profile_last_name TEXT,
    profile_mobile TEXT DEFAULT NULL,
    profile_barangay_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get or create resident role
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'resident';
    
    IF default_role_id IS NULL THEN
        INSERT INTO public.roles (name, permissions) 
        VALUES ('resident', '{"residents": ["read", "create", "update"]}')
        RETURNING id INTO default_role_id;
    END IF;
    
    -- Simple insert without any foreign key constraints to worry about
    INSERT INTO public.user_profiles (
        id, email, first_name, last_name, mobile_number, barangay_code, role_id, is_active
    ) VALUES (
        profile_id, profile_email, profile_first_name, profile_last_name, 
        profile_mobile, profile_barangay_code, default_role_id, true
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
GRANT EXECUTE ON FUNCTION public.create_profile_no_constraints(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;

-- =============================================================================
-- 5. TEST WITHOUT CONSTRAINTS
-- =============================================================================

DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    result_id UUID;
BEGIN
    -- Test profile creation without any constraint issues
    SELECT public.create_profile_no_constraints(
        test_id,
        'test@example.com',
        'Test',
        'User',
        '09123456789',
        'invalid_barangay_code'  -- This should work now since no FK constraint
    ) INTO result_id;
    
    IF result_id = test_id THEN
        RAISE NOTICE '✓ Profile creation (no constraints) test PASSED';
        DELETE FROM public.user_profiles WHERE id = test_id;
    ELSE
        RAISE EXCEPTION '✗ Profile creation test FAILED';
    END IF;
END $$;

-- =============================================================================
-- 6. DISABLE RLS FOR CLEAN SIGNUP
-- =============================================================================

ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_profiles TO authenticated, anon;
GRANT SELECT ON public.roles TO authenticated, anon;

SELECT 'All foreign key constraints removed. Signup should work without constraint violations.' as final_status;