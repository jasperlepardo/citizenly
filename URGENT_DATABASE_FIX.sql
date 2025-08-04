-- URGENT: Fix missing columns in user_profiles table
-- Run this SQL in your Supabase SQL Editor immediately

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS barangay_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending_approval';

-- Add constraint for status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'user_profiles_status_check'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_status_check 
        CHECK (status IN ('active', 'inactive', 'pending_approval', 'suspended'));
    END IF;
END $$;

-- Create barangay_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS barangay_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  barangay_code VARCHAR(20) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  status VARCHAR(20) DEFAULT 'pending_approval' CHECK (status IN ('active', 'inactive', 'pending_approval', 'suspended')),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, barangay_code)
);

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow signup
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own barangay accounts" ON barangay_accounts;
CREATE POLICY "Users can create own barangay accounts" ON barangay_accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own barangay accounts" ON barangay_accounts;
CREATE POLICY "Users can read own barangay accounts" ON barangay_accounts
  FOR SELECT USING (user_id = auth.uid());

-- Success message
SELECT 'Database setup complete! You can now test signup again.' as message;