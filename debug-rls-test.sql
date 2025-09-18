-- Debug RLS Test Function
-- Run this in your Supabase SQL editor to create a test function

CREATE OR REPLACE FUNCTION test_household_access(target_barangay VARCHAR(10) DEFAULT NULL)
RETURNS TABLE (
    household_code VARCHAR(50),
    barangay_code VARCHAR(10),
    created_by VARCHAR(50),
    auth_uid_result VARCHAR(50),
    user_barangay_result VARCHAR(10),
    rls_check_result BOOLEAN
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.code::VARCHAR(50) as household_code,
        h.barangay_code::VARCHAR(10) as barangay_code,
        h.created_by::VARCHAR(50) as created_by,
        auth.uid()::VARCHAR(50) as auth_uid_result,
        user_barangay_code()::VARCHAR(10) as user_barangay_result,
        (h.barangay_code = user_barangay_code())::BOOLEAN as rls_check_result
    FROM households h
    WHERE 
        target_barangay IS NULL OR h.barangay_code = target_barangay
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;