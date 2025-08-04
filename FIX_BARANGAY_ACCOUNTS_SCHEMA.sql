-- Fix barangay_accounts table to match AuthContext expectations
-- Run this to add the missing is_primary column

-- Add missing is_primary column
ALTER TABLE barangay_accounts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;

-- Update existing records to have is_primary = true (since they're likely the primary account)
UPDATE barangay_accounts SET is_primary = true WHERE is_primary IS NULL;

-- Verification
SELECT 'barangay_accounts table updated!' as message;

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'barangay_accounts' 
ORDER BY ordinal_position;