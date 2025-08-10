-- =====================================================
-- SECURE ONLY ACTUAL TABLES (NOT VIEWS)
-- This fixes the materialized view error
-- =====================================================

-- Secure ALL actual tables in public schema (excluding views)
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Loop through only actual tables (not views or materialized views)
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || table_record.tablename || ' ENABLE ROW LEVEL SECURITY';
        EXECUTE 'ALTER TABLE public.' || table_record.tablename || ' FORCE ROW LEVEL SECURITY';
        RAISE NOTICE 'Secured table: %', table_record.tablename;
    END LOOP;
END $$;

-- Remove ALL permissions from anon (including views)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant safe read access to reference data tables only
GRANT SELECT ON public.psgc_regions TO anon;
GRANT SELECT ON public.psgc_provinces TO anon;
GRANT SELECT ON public.psgc_cities_municipalities TO anon;
GRANT SELECT ON public.psgc_barangays TO anon;
GRANT SELECT ON public.psoc_major_groups TO anon;
GRANT SELECT ON public.psoc_sub_major_groups TO anon;
GRANT SELECT ON public.psoc_minor_groups TO anon;
GRANT SELECT ON public.psoc_unit_groups TO anon;
GRANT SELECT ON public.psoc_unit_sub_groups TO anon;
GRANT SELECT ON public.psoc_position_titles TO anon;
GRANT SELECT ON public.psoc_cross_references TO anon;

-- Grant read access to materialized views (they can't have RLS but can have permissions)
GRANT SELECT ON public.barangay_quick_stats TO anon;

-- Note: Views and materialized views will show as "unrestricted" in Supabase dashboard
-- but they are controlled by permissions, not RLS
SELECT 'All actual tables now have RLS enabled. Views remain unrestricted by design.' as status;