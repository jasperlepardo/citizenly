-- Migration: Add missing columns to residents table
-- Run this SQL to add the missing columns that the form expects

BEGIN;

-- Add missing geographic hierarchy columns if they don't exist
DO $$ 
BEGIN
    -- Add region_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'region_code') THEN
        ALTER TABLE residents ADD COLUMN region_code VARCHAR(10) REFERENCES psgc_regions(code);
        CREATE INDEX IF NOT EXISTS idx_residents_region ON residents(region_code);
    END IF;
    
    -- Add province_code if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'province_code') THEN
        ALTER TABLE residents ADD COLUMN province_code VARCHAR(10) REFERENCES psgc_provinces(code);
        CREATE INDEX IF NOT EXISTS idx_residents_province ON residents(province_code);
    END IF;
    
    -- Add city_municipality_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'city_municipality_code') THEN
        ALTER TABLE residents ADD COLUMN city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code);
        CREATE INDEX IF NOT EXISTS idx_residents_city_municipality ON residents(city_municipality_code);
    END IF;
    
    -- Add street_name if it doesn't exist (form expects this)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'street_name') THEN
        ALTER TABLE residents ADD COLUMN street_name VARCHAR(200);
    END IF;
    
    -- Add house_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'house_number') THEN
        ALTER TABLE residents ADD COLUMN house_number VARCHAR(50);
    END IF;
    
    -- Add subdivision if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residents' AND column_name = 'subdivision') THEN
        ALTER TABLE residents ADD COLUMN subdivision VARCHAR(100);
    END IF;
END $$;

-- Update existing residents to populate geographic hierarchy from their barangay
UPDATE residents 
SET 
    region_code = hierarchy.region_code,
    province_code = hierarchy.province_code,
    city_municipality_code = hierarchy.city_municipality_code
FROM (
    SELECT 
        b.code as barangay_code,
        COALESCE(p.region_code, '13') as region_code,
        p.code as province_code,
        c.code as city_municipality_code
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    LEFT JOIN psgc_provinces p ON c.province_code = p.code
) hierarchy
WHERE residents.barangay_code = hierarchy.barangay_code
  AND (residents.region_code IS NULL OR residents.city_municipality_code IS NULL);

COMMIT;

-- Verification query - run this after the migration to check
-- SELECT 
--     COUNT(*) as total_residents,
--     COUNT(region_code) as with_region,
--     COUNT(city_municipality_code) as with_city,
--     COUNT(barangay_code) as with_barangay
-- FROM residents;