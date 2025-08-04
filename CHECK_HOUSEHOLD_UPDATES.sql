-- Check if the household head update is working
SELECT 'Current household data:' as info;
SELECT code, household_head_id, total_members, street_name 
FROM households 
WHERE code = 'HH-014-729881';

-- Check residents in this household
SELECT 'Residents in household:' as info;
SELECT id, first_name, last_name, household_code 
FROM residents 
WHERE household_code = 'HH-014-729881';

-- Check if trigger exists
SELECT 'Household member count trigger:' as info;
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'trg_update_household_member_count';

-- Check if the trigger function exists
SELECT 'Trigger function exists:' as info;
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'update_household_member_count';