-- =====================================================
-- SECURE ALL POSSIBLE DATABASE OBJECTS
-- This covers tables, views, and system objects that might show as "unrestricted"
-- =====================================================

-- Enable RLS on any possible remaining tables/views
-- (Some might not exist, but PostgreSQL will ignore them)

-- Possible system or generated tables
ALTER TABLE IF EXISTS public.migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.versions ENABLE ROW LEVEL SECURITY;

-- Possible audit/log tables
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;

-- Force RLS on any that exist
ALTER TABLE IF EXISTS public.migrations FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schema_migrations FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seeds FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.versions FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs FORCE ROW LEVEL SECURITY;

-- Alternative: Secure ALL tables in public schema regardless of name
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Loop through all tables in public schema
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || table_record.tablename || ' ENABLE ROW LEVEL SECURITY';
        EXECUTE 'ALTER TABLE public.' || table_record.tablename || ' FORCE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Also secure any materialized views
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Loop through all materialized views in public schema
    FOR view_record IN 
        SELECT matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER MATERIALIZED VIEW public.' || view_record.matviewname || ' ENABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Ensure comprehensive permission revocation
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON SCHEMA public FROM anon;

-- Grant only essential access back
GRANT USAGE ON SCHEMA public TO anon;
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