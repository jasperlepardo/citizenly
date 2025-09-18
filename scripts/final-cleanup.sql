-- Remove temporary policies, keep the comprehensive multi-level policy
DROP POLICY IF EXISTS "allow_all_households" ON households;
DROP POLICY IF EXISTS "household_geographic_access" ON households;

-- Keep: "Multi-level geographic access for households" (the comprehensive one)