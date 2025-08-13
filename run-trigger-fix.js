const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: serviceRoleKey ? 'present' : 'missing'
  });

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'found' : 'not found');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'found' : 'not found');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Read the SQL migration file
  const sqlFile = path.join(__dirname, 'database/migrations/fix-full-name-trigger.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  try {
    console.log('Running migration to fix full name trigger...');
    console.log('SQL content preview:', sql.substring(0, 200) + '...');
    
    // Split the SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing statement:', statement.trim().substring(0, 100) + '...');
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement.trim() + ';'
        });
        
        if (error) {
          console.error('Statement failed:', error);
          // Continue with other statements
        } else {
          console.log('Statement executed successfully');
        }
      }
    }
    
    console.log('Migration completed!');
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

runMigration();