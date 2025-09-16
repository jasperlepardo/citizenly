-- Production-Ready RLS Policy for Households
-- Enhanced version with error handling and logging

-- Drop current policy
DROP POLICY IF EXISTS "Multi-level geographic access for households" ON households;

-- Create production-ready policy with comprehensive error handling
CREATE POLICY "Multi-level geographic access for households" ON households
FOR ALL USING (
    -- Early exit for super admin (most performant)
    is_super_admin() OR
    
    -- Ensure user has an active profile
    EXISTS (
        SELECT 1 FROM auth_user_profiles 
        WHERE id = auth.uid() AND is_active = true
    ) AND
    
    -- Geographic access control with proper NULL handling
    CASE 
        WHEN user_access_level() IS NULL THEN false
        WHEN user_access_level()->>'level' IS NULL THEN false
        ELSE
            CASE user_access_level()->>'level'
                WHEN 'national' THEN true
                WHEN 'region' THEN (
                    region_code IS NOT NULL AND 
                    user_region_code() IS NOT NULL AND 
                    region_code = user_region_code()
                )
                WHEN 'province' THEN (
                    province_code IS NOT NULL AND 
                    user_province_code() IS NOT NULL AND 
                    province_code = user_province_code()
                )
                WHEN 'city' THEN (
                    city_municipality_code IS NOT NULL AND 
                    user_city_code() IS NOT NULL AND 
                    city_municipality_code = user_city_code()
                )
                WHEN 'barangay' THEN (
                    barangay_code IS NOT NULL AND 
                    user_barangay_code() IS NOT NULL AND 
                    barangay_code = user_barangay_code()
                )
                ELSE false
            END
    END
);

-- Add comment for documentation
COMMENT ON POLICY "Multi-level geographic access for households" ON households IS 
'Production RLS policy for households with geographic access control and comprehensive error handling. 
Updated: 2025-09-12 - Fixed JSON extraction and added NULL checks';

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_households_barangay_code ON households(barangay_code);
CREATE INDEX IF NOT EXISTS idx_households_city_code ON households(city_municipality_code);
CREATE INDEX IF NOT EXISTS idx_households_province_code ON households(province_code);
CREATE INDEX IF NOT EXISTS idx_households_region_code ON households(region_code);

-- Verify policy was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'households' 
        AND policyname = 'Multi-level geographic access for households'
    ) THEN
        RAISE NOTICE '✅ Production RLS policy created successfully';
        RAISE NOTICE '📋 Run production-rls-validation.sql to verify security';
        RAISE NOTICE '🚀 Ready for production deployment after validation';
    ELSE
        RAISE EXCEPTION '❌ Policy creation failed';
    END IF;
END $$;