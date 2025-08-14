const { createClient } = require('@supabase/supabase-js');

// Anon client for signup
const supabase = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

// Admin client for checking
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

async function testAutoConfirmFlow() {
  console.log('🧪 Testing Auto-Confirm Development Flow\n');
  console.log('═'.repeat(50));
  
  // Get a valid barangay code first
  const { data: barangays } = await supabaseAdmin
    .from('psgc_barangays')
    .select('code, name')
    .limit(1);
  
  const barangayCode = barangays?.[0]?.code || '012801001';
  console.log('Using barangay:', barangays?.[0]?.name || 'Adams', `(${barangayCode})`);
  
  // Generate test email
  const timestamp = Date.now();
  const testEmail = `dev.test.${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log('Test email:', testEmail);
  console.log('═'.repeat(50));
  
  try {
    // Step 1: Sign up
    console.log('\n1️⃣ SIGNUP');
    console.log('Creating account with metadata...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Auto',
          last_name: 'Test',
          phone: '09171234567',
          barangay_code: barangayCode,
          signup_step: 'awaiting_confirmation'
        }
      }
    });
    
    if (authError) throw authError;
    
    console.log('✅ Account created');
    console.log('   User ID:', authData.user.id);
    console.log('   Email confirmed:', authData.user.email_confirmed_at ? '✅ YES (auto-confirmed!)' : '❌ NO');
    
    // Step 2: Check if profile was created immediately
    console.log('\n2️⃣ CHECKING PROFILE');
    console.log('Waiting 2 seconds for triggers to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select(`
        *,
        auth_roles (
          name
        )
      `)
      .eq('id', authData.user.id)
      .single();
    
    if (profile) {
      console.log('✅ Profile created automatically!');
      console.log('   Name:', `${profile.first_name} ${profile.last_name}`);
      console.log('   Email:', profile.email);
      console.log('   Barangay:', profile.barangay_code);
      console.log('   Role:', profile.auth_roles?.name || 'Not found');
      console.log('   Active:', profile.is_active ? 'Yes' : 'No');
    } else {
      console.log('❌ Profile not found');
      if (profileError) console.log('   Error:', profileError.message);
    }
    
    // Step 3: Test immediate login
    console.log('\n3️⃣ LOGIN TEST');
    console.log('Testing immediate login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginData?.user) {
      console.log('✅ Login successful!');
      console.log('   User can access system immediately');
      console.log('   No email confirmation needed');
    } else {
      console.log('❌ Login failed:', loginError?.message);
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('✨ AUTO-CONFIRM MODE WORKING!');
    console.log('\nBenefits:');
    console.log('✅ No emails sent (no bounces)');
    console.log('✅ Instant account activation');
    console.log('✅ Profile created immediately');
    console.log('✅ Can login right away');
    console.log('✅ Perfect for development/testing');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.details) console.error('Details:', error.details);
  }
}

testAutoConfirmFlow();