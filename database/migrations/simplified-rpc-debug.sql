-- Simplified RPC function for debugging VARCHAR(10) error
-- This removes geo lookup to isolate the issue

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
BEGIN
    -- Insert with minimal fields to debug which field causes VARCHAR(10) error
    INSERT INTO residents (
        first_name_encrypted,
        last_name_encrypted,
        birthdate,
        sex,
        barangay_code,
        city_municipality_code,
        region_code,
        is_data_encrypted,
        encryption_key_version,
        encrypted_at
    ) VALUES (
        encrypt_pii(p_first_name),
        encrypt_pii(p_last_name),
        p_birthdate,
        p_sex,
        p_barangay_code,
        p_city_municipality_code,
        p_region_code,
        true,
        1,
        NOW()
    ) RETURNING id INTO new_resident_id;
    
    RETURN new_resident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;