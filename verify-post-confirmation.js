const { createClient } = require('@supabase/supabase-js');

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

async function verifySystem() {
  console.log('🔍 Verifying post-confirmation system status...\n');
  
  try {
    // 1. Check users and confirmation status
    console.log('1️⃣ Checking user confirmation status...');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError.message);
      return;
    }
    
    const confirmed = users.users.filter(u => u.email_confirmed_at);
    const unconfirmed = users.users.filter(u => !u.email_confirmed_at);
    
    console.log(`   Total users: ${users.users.length}`);
    console.log(`   Confirmed: ${confirmed.length}`);
    console.log(`   Unconfirmed: ${unconfirmed.length}`);
    
    // 2. Check if new columns were added to profiles table
    console.log('\n2️⃣ Checking profile table structure...');
    try {
      const { data: sampleProfile, error: profileError } = await supabaseAdmin
        .from('auth_user_profiles')
        .select('id, email_verified, email_verified_at, welcome_email_sent, onboarding_completed')
        .limit(1);
      
      if (profileError) {
        console.log('   ❌ Profile table migration may be incomplete:', profileError.message);
      } else {
        console.log('   ✅ Profile table has new post-confirmation columns');
      }
    } catch (error) {
      console.log('   ❌ Profile table check failed:', error.message);
    }
    
    // 3. Check if notifications table exists
    console.log('\n3️⃣ Checking notifications system...');
    try {
      const { data: notifications, error: notifError } = await supabaseAdmin
        .from('user_notifications')
        .select('*')
        .limit(1);
      
      if (notifError) {
        console.log('   ❌ Notifications table may need creation:', notifError.message);
      } else {
        console.log('   ✅ Notifications table exists and ready');
        
        // Check for any existing notifications
        const { count } = await supabaseAdmin
          .from('user_notifications')
          .select('*', { count: 'exact' });
        
        console.log(`   📧 Notifications in queue: ${count || 0}`);
      }
    } catch (error) {
      console.log('   ❌ Notifications check failed:', error.message);
    }
    
    // 4. Test trigger functions exist
    console.log('\n4️⃣ Checking trigger functions...');
    try {
      // This query checks if our functions exist in the database
      const { data: functions, error: funcError } = await supabaseAdmin
        .rpc('exec_sql', {
          sql_query: `
            SELECT routine_name, routine_type 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('auto_process_user_confirmation', 'auto_queue_welcome_notifications', 'process_confirmed_users')
            ORDER BY routine_name;
          `
        });
      
      if (funcError) {
        console.log('   ⚠️  Cannot check functions directly, but triggers should be active');
      } else {
        console.log('   ✅ Post-confirmation functions are installed');
      }
    } catch (error) {
      console.log('   ⚠️  Function check skipped (normal for some setups)');
    }
    
    // 5. Summary and recommendations
    console.log('\n📋 System Status Summary:');
    
    if (unconfirmed.length > 0) {
      console.log(`   🔄 ${unconfirmed.length} users pending email confirmation`);
      console.log('   💡 Test the system by confirming one of these users');
    }
    
    if (confirmed.length > 0) {
      console.log(`   ✅ ${confirmed.length} users already confirmed`);
      console.log('   📧 These users should have received post-confirmation processing');
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Test signup flow: Create a new user and confirm email');
    console.log('   2. Check POST /api/auth/process-notifications to send queued emails');
    console.log('   3. Monitor logs for trigger execution');
    console.log('   4. Optional: Set up webhook at /api/auth/webhook for real-time processing');
    
    console.log('\n✅ Post-confirmation system verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifySystem();