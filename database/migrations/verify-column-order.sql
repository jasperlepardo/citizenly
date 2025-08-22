-- =============================================================================
-- VERIFY RESIDENTS TABLE COLUMN ORDER
-- =============================================================================
-- 
-- Run this in Supabase SQL Editor to check the actual column order in the database
--
-- =============================================================================

-- Check the actual column order as stored in the database
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'residents' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show expected order from database/schema.sql for comparison
-- Expected order should be:
-- 1. id
-- 2. philsys_card_number  
-- 3. philsys_last4
-- 4. first_name
-- 5. middle_name
-- 6. last_name
-- 7. extension_name
-- 8. birthdate
-- 9. birth_place_code
-- 10. sex
-- 11. civil_status
-- 12. civil_status_others_specify
-- 13. education_attainment
-- 14. is_graduate
-- 15. employment_status
-- 16. occupation_code
-- 17. email
-- 18. mobile_number
-- 19. telephone_number
-- 20. household_code
-- 21. blood_type
-- 22. height
-- 23. weight
-- 24. complexion
-- 25. citizenship
-- 26. is_voter
-- 27. is_resident_voter
-- 28. last_voted_date
-- 29. ethnicity
-- 30. religion
-- 31. religion_others_specify
-- 32. mother_maiden_first
-- 33. mother_maiden_middle
-- 34. mother_maiden_last
-- 35. is_active
-- 36. created_by
-- 37. updated_by
-- 38. created_at
-- 39. updated_at