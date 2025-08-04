-- Fix the role_id constraint issue
-- Run this in your Supabase SQL Editor

-- Option 1: Make role_id nullable (recommended for user_profiles)
ALTER TABLE user_profiles ALTER COLUMN role_id DROP NOT NULL;

-- Option 2: Set a default role_id for new users
-- First, get the resident role ID
DO $$
DECLARE
    resident_role_id UUID;
BEGIN
    -- Get the resident role ID
    SELECT id INTO resident_role_id FROM roles WHERE name = 'resident' LIMIT 1;
    
    IF resident_role_id IS NOT NULL THEN
        -- Set default role_id to resident
        EXECUTE format('ALTER TABLE user_profiles ALTER COLUMN role_id SET DEFAULT %L', resident_role_id);
    ELSE
        -- If no resident role exists, make the column nullable
        ALTER TABLE user_profiles ALTER COLUMN role_id DROP NOT NULL;
    END IF;
END $$;

-- Check the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

SELECT 'role_id constraint fixed. Signup should work now.' as message;