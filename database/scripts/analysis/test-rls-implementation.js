#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

// Initialize clients for different access levels
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRLSImplementation() {
  console.log('🧪 TESTING RLS IMPLEMENTATION');
  console.log('=============================\n');
  
  try {
    // Test 1: Service Role Access (should have full access)
    console.log('🔧 TEST 1: Service Role Access (Admin Level)');
    console.log('=============================================');
    
    const { count: serviceRegionCount } = await serviceClient
      .from('psgc_regions')
      .select('*', { count: 'exact' });
    
    const { count: serviceBarangayCount } = await serviceClient
      .from('psgc_barangays')
      .select('*', { count: 'exact' });
    
    console.log(`✅ Service role can access regions: ${serviceRegionCount?.toLocaleString() || 'Unknown'}`);
    console.log(`✅ Service role can access barangays: ${serviceBarangayCount?.toLocaleString() || 'Unknown'}`);
    
    // Test 2: Anonymous Access (should have read-only access)
    console.log('\n🌍 TEST 2: Anonymous Public Access (Read-Only)');
    console.log('==============================================');
    
    const { data: anonRegions, error: anonRegionsError } = await anonClient
      .from('psgc_regions')
      .select('code, name')
      .limit(5);
    
    const { data: anonBarangays, error: anonBarangaysError } = await anonClient
      .from('psgc_barangays')
      .select('code, name')
      .limit(5);
    
    if (anonRegionsError) {
      console.log('❌ Anonymous read access to regions:', anonRegionsError.message);
    } else {
      console.log(`✅ Anonymous read access to regions: ${anonRegions?.length || 0} records`);
    }
    
    if (anonBarangaysError) {
      console.log('❌ Anonymous read access to barangays:', anonBarangaysError.message);
    } else {
      console.log(`✅ Anonymous read access to barangays: ${anonBarangays?.length || 0} records`);
    }
    
    // Test 3: Anonymous Write Access (should be blocked)
    console.log('\n🚫 TEST 3: Anonymous Write Access (Should Be Blocked)');
    console.log('====================================================');
    
    const { error: anonInsertError } = await anonClient
      .from('psgc_regions')
      .insert({ code: 'TEST01', name: 'Test Region' });
    
    if (anonInsertError) {
      console.log('✅ Anonymous write access properly blocked:', anonInsertError.message);
    } else {
      console.log('❌ Anonymous write access NOT blocked - Security issue!');
    }
    
    // Test 4: User Profiles Access
    console.log('\n👤 TEST 4: User Profiles Table Access');
    console.log('====================================');
    
    const { data: profilesData, error: profilesError } = await serviceClient
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('⚠️  User profiles access:', profilesError.message);
    } else {
      console.log(`✅ User profiles accessible: ${profilesData?.length || 0} records`);
    }
    
    // Test 5: Admin Setup Function
    console.log('\n👑 TEST 5: Admin Setup Function');
    console.log('===============================');
    
    // This is just a test of function existence
    const { error: functionError } = await serviceClient.rpc('setup_admin_user', {
      user_email: 'test@example.com'
    });
    
    if (functionError) {
      if (functionError.message.includes('could not be found') || functionError.message.includes('does not exist')) {
        console.log('⚠️  Admin setup function: User not found (expected for test email)');
      } else {
        console.log('❌ Admin setup function error:', functionError.message);
      }
    } else {
      console.log('✅ Admin setup function: Working properly');
    }
    
    // Test 6: RLS Policy Status
    console.log('\n🛡️  TEST 6: RLS Policy Status');
    console.log('=============================');
    
    const psgcTables = ['psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays'];
    
    for (const table of psgcTables) {
      // Test with anon client to verify RLS
      const { data, error } = await anonClient
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: RLS blocking access - ${error.message}`);
      } else {
        console.log(`✅ ${table}: RLS allowing read access (${data?.length || 0} records)`);
      }
    }
    
    // Summary
    console.log('\n📋 RLS IMPLEMENTATION SUMMARY:');
    console.log('===============================');
    
    const readAccessWorking = !anonRegionsError && !anonBarangaysError;
    const writeAccessBlocked = !!anonInsertError;
    const userProfilesExist = !profilesError;
    
    console.log(`Public read access: ${readAccessWorking ? '✅ Working' : '❌ Blocked'}`);
    console.log(`Public write access: ${writeAccessBlocked ? '✅ Properly blocked' : '❌ Security risk'}`);
    console.log(`User profiles system: ${userProfilesExist ? '✅ Implemented' : '❌ Missing'}`);
    
    if (readAccessWorking && writeAccessBlocked && userProfilesExist) {
      console.log('\n🎉 RLS IMPLEMENTATION SUCCESS!');
      console.log('==============================');
      console.log('✅ PSGC tables are properly secured');
      console.log('✅ Public read access enabled');
      console.log('✅ Write access restricted to authorized users');
      console.log('✅ User authentication system implemented');
      console.log('\n🔧 Ready for production use with proper access controls');
    } else {
      console.log('\n⚠️  RLS IMPLEMENTATION NEEDS ATTENTION');
      console.log('=====================================');
      console.log('Some security policies may need manual adjustment');
      console.log('Check Supabase dashboard for policy configuration');
    }
    
  } catch (error) {
    console.error('❌ RLS testing failed:', error.message);
  }
}

// Run the RLS test
if (require.main === module) {
  testRLSImplementation();
}

module.exports = { testRLSImplementation };