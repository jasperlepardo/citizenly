-- Optimize retry logic with shorter delays to prevent statement timeout
-- Reduces total retry time while maintaining effectiveness

CREATE OR REPLACE FUNCTION verify_auth_user_exists(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN := false;
    retry_count INTEGER := 0;
    max_retries INTEGER := 6;  -- More attempts with shorter delays
BEGIN
    -- Check if user exists in auth.users table with optimized retry logic
    WHILE NOT user_exists AND retry_count < max_retries LOOP
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            retry_count := retry_count + 1;
            -- Shorter delays: 0.5s, 1s, 1.5s, 2s, 2.5s, 3s (total ~10.5 seconds)
            PERFORM pg_sleep(retry_count * 0.5);
        END IF;
    END LOOP;
    
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;