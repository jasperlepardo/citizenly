-- Production Security Fix: Missing RLS Functions
-- This migration adds the missing user access functions required by RLS policies

-- =============================================================================
-- USER ACCESS FUNCTIONS FOR RLS POLICIES
-- =============================================================================

-- Get user's barangay code for RLS filtering
CREATE OR REPLACE FUNCTION user_barangay_code()
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
CREATE OR REPLACE FUNCTION user_city_code()
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
CREATE OR REPLACE FUNCTION user_province_code()
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
CREATE OR REPLACE FUNCTION user_region_code()
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
CREATE OR REPLACE FUNCTION user_role()
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
CREATE OR REPLACE FUNCTION is_super_admin()
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

-- =============================================================================
-- FIXED RLS POLICIES FOR RESIDENTS TABLE
-- =============================================================================

-- Drop the existing broken policy
DROP POLICY IF EXISTS "Multi-level geographic access for residents" ON residents;

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
-- INDEXES FOR RLS PERFORMANCE
-- =============================================================================

-- Index for household code lookups (critical for RLS performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_residents_household_code_active 
ON residents (household_code) 
WHERE is_active = true;

-- Index for household geographic codes (critical for RLS joins)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_households_geographic_codes 
ON households (barangay_code, city_municipality_code, province_code, region_code);

-- Index for user profile lookups (critical for RLS functions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_user_profiles_active_geographic 
ON auth_user_profiles (id, barangay_code, city_municipality_code, province_code, region_code) 
WHERE is_active = true;

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

-- =============================================================================
-- VALIDATION TESTS
-- =============================================================================

-- Test the functions (these should return NULL when run as service role)
-- In production, these will return actual values when run as authenticated users

DO $$
BEGIN
    -- Test function creation
    IF (SELECT COUNT(*) FROM pg_proc WHERE proname IN (
        'user_barangay_code', 'user_city_code', 'user_province_code', 
        'user_region_code', 'user_role', 'is_super_admin'
    )) = 6 THEN
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
END $$;