-- Create a simple working household RLS policy
-- This version avoids complex JSON extraction that might be causing issues

CREATE POLICY "household_geographic_access" ON households
FOR ALL USING (
    -- Super admin bypass
    is_super_admin() = true OR
    
    -- Simple barangay-level access 
    barangay_code = user_barangay_code()
);