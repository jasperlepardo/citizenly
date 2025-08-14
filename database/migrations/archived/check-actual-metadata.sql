-- Check what's actually stored in auth.users table
SELECT 
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;