-- Production Security Fix: Missing RLS Functions (Without Concurrent Indexes)
-- Run this first, then run the separate index script

-- =============================================================================
-- CLEAN REMOVAL OF EXISTING FUNCTIONS
-- =============================================================================

-- Drop existing functions if they exist (handles type conflicts)
DROP FUNCTION IF EXISTS user_barangay_code() CASCADE;
DROP FUNCTION IF EXISTS user_city_code() CASCADE;
DROP FUNCTION IF EXISTS user_province_code() CASCADE;
DROP FUNCTION IF EXISTS user_region_code() CASCADE;
DROP FUNCTION IF EXISTS user_role() CASCADE;
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS user_access_level() CASCADE;

-- =============================================================================
-- USER ACCESS FUNCTIONS FOR RLS POLICIES
-- =============================================================================

-- Get user's barangay code for RLS filtering
CREATE FUNCTION user_barangay_code()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT barangay_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid() 
        AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's city code for RLS filtering
CREATE FUNCTION user_city_code()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT city_municipality_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid() 
        AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's province code for RLS filtering
CREATE FUNCTION user_province_code()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT province_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid() 
        AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's region code for RLS filtering
CREATE FUNCTION user_region_code()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT region_code 
        FROM auth_user_profiles 
        WHERE id = auth.uid() 
        AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's role for RLS filtering
CREATE FUNCTION user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT r.name
        FROM auth_user_profiles p
        JOIN auth_roles r ON r.id = p.role_id
        WHERE p.id = auth.uid() 
        AND p.is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is super admin (bypasses geographic restrictions)
CREATE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT r.name = 'super_admin'
        FROM auth_user_profiles p
        JOIN auth_roles r ON r.id = p.role_id
        WHERE p.id = auth.uid() 
        AND p.is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's access level configuration
CREATE FUNCTION user_access_level()
RETURNS JSON AS $$
DECLARE
    role_name TEXT;
BEGIN
    -- Get user role name
    SELECT r.name
    INTO role_name
    FROM auth_user_profiles p
    JOIN auth_roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() 
    AND p.is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN '{"level": "none", "access": false}'::json;
    END IF;
    
    -- Determine access level based on role
    RETURN json_build_object(
        'level', CASE 
            WHEN role_name = 'super_admin' THEN 'national'
            WHEN role_name = 'regional_admin' THEN 'region'
            WHEN role_name = 'provincial_admin' THEN 'province'
            WHEN role_name = 'city_admin' THEN 'city'
            WHEN role_name = 'barangay_admin' THEN 'barangay'
            ELSE 'none'
        END,
        'access', true,
        'role', role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FIXED RLS POLICIES FOR RESIDENTS TABLE
-- =============================================================================

-- Drop the existing broken policies
DROP POLICY IF EXISTS "Multi-level geographic access for residents" ON residents;
DROP POLICY IF EXISTS "Residents geographic access via households" ON residents;

-- Create new policy that properly handles the household join
CREATE POLICY "Residents geographic access via households" ON residents
FOR ALL USING (
    -- Super admin can access all residents
    is_super_admin() OR
    
    -- Users can access residents based on their geographic level
    EXISTS (
        SELECT 1 
        FROM households h 
        WHERE h.code = residents.household_code
        AND (
            CASE user_access_level()::json->>'level'
                WHEN 'barangay' THEN h.barangay_code = user_barangay_code()
                WHEN 'city' THEN h.city_municipality_code = user_city_code()
                WHEN 'province' THEN h.province_code = user_province_code()
                WHEN 'region' THEN h.region_code = user_region_code()
                WHEN 'national' THEN true
                ELSE false
            END
        )
    )
);

-- =============================================================================
-- GRANTS FOR RLS FUNCTIONS
-- =============================================================================

-- Allow authenticated users to execute these functions
GRANT EXECUTE ON FUNCTION user_barangay_code() TO authenticated;
GRANT EXECUTE ON FUNCTION user_city_code() TO authenticated;
GRANT EXECUTE ON FUNCTION user_province_code() TO authenticated;
GRANT EXECUTE ON FUNCTION user_region_code() TO authenticated;
GRANT EXECUTE ON FUNCTION user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION user_access_level() TO authenticated;

-- =============================================================================
-- VALIDATION TESTS
-- =============================================================================

DO $$
BEGIN
    -- Test function creation
    IF (SELECT COUNT(*) FROM pg_proc WHERE proname IN (
        'user_barangay_code', 'user_city_code', 'user_province_code', 
        'user_region_code', 'user_role', 'is_super_admin', 'user_access_level'
    )) = 7 THEN
        RAISE NOTICE '✅ All RLS functions created successfully';
    ELSE
        RAISE EXCEPTION '❌ Missing RLS functions';
    END IF;
    
    -- Test policy creation
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'residents' AND policyname = 'Residents geographic access via households') = 1 THEN
        RAISE NOTICE '✅ Residents RLS policy created successfully';
    ELSE
        RAISE EXCEPTION '❌ Missing residents RLS policy';
    END IF;
    
    RAISE NOTICE '🚀 RLS security fixes applied successfully!';
    RAISE NOTICE 'ℹ️ Functions will return NULL as service role - they work properly for authenticated users';
    RAISE NOTICE '📋 Next step: Run create-rls-indexes.sql to add performance indexes';
END $$;