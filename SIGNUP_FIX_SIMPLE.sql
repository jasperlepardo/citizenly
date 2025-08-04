-- Simple Signup Fix - Only add missing schema components
-- Run this in your Supabase SQL Editor after FIX_ROLE_ID_CONSTRAINT.sql
-- Assumes PSGC database is already populated

-- =====================================================
-- 1. ADD MISSING COLUMNS TO USER_PROFILES
-- =====================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_approval';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS barangay_code VARCHAR(10);

-- Add foreign key constraint for barangay_code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_barangay'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT fk_user_profiles_barangay 
        FOREIGN KEY (barangay_code) REFERENCES psgc_barangays(code);
    END IF;
END $$;

-- =====================================================
-- 2. CREATE BARANGAY_ACCOUNTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    role_id UUID REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'pending_approval',
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_barangay_accounts_user_id ON barangay_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_barangay_accounts_barangay_code ON barangay_accounts(barangay_code);

-- =====================================================
-- 3. RLS POLICIES FOR SIGNUP
-- =====================================================

-- Enable RLS
ALTER TABLE barangay_accounts ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies first
DO $$
BEGIN
    DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
    DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
    DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;
    DROP POLICY IF EXISTS barangay_accounts_insert_own ON barangay_accounts;
    DROP POLICY IF EXISTS barangay_accounts_select_own ON barangay_accounts;
    DROP POLICY IF EXISTS barangay_accounts_update_own ON barangay_accounts;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- User profiles policies
CREATE POLICY user_profiles_insert_own ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY user_profiles_select_own ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY user_profiles_update_own ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Barangay accounts policies
CREATE POLICY barangay_accounts_insert_own ON barangay_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY barangay_accounts_select_own ON barangay_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY barangay_accounts_update_own ON barangay_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 4. VERIFICATION
-- =====================================================

SELECT 'Database schema updated successfully for signup!' as message;

-- Show table structures
SELECT 'user_profiles columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

SELECT 'barangay_accounts columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'barangay_accounts' 
ORDER BY ordinal_position;