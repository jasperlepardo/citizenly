// Fix database trigger functions that reference non-existent plain text fields
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixTriggerFunctions() {
  try {
    console.log('Fixing database trigger functions...');
    
    const sqlContent = fs.readFileSync('database/fix-trigger-function.sql', 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative approach - split into individual statements
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing statement:', statement.trim().substring(0, 100) + '...');
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement.trim() + ';'
          });
          
          if (stmtError) {
            console.error('Error in statement:', stmtError);
          }
        }
      }
    } else {
      console.log('Successfully fixed trigger functions!');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixTriggerFunctions();