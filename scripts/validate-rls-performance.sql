-- Performance validation for RLS policy
-- Test performance of typical household queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT code, barangay_code, created_by
FROM households 
WHERE barangay_code = '042114014' 
LIMIT 10;