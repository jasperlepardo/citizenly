require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugTriggerStatus() {
  console.log('🔍 Debugging trigger status...\n');
  
  try {
    // Check current user metadata
    const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const user = users.users[0];
    
    if (user) {
      console.log('👤 Current user details:');
      console.log('- Email:', user.email);
      console.log('- Email confirmed:', user.email_confirmed_at ? 'YES' : 'NO');
      console.log('- User metadata:', JSON.stringify(user.user_metadata, null, 2));
      console.log('- Raw metadata:', JSON.stringify(user.raw_user_meta_data, null, 2));
      
      // Check if barangay code exists in metadata
      const barangayCode = user.raw_user_meta_data?.barangay_code || user.user_metadata?.barangay_code;
      console.log('- Barangay code found:', barangayCode || 'MISSING');
    }
    
    // Check if profile exists
    const { data: profiles } = await supabase
      .from('auth_user_profiles')
      .select('*')
      .limit(1);
      
    console.log('\n📊 Profile status:');
    console.log('- Profiles found:', profiles?.length || 0);
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      console.log('- Latest profile:');
      console.log('  Email:', profile.email);
      console.log('  barangay_code:', profile.barangay_code || 'NULL');
      console.log('  city_municipality_code:', profile.city_municipality_code || 'NULL');
      console.log('  province_code:', profile.province_code || 'NULL');
      console.log('  region_code:', profile.region_code || 'NULL');
    }
    
    // The trigger issue might be:
    console.log('\n🔧 Possible issues:');
    console.log('1. Trigger function exists but trigger not attached to auth.users table');
    console.log('2. Email confirmation happening but trigger not firing');
    console.log('3. Metadata not being saved correctly during signup');
    
    console.log('\n💡 Solutions:');
    console.log('1. Run: node create-new-profile.js (immediate fix)');
    console.log('2. Check Supabase logs for trigger errors');
    console.log('3. Verify trigger is attached to auth.users table');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugTriggerStatus().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});