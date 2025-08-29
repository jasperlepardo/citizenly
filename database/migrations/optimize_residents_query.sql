-- Migration: Optimize residents query performance
-- Date: 2025-08-29
-- Purpose: Add composite indexes to improve residents listing query performance

-- Drop existing individual indexes that will be covered by composite indexes
DROP INDEX IF EXISTS idx_residents_household;
DROP INDEX IF EXISTS idx_residents_search_active;

-- Create optimized composite index for the main residents listing query
-- This covers: is_active, household_code (for JOIN), and created_at (for ORDER BY)
CREATE INDEX idx_residents_listing_optimized 
ON residents(is_active, household_code, created_at DESC) 
WHERE is_active = true AND household_code IS NOT NULL;

-- Create composite index for search queries with name filters
CREATE INDEX idx_residents_name_search_optimized 
ON residents(is_active, last_name, first_name, middle_name) 
WHERE is_active = true;

-- Create composite index on households for the JOIN operation
CREATE INDEX idx_households_geographic_lookup
ON households(code, barangay_code, city_municipality_code, province_code, region_code)
WHERE is_active = true;

-- Analyze tables to update statistics for query planner
ANALYZE residents;
ANALYZE households;

-- Add comment explaining the optimization
COMMENT ON INDEX idx_residents_listing_optimized IS 'Optimized index for residents listing queries with household joins and pagination';
COMMENT ON INDEX idx_residents_name_search_optimized IS 'Optimized index for name-based search queries on active residents';
COMMENT ON INDEX idx_households_geographic_lookup IS 'Optimized index for geographic filtering in resident-household joins';