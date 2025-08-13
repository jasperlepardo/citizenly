require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createNewProfileWithGeoCodes() {
  console.log('🔧 Creating new profile with complete geographic codes...\n');
  
  try {
    // Get the most recent user
    const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const user = users.users[0];
    
    if (!user) {
      console.log('❌ No user found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('📧 Email confirmed:', user.email_confirmed_at ? 'YES' : 'NO');
    console.log('📝 Metadata:', JSON.stringify(user.user_metadata, null, 2));
    
    const barangayCode = user.user_metadata.barangay_code;
    
    if (!barangayCode) {
      console.log('❌ No barangay code in metadata');
      return;
    }
    
    // Get complete geographic hierarchy
    const { data: hierarchy } = await supabase
      .from('psgc_barangays')
      .select(`
        code,
        city_municipality_code,
        psgc_cities_municipalities!inner(
          code,
          province_code,
          psgc_provinces!inner(
            code,
            region_code
          )
        )
      `)
      .eq('code', barangayCode)
      .single();
    
    if (!hierarchy) {
      console.log('❌ Could not find geographic hierarchy for barangay:', barangayCode);
      return;
    }
    
    const city = hierarchy.psgc_cities_municipalities;
    const province = city.psgc_provinces;
    
    console.log('\n🗺️ Geographic hierarchy resolved:');
    console.log('- Barangay Code:', barangayCode, '(from signup)');
    console.log('- City Code:', city.code, '(auto-derived)');
    console.log('- Province Code:', province.code, '(auto-derived)'); 
    console.log('- Region Code:', province.region_code, '(auto-derived)');
    
    // Get barangay admin role
    const { data: role } = await supabase
      .from('auth_roles')
      .select('id')
      .eq('name', 'barangay_admin')
      .single();
    
    if (!role) {
      console.log('❌ Could not find barangay_admin role');
      return;
    }
    
    // Create profile with complete geographic codes using CORRECT field names
    const { data: profile, error } = await supabase
      .from('auth_user_profiles')
      .insert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata.first_name,
        last_name: user.user_metadata.last_name,
        phone: user.user_metadata.phone,
        role_id: role.id,
        barangay_code: barangayCode,
        city_municipality_code: city.code,           // Using CORRECT field name
        province_code: province.code,               // Using CORRECT field name  
        region_code: province.region_code,          // Using CORRECT field name
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating profile:', error);
    } else {
      console.log('\n✅ Profile created successfully with COMPLETE geographic auto-population!');
      console.log('\n👤 Your complete profile:');
      console.log('- Name:', profile.first_name, profile.last_name);
      console.log('- Email:', profile.email);
      console.log('- Role: barangay_admin');
      console.log('- Barangay Code:', profile.barangay_code);
      console.log('- City Code:', profile.city_municipality_code);
      console.log('- Province Code:', profile.province_code);
      console.log('- Region Code:', profile.region_code);
      
      console.log('\n🎉 Auto-population SUCCESS! All geographic codes populated correctly.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createNewProfileWithGeoCodes().then(() => {
  console.log('\n✅ Done! You can now login with your new account.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});