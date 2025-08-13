require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyTriggerFix() {
  console.log('🔧 Applying fixed email confirmation trigger to database...\n');
  
  try {
    // Read the fixed trigger function SQL
    const fixedSQL = fs.readFileSync('fix-email-confirmation-trigger.sql', 'utf8');
    
    // Extract just the function part (remove comments)
    const functionSQL = fixedSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .trim();
    
    console.log('📝 Applying fixed handle_user_email_confirmation function...');
    
    // Apply the function using Supabase client
    const { data, error } = await supabase.rpc('exec', {
      query: functionSQL
    });
    
    if (error) {
      console.error('❌ Error applying function:', error);
      
      // Try alternative approach - direct execution
      console.log('\n🔄 Trying alternative execution method...');
      
      const { error: altError } = await supabase
        .from('sql_execution')
        .insert({ query: functionSQL });
        
      if (altError) {
        console.error('❌ Alternative method failed:', altError);
        console.log('\n📋 The SQL needs to be executed manually:');
        console.log('1. Copy the content of fix-email-confirmation-trigger.sql');
        console.log('2. Execute it in your Supabase SQL editor');
        console.log('3. Then delete your account and test signup again');
        return;
      }
    }
    
    console.log('✅ Fixed trigger function applied successfully!');
    
    // Verify the function exists
    const { data: functions } = await supabase
      .rpc('get_function_info', { func_name: 'handle_user_email_confirmation' })
      .single();
      
    if (functions) {
      console.log('✅ Function verified in database');
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Delete your current account');
    console.log('2. Run: node test-automatic-signup.js');
    console.log('3. Create a new account to test automatic profile creation');
    console.log('4. The new profile should include all geographic codes automatically');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n📋 Manual execution required:');
    console.log('Execute fix-email-confirmation-trigger.sql in Supabase SQL editor');
  }
}

applyTriggerFix().then(() => {
  console.log('\n✅ Trigger fix application completed!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});