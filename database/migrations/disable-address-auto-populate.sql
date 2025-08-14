-- Temporarily disable the auto_populate_resident_address trigger
-- This trigger is conflicting with the UI-provided geographic data

-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS trigger_auto_populate_resident_address ON residents;

-- Comment for reference:
-- This trigger was auto-populating address fields from user's barangay assignment
-- but we want the API to explicitly pass the geographic codes from the UI
-- The trigger can be re-enabled later if needed with:
-- CREATE TRIGGER trigger_auto_populate_resident_address
--     BEFORE INSERT OR UPDATE ON residents
--     FOR EACH ROW
--     EXECUTE FUNCTION auto_populate_resident_address();