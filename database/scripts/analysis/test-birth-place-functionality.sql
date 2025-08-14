-- =====================================================
-- TEST BIRTH PLACE FUNCTIONALITY
-- This tests the single field approach for birth place
-- Similar to PSOC implementation
-- =====================================================

-- Test 1: Insert resident with barangay-level birth place
-- Example: born in a specific barangay
/*
INSERT INTO residents (
    first_name, last_name, birthdate, sex, civil_status,
    household_id, barangay_code,
    birth_place_code, birth_place_level
) VALUES (
    'Juan', 'Dela Cruz', '1990-01-15', 'male', 'single',
    '00000000-0000-0000-0000-000000000001', -- sample household ID
    '042604001', -- sample barangay code
    '042604001', -- born in same barangay
    'barangay'
);
*/

-- Test 2: Insert resident with province-level birth place
-- Example: only knows province of birth
/*
INSERT INTO residents (
    first_name, last_name, birthdate, sex, civil_status,
    household_id, barangay_code,
    birth_place_code, birth_place_level
) VALUES (
    'Maria', 'Santos', '1985-03-20', 'female', 'married',
    '00000000-0000-0000-0000-000000000001', -- sample household ID
    '042604001', -- current barangay
    '0426', -- born in Bataan province
    'province'
);
*/

-- Test 3: Insert resident with foreign birth place
-- Example: born abroad
/*
INSERT INTO residents (
    first_name, last_name, birthdate, sex, civil_status,
    household_id, barangay_code,
    birth_place_text
) VALUES (
    'Jose', 'Rodriguez', '1980-07-10', 'male', 'married',
    '00000000-0000-0000-0000-000000000001', -- sample household ID
    '042604001', -- current barangay
    'New York, USA' -- free text for foreign birth
);
*/

-- Test queries to verify functionality:

-- 1. Test the birth_place_options view
SELECT * FROM birth_place_options 
WHERE place_level = 'region' 
LIMIT 5;

-- 2. Test search function
SELECT * FROM search_birth_places('Manila');

-- 3. Test search with level filter
SELECT * FROM search_birth_places('Bataan', 'province'::birth_place_level_enum);

-- 4. Test get birth place details
SELECT * FROM get_birth_place_details('01', 'region'::birth_place_level_enum);

-- 5. Verify auto-calculated age works
-- (This would show after inserting test residents)
/*
SELECT 
    first_name, 
    last_name, 
    birthdate, 
    age,
    birth_place_full 
FROM residents 
WHERE birth_place_code IS NOT NULL
LIMIT 5;
*/

-- Example Usage Documentation:
-- 
-- To insert a resident born in a specific barangay:
-- birth_place_code = '042604001', birth_place_level = 'barangay'
--
-- To insert a resident born in a province (don't know exact city):
-- birth_place_code = '0426', birth_place_level = 'province'  
--
-- To insert a resident born abroad:
-- birth_place_text = 'London, United Kingdom'
--
-- The birth_place_full column will automatically generate:
-- - For PSGC codes: Complete address from hierarchy
-- - For text: Display the text as-is
--
-- Search examples:
-- - search_birth_places('Manila') -- Find all places with Manila in name
-- - search_birth_places('Quezon', 'city_municipality'::birth_place_level_enum) -- Find cities named Quezon
-- - search_birth_places(NULL, 'region'::birth_place_level_enum) -- List all regions

COMMENT ON SCRIPT IS 'Test suite for birth place single field approach functionality';