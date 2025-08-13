-- FIX RESIDENT ROLE PERMISSIONS
-- Ensures resident role has proper permissions to access the system

-- =============================================================================
-- 1. UPDATE RESIDENT ROLE PERMISSIONS
-- =============================================================================

-- Update the resident role with proper permissions
UPDATE public.roles 
SET permissions = '{
  "residents": ["read", "create", "update"],
  "residents_view": true,
  "residents_create": true,
  "residents_update": true,
  "households": ["read"],
  "households_view": true
}'::jsonb
WHERE name = 'resident';

-- =============================================================================
-- 2. UPDATE BARANGAY_ADMIN ROLE PERMISSIONS
-- =============================================================================

-- Update barangay_admin role with comprehensive permissions
UPDATE public.roles 
SET permissions = '{
  "residents": ["read", "create", "update", "delete"],
  "residents_view": true,
  "residents_create": true,
  "residents_update": true,
  "residents_delete": true,
  "households": ["read", "create", "update", "delete"],
  "households_view": true,
  "households_create": true,
  "households_update": true,
  "households_delete": true,
  "users": ["read"],
  "users_view": true,
  "reports": ["read"],
  "reports_view": true
}'::jsonb
WHERE name = 'barangay_admin';

-- =============================================================================
-- 3. VERIFY ROLE PERMISSIONS
-- =============================================================================

-- Check what permissions each role has
SELECT 
  name,
  permissions,
  CASE 
    WHEN permissions ? 'residents_view' THEN 'Has residents_view'
    WHEN permissions->'residents' ? '0' THEN 'Has residents array access'
    ELSE 'Missing residents access'
  END as residents_access_check
FROM public.roles 
WHERE name IN ('resident', 'barangay_admin')
ORDER BY name;

-- =============================================================================
-- 4. TEST USER PROFILE ACCESS
-- =============================================================================

-- Show current user profiles and their roles
SELECT 
  up.id,
  up.email,
  up.first_name,
  up.last_name,
  r.name as role_name,
  r.permissions
FROM public.user_profiles up
JOIN public.roles r ON up.role_id = r.id
ORDER BY up.created_at DESC
LIMIT 5;

SELECT 'Resident role permissions updated successfully' as status;