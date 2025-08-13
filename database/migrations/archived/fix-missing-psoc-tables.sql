-- =============================================================================
-- FIX MISSING PSOC TABLES AND UNIFIED VIEW
-- Your schema has PSOC hierarchy but missing the unified psoc_occupations table/view
-- =============================================================================

-- 1. Create unified PSOC occupations view (this is what your API expects)
CREATE OR REPLACE VIEW psoc_occupations AS
SELECT 
    ug.code as occupation_code,
    ug.title as occupation_title,
    4 as hierarchy_level,
    ug.minor_code as parent_code,
    mg.title as minor_group_title,
    smg.title as sub_major_group_title,
    maj.title as major_group_title,
    CONCAT(maj.code, ' - ', maj.title) as full_hierarchy,
    ug.created_at
FROM psoc_unit_groups ug
LEFT JOIN psoc_minor_groups mg ON ug.minor_code = mg.code
LEFT JOIN psoc_sub_major_groups smg ON mg.sub_major_code = smg.code  
LEFT JOIN psoc_major_groups maj ON smg.major_code = maj.code

UNION ALL

SELECT 
    mg.code as occupation_code,
    mg.title as occupation_title,
    3 as hierarchy_level,
    mg.sub_major_code as parent_code,
    NULL as minor_group_title,
    smg.title as sub_major_group_title,
    maj.title as major_group_title,
    CONCAT(maj.code, ' - ', maj.title) as full_hierarchy,
    mg.created_at
FROM psoc_minor_groups mg
LEFT JOIN psoc_sub_major_groups smg ON mg.sub_major_code = smg.code
LEFT JOIN psoc_major_groups maj ON smg.major_code = maj.code

UNION ALL

SELECT 
    smg.code as occupation_code,
    smg.title as occupation_title,
    2 as hierarchy_level,
    smg.major_code as parent_code,
    NULL as minor_group_title,
    NULL as sub_major_group_title,
    maj.title as major_group_title,
    CONCAT(maj.code, ' - ', maj.title) as full_hierarchy,
    smg.created_at
FROM psoc_sub_major_groups smg
LEFT JOIN psoc_major_groups maj ON smg.major_code = maj.code

UNION ALL

SELECT 
    maj.code as occupation_code,
    maj.title as occupation_title,
    1 as hierarchy_level,
    NULL as parent_code,
    NULL as minor_group_title,
    NULL as sub_major_group_title,
    NULL as major_group_title,
    maj.title as full_hierarchy,
    maj.created_at
FROM psoc_major_groups maj

ORDER BY occupation_code;

COMMENT ON VIEW psoc_occupations IS 'Unified view of all PSOC occupation levels for API compatibility';

-- 2. Check if PSOC data exists, if not, insert sample data
DO $$
DECLARE
    psoc_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO psoc_count FROM psoc_major_groups;
    
    IF psoc_count = 0 THEN
        RAISE NOTICE 'No PSOC data found, inserting sample data...';
        
        -- Insert Major Groups (Level 1)
        INSERT INTO psoc_major_groups (code, title) VALUES
        ('1', 'Managers'),
        ('2', 'Professionals'),
        ('3', 'Technicians and Associate Professionals'),
        ('4', 'Clerical Support Workers'),
        ('5', 'Service and Sales Workers'),
        ('6', 'Skilled Agricultural, Forestry and Fishery Workers'),
        ('7', 'Craft and Related Trades Workers'),
        ('8', 'Plant and Machine Operators and Assemblers'),
        ('9', 'Elementary Occupations');
        
        -- Insert Sub-Major Groups (Level 2)
        INSERT INTO psoc_sub_major_groups (code, title, major_code) VALUES
        ('11', 'Chief Executives, Senior Officials and Legislators', '1'),
        ('12', 'Administrative and Commercial Managers', '1'),
        ('13', 'Production and Specialized Services Managers', '1'),
        ('14', 'Hospitality, Retail and Other Services Managers', '1'),
        ('21', 'Science and Engineering Professionals', '2'),
        ('22', 'Health Professionals', '2'),
        ('23', 'Teaching Professionals', '2'),
        ('24', 'Business and Administration Professionals', '2'),
        ('25', 'Information and Communications Technology Professionals', '2'),
        ('26', 'Legal, Social and Cultural Professionals', '2'),
        ('31', 'Science and Engineering Associate Professionals', '3'),
        ('32', 'Health Associate Professionals', '3'),
        ('33', 'Business and Administration Associate Professionals', '3'),
        ('34', 'Legal, Social, Cultural and Related Associate Professionals', '3'),
        ('35', 'Information and Communications Technicians', '3'),
        ('41', 'General and Keyboard Clerks', '4'),
        ('42', 'Customer Services Clerks', '4'),
        ('43', 'Numerical and Material Recording Clerks', '4'),
        ('44', 'Other Clerical Support Workers', '4'),
        ('51', 'Personal Service Workers', '5'),
        ('52', 'Sales Workers', '5'),
        ('53', 'Personal Care Workers', '5'),
        ('54', 'Protective Services Workers', '5'),
        ('61', 'Market-oriented Skilled Agricultural Workers', '6'),
        ('62', 'Market-oriented Skilled Forestry, Fishery and Hunting Workers', '6'),
        ('63', 'Subsistence Farmers, Fishers, Hunters and Gatherers', '6'),
        ('71', 'Building and Related Trades Workers, Excluding Electricians', '7'),
        ('72', 'Metal, Machinery and Related Trades Workers', '7'),
        ('73', 'Handicraft and Printing Workers', '7'),
        ('74', 'Electrical and Electronic Trades Workers', '7'),
        ('75', 'Food Processing, Wood Working, Garment and Other Craft and Related Trades Workers', '7'),
        ('81', 'Stationary Plant and Machine Operators', '8'),
        ('82', 'Assemblers', '8'),
        ('83', 'Drivers and Mobile Plant Operators', '8'),
        ('91', 'Cleaners and Helpers', '9'),
        ('92', 'Agricultural, Forestry and Fishery Labourers', '9'),
        ('93', 'Labourers in Mining, Construction, Manufacturing and Transport', '9'),
        ('94', 'Food Preparation Assistants', '9'),
        ('95', 'Street and Related Sales and Service Workers', '9'),
        ('96', 'Refuse Workers and Other Elementary Workers', '9');
        
        -- Insert some Minor Groups (Level 3) - Sample only
        INSERT INTO psoc_minor_groups (code, title, sub_major_code) VALUES
        ('111', 'Legislators and Senior Government Officials', '11'),
        ('112', 'Traditional Chiefs and Heads of Villages', '11'),
        ('121', 'Business Services and Administration Managers', '12'),
        ('122', 'Sales, Marketing and Development Managers', '12'),
        ('131', 'Production Managers in Agriculture, Forestry and Fisheries', '13'),
        ('132', 'Manufacturing, Mining, Construction, and Distribution Managers', '13'),
        ('211', 'Physicists, Chemists and Related Professionals', '21'),
        ('212', 'Mathematicians, Actuaries and Statisticians', '21'),
        ('213', 'Life Science Professionals', '21'),
        ('214', 'Engineering Professionals (excluding Electrotechnology)', '21'),
        ('215', 'Electrotechnology Engineers', '21'),
        ('216', 'Architects, Planners, Surveyors and Designers', '21'),
        ('221', 'Medical Doctors', '22'),
        ('222', 'Nursing and Midwifery Professionals', '22'),
        ('231', 'University and Higher Education Teachers', '23'),
        ('232', 'Vocational Education Teachers', '23'),
        ('233', 'Secondary Education Teachers', '23'),
        ('234', 'Primary School and Early Childhood Teachers', '23'),
        ('235', 'Other Teaching Professionals', '23');
        
        -- Insert some Unit Groups (Level 4) - Sample only  
        INSERT INTO psoc_unit_groups (code, title, minor_code) VALUES
        ('1111', 'Legislators', '111'),
        ('1112', 'Senior Government Officials', '111'),
        ('1113', 'Traditional Chiefs and Heads of Villages', '112'),
        ('1211', 'Finance Managers', '121'),
        ('1212', 'Human Resource Managers', '121'),
        ('1213', 'Policy and Planning Managers', '121'),
        ('1219', 'Business Services and Administration Managers Not Elsewhere Classified', '121'),
        ('1221', 'Sales and Marketing Managers', '122'),
        ('1222', 'Advertising and Public Relations Managers', '122'),
        ('1223', 'Research and Development Managers', '122'),
        ('2111', 'Physicists and Astronomers', '211'),
        ('2112', 'Meteorologists', '211'),
        ('2113', 'Chemists', '211'),
        ('2114', 'Geologists and Geophysicists', '211'),
        ('2211', 'Generalist Medical Practitioners', '221'),
        ('2212', 'Specialist Medical Practitioners', '221'),
        ('2221', 'Nursing Professionals', '222'),
        ('2222', 'Midwifery Professionals', '222'),
        ('2310', 'University and Higher Education Teachers', '231'),
        ('2320', 'Vocational Education Teachers', '232'),
        ('2330', 'Secondary Education Teachers', '233'),
        ('2341', 'Primary School Teachers', '234'),
        ('2342', 'Early Childhood Educators', '234');
        
        RAISE NOTICE 'Sample PSOC data inserted successfully';
    ELSE
        RAISE NOTICE 'PSOC data already exists (% records)', psoc_count;
    END IF;
END
$$;

-- 3. Create search function that your API uses
CREATE OR REPLACE FUNCTION search_psoc_occupations(
    search_term TEXT DEFAULT '',
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    occupation_code VARCHAR(10),
    occupation_title VARCHAR(200),
    hierarchy_level INTEGER,
    parent_code VARCHAR(10),
    full_hierarchy TEXT,
    rank REAL
) AS $$
BEGIN
    IF search_term = '' OR search_term IS NULL THEN
        -- Return top-level occupations if no search term
        RETURN QUERY
        SELECT 
            p.occupation_code,
            p.occupation_title,
            p.hierarchy_level,
            p.parent_code,
            p.full_hierarchy,
            1.0::REAL as rank
        FROM psoc_occupations p
        WHERE p.hierarchy_level = 4  -- Unit groups (most specific)
        ORDER BY p.occupation_code
        LIMIT limit_count;
    ELSE
        -- Search with ranking
        RETURN QUERY
        SELECT 
            p.occupation_code,
            p.occupation_title,
            p.hierarchy_level,
            p.parent_code,
            p.full_hierarchy,
            (
                CASE 
                    WHEN LOWER(p.occupation_title) = LOWER(search_term) THEN 1.0
                    WHEN LOWER(p.occupation_title) LIKE LOWER(search_term) || '%' THEN 0.9
                    WHEN LOWER(p.occupation_title) LIKE '%' || LOWER(search_term) || '%' THEN 0.8
                    WHEN similarity(LOWER(p.occupation_title), LOWER(search_term)) > 0.3 THEN similarity(LOWER(p.occupation_title), LOWER(search_term))
                    ELSE 0.1
                END
            )::REAL as rank
        FROM psoc_occupations p
        WHERE 
            LOWER(p.occupation_title) ILIKE '%' || LOWER(search_term) || '%'
            OR similarity(LOWER(p.occupation_title), LOWER(search_term)) > 0.3
        ORDER BY rank DESC, p.occupation_code
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Create get_psoc_title function that your schema references
CREATE OR REPLACE FUNCTION get_psoc_title(p_psoc_code VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    psoc_title VARCHAR(200);
BEGIN
    SELECT occupation_title INTO psoc_title
    FROM psoc_occupations
    WHERE occupation_code = p_psoc_code
    LIMIT 1;
    
    RETURN COALESCE(psoc_title, 'Unknown Occupation');
END;
$$ LANGUAGE plpgsql;

-- 5. Update the inspection script to use correct table names
-- Replace psoc_occupations count with psoc hierarchy count
SELECT 'PSOC Data Verification' as check_name, 
       'psoc_major_groups' as table_name, 
       COUNT(*) as row_count 
FROM psoc_major_groups
UNION ALL
SELECT 'PSOC Data Verification', 'psoc_unit_groups', COUNT(*) FROM psoc_unit_groups
UNION ALL  
SELECT 'PSOC Data Verification', 'psoc_occupations_view', COUNT(*) FROM psoc_occupations;

-- 6. Test the new functions
SELECT 'PSOC Function Tests' as test_name;
SELECT occupation_code, occupation_title, hierarchy_level 
FROM search_psoc_occupations('teacher', 5);
SELECT get_psoc_title('2341') as teacher_title;

RAISE NOTICE 'PSOC tables and functions setup completed!';
RAISE NOTICE 'You can now use: SELECT * FROM psoc_occupations LIMIT 10;';