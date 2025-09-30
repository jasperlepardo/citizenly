-- Database setup for RBI System user management
-- Run these queries in your Supabase SQL editor

-- First check if user_profiles table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            phone VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Add missing columns to user_profiles if they don't exist
DO $$ 
BEGIN
    -- Add mobile_number column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'mobile_number') THEN
        ALTER TABLE user_profiles ADD COLUMN mobile_number VARCHAR(20);
    END IF;
    
    -- Add barangay_code column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'barangay_code') THEN
        ALTER TABLE user_profiles ADD COLUMN barangay_code VARCHAR(20);
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status') THEN
        ALTER TABLE user_profiles ADD COLUMN status VARCHAR(20) DEFAULT 'pending_approval' CHECK (status IN ('active', 'inactive', 'pending_approval', 'suspended'));
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

-- Insert default roles if they don't exist
INSERT INTO roles (id, name, description, permissions, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'super_admin', 'System super administrator', '{"*": true}', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'barangay_admin', 'Barangay administrator', '{"manage_users": true, "manage_residents": true, "manage_households": true, "view_analytics": true}', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'clerk', 'Data entry clerk', '{"manage_residents": true, "view_residents": true}', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'resident', 'Barangay resident', '{"view_own_profile": true}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_barangay ON user_profiles(barangay_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_barangay_accounts_user ON barangay_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_barangay_accounts_barangay ON barangay_accounts(barangay_code);
CREATE INDEX IF NOT EXISTS idx_barangay_accounts_status ON barangay_accounts(status);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for user_profiles

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to create their own profile during signup
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to read all profiles (will be added later when barangay_accounts exists)
-- For now, we'll keep it simple and add admin policies later

-- Enable RLS on barangay_accounts
ALTER TABLE barangay_accounts ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for barangay_accounts

-- Allow users to read their own barangay accounts
DROP POLICY IF EXISTS "Users can read own barangay accounts" ON barangay_accounts;
CREATE POLICY "Users can read own barangay accounts" ON barangay_accounts
  FOR SELECT USING (user_id = auth.uid());

-- Allow users to create their own barangay account during signup
DROP POLICY IF EXISTS "Users can create own barangay accounts" ON barangay_accounts;
CREATE POLICY "Users can create own barangay accounts" ON barangay_accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_barangay_accounts_updated_at ON barangay_accounts;
CREATE TRIGGER update_barangay_accounts_updated_at
  BEFORE UPDATE ON barangay_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile from auth.users metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if metadata contains the required fields
  IF NEW.raw_user_meta_data ? 'first_name' AND NEW.raw_user_meta_data ? 'last_name' THEN
    INSERT INTO public.user_profiles (
      id,
      email,
      first_name,
      last_name,
      mobile_number,
      barangay_code
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'mobile_number',
      NEW.raw_user_meta_data->>'barangay_code'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();