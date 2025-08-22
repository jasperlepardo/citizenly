-- Remove migration_type and is_whole_family_migrated from resident_migrant_info table
-- Migration Date: 2025-08-17
-- Purpose: Simplify migration tracking by removing unnecessary fields

-- Drop the columns from resident_migrant_info table
ALTER TABLE resident_migrant_info 
DROP COLUMN IF EXISTS migration_type,
DROP COLUMN IF EXISTS is_whole_family_migrated;

-- Drop any indexes related to these fields (if they exist)
DROP INDEX IF EXISTS idx_migrant_migration_type;
DROP INDEX IF EXISTS idx_migrant_family_migrated;

-- Update any views that might reference these fields
-- Note: The migrants_complete view should automatically handle missing columns
-- but we'll recreate it to be safe

-- Recreate migrants_complete view without the removed fields
DROP VIEW IF EXISTS migrants_complete CASCADE;

CREATE VIEW migrants_complete AS
SELECT
    mi.*,
    r.first_name,
    r.middle_name,
    r.last_name,
    r.birthdate,
    r.sex,
    -- Previous address components
    prev_reg.name as previous_region_name,
    prev_prov.name as previous_province_name,
    prev_city.name as previous_city_municipality_name,
    prev_bgy.name as previous_barangay_name,
    -- Current address from resident
    curr_reg.name as current_region_name,
    curr_prov.name as current_province_name,
    curr_city.name as current_city_municipality_name,
    curr_bgy.name as current_barangay_name
FROM resident_migrant_info mi
JOIN residents r ON mi.resident_id = r.id
-- Previous address joins
LEFT JOIN psgc_regions prev_reg ON mi.previous_region_code = prev_reg.code
LEFT JOIN psgc_provinces prev_prov ON mi.previous_province_code = prev_prov.code
LEFT JOIN psgc_cities_municipalities prev_city ON mi.previous_city_municipality_code = prev_city.code
LEFT JOIN psgc_barangays prev_bgy ON mi.previous_barangay_code = prev_bgy.code
-- Current address joins (from resident's location)
LEFT JOIN psgc_barangays curr_bgy ON r.barangay_code = curr_bgy.code
LEFT JOIN psgc_cities_municipalities curr_city ON curr_bgy.city_municipality_code = curr_city.code
LEFT JOIN psgc_provinces curr_prov ON curr_city.province_code = curr_prov.code
LEFT JOIN psgc_regions curr_reg ON COALESCE(curr_prov.region_code, curr_city.province_code) = curr_reg.code;

-- Grant appropriate permissions
GRANT SELECT ON migrants_complete TO authenticated;

-- Add comment
COMMENT ON VIEW migrants_complete IS 'Migration data with complete resident profiles (simplified)';