const { createClient } = require('@supabase/supabase-js');

// Use the same setup as SimpleBarangaySelector
const supabase = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

async function debugBarangayAccess() {
  console.log('🔍 Debugging barangay access...\n');
  
  try {
    // Test 1: Check if we can access the table at all
    console.log('1. Testing basic table access...');
    const { data: countData, error: countError } = await supabase
      .from('psgc_barangays')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Cannot access table:', countError.message);
      console.error('   Code:', countError.code);
      console.error('   Details:', countError.details);
    } else {
      console.log('✅ Table accessible, total rows:', countData);
    }
    
    // Test 2: Try to get a few records
    console.log('\n2. Testing basic select...');
    const { data: basicData, error: basicError } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .limit(3);
    
    if (basicError) {
      console.error('❌ Basic select failed:', basicError.message);
      console.error('   Code:', basicError.code);
    } else {
      console.log('✅ Basic select works, sample data:');
      basicData?.forEach(b => console.log(`   ${b.code} - ${b.name}`));
    }
    
    // Test 3: Try exact search that worked before
    console.log('\n3. Testing search for "Adams"...');
    const { data: searchData, error: searchError } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .ilike('name', '%adams%')
      .limit(5);
    
    if (searchError) {
      console.error('❌ Search failed:', searchError.message);
      console.error('   Code:', searchError.code);
    } else {
      console.log('✅ Search works, results:');
      if (searchData && searchData.length > 0) {
        searchData.forEach(b => console.log(`   ${b.code} - ${b.name}`));
      } else {
        console.log('   No results found for "adams"');
      }
    }
    
    // Test 4: Check auth status
    console.log('\n4. Checking auth status...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else {
      console.log('Session status:', session ? 'Authenticated' : 'Anonymous');
      if (session) {
        console.log('User ID:', session.user.id);
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

debugBarangayAccess();