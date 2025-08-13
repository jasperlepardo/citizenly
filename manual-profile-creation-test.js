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

async function manualProfileCreation() {
  console.log('Testing manual profile creation for existing users...\n');
  
  try {
    // Get recent users with metadata
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (!users || users.length === 0) {
      console.log('No users found');
      return;
    }
    
    const user = users[0];
    console.log('Found user:', user.email);
    console.log('User ID:', user.id);
    console.log('Metadata:', user.user_metadata);
    
    // Check if this user has the required metadata
    if (!user.user_metadata?.first_name) {
      console.log('\n⚠️ User missing metadata, skipping profile creation');
      return;
    }
    
    // Get barangay admin role
    const { data: role } = await supabaseAdmin
      .from('auth_roles')
      .select('id')
      .eq('name', 'barangay_admin')
      .single();
    
    const roleId = role?.id || '3fd5bb4b-0f55-4e96-aa9f-69a63e783cc6';
    
    // Manually create profile
    console.log('\nCreating profile manually...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata.first_name,
        last_name: user.user_metadata.last_name,
        phone: user.user_metadata.phone,
        barangay_code: user.user_metadata.barangay_code,
        role_id: roleId,
        is_active: true
      }, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      return;
    }
    
    console.log('✅ Profile created successfully!');
    console.log('Profile details:', {
      name: `${profile.first_name} ${profile.last_name}`,
      barangay: profile.barangay_code,
      role: profile.role_id
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

manualProfileCreation();