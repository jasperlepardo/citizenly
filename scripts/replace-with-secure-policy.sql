-- Replace temporary policy with secure one
-- Run this AFTER confirming household access works

-- Drop the temporary "allow all" policy
DROP POLICY "allow_all_households" ON households;

-- Create the proper secure policy
CREATE POLICY "household_geographic_access" ON households
FOR ALL USING (
    is_super_admin() OR
    barangay_code = user_barangay_code()
);