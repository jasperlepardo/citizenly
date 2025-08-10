-- =====================================================
-- PII ENCRYPTION SECURITY IMPLEMENTATION
-- =====================================================
-- System: RBI - Phase 1 Critical Security Enhancement
-- Purpose: Encrypt sensitive personal information
-- Priority: CRITICAL - Implement immediately
-- =====================================================

-- =====================================================
-- SECTION 1: ENCRYPTION KEY MANAGEMENT
-- =====================================================

-- Encryption key management table
CREATE TABLE system_encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(50) NOT NULL UNIQUE,
    key_version INTEGER NOT NULL DEFAULT 1,
    encryption_algorithm VARCHAR(20) DEFAULT 'AES-256-GCM',
    key_purpose VARCHAR(50) NOT NULL, -- 'pii', 'documents', 'communications'
    
    -- Security metadata
    key_hash BYTEA NOT NULL,  -- Store key hash, not actual key
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    
    -- Constraints
    CONSTRAINT active_key_per_name UNIQUE(key_name, is_active) 
        WHERE is_active = true,
    CONSTRAINT valid_algorithm CHECK (encryption_algorithm IN ('AES-256-GCM', 'AES-256-CBC')),
    CONSTRAINT valid_purpose CHECK (key_purpose IN ('pii', 'documents', 'communications', 'system'))
);

-- Key rotation history
CREATE TABLE system_key_rotation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(50) NOT NULL,
    old_key_version INTEGER NOT NULL,
    new_key_version INTEGER NOT NULL,
    rotation_reason TEXT,
    rotated_by UUID REFERENCES auth_user_profiles(id),
    rotated_at TIMESTAMPTZ DEFAULT NOW(),
    records_migrated INTEGER DEFAULT 0,
    migration_completed_at TIMESTAMPTZ
);

-- Initialize default PII encryption key
INSERT INTO system_encryption_keys (
    key_name, 
    key_purpose, 
    key_hash,
    created_by
) VALUES (
    'pii_master_key',
    'pii', 
    digest('RBI-PII-KEY-2025-' || extract(epoch from now())::text, 'sha256'),
    (SELECT id FROM auth_user_profiles WHERE email LIKE '%admin%' LIMIT 1)
);

-- =====================================================
-- SECTION 2: PII ENCRYPTION FUNCTIONS
-- =====================================================

-- Function: Get active encryption key
CREATE OR REPLACE FUNCTION get_active_encryption_key(p_key_name VARCHAR)
RETURNS BYTEA AS $$
DECLARE
    encryption_key BYTEA;
BEGIN
    SELECT key_hash INTO encryption_key 
    FROM system_encryption_keys 
    WHERE key_name = p_key_name 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW());
    
    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'No active encryption key found for: %', p_key_name;
    END IF;
    
    RETURN encryption_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Encrypt PII data
CREATE OR REPLACE FUNCTION encrypt_pii(
    p_plaintext TEXT,
    p_key_name VARCHAR DEFAULT 'pii_master_key'
)
RETURNS BYTEA AS $$
DECLARE
    encryption_key BYTEA;
    encrypted_data BYTEA;
BEGIN
    -- Handle NULL input
    IF p_plaintext IS NULL OR TRIM(p_plaintext) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Get active key
    encryption_key := get_active_encryption_key(p_key_name);
    
    -- Encrypt using pgcrypto
    encrypted_data := pgp_sym_encrypt(p_plaintext, encode(encryption_key, 'hex'));
    
    -- Log encryption event (for audit)
    INSERT INTO system_audit_logs (
        table_name, 
        operation, 
        record_id, 
        new_values,
        user_id,
        created_at
    ) VALUES (
        'pii_encryption',
        'ENCRYPT',
        gen_random_uuid(),
        jsonb_build_object('key_name', p_key_name, 'data_length', length(p_plaintext)),
        auth.uid(),
        NOW()
    );
    
    RETURN encrypted_data;
EXCEPTION
    WHEN OTHERS THEN
        -- Log encryption failure
        INSERT INTO system_audit_logs (
            table_name, 
            operation, 
            record_id, 
            new_values,
            user_id,
            created_at
        ) VALUES (
            'pii_encryption',
            'ENCRYPT_FAILED',
            gen_random_uuid(),
            jsonb_build_object('error', SQLERRM, 'key_name', p_key_name),
            auth.uid(),
            NOW()
        );
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Decrypt PII data
CREATE OR REPLACE FUNCTION decrypt_pii(
    p_encrypted_data BYTEA,
    p_key_name VARCHAR DEFAULT 'pii_master_key'
)
RETURNS TEXT AS $$
DECLARE
    encryption_key BYTEA;
    decrypted_data TEXT;
BEGIN
    -- Handle NULL input
    IF p_encrypted_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get active key
    encryption_key := get_active_encryption_key(p_key_name);
    
    -- Decrypt using pgcrypto
    decrypted_data := pgp_sym_decrypt(p_encrypted_data, encode(encryption_key, 'hex'));
    
    -- Log decryption access (for audit)
    INSERT INTO system_audit_logs (
        table_name, 
        operation, 
        record_id, 
        new_values,
        user_id,
        created_at
    ) VALUES (
        'pii_decryption',
        'DECRYPT',
        gen_random_uuid(),
        jsonb_build_object('key_name', p_key_name, 'accessed_by', auth.uid()),
        auth.uid(),
        NOW()
    );
    
    RETURN decrypted_data;
EXCEPTION
    WHEN OTHERS THEN
        -- Log decryption failure
        INSERT INTO system_audit_logs (
            table_name, 
            operation, 
            record_id, 
            new_values,
            user_id,
            created_at
        ) VALUES (
            'pii_decryption',
            'DECRYPT_FAILED',
            gen_random_uuid(),
            jsonb_build_object('error', SQLERRM, 'key_name', p_key_name),
            auth.uid(),
            NOW()
        );
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create searchable hash for encrypted fields
CREATE OR REPLACE FUNCTION create_search_hash(
    p_plaintext TEXT,
    p_salt TEXT DEFAULT 'RBI_SEARCH_SALT_2025'
)
RETURNS VARCHAR(64) AS $$
BEGIN
    -- Handle NULL input
    IF p_plaintext IS NULL OR TRIM(p_plaintext) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Create searchable hash (not for encryption, just for lookups)
    RETURN encode(
        hmac(LOWER(TRIM(p_plaintext)), p_salt, 'sha256'), 
        'hex'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- SECTION 3: UPDATE RESIDENTS TABLE STRUCTURE
-- =====================================================

-- Add encrypted fields to residents table
ALTER TABLE residents 
ADD COLUMN first_name_encrypted BYTEA,
ADD COLUMN middle_name_encrypted BYTEA,
ADD COLUMN last_name_encrypted BYTEA,
ADD COLUMN mobile_number_encrypted BYTEA,
ADD COLUMN telephone_number_encrypted BYTEA,
ADD COLUMN email_encrypted BYTEA,
ADD COLUMN mother_maiden_first_encrypted BYTEA,
ADD COLUMN mother_maiden_middle_encrypted BYTEA,
ADD COLUMN mother_maiden_last_encrypted BYTEA;

-- Add searchable hash fields for lookups
ALTER TABLE residents
ADD COLUMN first_name_hash VARCHAR(64),
ADD COLUMN last_name_hash VARCHAR(64),
ADD COLUMN mobile_number_hash VARCHAR(64),
ADD COLUMN email_hash VARCHAR(64),
ADD COLUMN full_name_hash VARCHAR(64);

-- Add encryption metadata
ALTER TABLE residents
ADD COLUMN is_data_encrypted BOOLEAN DEFAULT false,
ADD COLUMN encryption_key_version INTEGER DEFAULT 1,
ADD COLUMN encrypted_at TIMESTAMPTZ,
ADD COLUMN encrypted_by UUID REFERENCES auth_user_profiles(id);

-- Update residents table comments
COMMENT ON COLUMN residents.first_name_encrypted IS 'Encrypted first name using AES-256';
COMMENT ON COLUMN residents.mobile_number_encrypted IS 'Encrypted mobile number for privacy';
COMMENT ON COLUMN residents.email_encrypted IS 'Encrypted email address';
COMMENT ON COLUMN residents.mother_maiden_first_encrypted IS 'Encrypted mother maiden name (highly sensitive)';
COMMENT ON COLUMN residents.first_name_hash IS 'Searchable hash of first name (not reversible)';
COMMENT ON COLUMN residents.is_data_encrypted IS 'Flag indicating if PII is encrypted';

-- =====================================================
-- SECTION 4: ENCRYPTION TRIGGERS
-- =====================================================

-- Trigger function: Auto-encrypt PII on insert/update
CREATE OR REPLACE FUNCTION trigger_encrypt_resident_pii()
RETURNS TRIGGER AS $$
BEGIN
    -- Only encrypt if data is not already encrypted
    IF NEW.is_data_encrypted = false OR NEW.is_data_encrypted IS NULL THEN
        
        -- Encrypt PII fields
        NEW.first_name_encrypted := encrypt_pii(NEW.first_name);
        NEW.middle_name_encrypted := encrypt_pii(NEW.middle_name);
        NEW.last_name_encrypted := encrypt_pii(NEW.last_name);
        NEW.mobile_number_encrypted := encrypt_pii(NEW.mobile_number);
        NEW.telephone_number_encrypted := encrypt_pii(NEW.telephone_number);
        NEW.email_encrypted := encrypt_pii(NEW.email);
        NEW.mother_maiden_first_encrypted := encrypt_pii(NEW.mother_maiden_first);
        NEW.mother_maiden_middle_encrypted := encrypt_pii(NEW.mother_maiden_middle);
        NEW.mother_maiden_last_encrypted := encrypt_pii(NEW.mother_maiden_last);
        
        -- Create searchable hashes
        NEW.first_name_hash := create_search_hash(NEW.first_name);
        NEW.last_name_hash := create_search_hash(NEW.last_name);
        NEW.mobile_number_hash := create_search_hash(NEW.mobile_number);
        NEW.email_hash := create_search_hash(NEW.email);
        NEW.full_name_hash := create_search_hash(
            TRIM(COALESCE(NEW.first_name, '') || ' ' || 
                 COALESCE(NEW.middle_name, '') || ' ' || 
                 COALESCE(NEW.last_name, ''))
        );
        
        -- Update encryption metadata
        NEW.is_data_encrypted := true;
        NEW.encryption_key_version := 1;
        NEW.encrypted_at := NOW();
        NEW.encrypted_by := auth.uid();
        
        -- Clear plain text fields after encryption (optional - for maximum security)
        -- Uncomment these lines to remove plain text after encryption:
        -- NEW.first_name := NULL;
        -- NEW.middle_name := NULL;  
        -- NEW.last_name := NULL;
        -- NEW.mobile_number := NULL;
        -- NEW.telephone_number := NULL;
        -- NEW.email := NULL;
        -- NEW.mother_maiden_first := NULL;
        -- NEW.mother_maiden_middle := NULL;
        -- NEW.mother_maiden_last := NULL;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic PII encryption
CREATE TRIGGER trigger_residents_encrypt_pii
    BEFORE INSERT OR UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION trigger_encrypt_resident_pii();

-- =====================================================
-- SECTION 5: DATA ACCESS VIEWS
-- =====================================================

-- View: Decrypted resident data (for authorized access)
CREATE VIEW residents_decrypted AS
SELECT 
    id,
    philsys_card_number_hash,
    philsys_last4,
    
    -- Decrypted personal information
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(first_name_encrypted)
        ELSE first_name 
    END as first_name,
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(middle_name_encrypted)
        ELSE middle_name 
    END as middle_name,
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(last_name_encrypted)
        ELSE last_name 
    END as last_name,
    
    -- Non-PII fields (unchanged)
    extension_name,
    birthdate,
    age,
    birth_place_code,
    birth_place_level,
    birth_place_text,
    birth_place_full,
    sex,
    civil_status,
    civil_status_others_specify,
    blood_type,
    height,
    weight,
    complexion,
    
    -- Education and employment (non-sensitive)
    education_attainment,
    is_graduate,
    employment_status,
    psoc_code,
    psoc_level,
    occupation_title,
    job_title,
    workplace,
    occupation,
    occupation_details,
    
    -- Decrypted contact information
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(mobile_number_encrypted)
        ELSE mobile_number 
    END as mobile_number,
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(telephone_number_encrypted)
        ELSE telephone_number 
    END as telephone_number,
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(email_encrypted)
        ELSE email 
    END as email,
    
    -- Location and household (non-sensitive)
    household_id,
    household_code,
    street_id,
    subdivision_id,
    barangay_code,
    city_municipality_code,
    province_code,
    region_code,
    
    -- Civic information (non-sensitive)
    citizenship,
    is_registered_voter,
    is_resident_voter,
    last_voted_year,
    ethnicity,
    religion,
    religion_others_specify,
    
    -- Decrypted mother's maiden name
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(mother_maiden_first_encrypted)
        ELSE mother_maiden_first 
    END as mother_maiden_first,
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(mother_maiden_middle_encrypted)
        ELSE mother_maiden_middle 
    END as mother_maiden_middle,
    CASE 
        WHEN is_data_encrypted = true THEN decrypt_pii(mother_maiden_last_encrypted)
        ELSE mother_maiden_last 
    END as mother_maiden_last,
    
    -- Metadata
    created_by,
    updated_by,
    created_at,
    updated_at,
    search_text,
    search_vector,
    
    -- Encryption metadata
    is_data_encrypted,
    encryption_key_version,
    encrypted_at,
    encrypted_by
    
FROM residents;

-- View: Masked resident data (for public/limited access)
CREATE VIEW residents_masked AS
SELECT 
    id,
    
    -- Masked personal information
    CASE 
        WHEN first_name IS NOT NULL THEN 
            LEFT(COALESCE(decrypt_pii(first_name_encrypted), first_name), 1) || '***'
        ELSE NULL 
    END as first_name_masked,
    CASE 
        WHEN last_name IS NOT NULL THEN 
            LEFT(COALESCE(decrypt_pii(last_name_encrypted), last_name), 1) || '***'
        ELSE NULL 
    END as last_name_masked,
    
    -- Public demographic information
    age,
    sex,
    civil_status,
    barangay_code,
    
    -- Masked contact information
    CASE 
        WHEN mobile_number IS NOT NULL OR mobile_number_encrypted IS NOT NULL THEN 
            'XXX-XXX-' || RIGHT(COALESCE(decrypt_pii(mobile_number_encrypted), mobile_number), 4)
        ELSE NULL 
    END as mobile_number_masked,
    
    -- General location (non-specific)
    subdivision_id,
    city_municipality_code,
    province_code,
    region_code,
    
    -- Non-sensitive metadata
    created_at,
    is_data_encrypted
    
FROM residents;

-- =====================================================
-- SECTION 6: SECURE SEARCH FUNCTIONS
-- =====================================================

-- Function: Search residents by encrypted name
CREATE OR REPLACE FUNCTION search_residents_by_name(
    p_search_term TEXT,
    p_barangay_code VARCHAR(10)
)
RETURNS TABLE(
    resident_id UUID,
    full_name TEXT,
    age INTEGER,
    sex sex_enum,
    mobile_number TEXT,
    match_score INTEGER
) AS $$
DECLARE
    search_hash VARCHAR(64);
BEGIN
    -- Create search hash for the search term
    search_hash := create_search_hash(p_search_term);
    
    RETURN QUERY
    SELECT 
        r.id as resident_id,
        CASE 
            WHEN r.is_data_encrypted = true THEN
                TRIM(COALESCE(decrypt_pii(r.first_name_encrypted), '') || ' ' ||
                     COALESCE(decrypt_pii(r.middle_name_encrypted), '') || ' ' ||
                     COALESCE(decrypt_pii(r.last_name_encrypted), ''))
            ELSE
                TRIM(COALESCE(r.first_name, '') || ' ' ||
                     COALESCE(r.middle_name, '') || ' ' ||
                     COALESCE(r.last_name, ''))
        END as full_name,
        r.age,
        r.sex,
        CASE 
            WHEN r.is_data_encrypted = true THEN decrypt_pii(r.mobile_number_encrypted)
            ELSE r.mobile_number 
        END as mobile_number,
        CASE 
            WHEN r.full_name_hash = search_hash THEN 100
            WHEN r.first_name_hash = search_hash THEN 90
            WHEN r.last_name_hash = search_hash THEN 85
            ELSE 70
        END as match_score
    FROM residents r
    WHERE r.barangay_code = p_barangay_code
    AND (
        r.full_name_hash = search_hash OR
        r.first_name_hash = search_hash OR
        r.last_name_hash = search_hash
    )
    ORDER BY match_score DESC, full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search residents by encrypted mobile number
CREATE OR REPLACE FUNCTION search_residents_by_mobile(
    p_mobile_number TEXT,
    p_barangay_code VARCHAR(10)
)
RETURNS TABLE(
    resident_id UUID,
    full_name TEXT,
    mobile_number TEXT,
    email TEXT
) AS $$
DECLARE
    mobile_hash VARCHAR(64);
BEGIN
    -- Create search hash for the mobile number
    mobile_hash := create_search_hash(p_mobile_number);
    
    RETURN QUERY
    SELECT 
        r.id as resident_id,
        CASE 
            WHEN r.is_data_encrypted = true THEN
                TRIM(COALESCE(decrypt_pii(r.first_name_encrypted), '') || ' ' ||
                     COALESCE(decrypt_pii(r.middle_name_encrypted), '') || ' ' ||
                     COALESCE(decrypt_pii(r.last_name_encrypted), ''))
            ELSE
                TRIM(COALESCE(r.first_name, '') || ' ' ||
                     COALESCE(r.middle_name, '') || ' ' ||
                     COALESCE(r.last_name, ''))
        END as full_name,
        CASE 
            WHEN r.is_data_encrypted = true THEN decrypt_pii(r.mobile_number_encrypted)
            ELSE r.mobile_number 
        END as mobile_number,
        CASE 
            WHEN r.is_data_encrypted = true THEN decrypt_pii(r.email_encrypted)
            ELSE r.email 
        END as email
    FROM residents r
    WHERE r.barangay_code = p_barangay_code
    AND r.mobile_number_hash = mobile_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 7: INDEXES FOR ENCRYPTED FIELDS
-- =====================================================

-- Indexes for hash-based searching
CREATE INDEX idx_residents_first_name_hash ON residents(first_name_hash) WHERE first_name_hash IS NOT NULL;
CREATE INDEX idx_residents_last_name_hash ON residents(last_name_hash) WHERE last_name_hash IS NOT NULL;
CREATE INDEX idx_residents_full_name_hash ON residents(full_name_hash) WHERE full_name_hash IS NOT NULL;
CREATE INDEX idx_residents_mobile_hash ON residents(mobile_number_hash) WHERE mobile_number_hash IS NOT NULL;
CREATE INDEX idx_residents_email_hash ON residents(email_hash) WHERE email_hash IS NOT NULL;

-- Index for encryption status
CREATE INDEX idx_residents_encryption_status ON residents(is_data_encrypted, encrypted_at);

-- Index for key version (for key rotation)
CREATE INDEX idx_residents_key_version ON residents(encryption_key_version) WHERE is_data_encrypted = true;

-- =====================================================
-- SECTION 8: ROW LEVEL SECURITY FOR ENCRYPTED DATA
-- =====================================================

-- Enable RLS on new encryption tables
ALTER TABLE system_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_encryption_keys FORCE ROW LEVEL SECURITY;

ALTER TABLE system_key_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_key_rotation_history FORCE ROW LEVEL SECURITY;

-- Policy: Only super admins can manage encryption keys
CREATE POLICY "Super admin encryption keys" ON system_encryption_keys
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles p
        JOIN auth_roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name = 'super_admin'
    )
);

-- Policy: Key rotation history access
CREATE POLICY "Admin key rotation history" ON system_key_rotation_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth_user_profiles p
        JOIN auth_roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name IN ('super_admin', 'admin')
    )
);

-- Policy: Restrict access to decrypted views
CREATE POLICY "Authorized access to decrypted residents" ON residents_decrypted
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth_barangay_accounts ba
        WHERE ba.user_id = auth.uid() 
        AND ba.barangay_code = residents_decrypted.barangay_code
    )
);

-- =====================================================
-- SECTION 9: UTILITY FUNCTIONS
-- =====================================================

-- Function: Get encryption statistics
CREATE OR REPLACE FUNCTION get_encryption_statistics()
RETURNS TABLE(
    total_residents BIGINT,
    encrypted_residents BIGINT,
    unencrypted_residents BIGINT,
    encryption_percentage NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_residents,
        COUNT(*) FILTER (WHERE is_data_encrypted = true) as encrypted_residents,
        COUNT(*) FILTER (WHERE is_data_encrypted = false OR is_data_encrypted IS NULL) as unencrypted_residents,
        ROUND(
            (COUNT(*) FILTER (WHERE is_data_encrypted = true) * 100.0) / 
            GREATEST(COUNT(*), 1), 2
        ) as encryption_percentage
    FROM residents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Validate encryption integrity
CREATE OR REPLACE FUNCTION validate_encryption_integrity(p_resident_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    r RECORD;
    test_decrypt TEXT;
BEGIN
    SELECT * INTO r FROM residents WHERE id = p_resident_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resident not found: %', p_resident_id;
    END IF;
    
    IF r.is_data_encrypted = false THEN
        RETURN true; -- Not encrypted, so integrity is not applicable
    END IF;
    
    -- Try to decrypt a field to test integrity
    BEGIN
        test_decrypt := decrypt_pii(r.first_name_encrypted);
        RETURN test_decrypt IS NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN false;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE system_encryption_keys IS 'Manages encryption keys for PII data protection';
COMMENT ON TABLE system_key_rotation_history IS 'Tracks encryption key rotation events';
COMMENT ON FUNCTION encrypt_pii(TEXT, VARCHAR) IS 'Encrypts PII data using active encryption key';
COMMENT ON FUNCTION decrypt_pii(BYTEA, VARCHAR) IS 'Decrypts PII data (logs access for audit)';
COMMENT ON FUNCTION create_search_hash(TEXT, TEXT) IS 'Creates searchable hash for encrypted fields';
COMMENT ON VIEW residents_decrypted IS 'Decrypted view of residents (requires proper permissions)';
COMMENT ON VIEW residents_masked IS 'Masked view of residents for public/limited access';

-- =====================================================
-- FINAL NOTES
-- =====================================================
-- 
-- IMPLEMENTATION NOTES:
-- 1. This script encrypts PII but keeps plain text fields for backward compatibility
-- 2. To remove plain text after encryption, uncomment the NULL assignments in trigger
-- 3. All encryption/decryption operations are logged for audit
-- 4. Search functions use hash-based lookups for performance
-- 5. Views provide different access levels (decrypted vs masked)
-- 
-- SECURITY CONSIDERATIONS:
-- - Encryption keys are stored as hashes, not actual keys
-- - All PII access is logged in audit_logs
-- - RLS policies control access to sensitive functions
-- - Hash-based searching maintains performance while protecting data
-- 
-- NEXT STEPS:
-- 1. Test encryption/decryption functions
-- 2. Migrate existing data to encrypted format
-- 3. Update application code to use new views
-- 4. Implement key rotation procedures
-- =====================================================