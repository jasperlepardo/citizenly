-- CREATE AUTHENTICATION USERS FOR RBI SYSTEM
-- This script helps create the demo users in Supabase Auth

-- NOTE: This script shows the SQL that Supabase Auth would execute,
-- but in practice, you need to create users through the Supabase Dashboard
-- or using the Supabase Admin API.

-- =============================================================================
-- INSTRUCTIONS FOR CREATING DEMO USERS
-- =============================================================================

/*
To create the demo users, you have two options:

OPTION 1: Using Supabase Dashboard (Recommended for testing)
---------------------------------------------------------
1. Go to https://supabase.com/dashboard
2. Open your project: osxfdjefhmmdjjuoghoo
3. Go to Authentication > Users
4. Click "Add user" and create these accounts:

   User 1 (Barangay Admin):
   - Email: admin@barangay.local
   - Password: password123
   - Confirm password: password123
   - User ID: 00000000-0000-0000-0000-000000000002

   User 2 (Clerk):
   - Email: clerk@barangay.local
   - Password: password123
   - Confirm password: password123
   - User ID: 00000000-0000-0000-0000-000000000003

OPTION 2: Using Supabase Admin API (For production setup)
--------------------------------------------------------
Use the Supabase Admin SDK to create users programmatically.

*/

-- =============================================================================
-- VERIFY USER PROFILES ARE READY
-- =============================================================================

-- Check if user profiles exist and are properly configured
SELECT 
    'USER PROFILES STATUS' as section,
    up.id,
    up.email,
    up.first_name || ' ' || up.last_name as full_name,
    r.name as role_name,
    up.is_active,
    CASE 
        WHEN ba.barangay_code IS NOT NULL 
        THEN 'Has barangay assignment: ' || ba.barangay_code
        ELSE 'NO BARANGAY ASSIGNMENT'
    END as barangay_status
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
LEFT JOIN barangay_accounts ba ON up.id = ba.user_id
WHERE up.email IN ('admin@barangay.local', 'clerk@barangay.local')
ORDER BY up.email;

-- Check if roles exist
SELECT 
    'ROLES STATUS' as section,
    r.name,
    r.description,
    r.permissions::text
FROM roles r
WHERE r.name IN ('Barangay Admin', 'Clerk')
ORDER BY r.name;

-- Check if PSGC barangay exists
SELECT 
    'BARANGAY DATA STATUS' as section,
    b.code,
    b.name,
    cm.name as city_municipality,
    p.name as province,
    r.name as region
FROM psgc_barangays b
LEFT JOIN psgc_cities_municipalities cm ON b.city_municipality_code = cm.code
LEFT JOIN psgc_provinces p ON cm.province_code = p.code
LEFT JOIN psgc_regions r ON p.region_code = r.code
WHERE b.code = '137604176'
LIMIT 1;

-- =============================================================================
-- SAMPLE AUTHENTICATION TEST
-- =============================================================================

/*
After creating the users in Supabase Auth, test the login with these credentials:

1. Barangay Admin Login:
   Email: admin@barangay.local
   Password: password123

2. Clerk Login:
   Email: clerk@barangay.local
   Password: password123

The users should be able to:
- Login successfully
- See their barangay assignment in the header
- Access the resident creation form
- Have the address auto-populated with their barangay data

*/

-- =============================================================================
-- TROUBLESHOOTING QUERIES
-- =============================================================================

-- If login fails, run these queries to debug:

-- 1. Check if user_profiles exist with correct IDs
-- SELECT * FROM user_profiles WHERE email LIKE '%@barangay.local';

-- 2. Check if barangay_accounts are properly linked
-- SELECT * FROM barangay_accounts WHERE user_id IN (
--     SELECT id FROM user_profiles WHERE email LIKE '%@barangay.local'
-- );

-- 3. Check if roles have proper permissions
-- SELECT name, permissions FROM roles WHERE name IN ('Barangay Admin', 'Clerk');

-- 4. Verify RLS policies are not blocking access
-- SELECT * FROM pg_policies WHERE tablename IN ('user_profiles', 'barangay_accounts');

SELECT 'Setup script completed. Please create the auth users as described above.' as message;