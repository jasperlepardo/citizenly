-- Minimal household policy - should always work
CREATE POLICY "allow_all_households" ON households
FOR ALL USING (true);