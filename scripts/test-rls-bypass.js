#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('🔓 Testing RLS Bypass to Confirm Policy Issue...');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testRLSBypass() {
  try {
    console.log('🧪 Testing with service role (bypasses RLS)...');
    
    // This should work since service role bypasses RLS
    const { data: households, error } = await supabase
      .from('households')
      .select('code, barangay_code, created_by')
      .eq('code', '042114014-0000-0001-0001');
      
    if (error) {
      console.log('❌ Service role query failed:', error.message);
      return;
    }
    
    if (!households || households.length === 0) {
      console.log('❌ Household does not exist in database!');
      console.log('🔍 Searching for any households with similar codes...');
      
      const { data: similarHouseholds, error: searchError } = await supabase
        .from('households')
        .select('code, barangay_code')
        .like('code', '%042114014%')
        .limit(5);
        
      if (searchError) {
        console.log('❌ Search failed:', searchError.message);
      } else {
        console.log('🔍 Found similar households:', similarHouseholds?.length || 0);
        similarHouseholds?.forEach(h => {
          console.log(`   - ${h.code} (${h.barangay_code})`);
        });
      }
      return;
    }
    
    console.log('✅ Household exists:', households[0]);
    console.log('👤 Created by:', households[0].created_by);
    console.log('🏠 Barangay:', households[0].barangay_code);
    
    // Now test if the user profile exists and matches
    const { data: userProfile, error: userError } = await supabase
      .from('auth_user_profiles')
      .select('id, barangay_code, role_id, is_active')
      .eq('id', households[0].created_by)
      .single();
      
    if (userError) {
      console.log('❌ User profile query failed:', userError.message);
      return;
    }
    
    console.log('✅ User profile:', userProfile);
    
    // Check if everything should match for RLS
    const shouldHaveAccess = userProfile.barangay_code === households[0].barangay_code && userProfile.is_active;
    console.log('🎯 Should have access:', shouldHaveAccess);
    console.log('📊 Barangay codes match:', userProfile.barangay_code === households[0].barangay_code);
    console.log('🔓 User is active:', userProfile.is_active);
    
    if (shouldHaveAccess) {
      console.log('\n✅ DIAGNOSIS: Data is correct, RLS policy logic is the issue');
      console.log('🛠️ The JSON extraction user_access_level()::json->>"level" is failing');
      console.log('📝 Need to fix RLS policy to use user_access_level()->>"level" instead');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRLSBypass();