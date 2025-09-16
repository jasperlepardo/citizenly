-- Performance Indexes for RLS Policies
-- Run this AFTER running fix-rls-functions-final.sql
-- These indexes are critical for RLS performance

-- =============================================================================
-- PERFORMANCE INDEXES FOR RLS QUERIES
-- =============================================================================

-- Index for household code lookups (critical for RLS performance)
-- This speeds up the JOIN between residents and households in RLS policy
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_residents_household_code_active 
ON residents (household_code) 
WHERE is_active = true;

-- Index for household geographic codes (critical for RLS joins)
-- This speeds up geographic filtering in the RLS policy
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_households_geographic_codes 
ON households (barangay_code, city_municipality_code, province_code, region_code);

-- Index for user profile lookups (critical for RLS functions)
-- This speeds up the RLS functions that look up user geographic codes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_user_profiles_active_geographic 
ON auth_user_profiles (id, barangay_code, city_municipality_code, province_code, region_code) 
WHERE is_active = true;

-- Index for user profile role lookups (critical for is_super_admin function)
-- This speeds up role-based access checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_user_profiles_role_lookup 
ON auth_user_profiles (id, role_id) 
WHERE is_active = true;

-- Index for role name lookups (critical for admin checks)
-- This speeds up the role name resolution in RLS functions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_roles_name 
ON auth_roles (id, name);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- After running this script, verify indexes were created:
-- SELECT schemaname, tablename, indexname FROM pg_indexes 
-- WHERE indexname LIKE 'idx_%rls%' OR indexname LIKE 'idx_%geographic%' OR indexname LIKE 'idx_%profiles%';