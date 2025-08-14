-- Clean up old RPC functions that are causing VARCHAR(10) errors
-- This will remove the problematic insert_resident_encrypted function

DROP FUNCTION IF EXISTS insert_resident_encrypted CASCADE;

-- Verify the function is removed
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%resident%';