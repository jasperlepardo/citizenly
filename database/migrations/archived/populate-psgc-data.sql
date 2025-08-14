-- =================================================================
-- PSGC DATA MIGRATION SCRIPT
-- =================================================================
-- Populates PSGC (Philippine Standard Geographic Code) reference data
-- from updated CSV files (2Q 2025 Publication)
--
-- Usage: psql -d your_database -f populate-psgc-data.sql
-- Files: database/sample data/psgc/updated/*.csv
--
-- IMPORTANT: Run this AFTER creating the database schema (schema.sql)
-- =================================================================

BEGIN;

-- Disable triggers and constraints temporarily for faster loading
SET session_replication_role = replica;

-- =================================================================
-- STEP 1: CLEAR EXISTING PSGC DATA (if any)
-- =================================================================
TRUNCATE psgc_barangays CASCADE;
TRUNCATE psgc_cities_municipalities CASCADE; 
TRUNCATE psgc_provinces CASCADE;
TRUNCATE psgc_regions CASCADE;

-- =================================================================
-- STEP 2: POPULATE REGIONS
-- =================================================================
-- Source: psgc_regions.updated.csv
-- Format: code,name

COPY psgc_regions (code, name) FROM stdin WITH CSV HEADER;
01,Region I (Ilocos Region)
02,Region II (Cagayan Valley)
03,Region III (Central Luzon)
04,Region IV-A (CALABARZON)
05,Region V (Bicol Region)
06,Region VI (Western Visayas)
07,Region VII (Central Visayas)
08,Region VIII (Eastern Visayas)
09,Region IX (Zamboanga Peninsula)
10,Region X (Northern Mindanao)
11,Region XI (Davao Region)
12,Region XII (SOCCSKSARGEN)
13,National Capital Region (NCR)
14,Cordillera Administrative Region (CAR)
15,Autonomous Region in Muslim Mindanao (ARMM)
16,Region XIII (Caraga)
17,Region IV-B (MIMAROPA)
\.

-- =================================================================
-- STEP 3: POPULATE PROVINCES  
-- =================================================================
-- Source: psgc_provinces.updated.csv
-- Format: code,name,region_code,is_active

COPY psgc_provinces (code, name, region_code, is_active) FROM stdin WITH CSV HEADER;
0128,Ilocos Norte,01,true
0129,Ilocos Sur,01,true
0133,La Union,01,true
0155,Pangasinan,01,true
0209,Batanes,02,true
0215,Cagayan,02,true
0231,Isabela,02,true
0250,Nueva Vizcaya,02,true
0257,Quirino,02,true
0308,Aurora,03,true
0314,Bataan,03,true
0369,Bulacan,03,true
0371,Nueva Ecija,03,true
0377,Pampanga,03,true
0381,Tarlac,03,true
0410,Zambales,03,true
0421,Batangas,04,true
0430,Cavite,04,true
0434,Laguna,04,true
0456,Quezon,04,true
0458,Rizal,04,true
0515,Albay,05,true
0517,Camarines Norte,05,true
0518,Camarines Sur,05,true
0520,Catanduanes,05,true
0541,Masbate,05,true
0562,Sorsogon,05,true
0604,Aklan,06,true
0606,Antique,06,true
0619,Capiz,06,true
0630,Guimaras,06,true
0645,Iloilo,06,true
0679,Negros Occidental,06,true
0712,Bohol,07,true
0722,Cebu,07,true
0746,Negros Oriental,07,true
0761,Siquijor,07,true
0826,Biliran,08,true
0837,Eastern Samar,08,true
0848,Leyte,08,true
0860,Northern Samar,08,true
0864,Samar,08,true
0878,Southern Leyte,08,true
0973,Zamboanga del Norte,09,true
0975,Zamboanga del Sur,09,true
0983,Zamboanga Sibugay,09,true
1042,Bukidnon,10,true
1043,Camiguin,10,true
1065,Lanao del Norte,10,true
1067,Misamis Occidental,10,true
1069,Misamis Oriental,10,true
1123,Compostela Valley,11,true
1124,Davao del Norte,11,true
1125,Davao del Sur,11,true
1126,Davao Occidental,11,true
1127,Davao Oriental,11,true
1247,North Cotabato,12,true
1263,Sarangani,12,true
1265,South Cotabato,12,true
1266,Sultan Kudarat,12,true
1404,Abra,14,true
1405,Apayao,14,true
1411,Benguet,14,true
1427,Ifugao,14,true
1432,Kalinga,14,true
1444,Mountain Province,14,true
1581,Basilan,15,true
1663,Lanao del Sur,15,true
1665,Maguindanao,15,true
1667,Sulu,15,true
1668,Tawi-Tawi,15,true
1671,Agusan del Norte,16,true
1672,Agusan del Sur,16,true
1674,Dinagat Islands,16,true
1675,Surigao del Norte,16,true
1676,Surigao del Sur,16,true
1751,Marinduque,17,true
1752,Occidental Mindoro,17,true
1753,Oriental Mindoro,17,true
1759,Palawan,17,true
1773,Romblon,17,true
\.

-- =================================================================
-- STEP 4: POPULATE CITIES AND MUNICIPALITIES
-- =================================================================
-- Note: This is a truncated example. The full migration script would
-- need to include all cities/municipalities from the CSV file.
-- For production, use: \copy psgc_cities_municipalities FROM 'path/to/file.csv' WITH CSV HEADER;

-- Example entries for demonstration:
INSERT INTO psgc_cities_municipalities (code, name, province_code, type, is_independent) VALUES
('012801', 'Adams', '0128', 'municipality', false),
('012802', 'Bacarra', '0128', 'municipality', false),
('012803', 'Badoc', '0128', 'municipality', false),
('012804', 'Bangui', '0128', 'municipality', false),
('012805', 'City of Batac', '0128', 'component city', false),
('137401', 'City of Manila', NULL, 'highly urbanized city', true),
('137402', 'City of Mandaluyong', NULL, 'highly urbanized city', true),
('137403', 'City of Marikina', NULL, 'highly urbanized city', true);

-- =================================================================
-- STEP 5: POPULATE BARANGAYS
-- =================================================================
-- Note: This is a truncated example. The full migration script would  
-- need to include all barangays from the CSV file.
-- For production, use: \copy psgc_barangays FROM 'path/to/file.csv' WITH CSV HEADER;

-- Example entries for demonstration:
INSERT INTO psgc_barangays (code, name, city_municipality_code) VALUES
('012801001', 'Adams', '012801'),
('012802001', 'Bani', '012802'),
('012802002', 'Buyon', '012802'),
('012802003', 'Cabaruan', '012802'),
('012802004', 'Cabulalaan', '012802');

-- =================================================================
-- STEP 6: RE-ENABLE CONSTRAINTS AND TRIGGERS
-- =================================================================
SET session_replication_role = DEFAULT;

-- =================================================================
-- STEP 7: VERIFY DATA INTEGRITY
-- =================================================================
-- Check record counts
SELECT 'Regions' as table_name, COUNT(*) as record_count FROM psgc_regions
UNION ALL
SELECT 'Provinces', COUNT(*) FROM psgc_provinces  
UNION ALL
SELECT 'Cities/Municipalities', COUNT(*) FROM psgc_cities_municipalities
UNION ALL
SELECT 'Barangays', COUNT(*) FROM psgc_barangays;

-- Check foreign key integrity
SELECT 'Provinces without regions' as check_name, COUNT(*) as error_count
FROM psgc_provinces p 
LEFT JOIN psgc_regions r ON p.region_code = r.code 
WHERE r.code IS NULL

UNION ALL

SELECT 'Cities without provinces', COUNT(*)
FROM psgc_cities_municipalities c
LEFT JOIN psgc_provinces p ON c.province_code = p.code
WHERE c.province_code IS NOT NULL AND p.code IS NULL

UNION ALL  

SELECT 'Barangays without cities', COUNT(*)
FROM psgc_barangays b
LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
WHERE c.code IS NULL;

-- =================================================================
-- STEP 8: UPDATE STATISTICS
-- =================================================================
ANALYZE psgc_regions;
ANALYZE psgc_provinces; 
ANALYZE psgc_cities_municipalities;
ANALYZE psgc_barangays;

COMMIT;

-- =================================================================
-- MIGRATION COMPLETE
-- =================================================================
-- 
-- NEXT STEPS:
-- 1. Load full datasets using COPY commands or \copy with CSV files
-- 2. Run PSOC data migration (separate script)  
-- 3. Verify all reference data is populated
-- 4. Begin application data import
-- 
-- =================================================================