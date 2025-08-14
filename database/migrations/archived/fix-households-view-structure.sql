-- Fix the api_households_with_members view to match frontend expectations
-- The frontend expects head_resident as an object and geographic info as nested objects

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
    -- Head resident as JSON object (frontend expects this structure)
    CASE 
        WHEN r.id IS NOT NULL THEN 
            json_build_object(
                'id', r.id,
                'first_name', r.first_name,
                'middle_name', r.middle_name,
                'last_name', r.last_name
            )
        ELSE NULL
    END as head_resident,
    COALESCE(member_count.count, 0) as member_count,
    -- Geographic info as nested objects (frontend expects this structure)
    json_build_object(
        'code', pb.code,
        'name', pb.name
    ) as barangay_info,
    json_build_object(
        'code', pc.code,
        'name', pc.name,
        'type', pc.type
    ) as city_municipality_info,
    CASE 
        WHEN pp.code IS NOT NULL THEN 
            json_build_object(
                'code', pp.code,
                'name', pp.name
            )
        ELSE NULL
    END as province_info,
    json_build_object(
        'code', pr.code,
        'name', pr.name
    ) as region_info
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

-- Test the fixed structure
SELECT 
    'Fixed view test' as status,
    code,
    street_name,
    house_number,
    subdivision,
    head_resident,
    member_count,
    barangay_info,
    city_municipality_info
FROM api_households_with_members 
WHERE barangay_code = '042114014';