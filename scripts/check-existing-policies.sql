-- Check what policies exist on households table
SELECT 
    policyname, 
    permissive, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'households';