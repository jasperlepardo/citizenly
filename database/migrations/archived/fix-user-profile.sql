-- Script to fix user profile and barangay assignment
-- Run this in your Supabase SQL editor

-- =============================================================================
-- 1. CHECK CURRENT USER STATUS
-- =============================================================================

-- Check if you have any auth users
SELECT 
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check current user profiles
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

-- =============================================================================
-- 2. GET SAMPLE BARANGAY CODES
-- =============================================================================

-- Get some Metro Manila barangay codes for assignment
SELECT 
    b.code,
    b.name as barangay_name,
    c.name as city_name,
    p.name as province_name
FROM psgc_barangays b
LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code  
WHERE c.name IN ('Quezon City', 'Manila', 'Makati', 'Pasig', 'Mandaluyong')
ORDER BY c.name, b.name 
LIMIT 20;

-- =============================================================================
-- 3. CREATE/UPDATE USER PROFILE (REPLACE WITH YOUR DETAILS)
-- =============================================================================

-- First, get the resident role ID
SELECT id, name FROM public.roles WHERE name = 'resident';

-- Method A: If you have an auth user but no profile, create the profile
-- REPLACE 'your-auth-user-id-here' and 'your-email@example.com' with actual values
/*
INSERT INTO user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    barangay_code, 
    role_id, 
    is_active
) 
SELECT 
    'your-auth-user-id-here'::uuid,  -- Replace with your auth user ID
    'your-email@example.com',        -- Replace with your email
    'Your',                          -- Replace with your first name
    'Name',                          -- Replace with your last name
    '137404001',                     -- Example barangay code (Quezon City)
    r.id,                           -- resident role ID
    true
FROM public.roles r 
WHERE r.name = 'resident'
ON CONFLICT (id) DO UPDATE SET
    barangay_code = EXCLUDED.barangay_code,
    role_id = EXCLUDED.role_id,
    is_active = true,
    updated_at = NOW();
*/

-- Method B: If you have a profile but no barangay, update it
-- REPLACE 'your-email@example.com' with your actual email
/*
UPDATE user_profiles 
SET 
    barangay_code = '137404001',  -- Example: Barangay in Quezon City
    role_id = (SELECT id FROM public.roles WHERE name = 'resident'),
    is_active = true,
    updated_at = NOW()
WHERE email = 'your-email@example.com';
*/

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
    p.name as province_name
FROM user_profiles up
LEFT JOIN public.roles r ON up.role_id = r.id
LEFT JOIN psgc_barangays b ON up.barangay_code = b.code
LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
WHERE up.email = 'your-email@example.com'  -- Replace with your email
ORDER BY up.created_at DESC;

-- =============================================================================
-- 5. TEST THE COMPLETE ADDRESS FUNCTION
-- =============================================================================

-- Test if the address hierarchy works for your assigned barangay
SELECT 
    b.code,
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
WHERE b.code = '137404001';  -- Replace with your chosen barangay code