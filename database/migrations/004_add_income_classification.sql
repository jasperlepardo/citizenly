-- =====================================================
-- INCOME CLASSIFICATION SYSTEM
-- Migration 004: Add automatic household income classification
-- Based on Philippine socioeconomic class standards
-- =====================================================

-- =====================================================
-- 1. CREATE INCOME CLASS ENUM
-- =====================================================

CREATE TYPE income_class_enum AS ENUM (
    'rich',                    -- ≥ 219,140
    'high_income',             -- 131,484 – 219,139
    'upper_middle_income',     -- 76,669 – 131,483
    'middle_class',            -- 43,828 – 76,668
    'lower_middle_class',      -- 21,194 – 43,827
    'low_income',              -- 9,520 – 21,193
    'poor'                     -- < 10,957 (includes 9,520-10,956 gap)
);

-- =====================================================
-- 2. ADD INCOME CLASS COLUMN TO HOUSEHOLDS
-- =====================================================

ALTER TABLE households ADD COLUMN income_class income_class_enum;

-- =====================================================
-- 3. INCOME CLASSIFICATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION determine_income_class(monthly_income DECIMAL(12,2))
RETURNS income_class_enum AS $$
BEGIN
    -- Handle NULL or negative income
    IF monthly_income IS NULL OR monthly_income < 0 THEN
        RETURN 'poor';
    END IF;
    
    -- Classify based on income ranges
    IF monthly_income >= 219140 THEN
        RETURN 'rich';
    ELSIF monthly_income >= 131484 THEN
        RETURN 'high_income';
    ELSIF monthly_income >= 76669 THEN
        RETURN 'upper_middle_income';
    ELSIF monthly_income >= 43828 THEN
        RETURN 'middle_class';
    ELSIF monthly_income >= 21194 THEN
        RETURN 'lower_middle_class';
    ELSIF monthly_income >= 9520 THEN
        RETURN 'low_income';
    ELSE
        RETURN 'poor';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 4. UPDATE EXISTING HOUSEHOLD INCOME CALCULATION
-- =====================================================

-- Enhanced function that also updates income classification
CREATE OR REPLACE FUNCTION update_household_derived_fields()
RETURNS TRIGGER AS $$
DECLARE
    calculated_income DECIMAL(12,2);
BEGIN
    -- Calculate the monthly income
    SELECT COALESCE(SUM(r.salary), 0.00)
    INTO calculated_income
    FROM household_members hm
    JOIN residents r ON hm.resident_id = r.id
    WHERE hm.household_id = COALESCE(NEW.household_id, OLD.household_id) 
    AND hm.is_active = true;
    
    -- Update the household with calculated values including income class
    UPDATE households 
    SET 
        no_of_members = (
            SELECT COUNT(*) 
            FROM household_members 
            WHERE household_id = COALESCE(NEW.household_id, OLD.household_id) 
            AND is_active = true
        ),
        no_of_migrants = (
            SELECT COUNT(*) 
            FROM household_members hm
            JOIN sectoral_information si ON hm.resident_id = si.resident_id
            WHERE hm.household_id = COALESCE(NEW.household_id, OLD.household_id) 
            AND hm.is_active = true 
            AND si.is_migrant = true
        ),
        monthly_income = calculated_income,
        income_class = determine_income_class(calculated_income),
        household_name = (
            SELECT r.last_name 
            FROM residents r 
            WHERE r.id = (
                SELECT household_head_id 
                FROM households 
                WHERE id = COALESCE(NEW.household_id, OLD.household_id)
            )
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.household_id, OLD.household_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGER FOR DIRECT HOUSEHOLD INCOME UPDATES
-- =====================================================

-- Function to update income class when monthly_income is directly modified
CREATE OR REPLACE FUNCTION update_household_income_class()
RETURNS TRIGGER AS $$
BEGIN
    -- Update income class based on new monthly_income
    NEW.income_class = determine_income_class(NEW.monthly_income);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for direct household updates
CREATE TRIGGER trigger_update_household_income_class
    BEFORE UPDATE ON households
    FOR EACH ROW
    WHEN (OLD.monthly_income IS DISTINCT FROM NEW.monthly_income)
    EXECUTE FUNCTION update_household_income_class();

-- =====================================================
-- 6. POPULATE EXISTING HOUSEHOLDS
-- =====================================================

-- Update income class for existing households
UPDATE households 
SET income_class = determine_income_class(monthly_income)
WHERE income_class IS NULL;

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_households_income_class ON households(income_class);
CREATE INDEX idx_households_monthly_income_class ON households(monthly_income, income_class);

-- =====================================================
-- 8. ENHANCED VIEWS WITH INCOME CLASSIFICATION
-- =====================================================

-- Update households_complete view to include income class
DROP VIEW IF EXISTS households_complete;
CREATE VIEW households_complete AS
SELECT 
    h.*,
    r.first_name || ' ' || r.last_name as head_full_name,
    addr.full_address,
    -- Address components
    reg.name as region_name,
    prov.name as province_name,
    city.name as city_municipality_name,
    bgy.name as barangay_name,
    -- Income classification details
    CASE h.income_class
        WHEN 'rich' THEN 'Rich (≥ ₱219,140)'
        WHEN 'high_income' THEN 'High Income (₱131,484 – ₱219,139)'
        WHEN 'upper_middle_income' THEN 'Upper Middle Income (₱76,669 – ₱131,483)'
        WHEN 'middle_class' THEN 'Middle Class (₱43,828 – ₱76,668)'
        WHEN 'lower_middle_class' THEN 'Lower Middle Class (₱21,194 – ₱43,827)'
        WHEN 'low_income' THEN 'Low Income (₱9,520 – ₱21,193)'
        WHEN 'poor' THEN 'Poor (< ₱10,957)'
        ELSE 'Unclassified'
    END as income_class_description
FROM households h
LEFT JOIN residents r ON h.household_head_id = r.id
LEFT JOIN addresses addr ON h.address_id = addr.id
LEFT JOIN psgc_barangays bgy ON h.barangay_code = bgy.code
LEFT JOIN psgc_cities_municipalities city ON bgy.city_municipality_code = city.code
LEFT JOIN psgc_provinces prov ON city.province_code = prov.code
LEFT JOIN psgc_regions reg ON prov.region_code = reg.code;

-- =====================================================
-- 9. INCOME DISTRIBUTION ANALYTICS VIEW
-- =====================================================

CREATE VIEW household_income_analytics AS
SELECT 
    h.barangay_code,
    bgy.name as barangay_name,
    h.income_class,
    CASE h.income_class
        WHEN 'rich' THEN 'Rich'
        WHEN 'high_income' THEN 'High Income'
        WHEN 'upper_middle_income' THEN 'Upper Middle Income'
        WHEN 'middle_class' THEN 'Middle Class'
        WHEN 'lower_middle_class' THEN 'Lower Middle Class'
        WHEN 'low_income' THEN 'Low Income'
        WHEN 'poor' THEN 'Poor'
    END as income_class_label,
    COUNT(*) as household_count,
    ROUND(AVG(h.monthly_income), 2) as average_income,
    ROUND(MIN(h.monthly_income), 2) as min_income,
    ROUND(MAX(h.monthly_income), 2) as max_income,
    ROUND(
        (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY h.barangay_code)), 
        2
    ) as percentage_in_barangay
FROM households h
JOIN psgc_barangays bgy ON h.barangay_code = bgy.code
WHERE h.income_class IS NOT NULL
GROUP BY h.barangay_code, bgy.name, h.income_class
ORDER BY h.barangay_code, 
    CASE h.income_class
        WHEN 'rich' THEN 1
        WHEN 'high_income' THEN 2
        WHEN 'upper_middle_income' THEN 3
        WHEN 'middle_class' THEN 4
        WHEN 'lower_middle_class' THEN 5
        WHEN 'low_income' THEN 6
        WHEN 'poor' THEN 7
    END;

-- =====================================================
-- 10. UTILITY FUNCTIONS
-- =====================================================

-- Function to get income class statistics for a barangay
CREATE OR REPLACE FUNCTION get_barangay_income_distribution(barangay_code_param VARCHAR(10))
RETURNS TABLE (
    income_class income_class_enum,
    income_class_label TEXT,
    household_count BIGINT,
    percentage NUMERIC(5,2),
    avg_income NUMERIC(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.income_class,
        CASE h.income_class
            WHEN 'rich' THEN 'Rich'
            WHEN 'high_income' THEN 'High Income'
            WHEN 'upper_middle_income' THEN 'Upper Middle Income'
            WHEN 'middle_class' THEN 'Middle Class'
            WHEN 'lower_middle_class' THEN 'Lower Middle Class'
            WHEN 'low_income' THEN 'Low Income'
            WHEN 'poor' THEN 'Poor'
        END,
        COUNT(*),
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2),
        ROUND(AVG(h.monthly_income), 2)
    FROM households h
    WHERE h.barangay_code = barangay_code_param
    AND h.income_class IS NOT NULL
    GROUP BY h.income_class
    ORDER BY CASE h.income_class
        WHEN 'rich' THEN 1
        WHEN 'high_income' THEN 2
        WHEN 'upper_middle_income' THEN 3
        WHEN 'middle_class' THEN 4
        WHEN 'lower_middle_class' THEN 5
        WHEN 'low_income' THEN 6
        WHEN 'poor' THEN 7
    END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. UPDATE DASHBOARD SUMMARIES
-- =====================================================

-- Add income distribution to dashboard summaries
ALTER TABLE barangay_dashboard_summaries ADD COLUMN rich_households INTEGER DEFAULT 0;
ALTER TABLE barangay_dashboard_summaries ADD COLUMN high_income_households INTEGER DEFAULT 0;
ALTER TABLE barangay_dashboard_summaries ADD COLUMN upper_middle_households INTEGER DEFAULT 0;
ALTER TABLE barangay_dashboard_summaries ADD COLUMN middle_class_households INTEGER DEFAULT 0;
ALTER TABLE barangay_dashboard_summaries ADD COLUMN lower_middle_households INTEGER DEFAULT 0;
ALTER TABLE barangay_dashboard_summaries ADD COLUMN low_income_households INTEGER DEFAULT 0;
ALTER TABLE barangay_dashboard_summaries ADD COLUMN poor_households INTEGER DEFAULT 0;
ALTER TABLE barangay_dashboard_summaries ADD COLUMN average_household_income DECIMAL(12,2) DEFAULT 0;

-- =====================================================
-- 12. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TYPE income_class_enum IS 'Philippine socioeconomic classification based on monthly household income';
COMMENT ON COLUMN households.income_class IS 'Auto-calculated socioeconomic class based on monthly_income';
COMMENT ON FUNCTION determine_income_class(DECIMAL) IS 'Determines income class based on Philippine socioeconomic standards';
COMMENT ON VIEW household_income_analytics IS 'Income distribution analytics by barangay and income class';

-- Income class range documentation
COMMENT ON TYPE income_class_enum IS 'Income ranges: rich(≥219,140), high_income(131,484-219,139), upper_middle_income(76,669-131,483), middle_class(43,828-76,668), lower_middle_class(21,194-43,827), low_income(9,520-21,193), poor(<10,957)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================