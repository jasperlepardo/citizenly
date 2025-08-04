-- Sample Authentication Data for RBI System
-- This script creates demo users with proper role and barangay assignments

-- First, ensure we have the required roles
INSERT INTO roles (id, name, description, permissions) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Super Admin', 
  'System-wide administrator with full access', 
  '{"all": true}'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

INSERT INTO roles (id, name, description, permissions) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Barangay Admin', 
  'Barangay administrator with local management access', 
  '{"manage_users": true, "manage_residents": true, "manage_households": true, "view_analytics": true}'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

INSERT INTO roles (id, name, description, permissions) VALUES
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Clerk', 
  'Data entry clerk with limited access', 
  '{"manage_residents": true, "view_residents": true}'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Create demo users (assuming Supabase auth users exist with these IDs)
-- Note: In real deployment, users must be created through Supabase Auth first

-- Super Admin User
INSERT INTO user_profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  middle_name,
  phone,
  role_id, 
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@rbi.local',
  'System',
  'Administrator',
  NULL,
  '+639123456789',
  '550e8400-e29b-41d4-a716-446655440001',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id;

-- Barangay Admin User (Bagong Pag-asa, Quezon City)
INSERT INTO user_profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  middle_name,
  phone,
  role_id, 
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@barangay.local',
  'Maria',
  'Santos',
  'Dela Cruz',
  '+639187654321',
  '550e8400-e29b-41d4-a716-446655440002',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id;

-- Clerk User (Bagong Pag-asa, Quezon City)
INSERT INTO user_profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  middle_name,
  phone,
  role_id, 
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'clerk@barangay.local',
  'Juan',
  'Dela Cruz',
  'Reyes',
  '+639171234567',
  '550e8400-e29b-41d4-a716-446655440003',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id;

-- Assign barangay access (using Bagong Pag-asa, Quezon City - Code: 137604176)
-- Note: This barangay code should exist in your PSGC data

-- Barangay Admin assignment
INSERT INTO barangay_accounts (
  id,
  user_id,
  barangay_code,
  is_primary
) VALUES (
  '550e8400-e29b-41d4-a716-446655440011',
  '00000000-0000-0000-0000-000000000002',
  '137604176',
  true
) ON CONFLICT (user_id, barangay_code) DO UPDATE SET
  is_primary = EXCLUDED.is_primary;

-- Clerk assignment (same barangay)
INSERT INTO barangay_accounts (
  id,
  user_id,
  barangay_code,
  is_primary
) VALUES (
  '550e8400-e29b-41d4-a716-446655440012',
  '00000000-0000-0000-0000-000000000003',
  '137604176',
  true
) ON CONFLICT (user_id, barangay_code) DO UPDATE SET
  is_primary = EXCLUDED.is_primary;

-- Display the created data
SELECT 
  up.email,
  up.first_name,
  up.last_name,
  r.name as role_name,
  ba.barangay_code,
  ba.is_primary
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
LEFT JOIN barangay_accounts ba ON up.id = ba.user_id
WHERE up.email LIKE '%@barangay.local' OR up.email LIKE '%@rbi.local'
ORDER BY up.email;

-- Show sample login credentials for testing
SELECT 
  '=== DEMO LOGIN CREDENTIALS ===' as info
UNION ALL
SELECT 'Email: admin@barangay.local | Role: Barangay Admin | Barangay: 137604176'
UNION ALL
SELECT 'Email: clerk@barangay.local | Role: Clerk | Barangay: 137604176'
UNION ALL
SELECT 'Password for all accounts: password123 (set in Supabase Auth)'
UNION ALL
SELECT '=== NOTE: Users must be created in Supabase Auth first ===';