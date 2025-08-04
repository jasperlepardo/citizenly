-- Complete Signup Fix - Apply remaining database schema updates
-- Run this in your Supabase SQL Editor after FIX_ROLE_ID_CONSTRAINT.sql

-- =====================================================
-- 1. ADD MISSING COLUMNS TO USER_PROFILES
-- =====================================================

-- Add missing columns that the signup expects but aren't in schema.sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_approval';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS barangay_code VARCHAR(10);

-- Add foreign key constraint for barangay_code (only if psgc_barangays exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'psgc_barangays') THEN
        -- Add foreign key constraint
        ALTER TABLE user_profiles 
        ADD CONSTRAINT fk_user_profiles_barangay 
        FOREIGN KEY (barangay_code) REFERENCES psgc_barangays(code);
    END IF;
END $$;

-- =====================================================
-- 2. CREATE BARANGAY_ACCOUNTS TABLE
-- =====================================================

-- Create barangay_accounts table that AuthContext expects
CREATE TABLE IF NOT EXISTS barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    barangay_code VARCHAR(10) NOT NULL,
    role_id UUID REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'pending_approval',
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for barangay_code (only if psgc_barangays exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'psgc_barangays') THEN
        ALTER TABLE barangay_accounts 
        ADD CONSTRAINT fk_barangay_accounts_barangay 
        FOREIGN KEY (barangay_code) REFERENCES psgc_barangays(code);
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_barangay_accounts_user_id ON barangay_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_barangay_accounts_barangay_code ON barangay_accounts(barangay_code);

-- =====================================================
-- 3. UPDATE RLS POLICIES FOR SIGNUP
-- =====================================================

-- Enable RLS on barangay_accounts
ALTER TABLE barangay_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;
DROP POLICY IF EXISTS barangay_accounts_insert_own ON barangay_accounts;
DROP POLICY IF EXISTS barangay_accounts_select_own ON barangay_accounts;
DROP POLICY IF EXISTS barangay_accounts_update_own ON barangay_accounts;

-- Allow users to insert their own profile during signup
CREATE POLICY user_profiles_insert_own ON user_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY user_profiles_select_own ON user_profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY user_profiles_update_own ON user_profiles
    FOR UPDATE 
    USING (auth.uid() = id);

-- Allow users to insert their own barangay account
CREATE POLICY barangay_accounts_insert_own ON barangay_accounts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own barangay accounts
CREATE POLICY barangay_accounts_select_own ON barangay_accounts
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to update their own barangay accounts
CREATE POLICY barangay_accounts_update_own ON barangay_accounts
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. ENSURE BASIC REFERENCE DATA EXISTS
-- =====================================================

-- Create sample PSGC data if tables exist but are empty
DO $$
BEGIN
    -- Check if we need to add sample data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'psgc_regions') 
       AND NOT EXISTS (SELECT 1 FROM psgc_regions LIMIT 1) THEN
        
        -- Add sample region
        INSERT INTO psgc_regions (code, name) VALUES 
        ('13', 'National Capital Region (NCR)'),
        ('03', 'Central Luzon'),
        ('04', 'CALABARZON');
        
        -- Add sample provinces
        INSERT INTO psgc_provinces (code, name, region_code) VALUES 
        ('1300', 'National Capital Region', '13'),
        ('0349', 'Bulacan', '03'),
        ('0421', 'Batangas', '04');
        
        -- Add sample cities
        INSERT INTO psgc_cities_municipalities (code, name, province_code, type) VALUES 
        ('130100', 'City of Manila', '1300', 'City'),
        ('034918', 'Malolos City', '0349', 'City'),
        ('042108', 'Batangas City', '0421', 'City');
        
        -- Add sample barangays
        INSERT INTO psgc_barangays (code, name, city_municipality_code, urban_rural_status) VALUES 
        ('13010001', 'Barangay 1 (Malacañang)', '130100', 'Urban'),
        ('13010002', 'Barangay 2 (Intramuros)', '130100', 'Urban'),
        ('03491801', 'Barangay Anilao', '034918', 'Urban'),
        ('04210801', 'Barangay 1 (Poblacion)', '042108', 'Urban');
    END IF;
END $$;

-- =====================================================
-- 5. VERIFY TABLE STRUCTURE
-- =====================================================

-- Show updated user_profiles structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Show barangay_accounts structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'barangay_accounts' 
ORDER BY ordinal_position;

-- Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'barangay_accounts')
ORDER BY tablename, policyname;

SELECT 'Signup database fix completed successfully! You can now test user signup.' as status;