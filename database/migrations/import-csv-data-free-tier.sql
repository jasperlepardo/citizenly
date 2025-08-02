-- =====================================================
-- FREE TIER DATA IMPORT WITH ADVANCED FEATURES
-- Optimized approach to get cross-references, position titles, 
-- and full-text search in Supabase free tier
-- =====================================================

-- 1. Import basic PSOC hierarchy (same as before)
\copy psoc_major_groups(code, title) FROM 'psgc/psoc_major_groups.csv' CSV HEADER;
\copy psoc_sub_major_groups(code, title, major_code) FROM 'psoc/psoc_sub_major_groups.csv' CSV HEADER;
\copy psoc_minor_groups(code, title, sub_major_code) FROM 'psoc/psoc_minor_groups.csv' CSV HEADER;
\copy psoc_unit_groups(code, title, minor_code) FROM 'psoc/psoc_unit_groups.csv' CSV HEADER;
\copy psoc_unit_sub_groups(code, title, unit_code) FROM 'psoc/psoc_unit_sub_groups.csv' CSV HEADER;

-- 2. Transform cross-references into denormalized format
-- Group related titles by unit_code for efficient searching
INSERT INTO psoc_cross_references (unit_code, related_titles)
SELECT 
    unit_code,
    string_agg(related_occupation_title, ', ' ORDER BY related_occupation_title)
FROM (
    SELECT DISTINCT unit_code, related_occupation_title 
    FROM temp_cross_ref_import
) grouped
GROUP BY unit_code;

-- Temporary table for cross-reference import
CREATE TEMP TABLE temp_cross_ref_import (
    unit_code VARCHAR(10),
    related_unit_code VARCHAR(10),
    related_occupation_title VARCHAR(200)
);

\copy temp_cross_ref_import FROM 'psoc/psoc_unit_group_related.csv' CSV HEADER;

-- 3. Create position titles from unit sub-groups
-- Group position titles by unit_group for JSONB storage
INSERT INTO psoc_position_titles (unit_group_code, titles)
SELECT 
    unit_code,
    jsonb_agg(title ORDER BY title)
FROM psoc_unit_sub_groups
GROUP BY unit_code;

-- 4. Import PSGC data (same as before)
\copy psgc_regions(code, name) FROM 'psgc/psgc_regions.csv' CSV HEADER;
\copy psgc_provinces(code, name, region_code, is_active) FROM 'psgc/psgc_provinces.csv' CSV HEADER;
\copy psgc_cities_municipalities(code, name, province_code, type, is_independent) FROM 'psgc/psgc_cities_municipalities.csv' CSV HEADER;
\copy psgc_barangays(code, name, city_municipality_code, urban_rural_status) FROM 'psgc/psgc_barangays.csv' CSV HEADER;

-- 5. Test the enhanced search functionality
-- Test 1: Search for "financial" (should show cross-references)
SELECT 'Cross-reference Test' as test_name, COUNT(*) as results
FROM psoc_occupation_search 
WHERE searchable_text ILIKE '%financial%';

-- Test 2: Search for "congressman" (should show position title)
SELECT 'Position Title Test' as test_name, COUNT(*) as results
FROM psoc_occupation_search 
WHERE searchable_text ILIKE '%congressman%';

-- Test 3: Full-text search on residents (will be tested after resident data)
SELECT 'Schema Validation' as test_name, 'Ready' as status;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample roles
INSERT INTO roles (name, permissions) VALUES 
('super_admin', '{"all": true}'),
('barangay_admin', '{"residents": "crud", "households": "crud"}'),
('clerk', '{"residents": "crud"}'),
('resident', '{"residents": "read_own"}');

-- Sample usage examples for developers:
/*
-- Full-text search residents by name, occupation, or phone
SELECT * FROM residents 
WHERE search_text ILIKE '%john%' OR search_text ILIKE '%teacher%'
ORDER BY last_name, first_name;

-- Occupation search with cross-references
SELECT * FROM psoc_occupation_search 
WHERE searchable_text ILIKE '%manager%'
ORDER BY hierarchy_level;

-- Find all position titles under a unit group
SELECT titles FROM psoc_position_titles 
WHERE unit_group_code = '1211';

-- Get cross-referenced occupations
SELECT related_titles FROM psoc_cross_references 
WHERE unit_code = '1211';
*/