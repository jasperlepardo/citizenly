require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugBarangayQuery() {
  console.log('🔍 Debugging barangay query that causes 500 error...\n');
  
  try {
    // Test the exact query from the error
    console.log('1. Testing problematic query...');
    const problematicQuery = supabase
      .from('psgc_barangays')
      .select(`
        name,
        psgc_cities_municipalities!inner(
          name,
          psgc_provinces!inner(
            name,
            psgc_regions!inner(name)
          )
        )
      `)
      .eq('code', '042114014');
    
    const { data, error } = await problematicQuery;
    
    if (error) {
      console.error('❌ Query error:', error);
    } else {
      console.log('✅ Query successful:', data);
    }
    
    // Test simpler queries
    console.log('\n2. Testing simple barangay query...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .eq('code', '042114014');
    
    if (simpleError) {
      console.error('❌ Simple query error:', simpleError);
    } else {
      console.log('✅ Simple query successful:', simpleData);
    }
    
    // Test RLS policies
    console.log('\n3. Testing with anon client...');
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: anonData, error: anonError } = await anonClient
      .from('psgc_barangays')
      .select('code, name')
      .eq('code', '042114014');
    
    if (anonError) {
      console.error('❌ Anon client error:', anonError);
    } else {
      console.log('✅ Anon client successful:', anonData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

debugBarangayQuery().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});