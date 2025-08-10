-- Test Script: Verify OSC and OSY Auto-Calculation
-- Description: Tests the automatic calculation of Out-of-School Children and Out-of-School Youth flags
-- Date: 2024-12-08

-- ============================================================================
-- TEST CASES: Create sample residents to test auto-calculation
-- ============================================================================

-- Clean up any existing test data
DELETE FROM resident_sectoral_info WHERE resident_id IN (
    SELECT id FROM residents WHERE last_name_encrypted = encrypt_pii('TESTCASE')
);
DELETE FROM residents WHERE last_name_encrypted = encrypt_pii('TESTCASE');

-- Test Case 1: Out-of-School Child (Age 10, not a student)
INSERT INTO residents (
    first_name_encrypted,
    last_name_encrypted,
    birthdate,
    sex,
    employment_status,
    education_attainment,
    is_graduate,
    barangay_code,
    city_municipality_code,
    region_code
) VALUES (
    encrypt_pii('OSC_Child'),
    encrypt_pii('TESTCASE'),
    CURRENT_DATE - INTERVAL '10 years',  -- Age 10
    'male',
    'unemployed',  -- Not a student
    'elementary',
    false,
    '137602022',  -- Sample barangay code
    '137602000',  -- Sample city code
    '13'          -- Sample region code
);

-- Test Case 2: In-School Child (Age 8, student)
INSERT INTO residents (
    first_name_encrypted,
    last_name_encrypted,
    birthdate,
    sex,
    employment_status,
    education_attainment,
    is_graduate,
    barangay_code,
    city_municipality_code,
    region_code
) VALUES (
    encrypt_pii('InSchool_Child'),
    encrypt_pii('TESTCASE'),
    CURRENT_DATE - INTERVAL '8 years',  -- Age 8
    'female',
    'student',  -- Is a student
    'elementary',
    false,
    '137602022',
    '137602000',
    '13'
);

-- Test Case 3: Out-of-School Youth (Age 18, not student, not employed, no college degree)
INSERT INTO residents (
    first_name_encrypted,
    last_name_encrypted,
    birthdate,
    sex,
    employment_status,
    education_attainment,
    is_graduate,
    barangay_code,
    city_municipality_code,
    region_code
) VALUES (
    encrypt_pii('OSY_Youth'),
    encrypt_pii('TESTCASE'),
    CURRENT_DATE - INTERVAL '18 years',  -- Age 18
    'male',
    'unemployed',  -- Not employed and not a student
    'high_school',
    true,  -- Graduated high school but no college
    '137602022',
    '137602000',
    '13'
);

-- Test Case 4: Employed Youth (Age 20, employed, should NOT be OSY)
INSERT INTO residents (
    first_name_encrypted,
    last_name_encrypted,
    birthdate,
    sex,
    employment_status,
    education_attainment,
    is_graduate,
    barangay_code,
    city_municipality_code,
    region_code
) VALUES (
    encrypt_pii('Employed_Youth'),
    encrypt_pii('TESTCASE'),
    CURRENT_DATE - INTERVAL '20 years',  -- Age 20
    'female',
    'employed',  -- Is employed
    'high_school',
    true,
    '137602022',
    '137602000',
    '13'
);

-- Test Case 5: College Student (Age 19, student, should NOT be OSY)
INSERT INTO residents (
    first_name_encrypted,
    last_name_encrypted,
    birthdate,
    sex,
    employment_status,
    education_attainment,
    is_graduate,
    barangay_code,
    city_municipality_code,
    region_code
) VALUES (
    encrypt_pii('College_Student'),
    encrypt_pii('TESTCASE'),
    CURRENT_DATE - INTERVAL '19 years',  -- Age 19
    'male',
    'student',  -- Is a student
    'college',
    false,  -- Still in college
    '137602022',
    '137602000',
    '13'
);

-- Test Case 6: College Graduate (Age 23, unemployed but has degree, should NOT be OSY)
INSERT INTO residents (
    first_name_encrypted,
    last_name_encrypted,
    birthdate,
    sex,
    employment_status,
    education_attainment,
    is_graduate,
    barangay_code,
    city_municipality_code,
    region_code
) VALUES (
    encrypt_pii('College_Grad'),
    encrypt_pii('TESTCASE'),
    CURRENT_DATE - INTERVAL '23 years',  -- Age 23
    'female',
    'unemployed',
    'college',
    true,  -- Completed college
    '137602022',
    '137602000',
    '13'
);

-- Test Case 7: Senior Citizen (Age 65, should auto-calculate senior citizen flag)
INSERT INTO residents (
    first_name_encrypted,
    last_name_encrypted,
    birthdate,
    sex,
    employment_status,
    education_attainment,
    is_graduate,
    barangay_code,
    city_municipality_code,
    region_code
) VALUES (
    encrypt_pii('Senior_Citizen'),
    encrypt_pii('TESTCASE'),
    CURRENT_DATE - INTERVAL '65 years',  -- Age 65
    'male',
    'retired',
    'college',
    true,
    '137602022',
    '137602000',
    '13'
);

-- Wait a moment for triggers to complete
SELECT pg_sleep(1);

-- ============================================================================
-- VERIFICATION: Check the auto-calculated results
-- ============================================================================

SELECT 
    decrypt_pii(r.first_name_encrypted) as first_name,
    EXTRACT(YEAR FROM age(r.birthdate)) as age,
    r.employment_status,
    r.education_attainment,
    r.is_graduate,
    rsi.is_out_of_school_children as "OSC?",
    rsi.is_out_of_school_youth as "OSY?",
    rsi.is_senior_citizen as "Senior?",
    CASE 
        WHEN rsi.is_out_of_school_children THEN 'Out-of-School Child'
        WHEN rsi.is_out_of_school_youth THEN 'Out-of-School Youth'
        WHEN rsi.is_senior_citizen THEN 'Senior Citizen'
        ELSE 'None'
    END as calculated_status
FROM residents r
LEFT JOIN resident_sectoral_info rsi ON r.id = rsi.resident_id
WHERE r.last_name_encrypted = encrypt_pii('TESTCASE')
ORDER BY age;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- | first_name      | age | employment | education   | grad | OSC?  | OSY?  | Senior? | Status             |
-- |-----------------|-----|------------|-------------|------|-------|-------|---------|-------------------|
-- | InSchool_Child  | 8   | student    | elementary  | f    | false | false | false   | None              |
-- | OSC_Child       | 10  | unemployed | elementary  | f    | true  | false | false   | Out-of-School Child|
-- | OSY_Youth       | 18  | unemployed | high_school | t    | false | true  | false   | Out-of-School Youth|
-- | College_Student | 19  | student    | college     | f    | false | false | false   | None              |
-- | Employed_Youth  | 20  | employed   | high_school | t    | false | false | false   | None              |
-- | College_Grad    | 23  | unemployed | college     | t    | false | false | false   | None              |
-- | Senior_Citizen  | 65  | retired    | college     | t    | false | false | true    | Senior Citizen    |

-- ============================================================================
-- SUMMARY STATISTICS
-- ============================================================================

SELECT 
    COUNT(*) FILTER (WHERE is_out_of_school_children) as total_osc,
    COUNT(*) FILTER (WHERE is_out_of_school_youth) as total_osy,
    COUNT(*) FILTER (WHERE is_senior_citizen) as total_seniors,
    COUNT(*) as total_residents
FROM resident_sectoral_info rsi
JOIN residents r ON r.id = rsi.resident_id
WHERE r.last_name_encrypted = encrypt_pii('TESTCASE');

-- ============================================================================
-- CLEANUP: Remove test data (uncomment to clean up)
-- ============================================================================

-- DELETE FROM resident_sectoral_info WHERE resident_id IN (
--     SELECT id FROM residents WHERE last_name_encrypted = encrypt_pii('TESTCASE')
-- );
-- DELETE FROM residents WHERE last_name_encrypted = encrypt_pii('TESTCASE');