-- Verify the actual database has the correct schema
SELECT 'Households table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
ORDER BY ordinal_position;

-- Check if we can insert directly
INSERT INTO households (code, barangay_code, street_name, total_members, created_by, created_at) 
VALUES ('TEST-001', '042114014', 'Test Street', 0, (SELECT id FROM user_profiles LIMIT 1), NOW());

SELECT 'Test record inserted:' as info;
SELECT * FROM households WHERE code = 'TEST-001';

-- Clean up test record
DELETE FROM households WHERE code = 'TEST-001';