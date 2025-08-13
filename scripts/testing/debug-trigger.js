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

async function debugTrigger() {
  const testUserId = 'c4d2eda3-e24a-4bed-ac2f-6e7b99e01c63'; // From our previous test
  
  console.log('🔍 Debug Trigger Test');
  console.log('👤 User ID:', testUserId);
  console.log('');
  
  try {
    // Step 1: Check if user exists in auth.users
    console.log('1️⃣ Checking user in auth.users...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(testUserId);
    
    if (authError || !authUser.user) {
      console.error('❌ User not found in auth.users:', authError?.message);
      return;
    }
    
    console.log('   User found:', {
      id: authUser.user.id,
      email: authUser.user.email,
      confirmed: !!authUser.user.email_confirmed_at,
      metadata: authUser.user.raw_user_meta_data
    });
    
    // Step 2: Check if profile exists in auth_user_profiles
    console.log('');
    console.log('2️⃣ Checking profile in auth_user_profiles...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (profileError) {
      console.log('   Profile not found:', profileError.message);
    } else {
      console.log('   Profile found:', {
        id: profile.id,
        email: profile.email,
        name: `${profile.first_name} ${profile.last_name}`,
        role_id: profile.role_id,
        is_active: profile.is_active
      });
    }
    
    // Step 3: Check available roles
    console.log('');
    console.log('3️⃣ Checking available roles...');
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('auth_roles')
      .select('*')
      .order('name');
    
    if (rolesError) {
      console.error('   Roles error:', rolesError.message);
    } else {
      console.log('   Available roles:');
      roles.forEach(role => {
        console.log(`   - ${role.name} (${role.id})`);
      });
    }
    
    // Step 4: Test manual profile creation
    if (!profile) {
      console.log('');
      console.log('4️⃣ Testing manual profile creation...');
      
      const defaultRole = roles?.find(r => r.name === 'barangay_admin');
      if (!defaultRole) {
        console.error('   No barangay_admin role found!');
        return;
      }
      
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('auth_user_profiles')
        .insert({
          id: testUserId,
          email: authUser.user.email,
          first_name: 'Test',
          last_name: 'User',
          role_id: defaultRole.id,
          is_active: true
        })
        .select()
        .single();
        
      if (createError) {
        console.error('   Manual creation failed:', createError.message);
      } else {
        console.log('   Manual creation successful:', newProfile.id);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

debugTrigger();