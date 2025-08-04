-- URGENT RLS Policy Fix for user_profiles
-- Run this in your Supabase SQL Editor

-- First, temporarily disable RLS to see current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow signup to create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create simple, working RLS policies
-- Allow authenticated users to insert their own profile
CREATE POLICY "Enable insert for authenticated users own profile" ON user_profiles
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Enable read access for own profile" ON user_profiles
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Enable update for own profile" ON user_profiles
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test if RLS is working properly
SELECT 'RLS policies updated successfully. Try signup again.' as message;