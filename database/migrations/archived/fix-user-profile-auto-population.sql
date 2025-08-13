-- Fix: Add auto-population trigger for auth_user_profiles
-- This will automatically populate city, province, and region codes from barangay_code

-- Create trigger function for auth_user_profiles auto-population
CREATE OR REPLACE FUNCTION auto_populate_user_profile_geo_codes()
RETURNS TRIGGER AS $$
DECLARE
    v_city_code VARCHAR(10);
    v_province_code VARCHAR(10);  
    v_region_code VARCHAR(10);
BEGIN
    -- Only auto-populate if barangay_code exists but other codes are missing
    IF NEW.barangay_code IS NOT NULL AND 
       (NEW.city_municipality_code IS NULL OR NEW.province_code IS NULL OR NEW.region_code IS NULL) THEN
        
        -- Get the complete geographic hierarchy from barangay code
        SELECT 
            c.code,           -- city code
            p.code,           -- province code  
            r.code            -- region code
        INTO v_city_code, v_province_code, v_region_code
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        JOIN psgc_provinces p ON c.province_code = p.code
        JOIN psgc_regions r ON p.region_code = r.code
        WHERE b.code = NEW.barangay_code;
        
        -- Update the NEW record with derived codes
        IF v_city_code IS NOT NULL THEN
            NEW.city_municipality_code := COALESCE(NEW.city_municipality_code, v_city_code);
            NEW.province_code := COALESCE(NEW.province_code, v_province_code);
            NEW.region_code := COALESCE(NEW.region_code, v_region_code);
            
            RAISE NOTICE 'Auto-populated geographic codes for user profile %: city=%, province=%, region=%', 
                NEW.id, v_city_code, v_province_code, v_region_code;
        ELSE
            RAISE WARNING 'Could not resolve geographic hierarchy for barangay_code: %', NEW.barangay_code;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on auth_user_profiles table
DROP TRIGGER IF EXISTS trigger_auth_user_profiles_auto_populate_geo_codes ON auth_user_profiles;
CREATE TRIGGER trigger_auth_user_profiles_auto_populate_geo_codes
    BEFORE INSERT OR UPDATE ON auth_user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION auto_populate_user_profile_geo_codes();

-- Update existing profiles that are missing geographic codes
UPDATE auth_user_profiles 
SET 
    city_municipality_code = subq.city_code,
    province_code = subq.province_code,
    region_code = subq.region_code,
    updated_at = NOW()
FROM (
    SELECT 
        aup.id,
        c.code as city_code,
        p.code as province_code,
        r.code as region_code
    FROM auth_user_profiles aup
    JOIN psgc_barangays b ON aup.barangay_code = b.code
    JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    JOIN psgc_provinces p ON c.province_code = p.code
    JOIN psgc_regions r ON p.region_code = r.code
    WHERE aup.barangay_code IS NOT NULL 
    AND (aup.city_municipality_code IS NULL OR aup.province_code IS NULL OR aup.region_code IS NULL)
) subq
WHERE auth_user_profiles.id = subq.id;

-- Verify the update
SELECT 
    id, 
    email,
    barangay_code,
    city_municipality_code,
    province_code, 
    region_code,
    'SUCCESS' as status
FROM auth_user_profiles 
WHERE barangay_code IS NOT NULL
ORDER BY created_at DESC;