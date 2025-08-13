require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugAutoPopulate() {
  console.log('🔍 Debugging auto-populate logic...\n');
  
  try {
    // Step 1: Test getting user session (this won't work in Node.js but shows the pattern)
    console.log('1. Testing user profile query...');
    
    // Simulate getting the user ID - in the component it comes from session
    const userId = '49b4ec7b-cab0-4c12-9d14-79067109e322'; // Your user ID
    
    // Test the profile query
    const { data: profile, error: profileError } = await supabase
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ Profile query error:', profileError);
      return;
    }
    
    console.log('✅ User profile found:');
    console.log('   - barangay_code:', profile.barangay_code);
    console.log('   - city_municipality_code:', profile.city_municipality_code);
    console.log('   - province_code:', profile.province_code);
    console.log('   - region_code:', profile.region_code);
    
    if (!profile.region_code) {
      console.log('❌ No region code - auto-populate will not work');
      return;
    }
    
    // Step 2: Test getting region details
    console.log('\n2. Testing region lookup...');
    const { data: regionData, error: regionError } = await supabase
      .from('psgc_regions')
      .select('code, name')
      .eq('code', profile.region_code)
      .single();
    
    if (regionError) {
      console.error('❌ Region query error:', regionError);
    } else {
      console.log('✅ Region found:', regionData.code, '-', regionData.name);
    }
    
    // Step 3: Test getting province details
    console.log('\n3. Testing province lookup...');
    const { data: provinceData, error: provinceError } = await supabase
      .from('psgc_provinces')
      .select('code, name')
      .eq('code', profile.province_code)
      .single();
    
    if (provinceError) {
      console.error('❌ Province query error:', provinceError);
    } else {
      console.log('✅ Province found:', provinceData.code, '-', provinceData.name);
    }
    
    // Step 4: Test getting city details
    console.log('\n4. Testing city lookup...');
    const { data: cityData, error: cityError } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name')
      .eq('code', profile.city_municipality_code)
      .single();
    
    if (cityError) {
      console.error('❌ City query error:', cityError);
    } else {
      console.log('✅ City found:', cityData.code, '-', cityData.name);
    }
    
    // Step 5: Test getting barangay details
    console.log('\n5. Testing barangay lookup...');
    const { data: barangayData, error: barangayError } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .eq('code', profile.barangay_code)
      .single();
    
    if (barangayError) {
      console.error('❌ Barangay query error:', barangayError);
    } else {
      console.log('✅ Barangay found:', barangayData.code, '-', barangayData.name);
    }
    
    console.log('\n📋 Summary for auto-populate:');
    console.log('- All data available:', regionData && provinceData && cityData && barangayData ? 'YES' : 'NO');
    console.log('- Complete hierarchy can be populated');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugAutoPopulate().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});