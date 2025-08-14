-- Script to assign a barangay to an existing user for testing
-- This should be run after the user has been created through signup

-- First, let's see what users exist
SELECT id, email, first_name, last_name, barangay_code 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Get a sample barangay code to assign (use a barangay from Metro Manila)
SELECT code, name, city_municipality_code
FROM psgc_barangays 
WHERE city_municipality_code LIKE '137%'  -- Metro Manila area
ORDER BY name 
LIMIT 5;

-- Example: Assign barangay "137401001" (Barangay 001, Caloocan City) to the most recent user
-- Replace the user ID with the actual ID from the first query
-- UPDATE user_profiles 
-- SET barangay_code = '137401001'
-- WHERE id = 'YOUR_USER_ID_HERE'
-- AND barangay_code IS NULL;

-- Verify the assignment
-- SELECT up.id, up.email, up.barangay_code, b.name as barangay_name, c.name as city_name
-- FROM user_profiles up
-- LEFT JOIN psgc_barangays b ON up.barangay_code = b.code
-- LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
-- WHERE up.barangay_code IS NOT NULL;