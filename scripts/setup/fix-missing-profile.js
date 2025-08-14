require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingProfile() {
  console.log('🔍 Getting user and creating missing profile...\n');
  
  // Get the most recent user
  const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  const user = users.users[0];
  
  if (!user) {
    console.log('No users found');
    return;
  }
  
  console.log('📝 User found:', user.email);
  console.log('User ID:', user.id);
  console.log('Email confirmed:', user.email_confirmed_at ? 'YES' : 'NO');
  console.log('Metadata:', JSON.stringify(user.user_metadata, null, 2));
  
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('auth_user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (existingProfile) {
    console.log('✅ Profile already exists:', existingProfile);
    return;
  }
  
  console.log('\n🔧 Creating missing profile...');
  
  // Create the profile manually using metadata from signup
  const { data: profile, error: profileError } = await supabase
    .from('auth_user_profiles')
    .insert({
      id: user.id,
      email: user.email,
      first_name: user.user_metadata.first_name || '',
      last_name: user.user_metadata.last_name || '',
      barangay_code: user.user_metadata.barangay_code || '',
      phone: user.user_metadata.phone || '',
      role_id: '3fd5bb4b-0f55-4e96-aa9f-69a63e783cc6', // barangay_admin
      is_active: true
    })
    .select()
    .single();
  
  if (profileError) {
    console.error('❌ Error creating profile:', profileError);
  } else {
    console.log('✅ Profile created successfully:');
    console.log('  ID:', profile.id);
    console.log('  Email:', profile.email);
    console.log('  Name:', profile.first_name, profile.last_name);
    console.log('  Barangay:', profile.barangay_code);
    console.log('  Role:', profile.role_id);
  }
}

createMissingProfile().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});