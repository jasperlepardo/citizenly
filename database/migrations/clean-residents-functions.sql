-- Clean up old RPC functions and create simple approach
-- Remove complex functions that are causing issues

DROP FUNCTION IF EXISTS insert_resident_encrypted CASCADE;

-- We'll use direct INSERT with proper field mapping in the API instead of complex RPC functions