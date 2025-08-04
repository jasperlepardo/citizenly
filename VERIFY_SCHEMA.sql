-- Verify the actual database schema
SELECT 'Households table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

SELECT 'Sample household data:' as info;
SELECT * FROM households LIMIT 1;