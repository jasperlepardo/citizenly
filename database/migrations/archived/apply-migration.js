const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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
  console.log('🔄 Applying signup trigger fix migration...');
  
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('database/migrations/fix-signup-trigger.sql', 'utf8');
    
    // Split into individual statements (rough split on semicolons)
    const statements = migrationSQL
      .split(/;\s*(?=\n|$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.length < 10) continue;
      
      console.log(`\n🔧 Executing statement ${i + 1}...`);
      console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);
      
      try {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
          sql_query: statement 
        });
        
        if (error) {
          // Try direct SQL execution if RPC fails
          const result = await supabaseAdmin.from('dual').select('1').limit(0);
          // This won't work for DDL, so let's try a different approach
          throw new Error(`RPC failed: ${error.message}`);
        }
        
        console.log(`   ✅ Success`);
        successCount++;
        
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        errorCount++;
        
        // For critical operations, don't continue
        if (statement.includes('CREATE TRIGGER') || statement.includes('DROP TRIGGER')) {
          console.error('Critical statement failed, stopping migration');
          break;
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

applyMigration();