-- Check the current handle_new_user function definition
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';