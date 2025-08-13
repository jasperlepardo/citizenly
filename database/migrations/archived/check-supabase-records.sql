-- Check current records in Supabase database
-- Run this in Supabase SQL Editor

-- 1. Check user profiles
SELECT 
    id,
    email,
    first_name,
    last_name,
    barangay_code,
    city_municipality_code,
    province_code,
    region_code,
    created_at,
    updated_at
FROM auth_user_profiles 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check households
SELECT 
    h.code,
    h.name,
    h.house_number,
    h.barangay_code,
    h.created_at,
    h.created_by,
    gs.name as street_name,
    gsub.name as subdivision_name,
    gsub.type as subdivision_type
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
ORDER BY h.created_at DESC
LIMIT 10;

-- 3. Check streets
SELECT 
    id,
    name,
    subdivision_id,
    barangay_code,
    created_at
FROM geo_streets
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check subdivisions
SELECT 
    id,
    name,
    type,
    barangay_code,
    created_at
FROM geo_subdivisions
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check residents
SELECT 
    id,
    first_name,
    last_name,
    household_code,
    barangay_code,
    created_at
FROM residents
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check if there are households for your specific barangay
SELECT 
    h.code,
    h.name,
    h.house_number,
    gs.name as street_name,
    gsub.name as subdivision_name
FROM households h
LEFT JOIN geo_streets gs ON h.street_id = gs.id
LEFT JOIN geo_subdivisions gsub ON h.subdivision_id = gsub.id
WHERE h.barangay_code = '042114014'
ORDER BY h.created_at DESC;