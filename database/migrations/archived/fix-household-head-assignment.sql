-- Fix household head assignment for existing household and resident
-- This updates the household to assign the existing resident as the head

UPDATE households 
SET household_head_id = (
    SELECT id 
    FROM residents 
    WHERE household_code = '042114014-0000-0001-0001'
    LIMIT 1
)
WHERE code = '042114014-0000-0001-0001';

-- Verify the update
SELECT 
    'After update' as status,
    h.code,
    h.household_head_id,
    r.first_name || ' ' || r.last_name as head_resident_name
FROM households h
LEFT JOIN residents r ON h.household_head_id = r.id
WHERE h.code = '042114014-0000-0001-0001';