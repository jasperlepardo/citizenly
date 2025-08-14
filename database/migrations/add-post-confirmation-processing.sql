-- Post-Email-Confirmation Processing System
-- Handles processes that should run after user confirms their email

-- Add email verification tracking to profiles
ALTER TABLE auth_user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Function to handle post-confirmation processing
CREATE OR REPLACE FUNCTION auto_process_user_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_exists BOOLEAN := FALSE;
    v_role_name VARCHAR(50);
    v_address_hierarchy RECORD;
BEGIN
    -- Only process if email_confirmed_at changed from NULL to a timestamp
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        
        RAISE LOG 'Processing post-confirmation for user: %', NEW.id;
        
        -- Check if user profile exists
        SELECT EXISTS(SELECT 1 FROM auth_user_profiles WHERE id = NEW.id) INTO v_profile_exists;
        
        IF NOT v_profile_exists THEN
            RAISE WARNING 'No profile found for confirmed user: %', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Update profile with confirmation status
        UPDATE auth_user_profiles 
        SET 
            email_verified = true,
            email_verified_at = NEW.email_confirmed_at,
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Get user role for role-specific processing
        SELECT r.name INTO v_role_name
        FROM auth_user_profiles p
        JOIN auth_roles r ON p.role_id = r.id
        WHERE p.id = NEW.id;
        
        -- Complete geographic hierarchy if barangay is set
        SELECT 
            p.barangay_code,
            b.city_municipality_code,
            c.province_code,
            pr.region_code
        INTO v_address_hierarchy
        FROM auth_user_profiles p
        LEFT JOIN psgc_barangays b ON b.code = p.barangay_code
        LEFT JOIN psgc_cities_municipalities c ON c.code = b.city_municipality_code  
        LEFT JOIN psgc_provinces pr ON pr.code = c.province_code
        WHERE p.id = NEW.id 
        AND p.barangay_code IS NOT NULL;
        
        -- Update complete address hierarchy
        IF v_address_hierarchy.barangay_code IS NOT NULL THEN
            UPDATE auth_user_profiles 
            SET 
                city_municipality_code = v_address_hierarchy.city_municipality_code,
                province_code = v_address_hierarchy.province_code,
                region_code = v_address_hierarchy.region_code,
                updated_at = NOW()
            WHERE id = NEW.id;
            
            RAISE LOG 'Updated address hierarchy for user: % (%, %, %)', 
                NEW.id, 
                v_address_hierarchy.city_municipality_code,
                v_address_hierarchy.province_code, 
                v_address_hierarchy.region_code;
        END IF;
        
        -- Role-specific post-confirmation processing
        IF v_role_name = 'barangay_admin' THEN
            -- For barangay admins, ensure they have proper permissions
            -- This could include creating default dashboard settings, etc.
            RAISE LOG 'Barangay admin confirmed: %', NEW.id;
        END IF;
        
        RAISE LOG 'Post-confirmation processing completed for user: %', NEW.id;
        
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Post-confirmation processing failed for %: % (SQLSTATE: %)', 
            NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for post-confirmation processing
DROP TRIGGER IF EXISTS trigger_user_confirmation ON auth.users;

CREATE TRIGGER trigger_user_confirmation
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_process_user_confirmation();

-- Function to manually process confirmed users (for existing users)
CREATE OR REPLACE FUNCTION process_confirmed_users()
RETURNS TABLE(user_id UUID, status TEXT) AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find confirmed users without email_verified flag
    FOR user_record IN 
        SELECT u.id, u.email, u.email_confirmed_at, p.email_verified
        FROM auth.users u
        JOIN auth_user_profiles p ON u.id = p.id
        WHERE u.email_confirmed_at IS NOT NULL 
        AND (p.email_verified IS FALSE OR p.email_verified IS NULL)
    LOOP
        BEGIN
            -- Simulate the trigger by calling the function manually
            UPDATE auth_user_profiles 
            SET 
                email_verified = true,
                email_verified_at = user_record.email_confirmed_at,
                updated_at = NOW()
            WHERE id = user_record.id;
            
            -- Update address hierarchy if needed
            UPDATE auth_user_profiles p
            SET 
                city_municipality_code = c.code,
                province_code = pr.code,
                region_code = r.code,
                updated_at = NOW()
            FROM psgc_barangays b
            JOIN psgc_cities_municipalities c ON c.code = b.city_municipality_code
            JOIN psgc_provinces pr ON pr.code = c.province_code
            JOIN psgc_regions r ON r.code = pr.region_code
            WHERE p.id = user_record.id 
            AND p.barangay_code = b.code
            AND (p.city_municipality_code IS NULL OR p.province_code IS NULL OR p.region_code IS NULL);
            
            user_id := user_record.id;
            status := 'processed';
            RETURN NEXT;
            
        EXCEPTION WHEN others THEN
            user_id := user_record.id;
            status := 'failed: ' || SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification/welcome email queue table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'welcome_email', 'sms_welcome', etc.
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to queue welcome notifications after confirmation  
CREATE OR REPLACE FUNCTION auto_queue_welcome_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Only queue if email was just verified
    IF OLD.email_verified = false AND NEW.email_verified = true THEN
        
        -- Queue welcome email
        INSERT INTO user_notifications (user_id, notification_type, metadata)
        VALUES (
            NEW.id, 
            'welcome_email',
            json_build_object(
                'email', NEW.email,
                'first_name', NEW.first_name,
                'role_name', (SELECT name FROM auth_roles WHERE id = NEW.role_id)
            )
        );
        
        -- Queue SMS welcome if phone provided
        IF NEW.phone IS NOT NULL THEN
            INSERT INTO user_notifications (user_id, notification_type, metadata)
            VALUES (
                NEW.id,
                'sms_welcome', 
                json_build_object(
                    'phone', NEW.phone,
                    'first_name', NEW.first_name
                )
            );
        END IF;
        
        RAISE LOG 'Welcome notifications queued for user: %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to queue notifications
CREATE TRIGGER trigger_profile_email_verified
    AFTER UPDATE OF email_verified ON auth_user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_queue_welcome_notifications();

-- Process existing confirmed users
SELECT * FROM process_confirmed_users();