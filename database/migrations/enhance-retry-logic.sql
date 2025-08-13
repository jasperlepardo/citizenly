-- Enhanced retry logic for user verification with longer delays
-- This addresses persistent timing issues with Supabase Auth user propagation

CREATE OR REPLACE FUNCTION verify_auth_user_exists(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN := false;
    retry_count INTEGER := 0;
    max_retries INTEGER := 5;  -- Increased from 3 to 5
BEGIN
    -- Check if user exists in auth.users table with enhanced retry logic
    WHILE NOT user_exists AND retry_count < max_retries LOOP
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            retry_count := retry_count + 1;
            -- Progressive delays: 1s, 2s, 3s, 4s, 5s (total up to 15 seconds)
            PERFORM pg_sleep(retry_count * 1.0);
        END IF;
    END LOOP;
    
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;