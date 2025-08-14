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

async function fixExistingUser(email) {
  console.log(`Fixing existing user: ${email}\n`);
  
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
      current_metadata: user.raw_user_meta_data
    });
    
    // Add missing metadata
    console.log('\n📝 Adding signup metadata...');
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          first_name: 'Jasper',
          last_name: 'Lepardo',
          phone: '09171234567',
          barangay_code: '133212027', // Sample barangay code
          signup_step: 'awaiting_confirmation'
        }
      }
    );
    
    if (updateError) throw updateError;
    console.log('✅ Metadata added');
    
    // Now manually create the profile since the trigger won't fire retroactively
    console.log('\n👤 Creating profile manually...');
    
    // Get barangay admin role
    const { data: roles } = await supabaseAdmin
      .from('auth_roles')
      .select('id')
      .eq('name', 'barangay_admin')
      .single();
    
    const roleId = roles?.id || '3fd5bb4b-0f55-4e96-aa9f-69a63e783cc6';
    
    // Create profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        first_name: 'Jasper',
        last_name: 'Lepardo',
        phone: '09171234567',
        barangay_code: '133212027',
        role_id: roleId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (profileError) throw profileError;
    
    console.log('✅ Profile created successfully!');
    console.log('\n📋 Profile Details:');
    console.log('   ID:', profile.id);
    console.log('   Name:', `${profile.first_name} ${profile.last_name}`);
    console.log('   Email:', profile.email);
    console.log('   Barangay:', profile.barangay_code);
    console.log('   Role ID:', profile.role_id);
    console.log('   Active:', profile.is_active);
    
    console.log('\n✨ User is now ready to login!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node fix-existing-user.js <email>');
  console.log('Example: node fix-existing-user.js jsprlprd@gmail.com');
  process.exit(1);
}

fixExistingUser(email);