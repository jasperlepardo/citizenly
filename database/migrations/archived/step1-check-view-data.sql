-- Step 1: Verify the view exists and has your household data

SELECT 
    COUNT(*) as household_count
FROM api_households_with_members 
WHERE barangay_code = '042114014';