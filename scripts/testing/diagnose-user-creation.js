const { createClient } = require('@supabase/supabase-js');

// Both client types
const supabaseClient = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

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

async function diagnoseUserCreation() {
  const testEmail = `diagnosis${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  console.log('🔬 Diagnosing User Creation Issues');
  console.log('📧 Test Email:', testEmail);
  console.log('');
  
  try {
    // Step 1: List current users before creation
    console.log('1️⃣ Current users in system:');
    const { data: beforeUsers, error: beforeError } = await supabaseAdmin.auth.admin.listUsers();
    if (beforeError) {
      console.error('   Failed to list users:', beforeError.message);
    } else {
      console.log(`   Total users before: ${beforeUsers.users.length}`);
      console.log('   Recent users:');
      beforeUsers.users.slice(-3).forEach(user => {
        console.log(`   - ${user.email} (${user.id.substring(0, 8)}...) confirmed: ${!!user.email_confirmed_at}`);
      });
    }
    
    // Step 2: Create user with client
    console.log('\n2️⃣ Creating user with client...');
    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signupError) {
      console.error('❌ Client signup failed:', signupError.message);
      return;
    }
    
    console.log('✅ Client signup result:', {
      success: !signupError,
      hasUser: !!signupData.user,
      userId: signupData.user?.id,
      confirmed: !!signupData.user?.email_confirmed_at,
      session: !!signupData.session
    });
    
    const userId = signupData.user?.id;
    if (!userId) {
      console.error('❌ No user ID from signup');
      return;
    }
    
    // Step 3: Immediate admin lookup
    console.log('\n3️⃣ Immediate admin lookup...');
    const { data: immediateCheck, error: immediateError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    console.log('   Immediate result:', {
      hasData: !!immediateCheck,
      hasUser: !!immediateCheck?.user,
      error: immediateError?.message
    });
    
    // Step 4: List all users again
    console.log('\n4️⃣ Listing users after creation...');
    const { data: afterUsers, error: afterError } = await supabaseAdmin.auth.admin.listUsers();
    if (afterError) {
      console.error('   Failed to list users:', afterError.message);
    } else {
      console.log(`   Total users after: ${afterUsers.users.length}`);
      console.log('   New users found:');
      const newUsers = afterUsers.users.filter(u => !beforeUsers.users.find(b => b.id === u.id));
      newUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id.substring(0, 8)}...) confirmed: ${!!user.email_confirmed_at}`);
      });
      
      // Check if our specific user is in the list
      const ourUser = afterUsers.users.find(u => u.id === userId);
      console.log(`   Our user (${userId.substring(0, 8)}...) in list:`, !!ourUser);
    }
    
    // Step 5: Retry admin lookup with delays
    console.log('\n5️⃣ Testing admin lookup with delays...');
    for (let i = 1; i <= 3; i++) {
      console.log(`   Attempt ${i} (waiting 2s)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: retryCheck, error: retryError } = await supabaseAdmin.auth.admin.getUserById(userId);
      console.log(`   Result ${i}:`, {
        hasData: !!retryCheck,
        hasUser: !!retryCheck?.user,
        error: retryError?.message
      });
      
      if (retryCheck?.user) {
        console.log('✅ User found on retry', i);
        break;
      }
    }
    
    // Step 6: Check Supabase project settings
    console.log('\n6️⃣ Project configuration check...');
    try {
      // Try to get project settings (this might not work with our current permissions)
      const { data: settings, error: settingsError } = await supabaseAdmin.auth.admin.getServiceRoleUser();
      if (settingsError) {
        console.log('   Cannot check project settings (normal):', settingsError.message);
      } else {
        console.log('   Project settings accessible');
      }
    } catch (error) {
      console.log('   Project settings check skipped');
    }
    
    console.log('\n📋 Diagnosis Summary:');
    console.log('   - Client signup appears to work');
    console.log('   - User gets created with ID');
    console.log('   - Admin client cannot find user immediately');
    console.log('   - This suggests a replication/propagation delay');
    console.log('   - Or possibly user is created in different database/schema');
    
    console.log('\n💡 Recommended Solutions:');
    console.log('   1. Check Supabase dashboard for the created user');
    console.log('   2. Increase delays in production (5-10 seconds)');
    console.log('   3. Consider using webhooks instead of immediate API calls');
    console.log('   4. Check if user is in different auth schema/instance');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseUserCreation();