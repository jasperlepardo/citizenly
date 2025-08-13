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

async function deleteUser(email) {
  console.log(`Deleting user: ${email}\n`);
  
  try {
    // Get the user
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) throw getUserError;
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('Found user to delete:', {
      id: user.id,
      email: user.email,
      created: user.created_at
    });
    
    // First try to delete any profile if it exists
    console.log('\n1. Checking for profile...');
    const { data: profile, error: profileCheckError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      console.log('   Profile found, deleting...');
      const { error: profileDeleteError } = await supabaseAdmin
        .from('auth_user_profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileDeleteError) {
        console.log('   ⚠️ Could not delete profile:', profileDeleteError.message);
      } else {
        console.log('   ✅ Profile deleted');
      }
    } else {
      console.log('   No profile found');
    }
    
    // Delete the user from auth
    console.log('\n2. Deleting auth user...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) throw deleteError;
    
    console.log('   ✅ User deleted successfully!\n');
    console.log('🎉 You can now sign up fresh with the email:', email);
    console.log('   The new flow will handle everything automatically.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node delete-user.js <email>');
  console.log('Example: node delete-user.js jsprlprd@gmail.com');
  process.exit(1);
}

deleteUser(email);