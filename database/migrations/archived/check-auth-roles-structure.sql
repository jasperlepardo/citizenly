-- Check the actual structure of auth_roles table

-- 1. Check what columns exist in auth_roles
SELECT 
    'auth_roles columns' as test_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'auth_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check what data is in auth_roles table
SELECT 
    'auth_roles data' as test_name,
    *
FROM auth_roles
LIMIT 5;

-- 3. Check if there are any role-related tables
SELECT 
    'Role-related tables' as test_name,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%role%'
ORDER BY table_name;