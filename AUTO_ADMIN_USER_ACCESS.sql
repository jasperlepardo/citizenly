-- User Access Implementation with Auto Barangay Admin Assignment
-- For Original Schema

-- =====================================================
-- 1. MINIMAL SCHEMA ENHANCEMENTS
-- =====================================================

-- Add only essential field for user signup
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- =====================================================
-- 2. AUTO BARANGAY ADMIN ASSIGNMENT FUNCTION
-- =====================================================

-- Function to check if barangay has admin and assign role accordingly
CREATE OR REPLACE FUNCTION assign_user_role_for_barangay(
    p_user_id UUID,
    p_barangay_code VARCHAR(10)
) RETURNS UUID AS $$
DECLARE
    admin_role_id UUID;
    resident_role_id UUID;
    has_existing_admin BOOLEAN DEFAULT FALSE;
BEGIN
    -- Get role IDs
    SELECT id INTO admin_role_id FROM roles WHERE name = 'barangay_admin' LIMIT 1;
    SELECT id INTO resident_role_id FROM roles WHERE name = 'resident' LIMIT 1;
    
    -- Check if barangay already has an admin
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.barangay_code = p_barangay_code 
        AND r.name = 'barangay_admin'
        AND up.is_active = true
    ) INTO has_existing_admin;
    
    -- Assign role based on whether admin exists
    IF has_existing_admin = FALSE AND admin_role_id IS NOT NULL THEN
        -- No admin exists, make this user the barangay admin
        RETURN admin_role_id;
    ELSE
        -- Admin exists, assign as resident
        RETURN COALESCE(resident_role_id, admin_role_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. RLS POLICIES FOR USER SIGNUP AND MANAGEMENT
-- =====================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS user_profiles_own_policy ON user_profiles;
DROP POLICY IF EXISTS user_profiles_signup ON user_profiles;
DROP POLICY IF EXISTS user_profiles_read_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_admin_manage ON user_profiles;

-- Allow users to insert their own profile during signup
CREATE POLICY user_profiles_signup ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY user_profiles_read_own ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (limited fields)
CREATE POLICY user_profiles_update_own ON user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        -- Prevent users from changing critical fields
        (OLD.role_id = NEW.role_id AND OLD.barangay_code = NEW.barangay_code)
    );

-- Allow barangay admins to manage users in their barangay
CREATE POLICY user_profiles_admin_manage ON user_profiles
    FOR ALL USING (
        -- User can see their own profile OR
        auth.uid() = id OR
        -- Admin can see users in their barangay
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            JOIN roles admin_role ON admin_profile.role_id = admin_role.id
            WHERE admin_profile.id = auth.uid()
            AND admin_role.name IN ('barangay_admin', 'super_admin')
            AND admin_profile.is_active = true
            AND (
                admin_role.name = 'super_admin' OR 
                admin_profile.barangay_code = user_profiles.barangay_code
            )
        )
    );

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Test the function
SELECT 'Testing auto admin assignment function...' as step;

-- Show current schema
SELECT 'Updated user_profiles structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Show available roles
SELECT 'Available roles:' as info;
SELECT id, name, permissions FROM roles ORDER BY name;

SELECT 'Auto barangay admin assignment setup complete!' as status;