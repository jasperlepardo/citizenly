const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseAdmin = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function applyMigration() {
  console.log('Applying email confirmation flow migration...\n');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database/migrations/implement-email-confirmation-flow.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Execute the entire SQL as one query
    console.log('Executing SQL migration...');
    
    const { data, error } = await supabaseAdmin.rpc('exec', { 
      _sql: sql 
    });
    
    if (error) {
      console.error('Migration error:', error.message);
      throw error;
    }
    
    console.log('✅ Migration executed successfully');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();