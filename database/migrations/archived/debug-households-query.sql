-- Debug query to check what households exist and why they might not be showing

-- First, let's see what households exist in the database
SELECT 
    code,
    house_number,
    street_id,
    subdivision_id,
    barangay_code,
    name
FROM households 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any households for your specific barangay
-- Replace 'YOUR_BARANGAY_CODE' with your actual barangay code
SELECT 
    h.code,
    h.house_number,
    h.street_id,
    h.subdivision_id,
    h.barangay_code,
    h.name,
    gs.name as street_name,
    gsub.name as subdivision_name
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
-- WHERE h.barangay_code = 'YOUR_BARANGAY_CODE'  -- Uncomment and replace with your barangay code
ORDER BY h.created_at DESC;

-- Check what barangay code your user profile has
SELECT 
    id,
    email,
    first_name,
    last_name,
    barangay_code,
    is_active
FROM auth_user_profiles 
WHERE id = auth.uid();

-- Check if there are any households with missing street references (which would be filtered out by INNER JOIN)
SELECT 
    count(*) as households_total,
    count(street_id) as households_with_street_id,
    count(gs.id) as households_with_valid_street_reference
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id;