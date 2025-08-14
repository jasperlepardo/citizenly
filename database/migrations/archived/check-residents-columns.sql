-- Check what columns actually exist in residents table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'residents' AND table_schema = 'public'
ORDER BY ordinal_position;