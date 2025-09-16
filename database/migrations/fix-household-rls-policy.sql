-- Fix Household RLS Policy: Correct JSON extraction
-- The issue was using user_access_level()::json->>'level' instead of user_access_level()->>'level'

-- Drop existing policy
DROP POLICY IF EXISTS "Multi-level geographic access for households" ON households;

-- Create corrected policy
CREATE POLICY "Multi-level geographic access for households" ON households
FOR ALL USING (
    -- Super admin can access all households
    is_super_admin() OR
    
    -- Geographic jurisdiction matching for household data access
    CASE user_access_level()->>'level'
        WHEN 'barangay' THEN barangay_code = user_barangay_code()
        WHEN 'city' THEN city_municipality_code = user_city_code()
        WHEN 'province' THEN province_code = user_province_code()
        WHEN 'region' THEN region_code = user_region_code()
        WHEN 'national' THEN true
        ELSE false
    END
);

-- Test that the policy was created
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'households' AND policyname = 'Multi-level geographic access for households') = 1 THEN
        RAISE NOTICE '✅ Household RLS policy updated successfully';
    ELSE
        RAISE EXCEPTION '❌ Household RLS policy update failed';
    END IF;
    
    RAISE NOTICE '📱 Please refresh browser and test household access';
    RAISE NOTICE '🔍 Fixed JSON extraction: user_access_level()::json->>"level" → user_access_level()->>"level"';
END $$;