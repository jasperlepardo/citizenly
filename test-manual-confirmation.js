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

async function manuallyConfirmUser(email) {
  console.log(`Manually confirming user: ${email}\n`);
  
  try {
    // Get the user
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) throw getUserError;
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('Found user:', {
      id: user.id,
      email: user.email,
      confirmed: user.email_confirmed_at ? 'Yes' : 'No',
      metadata: user.user_metadata
    });
    
    if (user.email_confirmed_at) {
      console.log('✅ User is already confirmed');
      
      // Check if profile exists
      const { data: profile } = await supabaseAdmin
        .from('auth_user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        console.log('✅ Profile exists:', {
          name: `${profile.first_name} ${profile.last_name}`,
          barangay: profile.barangay_code,
          role: profile.role_id
        });
      } else {
        console.log('⚠️ Profile not found - trigger may not have fired');
      }
      return;
    }
    
    // Manually confirm the email
    console.log('\n📧 Confirming email...');
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirmed_at: new Date().toISOString()
      }
    );
    
    if (updateError) throw updateError;
    
    console.log('✅ Email confirmed successfully!');
    console.log('⏳ Waiting for trigger to create profile...');
    
    // Wait a moment for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if profile was created
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (newProfile) {
      console.log('\n🎉 Profile created by trigger!');
      console.log('Profile details:', {
        id: newProfile.id,
        email: newProfile.email,
        name: `${newProfile.first_name} ${newProfile.last_name}`,
        barangay: newProfile.barangay_code,
        role: newProfile.role_id,
        active: newProfile.is_active
      });
      
      // Check role assignment
      const { data: role } = await supabaseAdmin
        .from('auth_roles')
        .select('name')
        .eq('id', newProfile.role_id)
        .single();
        
      if (role) {
        console.log('✅ Role assigned:', role.name);
      }
      
      console.log('\n✨ User can now login with their credentials!');
    } else {
      console.log('⚠️ Profile not created - check trigger logs');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node test-manual-confirmation.js <email>');
  console.log('Example: node test-manual-confirmation.js test@example.com');
  process.exit(1);
}

manuallyConfirmUser(email);