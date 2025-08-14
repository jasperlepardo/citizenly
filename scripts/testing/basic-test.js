console.log('Starting basic test...');

try {
  const { createClient } = require('@supabase/supabase-js');
  console.log('Supabase client loaded successfully');
  
  const client = createClient(
    'https://cdtcbelaimyftpxmzkjf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk'
  );
  console.log('Supabase client created successfully');
  
  console.log('Test completed successfully');
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}