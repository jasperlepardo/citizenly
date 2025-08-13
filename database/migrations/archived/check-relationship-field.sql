-- Check if relationship_to_head field exists in residents table
SELECT 
    'Column check' as test_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'residents' 
AND column_name = 'relationship_to_head';

-- If it doesn't exist, check the household_head_id approach
SELECT 
    'Household head check' as test_type,
    h.code,
    h.household_head_id,
    r.id as resident_id,
    r.first_name || ' ' || r.last_name as resident_name
FROM households h
LEFT JOIN residents r ON h.household_head_id = r.id
WHERE h.barangay_code = '042114014';

-- Check if we need to set household_head_id for existing resident
SELECT 
    'Available residents to set as head' as test_type,
    h.code as household_code,
    r.id as resident_id,
    r.first_name || ' ' || r.last_name as resident_name,
    h.household_head_id as current_head_id
FROM households h
LEFT JOIN residents r ON r.household_code = h.code
WHERE h.barangay_code = '042114014';