-- =============================================================================
-- SUPABASE COMPATIBLE PERFORMANCE OPTIMIZATION QUERIES
-- =============================================================================
-- Run these individually in Supabase SQL Editor (without CONCURRENTLY)
-- Each section should be run separately for best results
--
-- STEP 1: Critical Trigram Indexes (Run these first)
-- =============================================================================

-- Barangay name search optimization (highest impact)
CREATE INDEX IF NOT EXISTS idx_psgc_barangays_name_trgm 
ON psgc_barangays USING GIN (name gin_trgm_ops);

-- City/Municipality name search optimization  
CREATE INDEX IF NOT EXISTS idx_psgc_cities_municipalities_name_trgm 
ON psgc_cities_municipalities USING GIN (name gin_trgm_ops);

-- Province name search optimization
CREATE INDEX IF NOT EXISTS idx_psgc_provinces_name_trgm 
ON psgc_provinces USING GIN (name gin_trgm_ops);

-- Region name search optimization
CREATE INDEX IF NOT EXISTS idx_psgc_regions_name_trgm 
ON psgc_regions USING GIN (name gin_trgm_ops);

-- =============================================================================
-- STEP 2: Foreign Key Indexes (Run these second)
-- =============================================================================

-- PSGC hierarchy foreign key indexes (critical for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_psgc_barangays_city_code 
ON psgc_barangays(city_municipality_code);

CREATE INDEX IF NOT EXISTS idx_psgc_cities_province_code 
ON psgc_cities_municipalities(province_code);

CREATE INDEX IF NOT EXISTS idx_psgc_provinces_region_code 
ON psgc_provinces(region_code);

-- =============================================================================
-- STEP 3: Composite Indexes (Run these third)
-- =============================================================================

-- Barangay search with activity filter
CREATE INDEX IF NOT EXISTS idx_psgc_barangays_name_active 
ON psgc_barangays(name, is_active) 
WHERE is_active = true;

-- City search with type and activity filter
CREATE INDEX IF NOT EXISTS idx_psgc_cities_name_type_active 
ON psgc_cities_municipalities(name, type, is_active) 
WHERE is_active = true;

-- Province search with region and activity
CREATE INDEX IF NOT EXISTS idx_psgc_provinces_name_region_active 
ON psgc_provinces(name, region_code, is_active) 
WHERE is_active = true;

-- Geographic hierarchy lookup optimization
CREATE INDEX IF NOT EXISTS idx_psgc_barangays_hierarchy 
ON psgc_barangays(city_municipality_code, name, is_active);

CREATE INDEX IF NOT EXISTS idx_psgc_cities_hierarchy 
ON psgc_cities_municipalities(province_code, name, type, is_active);

-- =============================================================================
-- STEP 4: Materialized View (Run this fourth, as separate statements)
-- =============================================================================

-- First, drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS mv_psgc_geographic_search;

-- Create the materialized view (Run this as a single statement)
CREATE MATERIALIZED VIEW mv_psgc_geographic_search AS
SELECT DISTINCT
    -- Barangay level
    b.code as barangay_code,
    b.name as barangay_name,
    b.is_active as barangay_active,
    
    -- City/Municipality level
    c.code as city_code,
    c.name as city_name,
    c.type as city_type,
    c.is_independent as city_independent,
    c.is_active as city_active,
    
    -- Province level
    p.code as province_code,
    p.name as province_name,
    p.is_active as province_active,
    
    -- Region level
    r.code as region_code,
    r.name as region_name,
    r.is_active as region_active,
    
    -- Computed fields for search optimization
    LOWER(b.name) as barangay_name_lower,
    LOWER(c.name) as city_name_lower,
    LOWER(COALESCE(p.name, '')) as province_name_lower,
    LOWER(r.name) as region_name_lower,
    
    -- Full address combinations
    b.name || ', ' || c.name as barangay_city,
    CASE 
        WHEN p.name IS NOT NULL THEN 
            b.name || ', ' || c.name || ', ' || p.name || ', ' || r.name
        ELSE 
            b.name || ', ' || c.name || ', ' || r.name
    END as full_address,
    
    -- Search optimization field
    LOWER(
        b.name || ' ' || c.name || ' ' || 
        COALESCE(p.name || ' ', '') || r.name
    ) as searchable_text

FROM psgc_barangays b
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
WHERE b.is_active = true 
  AND c.is_active = true 
  AND COALESCE(p.is_active, true) = true 
  AND r.is_active = true;

-- =============================================================================
-- STEP 5: Indexes on Materialized View (Run these fifth)
-- =============================================================================

-- Create indexes on the materialized view
CREATE INDEX IF NOT EXISTS idx_mv_psgc_barangay_name_trgm 
ON mv_psgc_geographic_search USING GIN (barangay_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mv_psgc_city_name_trgm 
ON mv_psgc_geographic_search USING GIN (city_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mv_psgc_province_name_trgm 
ON mv_psgc_geographic_search USING GIN (province_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mv_psgc_searchable_text_trgm 
ON mv_psgc_geographic_search USING GIN (searchable_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mv_psgc_barangay_code 
ON mv_psgc_geographic_search(barangay_code);

CREATE INDEX IF NOT EXISTS idx_mv_psgc_city_code 
ON mv_psgc_geographic_search(city_code);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_psgc_unique 
ON mv_psgc_geographic_search(barangay_code, city_code);

-- =============================================================================
-- VERIFICATION QUERY (Run this last to check)
-- =============================================================================

-- Check that all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (tablename LIKE 'psgc_%' OR tablename LIKE 'mv_psgc_%')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;