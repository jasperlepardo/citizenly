-- =============================================================================
-- ADD SAMPLE PSGC DATA
-- This adds minimal PSGC reference data so you can test resident creation
-- =============================================================================

-- Insert sample regions
INSERT INTO psgc_regions (code, name) VALUES
('13', 'CARAGA (Region XIII)')
ON CONFLICT (code) DO NOTHING;

-- Insert sample provinces  
INSERT INTO psgc_provinces (code, name, region_code) VALUES
('1374', 'Surigao del Norte', '13')
ON CONFLICT (code) DO NOTHING;

-- Insert sample cities/municipalities
INSERT INTO psgc_cities_municipalities (code, name, province_code, is_city) VALUES
('137404', 'Surigao City', '1374', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample barangays
INSERT INTO psgc_barangays (code, name, city_municipality_code) VALUES
('137404001', 'Alang-alang', '137404'),
('137404002', 'Anomar', '137404'),
('137404003', 'Baybay', '137404'),
('137404004', 'Bilabid', '137404'),
('137404005', 'Bonifacio', '137404')
ON CONFLICT (code) DO NOTHING;

-- Verify the data was inserted
SELECT 'PSGC Data Added' as status;
SELECT 'psgc_regions' as table_name, COUNT(*) as rows FROM psgc_regions
UNION ALL  
SELECT 'psgc_provinces', COUNT(*) FROM psgc_provinces
UNION ALL
SELECT 'psgc_cities_municipalities', COUNT(*) FROM psgc_cities_municipalities  
UNION ALL
SELECT 'psgc_barangays', COUNT(*) FROM psgc_barangays;