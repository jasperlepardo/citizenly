-- =====================================================
-- REFERENCE DATA MIGRATION SCRIPT
-- Import PSGC and PSOC data from CSV files
-- =====================================================

-- 1. IMPORT PSGC DATA (Geographic Codes)
-- =====================================================

-- NOTE: This SQL script is provided as reference only.
-- For Supabase deployment, use the JavaScript import script (import-csv-data.js)
-- which handles column mapping and transformations automatically.

-- The following COPY commands would work if CSV columns matched schema exactly:

-- Import Regions (schema: code, name, created_at, updated_at)
-- COPY psgc_regions(code, name) 
-- FROM '/path/to/database/sample data/psgc/psgc_regions.csv' 
-- DELIMITER ',' CSV HEADER;

-- Import Provinces (schema: code, name, region_code - CSV has extra is_active column)
-- COPY psgc_provinces(code, name, region_code)
-- FROM '/path/to/database/sample data/psgc/psgc_provinces.csv'
-- DELIMITER ',' CSV HEADER;

-- Import Cities/Municipalities (schema: code, name, type, province_code - CSV has extra is_independent column)
-- COPY psgc_cities_municipalities(code, name, type, province_code)
-- FROM '/path/to/database/sample data/psgc/psgc_cities_municipalities.csv'
-- DELIMITER ',' CSV HEADER;

-- Import Barangays (schema: code, name, city_municipality_code - CSV has extra urban_rural_status column)
-- COPY psgc_barangays(code, name, city_municipality_code)
-- FROM '/path/to/database/sample data/psgc/psgc_barangays.csv'
-- DELIMITER ',' CSV HEADER;

-- ⚠️  IMPORTANT: Column mismatches between CSV and schema prevent direct COPY.
-- ✅  USE: npm run import (JavaScript script with column mapping)

-- 2. IMPORT PSOC DATA (Occupation Codes)
-- =====================================================

-- Import Major Groups (level 1)
COPY psoc_major_groups(code, title)
FROM '/path/to/database/sample data/psoc/psoc_major_groups.csv'
DELIMITER ',' CSV HEADER;

-- Import Sub-Major Groups (level 2)  
COPY psoc_sub_major_groups(code, title, major_code)
FROM '/path/to/database/sample data/psoc/psoc_sub_major_groups.csv'
DELIMITER ',' CSV HEADER;

-- Import Minor Groups (level 3)
COPY psoc_minor_groups(code, title, sub_major_code)
FROM '/path/to/database/sample data/psoc/psoc_minor_groups.csv'
DELIMITER ',' CSV HEADER;

-- Import Unit Groups (level 4)
COPY psoc_unit_groups(code, title, minor_code)
FROM '/path/to/database/sample data/psoc/psoc_unit_groups.csv'
DELIMITER ',' CSV HEADER;

-- Import Unit Sub-Groups (level 5)
COPY psoc_unit_sub_groups(code, title, unit_code)
FROM '/path/to/database/sample data/psoc/psoc_unit_sub_groups.csv'
DELIMITER ',' CSV HEADER;

-- Import Cross-References (related occupations)
COPY psoc_occupation_cross_references(unit_group_code, related_unit_code, related_occupation_title)
FROM '/path/to/database/sample data/psoc/psoc_unit_group_related.csv'
DELIMITER ',' CSV HEADER;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check import counts
SELECT 'psgc_regions' as table_name, COUNT(*) as record_count FROM psgc_regions
UNION ALL
SELECT 'psgc_provinces', COUNT(*) FROM psgc_provinces  
UNION ALL
SELECT 'psgc_cities_municipalities', COUNT(*) FROM psgc_cities_municipalities
UNION ALL
SELECT 'psgc_barangays', COUNT(*) FROM psgc_barangays
UNION ALL
SELECT 'psoc_major_groups', COUNT(*) FROM psoc_major_groups
UNION ALL
SELECT 'psoc_sub_major_groups', COUNT(*) FROM psoc_sub_major_groups
UNION ALL
SELECT 'psoc_minor_groups', COUNT(*) FROM psoc_minor_groups
UNION ALL
SELECT 'psoc_unit_groups', COUNT(*) FROM psoc_unit_groups
UNION ALL
SELECT 'psoc_unit_sub_groups', COUNT(*) FROM psoc_unit_sub_groups
UNION ALL
SELECT 'psoc_occupation_cross_references', COUNT(*) FROM psoc_occupation_cross_references;

-- Test search functionality
SELECT * FROM psoc_occupation_search 
WHERE occupation_title ILIKE '%congressman%' 
ORDER BY hierarchy_level;

-- Test cross-reference (search for 1211, should show 2411 related)
SELECT * FROM psoc_occupation_search 
WHERE occupation_code = '1211' OR occupation_code IN (
    SELECT related_unit_code FROM psoc_occupation_cross_references WHERE unit_group_code = '1211'
)
ORDER BY hierarchy_level;