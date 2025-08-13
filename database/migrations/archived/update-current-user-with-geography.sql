-- Update the current user (261e373c-4aea-49eb-804d-b4d074ab03d8) with complete geographic hierarchy
-- This will fix the immediate address loading error

-- Get a complete address hierarchy for Quezon City
WITH address_info AS (
    SELECT 
        b.code as barangay_code,
        b.city_municipality_code,
        c.province_code,
        p.region_code
    FROM psgc_barangays b
    LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    LEFT JOIN psgc_provinces p ON c.province_code = p.code
    WHERE b.code = '137404004'  -- Barangay Bagong Pag-asa, Quezon City
)
UPDATE user_profiles 
SET 
    barangay_code = '137404004',
    city_municipality_code = (SELECT city_municipality_code FROM address_info),
    province_code = (SELECT province_code FROM address_info),
    region_code = (SELECT region_code FROM address_info),
    role_id = COALESCE(role_id, (SELECT id FROM public.roles WHERE name = 'resident')),
    is_active = true,
    updated_at = NOW()
WHERE id = '261e373c-4aea-49eb-804d-b4d074ab03d8';

-- Verify the update
SELECT 
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    up.barangay_code,
    up.city_municipality_code,
    up.province_code,  
    up.region_code,
    up.is_active,
    r.name as role_name,
    b.name as barangay_name,
    c.name as city_name,
    p.name as province_name,
    reg.name as region_name
FROM user_profiles up
LEFT JOIN public.roles r ON up.role_id = r.id
LEFT JOIN psgc_barangays b ON up.barangay_code = b.code
LEFT JOIN psgc_cities_municipalities c ON up.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON up.province_code = p.code
LEFT JOIN psgc_regions reg ON up.region_code = reg.code
WHERE up.id = '261e373c-4aea-49eb-804d-b4d074ab03d8';