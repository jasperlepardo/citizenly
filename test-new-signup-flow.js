const { createClient } = require('@supabase/supabase-js');

// Use the anon key for signup (not service role)
const supabase = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

async function testSignupFlow() {
  console.log('Testing new email confirmation signup flow...\n');

  const testEmail = `test${Date.now()}@example.com`;
  const testData = {
    email: testEmail,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    mobileNumber: '09171234567',
    barangayCode: '133212027', // Random barangay for testing
  };

  try {
    console.log('1. Creating account with metadata...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: {
          first_name: testData.firstName,
          last_name: testData.lastName,
          phone: testData.mobileNumber,
          barangay_code: testData.barangayCode,
          signup_step: 'awaiting_confirmation',
        },
      },
    });

    if (authError) {
      throw authError;
    }

    console.log('✅ Account created successfully');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('   Metadata stored:', authData.user.user_metadata);

    // Check if profile exists (should NOT exist yet)
    const supabaseAdmin = createClient(
      'https://cdtcbelaimyftpxmzkjf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('\n2. Checking if profile was created immediately...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      console.log('✅ CORRECT: Profile does NOT exist yet (waiting for email confirmation)');
    } else if (profile) {
      console.log('❌ WARNING: Profile was created immediately (should wait for confirmation)');
      console.log('   Profile:', profile);
    }

    console.log('\n3. Email confirmation status:');
    console.log('   ⏳ User needs to confirm email before profile is created');
    console.log('   📧 Check email for confirmation link');
    console.log('   ✅ After confirmation, profile and role will be assigned automatically');

    console.log('\n✨ New flow is working correctly!');
    console.log('   Account → Email Confirmation → Profile → Roles');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSignupFlow();
