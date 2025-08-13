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

async function createProfileForLatest() {
  // Use the data from the SQL query you just ran
  const userData = {
    id: "3b4ea34b-ea3b-43ca-b06c-28b2db974880",
    email: "dev.test.1755019917036@example.com",
    first_name: "Auto",
    last_name: "Test",
    phone: "09171234567",
    barangay_code: "012801001"
  };
  
  console.log('Creating profile for:', userData.email);
  
  try {
    // Get barangay admin role
    const { data: role } = await supabaseAdmin
      .from('auth_roles')
      .select('id')
      .eq('name', 'barangay_admin')
      .single();
    
    const roleId = role?.id || '3fd5bb4b-0f55-4e96-aa9f-69a63e783cc6';
    
    // Create profile
    const { data: profile, error } = await supabaseAdmin
      .from('auth_user_profiles')
      .insert({
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        barangay_code: userData.barangay_code,
        role_id: roleId,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ Profile created successfully!');
    console.log('Profile:', {
      name: `${profile.first_name} ${profile.last_name}`,
      barangay: profile.barangay_code,
      role: profile.role_id
    });
    
    // Test login
    console.log('\nTesting login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: 'TestPassword123!'
    });
    
    if (loginData?.user) {
      console.log('✅ Login works!');
    } else {
      console.log('❌ Login failed:', loginError?.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Use the regular client for login test
const supabase = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

createProfileForLatest();