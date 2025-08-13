-- =====================================================
-- BIRTH PLACE - SINGLE FIELD APPROACH (LIKE PSOC)
-- Similar to how PSOC uses psoc_code + psoc_level
-- This uses birth_place_code + birth_place_level
-- =====================================================

-- First, let's create the birth_place_level enum to specify which level of PSGC hierarchy
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'birth_place_level_enum') THEN
        CREATE TYPE birth_place_level_enum AS ENUM (
            'region', 'province', 'city_municipality', 'barangay'
        );
    END IF;
END $$;

-- Modify the residents table to use single field approach (like PSOC)
-- Instead of separate birth_region_code, birth_province_code, etc.
-- We'll use: birth_place_code + birth_place_level

-- Drop the existing birth place columns from residents table if they exist
-- (This is safe since we haven't migrated yet)
ALTER TABLE residents 
DROP COLUMN IF EXISTS birth_region_code,
DROP COLUMN IF EXISTS birth_province_code, 
DROP COLUMN IF EXISTS birth_city_municipality_code,
DROP COLUMN IF EXISTS birth_barangay_code;

-- Add the single field approach columns
ALTER TABLE residents 
ADD COLUMN birth_place_code VARCHAR(10),
ADD COLUMN birth_place_level birth_place_level_enum,
ADD COLUMN birth_place_text VARCHAR(200), -- Free text fallback for non-PSGC locations
ADD COLUMN birth_place_full TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN birth_place_text IS NOT NULL THEN birth_place_text
        WHEN birth_place_code IS NOT NULL AND birth_place_level IS NOT NULL THEN
            CASE birth_place_level
                WHEN 'region' THEN 
                    (SELECT r.name FROM psgc_regions r WHERE r.code = birth_place_code)
                WHEN 'province' THEN 
                    (SELECT CONCAT_WS(', ', p.name, r.name) 
                     FROM psgc_provinces p 
                     JOIN psgc_regions r ON p.region_code = r.code 
                     WHERE p.code = birth_place_code)
                WHEN 'city_municipality' THEN 
                    (SELECT CONCAT_WS(', ', 
                        c.name,
                        CASE WHEN c.is_independent THEN NULL ELSE p.name END,
                        r.name
                    ) 
                    FROM psgc_cities_municipalities c
                    LEFT JOIN psgc_provinces p ON c.province_code = p.code
                    LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
                    WHERE c.code = birth_place_code)
                WHEN 'barangay' THEN 
                    (SELECT CONCAT_WS(', ',
                        b.name,
                        c.name,
                        CASE WHEN c.is_independent THEN NULL ELSE p.name END,
                        r.name
                    ) 
                    FROM psgc_barangays b
                    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
                    LEFT JOIN psgc_provinces p ON c.province_code = p.code
                    LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code
                    WHERE b.code = birth_place_code)
                ELSE NULL
            END
        ELSE NULL
    END
) STORED;

-- Add check constraint to ensure birth_place_code exists in the appropriate PSGC table
ALTER TABLE residents 
ADD CONSTRAINT check_birth_place_code_validity CHECK (
    birth_place_code IS NULL OR birth_place_level IS NULL OR
    CASE birth_place_level
        WHEN 'region' THEN EXISTS (SELECT 1 FROM psgc_regions WHERE code = birth_place_code)
        WHEN 'province' THEN EXISTS (SELECT 1 FROM psgc_provinces WHERE code = birth_place_code)
        WHEN 'city_municipality' THEN EXISTS (SELECT 1 FROM psgc_cities_municipalities WHERE code = birth_place_code)
        WHEN 'barangay' THEN EXISTS (SELECT 1 FROM psgc_barangays WHERE code = birth_place_code)
        ELSE false
    END
);

-- Create indexes for the birth place fields
CREATE INDEX idx_residents_birth_place_code ON residents(birth_place_code);
CREATE INDEX idx_residents_birth_place_level ON residents(birth_place_level);
CREATE INDEX idx_residents_birth_place_code_level ON residents(birth_place_code, birth_place_level);
CREATE INDEX idx_residents_birth_place_full ON residents USING GIN(to_tsvector('english', birth_place_full));

-- Create a unified view for birth place selection (similar to PSOC hierarchy)
CREATE OR REPLACE VIEW birth_place_options AS
SELECT 
    'region' as place_level,
    code,
    name,
    name as full_name,
    NULL::VARCHAR(10) as parent_code
FROM psgc_regions

UNION ALL

SELECT 
    'province' as place_level,
    p.code,
    p.name,
    CONCAT_WS(', ', p.name, r.name) as full_name,
    p.region_code as parent_code
FROM psgc_provinces p
JOIN psgc_regions r ON p.region_code = r.code

UNION ALL

SELECT 
    'city_municipality' as place_level,
    c.code,
    c.name,
    CASE 
        WHEN c.is_independent THEN CONCAT_WS(', ', c.name, r.name)
        ELSE CONCAT_WS(', ', c.name, p.name, r.name)
    END as full_name,
    c.province_code as parent_code
FROM psgc_cities_municipalities c
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code

UNION ALL

SELECT 
    'barangay' as place_level,
    b.code,
    b.name,
    CONCAT_WS(', ',
        b.name,
        c.name,
        CASE WHEN c.is_independent THEN NULL ELSE p.name END,
        r.name
    ) as full_name,
    b.city_municipality_code as parent_code
FROM psgc_barangays b
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code;

-- Function to search birth places (similar to PSOC search)
CREATE OR REPLACE FUNCTION search_birth_places(
    search_term TEXT DEFAULT NULL,
    level_filter birth_place_level_enum DEFAULT NULL,
    parent_code_filter VARCHAR(10) DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    place_level TEXT,
    code VARCHAR(10),
    name VARCHAR,
    full_name TEXT,
    parent_code VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bpo.place_level,
        bpo.code,
        bpo.name,
        bpo.full_name,
        bpo.parent_code
    FROM birth_place_options bpo
    WHERE 
        (search_term IS NULL OR (
            bpo.name ILIKE '%' || search_term || '%' OR
            bpo.full_name ILIKE '%' || search_term || '%'
        ))
        AND (level_filter IS NULL OR bpo.place_level = level_filter::TEXT)
        AND (parent_code_filter IS NULL OR bpo.parent_code = parent_code_filter)
    ORDER BY 
        bpo.name ASC,
        bpo.place_level ASC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get birth place details by code and level
CREATE OR REPLACE FUNCTION get_birth_place_details(
    place_code VARCHAR(10),
    place_level birth_place_level_enum
)
RETURNS TABLE (
    code VARCHAR(10),
    name VARCHAR,
    full_name TEXT,
    level TEXT,
    parent_code VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bpo.code,
        bpo.name,
        bpo.full_name,
        bpo.place_level,
        bpo.parent_code
    FROM birth_place_options bpo
    WHERE bpo.code = place_code AND bpo.place_level = place_level::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON birth_place_options TO authenticated;

-- Add comments
COMMENT ON TYPE birth_place_level_enum IS 'Specifies which level of PSGC hierarchy the birth_place_code refers to';
COMMENT ON COLUMN residents.birth_place_code IS 'PSGC code for birth place (can be region, province, city, or barangay code)';
COMMENT ON COLUMN residents.birth_place_level IS 'Specifies which PSGC level the birth_place_code represents';
COMMENT ON COLUMN residents.birth_place_text IS 'Free text for birth places not in PSGC (e.g., foreign countries)';
COMMENT ON COLUMN residents.birth_place_full IS 'Auto-generated complete birth place address';
COMMENT ON VIEW birth_place_options IS 'Unified view of all PSGC locations for birth place selection';

-- Example usage:
-- Insert resident with barangay-level birth place:
-- INSERT INTO residents (..., birth_place_code, birth_place_level, ...) 
-- VALUES (..., '042604001', 'barangay', ...);

-- Insert resident with province-level birth place:
-- INSERT INTO residents (..., birth_place_code, birth_place_level, ...) 
-- VALUES (..., '0426', 'province', ...);

-- Insert resident born in foreign country:
-- INSERT INTO residents (..., birth_place_text, ...) 
-- VALUES (..., 'New York, USA', ...);