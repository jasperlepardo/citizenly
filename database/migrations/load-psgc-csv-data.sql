-- =================================================================
-- PSGC CSV DATA LOADER
-- =================================================================
-- Loads complete PSGC data from updated CSV files
-- 
-- PREREQUISITES:
-- 1. Database schema created (schema.sql)
-- 2. CSV files in: database/sample data/psgc/updated/
-- 3. PostgreSQL COPY permissions or use \copy for file access
--
-- USAGE:
-- psql -d your_database -f load-psgc-csv-data.sql
-- =================================================================

BEGIN;

-- Disable triggers temporarily for faster loading
SET session_replication_role = replica;

-- =================================================================
-- CLEAR EXISTING DATA
-- =================================================================
TRUNCATE psgc_barangays CASCADE;
TRUNCATE psgc_cities_municipalities CASCADE;
TRUNCATE psgc_provinces CASCADE; 
TRUNCATE psgc_regions CASCADE;

-- =================================================================
-- LOAD REGIONS
-- =================================================================
-- File: psgc_regions.updated.csv
-- Format: code,name

\copy psgc_regions (code, name) FROM 'database/sample data/psgc/updated/psgc_regions.updated.csv' WITH CSV HEADER;

-- =================================================================
-- LOAD PROVINCES
-- =================================================================  
-- File: psgc_provinces.updated.csv
-- Format: code,name,region_code,is_active

\copy psgc_provinces (code, name, region_code, is_active) FROM 'database/sample data/psgc/updated/psgc_provinces.updated.csv' WITH CSV HEADER;

-- =================================================================
-- LOAD CITIES AND MUNICIPALITIES
-- =================================================================
-- File: psgc_cities_municipalities.updated.fixed.csv  
-- Format: code,name,province_code,type,is_independent

\copy psgc_cities_municipalities (code, name, province_code, type, is_independent) FROM 'database/sample data/psgc/updated/psgc_cities_municipalities.updated.fixed.csv' WITH CSV HEADER;

-- =================================================================
-- LOAD BARANGAYS
-- =================================================================
-- File: psgc_barangays.updated.csv
-- Format: code,name,city_municipality_code,urban_rural_status

\copy psgc_barangays (code, name, city_municipality_code) FROM 'database/sample data/psgc/updated/psgc_barangays.updated.csv' WITH (CSV, HEADER);

-- =================================================================
-- RE-ENABLE CONSTRAINTS
-- =================================================================
SET session_replication_role = DEFAULT;

-- =================================================================
-- DATA VALIDATION
-- =================================================================

-- Check record counts
SELECT 'PSGC Data Load Summary' as summary;
SELECT '=====================' as divider;

SELECT 'Regions' as entity, COUNT(*) as count FROM psgc_regions
UNION ALL
SELECT 'Provinces', COUNT(*) FROM psgc_provinces
UNION ALL  
SELECT 'Cities/Municipalities', COUNT(*) FROM psgc_cities_municipalities
UNION ALL
SELECT 'Barangays', COUNT(*) FROM psgc_barangays;

-- Integrity checks
SELECT '=====================' as divider;
SELECT 'Data Integrity Checks' as summary;  
SELECT '=====================' as divider;

-- Check for orphaned records
SELECT CASE WHEN COUNT(*) = 0 THEN '✅ All provinces have valid regions' 
            ELSE '❌ ' || COUNT(*) || ' provinces without regions' END as check_result
FROM psgc_provinces p 
LEFT JOIN psgc_regions r ON p.region_code = r.code
WHERE r.code IS NULL;

SELECT CASE WHEN COUNT(*) = 0 THEN '✅ All non-independent cities have valid provinces'
            ELSE '❌ ' || COUNT(*) || ' cities without provinces' END as check_result  
FROM psgc_cities_municipalities c
LEFT JOIN psgc_provinces p ON c.province_code = p.code
WHERE c.province_code IS NOT NULL AND p.code IS NULL;

SELECT CASE WHEN COUNT(*) = 0 THEN '✅ All barangays have valid cities/municipalities'
            ELSE '❌ ' || COUNT(*) || ' barangays without cities' END as check_result
FROM psgc_barangays b  
LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
WHERE c.code IS NULL;

-- Geographic distribution summary
SELECT '=====================' as divider;
SELECT 'Geographic Distribution' as summary;
SELECT '=====================' as divider;

SELECT 
    r.name as region,
    COUNT(DISTINCT p.code) as provinces,
    COUNT(DISTINCT c.code) as cities_municipalities,
    COUNT(DISTINCT b.code) as barangays
FROM psgc_regions r
LEFT JOIN psgc_provinces p ON r.code = p.region_code
LEFT JOIN psgc_cities_municipalities c ON p.code = c.province_code
LEFT JOIN psgc_barangays b ON c.code = b.city_municipality_code  
GROUP BY r.code, r.name
ORDER BY r.code;

-- Update table statistics
ANALYZE psgc_regions;
ANALYZE psgc_provinces;
ANALYZE psgc_cities_municipalities; 
ANALYZE psgc_barangays;

COMMIT;

SELECT '=====================' as divider;
SELECT '✅ PSGC data load completed successfully!' as status;
SELECT 'Next: Load PSOC occupational data' as next_step;
SELECT '=====================' as divider;