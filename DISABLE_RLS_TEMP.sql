-- EMERGENCY FIX: Temporarily disable RLS to allow signup
-- This is a temporary solution to get signup working immediately

-- Step 1: Disable RLS on user_profiles temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Also disable RLS on barangay_accounts if it exists
ALTER TABLE barangay_accounts DISABLE ROW LEVEL SECURITY;

-- Confirmation message
SELECT 'RLS temporarily disabled. Signup should work now. Remember to re-enable RLS later for security!' as message;

-- NOTE: After signup is working, you should run this to re-enable security:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE barangay_accounts ENABLE ROW LEVEL SECURITY;