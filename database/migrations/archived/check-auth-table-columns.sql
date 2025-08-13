-- Check the actual column names in auth.users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name LIKE '%meta%'
ORDER BY ordinal_position;