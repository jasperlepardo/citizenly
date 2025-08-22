-- Migration: Align schema.sql with actual Supabase implementation
-- Removes all references to non-existent fields and fixes misalignments

-- 1. Remove birth_place_level references (column doesn't exist in Supabase)

-- Remove indexes that reference non-existent columns
DROP INDEX IF EXISTS idx_residents_birth_place_level;
DROP INDEX IF EXISTS idx_residents_birth_place_code_level;

-- Remove constraints that reference non-existent columns  
ALTER TABLE residents DROP CONSTRAINT IF EXISTS valid_birth_place_level_required;

-- 2. Remove family_position_enum usage in household_members
-- (The household_head_position should be VARCHAR, not enum)

-- 3. Update function signatures to remove birth_place_level_enum
-- Note: These functions need to be recreated without the enum parameter

-- Drop functions that use non-existent enum
DROP FUNCTION IF EXISTS search_birth_places(TEXT, birth_place_level_enum, VARCHAR(10), INTEGER);
DROP FUNCTION IF EXISTS get_birth_place_details(VARCHAR(10), birth_place_level_enum);

-- Recreate functions without enum parameter
CREATE OR REPLACE FUNCTION search_birth_places(
    search_term TEXT DEFAULT NULL,
    parent_code_filter VARCHAR(10) DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    code VARCHAR(10),
    name VARCHAR(200),
    level_name VARCHAR(20),
    parent_code VARCHAR(10),
    full_name VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.code, r.name, 'region'::VARCHAR(20), NULL::VARCHAR(10), r.name
    FROM psgc_regions r
    WHERE search_term IS NULL OR r.name ILIKE '%' || search_term || '%'
    
    UNION ALL
    
    SELECT 
        p.code, p.name, 'province'::VARCHAR(20), p.region_code, p.name || ', ' || r.name
    FROM psgc_provinces p
    JOIN psgc_regions r ON p.region_code = r.code
    WHERE search_term IS NULL OR p.name ILIKE '%' || search_term || '%'
    
    UNION ALL
    
    SELECT 
        c.code, c.name, 'city_municipality'::VARCHAR(20), c.province_code, 
        c.name || ', ' || p.name || ', ' || r.name
    FROM psgc_cities_municipalities c
    JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON p.region_code = r.code
    WHERE search_term IS NULL OR c.name ILIKE '%' || search_term || '%'
    
    UNION ALL
    
    SELECT 
        b.code, b.name, 'barangay'::VARCHAR(20), b.city_municipality_code,
        b.name || ', ' || c.name || ', ' || p.name || ', ' || r.name
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON p.region_code = r.code
    WHERE search_term IS NULL OR b.name ILIKE '%' || search_term || '%'
    
    ORDER BY level_name, name
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_birth_place_details(
    place_code VARCHAR(10)
)
RETURNS TABLE (
    code VARCHAR(10),
    name VARCHAR(200),
    level_name VARCHAR(20),
    parent_code VARCHAR(10),
    full_name VARCHAR(500)
) AS $$
BEGIN
    -- Try to find in regions
    RETURN QUERY
    SELECT r.code, r.name, 'region'::VARCHAR(20), NULL::VARCHAR(10), r.name
    FROM psgc_regions r WHERE r.code = place_code;
    
    IF FOUND THEN RETURN; END IF;
    
    -- Try to find in provinces  
    RETURN QUERY
    SELECT p.code, p.name, 'province'::VARCHAR(20), p.region_code, p.name || ', ' || r.name
    FROM psgc_provinces p
    JOIN psgc_regions r ON p.region_code = r.code
    WHERE p.code = place_code;
    
    IF FOUND THEN RETURN; END IF;
    
    -- Try to find in cities/municipalities
    RETURN QUERY
    SELECT c.code, c.name, 'city_municipality'::VARCHAR(20), c.province_code,
           c.name || ', ' || p.name || ', ' || r.name
    FROM psgc_cities_municipalities c
    JOIN psgc_provinces p ON c.province_code = p.code  
    JOIN psgc_regions r ON p.region_code = r.code
    WHERE c.code = place_code;
    
    IF FOUND THEN RETURN; END IF;
    
    -- Try to find in barangays
    RETURN QUERY
    SELECT b.code, b.name, 'barangay'::VARCHAR(20), b.city_municipality_code,
           b.name || ', ' || c.name || ', ' || p.name || ', ' || r.name
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON p.region_code = r.code
    WHERE b.code = place_code;
END;
$$ LANGUAGE plpgsql;

-- Remove enum type that isn't used
DROP TYPE IF EXISTS birth_place_level_enum CASCADE;

-- Update household_members table to use VARCHAR instead of enum
ALTER TABLE household_members ALTER COLUMN family_position TYPE VARCHAR(50);

-- Recreate grants
GRANT EXECUTE ON FUNCTION search_birth_places(TEXT, VARCHAR(10), INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_birth_place_details(VARCHAR(10)) TO authenticated;