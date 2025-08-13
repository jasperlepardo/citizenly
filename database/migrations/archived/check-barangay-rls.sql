-- Check Row Level Security policies on psgc_barangays table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'psgc_barangays';

-- Also check if RLS is enabled
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'psgc_barangays' 
AND schemaname = 'public';