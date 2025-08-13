-- Step 3: Check the auth_roles table structure and your specific role

-- First check what columns exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'auth_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;