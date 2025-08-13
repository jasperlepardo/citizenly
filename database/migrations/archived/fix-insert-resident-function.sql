-- Fix the insert_resident_encrypted function to include required geographic fields
-- The residents table has city_municipality_code and region_code as NOT NULL fields
-- but the function wasn't inserting them, causing the insert to fail

DROP FUNCTION IF EXISTS insert_resident_encrypted CASCADE;

CREATE OR REPLACE FUNCTION insert_resident_encrypted(
    p_first_name TEXT,
    p_last_name TEXT,
    p_birthdate DATE,
    p_sex sex_enum,
    p_barangay_code VARCHAR(10),
    p_middle_name TEXT DEFAULT NULL,
    p_mobile_number TEXT DEFAULT NULL,
    p_telephone_number TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_mother_maiden_first TEXT DEFAULT NULL,
    p_mother_maiden_middle TEXT DEFAULT NULL,
    p_mother_maiden_last TEXT DEFAULT NULL,
    p_household_code VARCHAR(50) DEFAULT NULL,
    p_city_municipality_code VARCHAR(10) DEFAULT NULL,
    p_province_code VARCHAR(10) DEFAULT NULL,
    p_region_code VARCHAR(10) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_resident_id UUID;
    v_city_code VARCHAR(10);
    v_province_code VARCHAR(10);
    v_region_code VARCHAR(10);
BEGIN
    -- If geographic codes not provided, derive from barangay code
    IF p_city_municipality_code IS NULL OR p_region_code IS NULL THEN
        SELECT 
            b.city_municipality_code,
            c.province_code,
            COALESCE(p.region_code, c.region_code) -- Handle independent cities
        INTO 
            v_city_code,
            v_province_code,
            v_region_code
        FROM psgc_barangays b
        JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
        LEFT JOIN psgc_provinces p ON c.province_code = p.code
        WHERE b.code = p_barangay_code;
    ELSE
        v_city_code := p_city_municipality_code;
        v_province_code := p_province_code;
        v_region_code := p_region_code;
    END IF;

    -- Insert the resident with all required fields
    INSERT INTO residents (
        first_name_encrypted,
        middle_name_encrypted,
        last_name_encrypted,
        mobile_number_encrypted,
        telephone_number_encrypted,
        email_encrypted,
        mother_maiden_first_encrypted,
        mother_maiden_middle_encrypted,
        mother_maiden_last_encrypted,
        first_name_hash,
        last_name_hash,
        mobile_number_hash,
        email_hash,
        name_hash,
        birthdate,
        sex,
        barangay_code,
        city_municipality_code,  -- NOW INCLUDED
        province_code,            -- NOW INCLUDED
        region_code,              -- NOW INCLUDED
        household_code,
        is_data_encrypted,
        encryption_key_version,
        encrypted_at,
        encrypted_by
    ) VALUES (
        encrypt_pii(p_first_name),
        encrypt_pii(p_middle_name),
        encrypt_pii(p_last_name),
        encrypt_pii(p_mobile_number),
        encrypt_pii(p_telephone_number),
        encrypt_pii(p_email),
        encrypt_pii(p_mother_maiden_first),
        encrypt_pii(p_mother_maiden_middle),
        encrypt_pii(p_mother_maiden_last),
        create_search_hash(p_first_name),
        create_search_hash(p_last_name),
        create_search_hash(p_mobile_number),
        create_search_hash(p_email),
        create_search_hash(
            TRIM(COALESCE(p_first_name, '') || ' ' ||
                 COALESCE(p_middle_name, '') || ' ' ||
                 COALESCE(p_last_name, ''))
        ),
        p_birthdate,
        p_sex,
        p_barangay_code,
        v_city_code,              -- NOW INCLUDED
        v_province_code,          -- NOW INCLUDED
        v_region_code,            -- NOW INCLUDED
        p_household_code,
        true,
        1,
        NOW(),
        auth.uid()
    ) RETURNING id INTO new_resident_id;
    
    RETURN new_resident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;