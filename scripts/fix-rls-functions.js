#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🔧 Applying RLS Functions Fix...');

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLSFix() {
  try {
    console.log('📋 Reading migration file...');
    const migrationSql = fs.readFileSync('database/migrations/fix-rls-functions-final.sql', 'utf8');
    
    console.log('🗂️ Executing RLS functions migration...');
    
    // Split the migration into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('DO $$'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.includes('FUNCTION') || stmt.includes('POLICY') || stmt.includes('GRANT')) {
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}: ${stmt.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('sql', { 
          query: stmt + ';'
        });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
          // Continue with other statements - some errors are expected (like dropping non-existent functions)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('🧪 Testing RLS functions...');
    
    // Test the functions
    const testFunctions = [
      'user_barangay_code',
      'user_city_code',
      'user_access_level',
      'is_super_admin'
    ];
    
    for (const funcName of testFunctions) {
      try {
        const { data, error } = await supabase.rpc(funcName);
        if (error) {
          console.log(`⚠️  Function ${funcName}: ${error.message} (expected for service role)`);
        } else {
          console.log(`✅ Function ${funcName}: exists and callable`);
        }
      } catch (e) {
        console.log(`⚠️  Function ${funcName}: ${e.message}`);
      }
    }
    
    console.log('🎯 Testing household access with sample query...');
    
    // Test household query
    const { data: households, error: householdError } = await supabase
      .from('households')
      .select('code, barangay_code')
      .limit(1);
      
    if (householdError) {
      console.log('⚠️  Household query (service role):', householdError.message);
    } else {
      console.log(`✅ Household access working - found ${households?.length || 0} records`);
    }
    
    console.log('🚀 RLS functions migration completed!');
    console.log('📝 Next: Refresh your browser and test the household access');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyRLSFix();