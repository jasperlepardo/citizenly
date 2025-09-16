-- Clean up - remove the temporary "allow all" policy
-- Keep only the secure geographic access policy
DROP POLICY IF EXISTS "allow_all_households" ON households;