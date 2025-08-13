-- DISABLE EMAIL CONFIRMATION FOR DEVELOPMENT
-- This allows immediate access without email verification

-- Option 1: Auto-confirm all new users (for development only)
CREATE OR REPLACE FUNCTION auto_confirm_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically confirm email for new users in development
    IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at = NOW();
        NEW.confirmation_sent_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm (ONLY FOR DEVELOPMENT)
DROP TRIGGER IF EXISTS trigger_auto_confirm_dev_users ON auth.users;
CREATE TRIGGER trigger_auto_confirm_dev_users
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_users();

-- Note: To re-enable email confirmation for production:
-- DROP TRIGGER IF EXISTS trigger_auto_confirm_dev_users ON auth.users;
-- DROP FUNCTION IF EXISTS auto_confirm_users();