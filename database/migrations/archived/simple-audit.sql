-- =============================================================================
-- SIMPLE SUPABASE AUDIT
-- See what you currently have vs what you actually need
-- =============================================================================

-- STEP 1: What tables do you have?
SELECT 'CURRENT TABLES' as audit_section, table_name as name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- STEP 2: What functions do you have?
SELECT 'CURRENT FUNCTIONS' as audit_section, routine_name as name
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- STEP 3: What views do you have?  
SELECT 'CURRENT VIEWS' as audit_section, table_name as name
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;