const { createClient } = require('@supabase/supabase-js');

// Anon client for signup
const supabase = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

// Admin client
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

async function testMetadata() {
  const testEmail = `metadata.test.${Date.now()}@example.com`;

  console.log('Testing metadata storage...\n');
  console.log('Creating user with metadata:', testEmail);

  try {
    // Sign up with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Metadata',
          last_name: 'Test',
          phone: '09171234567',
          barangay_code: '012801001',
          signup_step: 'awaiting_confirmation',
        },
      },
    });

    if (authError) throw authError;

    console.log('\n✅ User created');
    console.log('User ID:', authData.user.id);
    console.log('Metadata from signup response:', authData.user.user_metadata);

    // Now check what's actually stored in the database
    console.log('\nChecking database storage...');
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers();

    const dbUser = users.find(u => u.id === authData.user.id);

    if (dbUser) {
      console.log('\nDatabase user found:');
      console.log('- raw_user_meta_data:', dbUser.raw_user_meta_data);
      console.log('- user_metadata:', dbUser.user_metadata);
      console.log('- app_metadata:', dbUser.app_metadata);

      // Try different ways to access metadata
      console.log('\nMetadata access tests:');
      console.log('- raw_user_meta_data?.first_name:', dbUser.raw_user_meta_data?.first_name);
      console.log('- user_metadata?.first_name:', dbUser.user_metadata?.first_name);
    } else {
      console.log('❌ User not found in database');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMetadata();
