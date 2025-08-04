-- Test updating household head manually
SELECT 'Before update:' as info;
SELECT code, household_head_id FROM households WHERE code = 'HH-014-729881';

-- Get a resident ID from this household to test with
SELECT 'Available residents:' as info;
SELECT id, first_name, last_name FROM residents WHERE household_code = 'HH-014-729881';

-- Test manual update (replace the UUID with an actual resident ID)
-- UPDATE households SET household_head_id = 'actual-resident-uuid-here' WHERE code = 'HH-014-729881';

-- Check after update would show:
-- SELECT 'After update:' as info;
-- SELECT code, household_head_id FROM households WHERE code = 'HH-014-729881';