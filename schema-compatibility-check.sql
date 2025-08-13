-- =============================================================================
-- SCHEMA COMPATIBILITY CHECK
-- Compare your current database with the cleaned schema.sql
-- =============================================================================

-- STEP 1: Check if residents table matches cleaned schema
SELECT 'RESIDENTS TABLE CHECK' as check_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE WHEN column_name IN (
        'id', 'name', 'philsys_card_number', 'philsys_last4', 'first_name', 'middle_name', 
        'last_name', 'extension_name', 'birthdate', 'birth_place_code', 'birth_place_level', 
        'birth_place_name', 'sex', 'civil_status', 'civil_status_others_specify', 
        'education_attainment', 'is_graduate', 'employment_status', 'employment_code', 
        'employment_name', 'psoc_code', 'psoc_level', 'occupation_title', 'email', 
        'mobile_number', 'telephone_number', 'household_code', 'street_id', 'subdivision_id', 
        'barangay_code', 'city_municipality_code', 'province_code', 'region_code', 
        'zip_code', 'blood_type', 'height', 'weight', 'complexion', 'citizenship', 
        'is_voter', 'is_resident_voter', 'last_voted_date', 'ethnicity', 'religion', 
        'religion_others_specify', 'mother_maiden_first', 'mother_maiden_middle', 
        'mother_maiden_last', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at'
    ) THEN 'SCHEMA MATCH ✓' 
    ELSE 'NOT IN SCHEMA ❌' END as schema_status
FROM information_schema.columns 
WHERE table_name = 'residents' AND table_schema = 'public'
ORDER BY ordinal_position;