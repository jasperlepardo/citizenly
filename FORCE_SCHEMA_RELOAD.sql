-- Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';

-- Also try reloading the config
NOTIFY pgrst, 'reload config';

SELECT 'Schema reload signals sent' as result;