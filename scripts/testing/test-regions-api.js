require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRegionsAPI() {
  console.log('🧪 Testing regions API...\n');
  
  try {
    // First, let's test if we can get a session for your user
    console.log('1. Testing direct Supabase query...');
    
    const { data: regions, error } = await supabase
      .from('psgc_regions')
      .select('code, name')
      .order('name')
      .limit(5);
    
    if (error) {
      console.error('❌ Direct query error:', error);
    } else {
      console.log('✅ Direct query successful. Sample regions:');
      regions.forEach(region => {
        console.log(`   - ${region.code}: ${region.name}`);
      });
    }
    
    // Test with service role to bypass RLS
    console.log('\n2. Testing with service role...');
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: adminRegions, error: adminError } = await supabaseAdmin
      .from('psgc_regions')
      .select('code, name')
      .order('name')
      .limit(5);
    
    if (adminError) {
      console.error('❌ Service role error:', adminError);
    } else {
      console.log('✅ Service role query successful. Sample regions:');
      adminRegions.forEach(region => {
        console.log(`   - ${region.code}: ${region.name}`);
      });
    }
    
    // Test the actual API endpoint
    console.log('\n3. Testing API endpoint...');
    
    // Get user session token
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.email || 'Not authenticated');
    
    if (user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        console.log('✅ User session found, testing API...');
        
        const response = await fetch('http://localhost:3000/api/addresses/regions', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API call successful. Regions count:', data.data?.length || 0);
        } else {
          const errorText = await response.text();
          console.error('❌ API call failed:', response.status, errorText);
        }
      } else {
        console.log('❌ No access token found');
      }
    } else {
      console.log('❌ No user found - need to be logged in');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRegionsAPI().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});