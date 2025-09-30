-- Phase 1: Immediate Performance Optimizations
-- Denormalization for common query patterns
-- Date: 2025-08-29
-- Risk Level: LOW
-- Expected Performance Gain: 70-80%

-- ===========================================
-- 1. Add Geographic Names to Residents Table
-- ===========================================
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS barangay_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS city_name VARCHAR(100), 
ADD COLUMN IF NOT EXISTS province_name VARCHAR(100);

-- Create index for geographic queries
CREATE INDEX IF NOT EXISTS idx_residents_geographic_names 
ON residents(barangay_name, city_name, province_name)
WHERE is_active = true;

-- ===========================================  
-- 2. Add Geographic Names to Households Table
-- ===========================================
ALTER TABLE households
ADD COLUMN IF NOT EXISTS barangay_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS city_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS province_name VARCHAR(100);

-- Create index for geographic queries  
CREATE INDEX IF NOT EXISTS idx_households_geographic_names
ON households(barangay_name, city_name, province_name)
WHERE is_active = true;

-- ===========================================
-- 3. Create Resident Summary Cache Table
-- ===========================================
CREATE TABLE IF NOT EXISTS resident_summary_cache (
    resident_id UUID PRIMARY KEY REFERENCES residents(id) ON DELETE CASCADE,
    household_code VARCHAR(50),
    barangay_code VARCHAR(10),
    
    -- Cached demographics for fast filtering
    age_years INTEGER,
    age_group VARCHAR(20), -- 'child', 'adult', 'senior'
    sex sex_enum,
    civil_status civil_status_enum,
    
    -- Employment status (simplified)
    employment_category VARCHAR(20), -- 'employed', 'unemployed', 'student', 'retired', 'homemaker'
    is_ofw BOOLEAN DEFAULT false,
    
    -- Sectoral flags for dashboard counts
    is_senior BOOLEAN DEFAULT false,
    is_pwd BOOLEAN DEFAULT false,
    is_solo_parent BOOLEAN DEFAULT false,
    is_indigenous BOOLEAN DEFAULT false,
    is_student BOOLEAN DEFAULT false,
    
    -- Geographic info (denormalized)
    barangay_name VARCHAR(100),
    city_name VARCHAR(100),
    province_name VARCHAR(100),
    
    -- Cache metadata
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    needs_refresh BOOLEAN DEFAULT false
);

-- Optimized indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_resident_summary_dashboard 
ON resident_summary_cache(barangay_code, employment_category, age_group);

CREATE INDEX IF NOT EXISTS idx_resident_summary_sectoral
ON resident_summary_cache(barangay_code, is_senior, is_pwd, is_solo_parent)
WHERE is_senior = true OR is_pwd = true OR is_solo_parent = true;

CREATE INDEX IF NOT EXISTS idx_resident_summary_demographics
ON resident_summary_cache(barangay_code, sex, civil_status, age_group);

-- ===========================================
-- 4. Enhanced Dashboard Summary Table
-- ===========================================
CREATE TABLE IF NOT EXISTS enhanced_dashboard_summaries (
    barangay_code VARCHAR(10) PRIMARY KEY,
    barangay_name VARCHAR(100),
    
    -- Basic counts
    total_residents INTEGER DEFAULT 0,
    total_households INTEGER DEFAULT 0,
    total_families INTEGER DEFAULT 0,
    
    -- Demographics  
    male_count INTEGER DEFAULT 0,
    female_count INTEGER DEFAULT 0,
    seniors_count INTEGER DEFAULT 0,
    children_count INTEGER DEFAULT 0,
    adults_count INTEGER DEFAULT 0,
    
    -- Employment
    employed_count INTEGER DEFAULT 0,
    unemployed_count INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    homemakers_count INTEGER DEFAULT 0,
    retired_count INTEGER DEFAULT 0,
    ofw_count INTEGER DEFAULT 0,
    
    -- Civil status
    single_count INTEGER DEFAULT 0,
    married_count INTEGER DEFAULT 0,
    widowed_count INTEGER DEFAULT 0,
    separated_count INTEGER DEFAULT 0,
    
    -- Sectoral counts
    pwd_count INTEGER DEFAULT 0,
    solo_parent_count INTEGER DEFAULT 0,
    indigenous_count INTEGER DEFAULT 0,
    
    -- Household statistics
    avg_household_size DECIMAL(4,2) DEFAULT 0,
    avg_monthly_income DECIMAL(12,2) DEFAULT 0,
    
    -- Metadata
    calculation_date TIMESTAMPTZ DEFAULT NOW(),
    calculation_duration_ms INTEGER DEFAULT 0,
    is_current BOOLEAN DEFAULT true,
    data_as_of_date TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 5. Functions to Populate Denormalized Data
-- ===========================================

-- Function to update geographic names for residents
CREATE OR REPLACE FUNCTION update_resident_geographic_names()
RETURNS void AS $$
BEGIN
    UPDATE residents SET
        barangay_name = b.name,
        city_name = c.name,
        province_name = p.name
    FROM households h
    JOIN psgc_barangays b ON h.barangay_code = b.code
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code  
    JOIN psgc_provinces p ON c.province_code = p.code
    WHERE residents.household_code = h.code
    AND (residents.barangay_name IS NULL OR residents.barangay_name != b.name);
    
    GET DIAGNOSTICS UPDATE_COUNT = ROW_COUNT;
    RAISE NOTICE 'Updated geographic names for % residents', UPDATE_COUNT;
END;
$$ LANGUAGE plpgsql;

-- Function to update geographic names for households
CREATE OR REPLACE FUNCTION update_household_geographic_names()
RETURNS void AS $$
BEGIN
    UPDATE households SET
        barangay_name = b.name,
        city_name = c.name, 
        province_name = p.name
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    JOIN psgc_provinces p ON c.province_code = p.code
    WHERE households.barangay_code = b.code
    AND (households.barangay_name IS NULL OR households.barangay_name != b.name);
    
    GET DIAGNOSTICS UPDATE_COUNT = ROW_COUNT;
    RAISE NOTICE 'Updated geographic names for % households', UPDATE_COUNT;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh resident summary cache
CREATE OR REPLACE FUNCTION refresh_resident_summary_cache()
RETURNS void AS $$
BEGIN
    -- Delete existing cache
    TRUNCATE resident_summary_cache;
    
    -- Repopulate with current data
    INSERT INTO resident_summary_cache (
        resident_id, household_code, barangay_code,
        age_years, age_group, sex, civil_status,
        employment_category, is_ofw,
        is_senior, is_pwd, is_solo_parent, is_indigenous, is_student,
        barangay_name, city_name, province_name
    )
    SELECT 
        r.id,
        r.household_code,
        h.barangay_code,
        EXTRACT(YEAR FROM AGE(r.birthdate)) as age_years,
        CASE 
            WHEN EXTRACT(YEAR FROM AGE(r.birthdate)) < 18 THEN 'child'
            WHEN EXTRACT(YEAR FROM AGE(r.birthdate)) >= 60 THEN 'senior'
            ELSE 'adult'
        END as age_group,
        r.sex,
        r.civil_status,
        CASE 
            WHEN r.employment_status IN ('employed', 'self_employed') THEN 'employed'
            WHEN r.employment_status = 'unemployed' THEN 'unemployed'  
            WHEN EXTRACT(YEAR FROM AGE(r.birthdate)) BETWEEN 5 AND 24 THEN 'student'
            WHEN EXTRACT(YEAR FROM AGE(r.birthdate)) >= 65 THEN 'retired'
            ELSE 'homemaker'
        END as employment_category,
        COALESCE(rsi.is_overseas_filipino_worker, false) as is_ofw,
        COALESCE(rsi.is_senior_citizen, false) as is_senior,
        COALESCE(rsi.is_person_with_disability, false) as is_pwd,
        COALESCE(rsi.is_solo_parent, false) as is_solo_parent,
        COALESCE(rsi.is_indigenous_people, false) as is_indigenous,
        COALESCE(rsi.is_out_of_school_children OR rsi.is_out_of_school_youth, false) as is_student,
        h.barangay_name,
        h.city_name,
        h.province_name
    FROM residents r
    JOIN households h ON r.household_code = h.code
    LEFT JOIN resident_sectoral_info rsi ON r.id = rsi.resident_id
    WHERE r.is_active = true AND h.is_active = true;
    
    GET DIAGNOSTICS INSERT_COUNT = ROW_COUNT;
    RAISE NOTICE 'Refreshed resident summary cache with % records', INSERT_COUNT;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh enhanced dashboard summaries
CREATE OR REPLACE FUNCTION refresh_enhanced_dashboard_summaries()
RETURNS void AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    duration_ms INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- Clear existing summaries
    DELETE FROM enhanced_dashboard_summaries;
    
    -- Calculate comprehensive statistics
    INSERT INTO enhanced_dashboard_summaries (
        barangay_code, barangay_name,
        total_residents, total_households, total_families,
        male_count, female_count, seniors_count, children_count, adults_count,
        employed_count, unemployed_count, students_count, homemakers_count, retired_count, ofw_count,
        single_count, married_count, widowed_count, separated_count,
        pwd_count, solo_parent_count, indigenous_count,
        avg_household_size, avg_monthly_income,
        calculation_date, calculation_duration_ms, data_as_of_date
    )
    SELECT 
        rsc.barangay_code,
        rsc.barangay_name,
        COUNT(*) as total_residents,
        COUNT(DISTINCT rsc.household_code) as total_households,  
        COUNT(DISTINCT rsc.household_code) as total_families, -- Simplified assumption
        SUM(CASE WHEN rsc.sex = 'male' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN rsc.sex = 'female' THEN 1 ELSE 0 END) as female_count,
        SUM(CASE WHEN rsc.age_group = 'senior' THEN 1 ELSE 0 END) as seniors_count,
        SUM(CASE WHEN rsc.age_group = 'child' THEN 1 ELSE 0 END) as children_count,
        SUM(CASE WHEN rsc.age_group = 'adult' THEN 1 ELSE 0 END) as adults_count,
        SUM(CASE WHEN rsc.employment_category = 'employed' THEN 1 ELSE 0 END) as employed_count,
        SUM(CASE WHEN rsc.employment_category = 'unemployed' THEN 1 ELSE 0 END) as unemployed_count,
        SUM(CASE WHEN rsc.employment_category = 'student' THEN 1 ELSE 0 END) as students_count,
        SUM(CASE WHEN rsc.employment_category = 'homemaker' THEN 1 ELSE 0 END) as homemakers_count,
        SUM(CASE WHEN rsc.employment_category = 'retired' THEN 1 ELSE 0 END) as retired_count,
        SUM(CASE WHEN rsc.is_ofw THEN 1 ELSE 0 END) as ofw_count,
        SUM(CASE WHEN rsc.civil_status = 'single' THEN 1 ELSE 0 END) as single_count,
        SUM(CASE WHEN rsc.civil_status = 'married' THEN 1 ELSE 0 END) as married_count,
        SUM(CASE WHEN rsc.civil_status = 'widowed' THEN 1 ELSE 0 END) as widowed_count,  
        SUM(CASE WHEN rsc.civil_status = 'separated' THEN 1 ELSE 0 END) as separated_count,
        SUM(CASE WHEN rsc.is_pwd THEN 1 ELSE 0 END) as pwd_count,
        SUM(CASE WHEN rsc.is_solo_parent THEN 1 ELSE 0 END) as solo_parent_count,
        SUM(CASE WHEN rsc.is_indigenous THEN 1 ELSE 0 END) as indigenous_count,
        ROUND(AVG(h.no_of_household_members), 2) as avg_household_size,
        ROUND(AVG(h.monthly_income), 2) as avg_monthly_income,
        NOW() as calculation_date,
        0 as calculation_duration_ms, -- Will be updated below
        NOW() as data_as_of_date
    FROM resident_summary_cache rsc
    JOIN households h ON rsc.household_code = h.code
    GROUP BY rsc.barangay_code, rsc.barangay_name;
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Update duration for all records
    UPDATE enhanced_dashboard_summaries 
    SET calculation_duration_ms = duration_ms
    WHERE calculation_date = start_time;
    
    GET DIAGNOSTICS INSERT_COUNT = ROW_COUNT;
    RAISE NOTICE 'Refreshed enhanced dashboard summaries for % barangays in %ms', 
                 INSERT_COUNT, duration_ms;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 6. Triggers for Automatic Updates
-- ===========================================

-- Trigger to update geographic names when household location changes
CREATE OR REPLACE FUNCTION sync_geographic_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Update household geographic names
    IF TG_TABLE_NAME = 'households' THEN
        SELECT b.name, c.name, p.name 
        INTO NEW.barangay_name, NEW.city_name, NEW.province_name
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        JOIN psgc_provinces p ON c.province_code = p.code
        WHERE b.code = NEW.barangay_code;
        
        -- Mark residents for cache refresh
        UPDATE resident_summary_cache 
        SET needs_refresh = true 
        WHERE household_code = NEW.code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to households
DROP TRIGGER IF EXISTS sync_household_geographic_names ON households;
CREATE TRIGGER sync_household_geographic_names
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION sync_geographic_names();

-- ===========================================
-- 7. Initial Data Population
-- ===========================================

-- Populate geographic names
SELECT update_household_geographic_names();
SELECT update_resident_geographic_names();

-- Populate resident summary cache
SELECT refresh_resident_summary_cache();

-- Populate enhanced dashboard summaries  
SELECT refresh_enhanced_dashboard_summaries();

-- ===========================================
-- 8. Performance Analysis
-- ===========================================
ANALYZE residents;
ANALYZE households;  
ANALYZE resident_summary_cache;
ANALYZE enhanced_dashboard_summaries;

-- ===========================================
-- 9. Comments for Documentation
-- ===========================================
COMMENT ON TABLE resident_summary_cache IS 'Denormalized cache for fast resident queries and dashboard statistics';
COMMENT ON TABLE enhanced_dashboard_summaries IS 'Pre-computed dashboard statistics to avoid expensive real-time calculations';

COMMENT ON FUNCTION refresh_resident_summary_cache() IS 'Rebuilds the resident summary cache with current data - run after bulk data changes';
COMMENT ON FUNCTION refresh_enhanced_dashboard_summaries() IS 'Recalculates dashboard statistics - run daily or after significant data changes';

COMMENT ON INDEX idx_resident_summary_dashboard IS 'Optimized index for dashboard statistics queries';
COMMENT ON INDEX idx_residents_geographic_names IS 'Fast geographic filtering without PSGC joins';
COMMENT ON INDEX idx_households_geographic_names IS 'Fast household geographic lookups';