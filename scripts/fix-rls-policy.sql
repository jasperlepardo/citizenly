-- Fix RLS Policy: Remove incorrect JSON cast
-- The issue: user_access_level() already returns JSON, so ::json cast breaks it

-- Drop the broken policy
DROP POLICY IF EXISTS "Multi-level geographic access for households" ON households;

-- Create the fixed policy with correct JSON extraction
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