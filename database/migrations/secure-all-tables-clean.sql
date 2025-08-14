-- Enable RLS on ALL discovered tables
ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_regions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_provinces FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_cities_municipalities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psgc_barangays FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_major_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_sub_major_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_sub_major_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_minor_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_minor_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_sub_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_unit_sub_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_position_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_position_titles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psoc_cross_references FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households FORCE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.resident_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resident_relationships FORCE ROW LEVEL SECURITY;

-- Remove ALL permissions from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant safe read access to reference data only
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