-- Step 4: Check your specific role data

SELECT 
    id,
    name,
    description,
    permissions
FROM auth_roles 
WHERE id = '3fd5bb4b-0f55-4e96-aa9f-69a63e783cc6';