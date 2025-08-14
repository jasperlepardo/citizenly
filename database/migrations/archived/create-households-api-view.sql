-- Create the missing api_households_with_members view for the households page

CREATE OR REPLACE VIEW api_households_with_members AS
SELECT 
    h.code,
    h.name,
    h.house_number,
    h.barangay_code,
    h.city_municipality_code,
    h.province_code,
    h.region_code,
    h.created_at,
    h.updated_at,
    gs.name as street_name,
    gsub.name as subdivision,
    r.id as head_resident_id,
    r.first_name as head_resident_first_name,
    r.middle_name as head_resident_middle_name,
    r.last_name as head_resident_last_name,
    COALESCE(member_count.count, 0) as member_count,
    -- Add geographic info for display
    pb.name as barangay_name,
    pc.name as city_municipality_name,
    pc.type as city_municipality_type,
    pp.name as province_name,
    pr.name as region_name
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
LEFT JOIN residents r ON h.household_head_id = r.id
LEFT JOIN (
    SELECT 
        household_code, 
        COUNT(*) as count 
    FROM residents 
    WHERE is_active = true 
    GROUP BY household_code
) member_count ON h.code = member_count.household_code
LEFT JOIN psgc_barangays pb ON h.barangay_code = pb.code
LEFT JOIN psgc_cities_municipalities pc ON h.city_municipality_code = pc.code
LEFT JOIN psgc_provinces pp ON h.province_code = pp.code
LEFT JOIN psgc_regions pr ON h.region_code = pr.code;

-- Verify the view was created and test with your data
SELECT 
    'View created successfully' as status,
    COUNT(*) as household_count
FROM api_households_with_members 
WHERE barangay_code = '042114014';

-- Show the actual data
SELECT 
    code,
    street_name,
    house_number,
    subdivision,
    head_resident_first_name || ' ' || head_resident_last_name as head_name,
    member_count,
    barangay_name,
    city_municipality_name
FROM api_households_with_members 
WHERE barangay_code = '042114014';