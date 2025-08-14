-- Fix RLS policies to allow public read access to geographic reference data
-- Geographic data is public information and should be readable by all users

-- Enable RLS but allow public read access
ALTER TABLE psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_provinces ENABLE ROW LEVEL SECURITY;  
ALTER TABLE psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_barangays ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to geographic reference data
CREATE POLICY "Public read access to regions" ON psgc_regions
  FOR SELECT USING (true);

CREATE POLICY "Public read access to provinces" ON psgc_provinces  
  FOR SELECT USING (true);

CREATE POLICY "Public read access to cities" ON psgc_cities_municipalities
  FOR SELECT USING (true);

CREATE POLICY "Public read access to barangays" ON psgc_barangays
  FOR SELECT USING (true);

-- Note: This allows the auto-populate function to use direct Supabase queries
-- instead of requiring separate public API endpoints