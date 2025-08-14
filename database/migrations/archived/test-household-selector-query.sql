-- Test the exact query that HouseholdSelector now uses

-- 1. First check if household exists
SELECT 
    'Household exists' as test,
    code,
    name,
    house_number,
    street_id,
    subdivision_id,
    barangay_code,
    household_head_id
FROM households 
WHERE barangay_code = '042114014';

-- 2. Check geo_streets relationship
SELECT 
    'Streets relationship' as test,
    h.code as household_code,
    h.street_id,
    gs.id as street_id,
    gs.name as street_name
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
WHERE h.barangay_code = '042114014';

-- 3. Check geo_subdivisions relationship  
SELECT 
    'Subdivisions relationship' as test,
    h.code as household_code,
    h.subdivision_id,
    gsub.id as subdivision_id,
    gsub.name as subdivision_name,
    gsub.type as subdivision_type
FROM households h
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
WHERE h.barangay_code = '042114014';

-- 4. Test the exact query the component uses
SELECT 
    h.code,
    h.name,
    h.house_number,
    h.street_id,
    h.subdivision_id,
    h.barangay_code,
    h.household_head_id,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', gs.id,
            'name', gs.name
        )
    ) FILTER (WHERE gs.id IS NOT NULL) as geo_streets,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', gsub.id,
            'name', gsub.name,
            'type', gsub.type
        )
    ) FILTER (WHERE gsub.id IS NOT NULL) as geo_subdivisions
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
WHERE h.barangay_code = '042114014'
GROUP BY h.code, h.name, h.house_number, h.street_id, h.subdivision_id, h.barangay_code, h.household_head_id
ORDER BY h.code;