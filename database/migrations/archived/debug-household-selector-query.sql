-- Debug HouseholdSelector Query Issues
-- This replicates the exact query the HouseholdSelector component uses

-- First, check what the HouseholdSelector component expects to find
-- This is the exact query from HouseholdSelector.tsx lines 104-127

SELECT 
    h.*,
    head_resident.id as head_resident_id,
    head_resident.first_name as head_resident_first_name,
    head_resident.middle_name as head_resident_middle_name,
    head_resident.last_name as head_resident_last_name,
    gs.id as geo_streets_id,
    gs.name as geo_streets_name,
    gsub.id as geo_subdivisions_id,
    gsub.name as geo_subdivisions_name,
    gsub.type as geo_subdivisions_type
FROM households h
LEFT JOIN residents head_resident ON (
    head_resident.household_code = h.code 
    AND head_resident.relationship_to_head = 'head' 
    AND head_resident.is_active = true
)
LEFT JOIN geo_streets gs ON h.street_id = gs.id
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
WHERE h.barangay_code = '042114014'
ORDER BY h.code;

-- Check if the specific household exists with proper relationships
SELECT 
    'Household exists' as check_type,
    COUNT(*) as count
FROM households 
WHERE barangay_code = '042114014';

-- Check if household has proper street_id reference
SELECT 
    'Household has street_id' as check_type,
    h.code,
    h.street_id,
    h.subdivision_id,
    CASE 
        WHEN h.street_id IS NOT NULL THEN 'Has street_id'
        ELSE 'Missing street_id'
    END as street_status
FROM households h
WHERE h.barangay_code = '042114014';

-- Check if geo_streets record exists for the street_id
SELECT 
    'Street record exists' as check_type,
    h.code as household_code,
    h.street_id,
    gs.id as street_record_id,
    gs.name as street_name,
    CASE 
        WHEN gs.id IS NOT NULL THEN 'Street record found'
        ELSE 'Street record missing'
    END as street_record_status
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
WHERE h.barangay_code = '042114014';

-- Check if subdivision record exists
SELECT 
    'Subdivision record exists' as check_type,
    h.code as household_code,
    h.subdivision_id,
    gsub.id as subdivision_record_id,
    gsub.name as subdivision_name,
    CASE 
        WHEN gsub.id IS NOT NULL THEN 'Subdivision record found'
        ELSE 'Subdivision record missing'
    END as subdivision_record_status
FROM households h
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
WHERE h.barangay_code = '042114014';

-- Check user profile barangay_code to ensure it matches
SELECT 
    'User profile check' as check_type,
    id,
    email,
    barangay_code,
    CASE 
        WHEN barangay_code = '042114014' THEN 'Barangay code matches'
        ELSE 'Barangay code mismatch: ' || COALESCE(barangay_code, 'NULL')
    END as barangay_status
FROM auth_user_profiles 
WHERE id = auth.uid();

-- Check if household has head resident assigned
SELECT 
    'Head resident check' as check_type,
    h.code as household_code,
    COUNT(r.id) as head_count,
    STRING_AGG(r.first_name || ' ' || r.last_name, ', ') as head_names
FROM households h
LEFT JOIN residents r ON (
    r.household_code = h.code 
    AND r.relationship_to_head = 'head' 
    AND r.is_active = true
)
WHERE h.barangay_code = '042114014'
GROUP BY h.code;