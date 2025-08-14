const { createClient } = require('@supabase/supabase-js');

// Create both clients
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

async function debugSignup() {
  const testEmail = `test${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  console.log('🔍 Debug Signup Test');
  console.log('📧 Email:', testEmail);
  console.log('');
  
  try {
    // Step 1: Try signup with client
    console.log('1️⃣ Attempting signup with client...');
    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    console.log('   Signup Result:', {
      success: !signupError,
      hasUser: !!signupData.user,
      userId: signupData.user?.id,
      confirmationSent: !!signupData.user?.email_confirmed_at,
      isConfirmed: signupData.user?.email_confirmed_at ? true : false,
      error: signupError?.message
    });
    
    if (signupError) {
      console.error('❌ Signup failed:', signupError.message);
      return;
    }
    
    const userId = signupData.user?.id;
    if (!userId) {
      console.error('❌ No user ID returned from signup');
      return;
    }
    
    // Step 2: Check if user exists using admin client immediately
    console.log('');
    console.log('2️⃣ Checking user existence with admin client...');
    const { data: adminUserCheck, error: adminError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    console.log('   Admin Check Result:', {
      userFound: !!adminUserCheck.user,
      isConfirmed: adminUserCheck.user?.email_confirmed_at ? true : false,
      error: adminError?.message
    });
    
    // Step 3: Wait and check again
    console.log('');
    console.log('3️⃣ Waiting 2 seconds and checking again...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: adminUserCheck2, error: adminError2 } = await supabaseAdmin.auth.admin.getUserById(userId);
    console.log('   Second Admin Check Result:', {
      userFound: !!adminUserCheck2.user,
      isConfirmed: adminUserCheck2.user?.email_confirmed_at ? true : false,
      error: adminError2?.message
    });
    
    // Step 4: List all users to see if our user appears
    console.log('');
    console.log('4️⃣ Listing recent users...');
    const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 10
    });
    
    if (listError) {
      console.error('   List users error:', listError.message);
    } else {
      console.log(`   Found ${allUsers.users.length} users total`);
      const ourUser = allUsers.users.find(u => u.id === userId);
      console.log('   Our user in list:', !!ourUser);
      if (ourUser) {
        console.log('   Our user confirmed:', !!ourUser.email_confirmed_at);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

debugSignup();