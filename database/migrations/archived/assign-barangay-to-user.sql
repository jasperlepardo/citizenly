-- Script to assign barangay to the logged-in user
-- User ID: 261e373c-4aea-49eb-804d-b4d074ab03d8

-- =============================================================================
-- 1. CHECK CURRENT USER STATUS
-- =============================================================================

-- Check the current user profile
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
WHERE id = '261e373c-4aea-49eb-804d-b4d074ab03d8';

-- =============================================================================
-- 2. GET A GOOD BARANGAY CODE TO ASSIGN
-- =============================================================================

-- Get a barangay from Quezon City (good test location)
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
WHERE c.name = 'Quezon City'
ORDER BY b.name 
LIMIT 5;

-- =============================================================================
-- 3. ASSIGN BARANGAY TO USER
-- =============================================================================

-- Update the user profile with a barangay assignment
-- Using Barangay Bagong Pag-asa, Quezon City (code: 137404004)
UPDATE user_profiles 
SET 
    barangay_code = '137404004',  -- Barangay Bagong Pag-asa, Quezon City
    role_id = COALESCE(role_id, (SELECT id FROM public.roles WHERE name = 'resident')),
    is_active = true,
    updated_at = NOW()
WHERE id = '261e373c-4aea-49eb-804d-b4d074ab03d8';

-- =============================================================================
-- 4. VERIFY THE ASSIGNMENT
-- =============================================================================

-- Check the updated profile with complete address info
SELECT 
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    up.barangay_code,
    up.is_active,
    r.name as role_name,
    b.name as barangay_name,
    c.name as city_name,
    p.name as province_name,
    reg.name as region_name
FROM user_profiles up
LEFT JOIN public.roles r ON up.role_id = r.id
LEFT JOIN psgc_barangays b ON up.barangay_code = b.code
LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions reg ON p.region_code = reg.code
WHERE up.id = '261e373c-4aea-49eb-804d-b4d074ab03d8';

-- =============================================================================
-- 5. TEST ADDRESS HIERARCHY FOR THE ASSIGNED BARANGAY
-- =============================================================================

-- Verify the address hierarchy works correctly
SELECT 
    'Testing address hierarchy for assigned barangay' as test_description,
    b.code as barangay_code,
    b.name as barangay_name,
    b.city_municipality_code,
    c.name as city_name,
    c.province_code,
    p.name as province_name,
    p.region_code,
    r.name as region_name
FROM psgc_barangays b
LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON p.region_code = r.code
WHERE b.code = '137404004';

-- =============================================================================
-- 6. CHECK ROLE PERMISSIONS
-- =============================================================================

-- Verify the resident role has proper permissions
SELECT 
    name,
    permissions,
    CASE 
        WHEN permissions ? 'residents_view' THEN '✓ Has residents_view'
        WHEN permissions->'residents' ? '0' THEN '✓ Has residents array access'
        ELSE '✗ Missing residents access'
    END as residents_access_check
FROM public.roles 
WHERE name = 'resident';