-- Quick script to check user status and assign barangay

-- 1. Check what users exist in the system
SELECT 
    id,
    email, 
    first_name, 
    last_name, 
    barangay_code,
    role_id,
    is_active,
    created_at
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check if there are any auth users
SELECT 
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Get some sample barangay codes to assign
SELECT 
    b.code,
    b.name as barangay_name,
    c.name as city_name,
    p.name as province_name,
    r.name as region_name
FROM psgc_barangays b
LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code  
LEFT JOIN psgc_regions r ON p.region_code = r.code
WHERE c.name LIKE '%Quezon City%' OR c.name LIKE '%Manila%' OR c.name LIKE '%Makati%'
ORDER BY b.name 
LIMIT 10;

-- 4. Example assignment (uncomment and replace with actual user ID and barangay code)
-- UPDATE user_profiles 
-- SET barangay_code = '137404001'  -- Example: A barangay in Quezon City
-- WHERE email = 'your-email@example.com'  -- Replace with your actual email
-- AND barangay_code IS NULL;

-- 5. Verify assignment after running the update
-- SELECT 
--     up.email,
--     up.barangay_code,
--     b.name as barangay_name,
--     c.name as city_name
-- FROM user_profiles up
-- LEFT JOIN psgc_barangays b ON up.barangay_code = b.code
-- LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
-- WHERE up.email = 'your-email@example.com';