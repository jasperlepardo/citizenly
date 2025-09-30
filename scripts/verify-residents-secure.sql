-- Verify only secure policies remain on residents table
SELECT 
    policyname, 
    permissive, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'residents';