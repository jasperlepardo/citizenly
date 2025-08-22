-- Add geographic columns to residents table if they don't exist
-- These columns are critical for barangay-based data access control

DO $$
BEGIN
    -- Add barangay_code if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' 
        AND column_name = 'barangay_code'
    ) THEN
        ALTER TABLE residents 
        ADD COLUMN barangay_code VARCHAR(10) REFERENCES psgc_barangays(code);
        
        RAISE NOTICE 'Added barangay_code column to residents table';
    END IF;
    
    -- Add city_municipality_code if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' 
        AND column_name = 'city_municipality_code'
    ) THEN
        ALTER TABLE residents 
        ADD COLUMN city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code);
        
        RAISE NOTICE 'Added city_municipality_code column to residents table';
    END IF;
    
    -- Add province_code if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' 
        AND column_name = 'province_code'
    ) THEN
        ALTER TABLE residents 
        ADD COLUMN province_code VARCHAR(10) REFERENCES psgc_provinces(code);
        
        RAISE NOTICE 'Added province_code column to residents table';
    END IF;
    
    -- Add region_code if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'residents' 
        AND column_name = 'region_code'
    ) THEN
        ALTER TABLE residents 
        ADD COLUMN region_code VARCHAR(10) REFERENCES psgc_regions(code);
        
        RAISE NOTICE 'Added region_code column to residents table';
    END IF;
END $$;

-- Update existing residents to populate geographic codes from household_code
-- Household code format: RRPPMMBBBB-SSSS-TTTT-HHHH
-- Where: RR=region, PP=province, MM=municipality, BBBB=barangay
UPDATE residents 
SET 
    barangay_code = SUBSTRING(household_code FROM 1 FOR 9),
    city_municipality_code = SUBSTRING(household_code FROM 1 FOR 6),
    province_code = SUBSTRING(household_code FROM 1 FOR 4),
    region_code = SUBSTRING(household_code FROM 1 FOR 2)
WHERE household_code IS NOT NULL 
AND barangay_code IS NULL;

-- Make barangay_code NOT NULL after population
ALTER TABLE residents 
ALTER COLUMN barangay_code SET NOT NULL;

-- Make city_municipality_code NOT NULL after population  
ALTER TABLE residents 
ALTER COLUMN city_municipality_code SET NOT NULL;

-- Make region_code NOT NULL after population
ALTER TABLE residents 
ALTER COLUMN region_code SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_residents_barangay_code ON residents(barangay_code);
CREATE INDEX IF NOT EXISTS idx_residents_city_municipality_code ON residents(city_municipality_code);
CREATE INDEX IF NOT EXISTS idx_residents_province_code ON residents(province_code);
CREATE INDEX IF NOT EXISTS idx_residents_region_code ON residents(region_code);

RAISE NOTICE 'Geographic columns migration completed successfully';