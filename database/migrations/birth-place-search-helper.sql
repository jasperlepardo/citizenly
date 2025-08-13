-- =====================================================
-- BIRTH PLACE SEARCH HELPER VIEW AND FUNCTIONS
-- Completes the user's request: "can this be a search for 
-- all of psgc data from region to barangay? where i can 
-- select in between and it will be save as is."
-- =====================================================

-- Create a hierarchical view for birth place selection
CREATE OR REPLACE VIEW birth_place_hierarchy AS
SELECT 
    'region' as level,
    r.code as code,
    r.name as name,
    r.name as full_address,
    NULL::VARCHAR(10) as parent_code,
    NULL::VARCHAR as parent_name,
    r.code as region_code,
    NULL::VARCHAR(10) as province_code,
    NULL::VARCHAR(10) as city_code,
    NULL::VARCHAR(10) as barangay_code
FROM psgc_regions r

UNION ALL

SELECT 
    'province' as level,
    p.code as code,
    p.name as name,
    CONCAT_WS(', ', p.name, r.name) as full_address,
    p.region_code as parent_code,
    r.name as parent_name,
    p.region_code,
    p.code as province_code,
    NULL::VARCHAR(10) as city_code,
    NULL::VARCHAR(10) as barangay_code
FROM psgc_provinces p
JOIN psgc_regions r ON p.region_code = r.code

UNION ALL

SELECT 
    'city_municipality' as level,
    c.code as code,
    c.name as name,
    CASE 
        WHEN c.is_independent THEN CONCAT_WS(', ', c.name, r.name)
        ELSE CONCAT_WS(', ', c.name, p.name, r.name)
    END as full_address,
    c.province_code as parent_code,
    CASE 
        WHEN c.is_independent THEN r.name
        ELSE p.name
    END as parent_name,
    COALESCE(p.region_code, r.code) as region_code,
    c.province_code,
    c.code as city_code,
    NULL::VARCHAR(10) as barangay_code
FROM psgc_cities_municipalities c
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code

UNION ALL

SELECT 
    'barangay' as level,
    b.code as code,
    b.name as name,
    CONCAT_WS(', ',
        b.name,
        c.name,
        CASE WHEN c.is_independent THEN NULL ELSE p.name END,
        r.name
    ) as full_address,
    b.city_municipality_code as parent_code,
    c.name as parent_name,
    COALESCE(p.region_code, r.code) as region_code,
    c.province_code,
    b.city_municipality_code as city_code,
    b.code as barangay_code
FROM psgc_barangays b
JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
LEFT JOIN psgc_provinces p ON c.province_code = p.code
LEFT JOIN psgc_regions r ON COALESCE(p.region_code, c.province_code) = r.code;

-- Create a function to search birth places across all levels
CREATE OR REPLACE FUNCTION search_birth_places(
    search_term TEXT DEFAULT NULL,
    level_filter TEXT DEFAULT NULL,
    parent_code_filter VARCHAR(10) DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    level TEXT,
    code VARCHAR(10),
    name VARCHAR,
    full_address TEXT,
    parent_code VARCHAR(10),
    parent_name VARCHAR,
    region_code VARCHAR(10),
    province_code VARCHAR(10),
    city_code VARCHAR(10),
    barangay_code VARCHAR(10),
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bph.level,
        bph.code,
        bph.name,
        bph.full_address,
        bph.parent_code,
        bph.parent_name,
        bph.region_code,
        bph.province_code,
        bph.city_code,
        bph.barangay_code,
        CASE 
            WHEN search_term IS NULL THEN 1.0::REAL
            ELSE ts_rank(
                to_tsvector('english', bph.name || ' ' || bph.full_address), 
                plainto_tsquery('english', search_term)
            )
        END as relevance
    FROM birth_place_hierarchy bph
    WHERE 
        (search_term IS NULL OR (
            bph.name ILIKE '%' || search_term || '%' OR
            bph.full_address ILIKE '%' || search_term || '%'
        ))
        AND (level_filter IS NULL OR bph.level = level_filter)
        AND (parent_code_filter IS NULL OR bph.parent_code = parent_code_filter)
    ORDER BY 
        CASE WHEN search_term IS NULL THEN bph.level END,
        relevance DESC,
        bph.name ASC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get birth place hierarchy for a specific code
CREATE OR REPLACE FUNCTION get_birth_place_hierarchy(place_code VARCHAR(10))
RETURNS TABLE (
    region_code VARCHAR(10),
    region_name VARCHAR,
    province_code VARCHAR(10),
    province_name VARCHAR,
    city_code VARCHAR(10),
    city_name VARCHAR,
    barangay_code VARCHAR(10),
    barangay_name VARCHAR,
    full_address TEXT,
    level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bph.region_code,
        r.name as region_name,
        bph.province_code,
        p.name as province_name,
        bph.city_code,
        c.name as city_name,
        bph.barangay_code,
        CASE WHEN bph.level = 'barangay' THEN bph.name ELSE NULL END as barangay_name,
        bph.full_address,
        bph.level
    FROM birth_place_hierarchy bph
    LEFT JOIN psgc_regions r ON bph.region_code = r.code
    LEFT JOIN psgc_provinces p ON bph.province_code = p.code
    LEFT JOIN psgc_cities_municipalities c ON bph.city_code = c.code
    WHERE bph.code = place_code;
END;
$$ LANGUAGE plpgsql;

-- Create a function to auto-populate birth place hierarchy when selecting a lower level
-- This helps the UI auto-fill parent levels when a user selects a specific barangay/city
CREATE OR REPLACE FUNCTION auto_populate_birth_place_fields(selected_code VARCHAR(10))
RETURNS TABLE (
    birth_region_code VARCHAR(10),
    birth_province_code VARCHAR(10), 
    birth_city_municipality_code VARCHAR(10),
    birth_barangay_code VARCHAR(10),
    birth_place_full TEXT
) AS $$
DECLARE
    hierarchy_info RECORD;
BEGIN
    -- Get the hierarchy information for the selected code
    SELECT * INTO hierarchy_info
    FROM get_birth_place_hierarchy(selected_code)
    LIMIT 1;
    
    -- Return the appropriate fields based on the level
    RETURN QUERY
    SELECT 
        hierarchy_info.region_code,
        hierarchy_info.province_code,
        hierarchy_info.city_code,
        hierarchy_info.barangay_code,
        hierarchy_info.full_address;
END;
$$ LANGUAGE plpgsql;

-- Create indexes to optimize the search functions
CREATE INDEX IF NOT EXISTS idx_birth_place_search_name ON psgc_regions USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_birth_place_search_provinces ON psgc_provinces USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_birth_place_search_cities ON psgc_cities_municipalities USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_birth_place_search_barangays ON psgc_barangays USING GIN(to_tsvector('english', name));

-- Grant permissions to authenticated users
GRANT SELECT ON birth_place_hierarchy TO authenticated;

COMMENT ON VIEW birth_place_hierarchy IS 'Hierarchical view of all PSGC locations for birth place selection';
COMMENT ON FUNCTION search_birth_places(TEXT, TEXT, VARCHAR(10), INTEGER) IS 'Search function for birth places across all PSGC levels with fuzzy matching';
COMMENT ON FUNCTION get_birth_place_hierarchy(VARCHAR(10)) IS 'Get complete hierarchy information for a specific PSGC code';
COMMENT ON FUNCTION auto_populate_birth_place_fields(VARCHAR(10)) IS 'Auto-populate birth place fields when selecting a specific location';