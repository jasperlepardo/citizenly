#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing Resident Access After RLS Fix...');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testResidentAccess() {
  try {
    console.log('🔍 Testing resident queries as admin (bypasses RLS)...');
    
    // Test 1: Check if any residents exist in the target household
    const { data: householdResidents, error: residentsError } = await supabase
      .from('residents')
      .select('id, first_name, last_name, household_code')
      .eq('household_code', '042114014-0000-0001-0001')
      .limit(5);
      
    if (residentsError) {
      console.log('❌ Residents query failed:', residentsError.message);
    } else {
      console.log(`✅ Found ${householdResidents?.length || 0} residents in household 042114014-0000-0001-0001`);
      householdResidents?.forEach(r => {
        console.log(`   - ${r.first_name} ${r.last_name} (ID: ${r.id})`);
      });
    }
    
    // Test 2: Check total residents in the database
    const { data: allResidents, error: allError } = await supabase
      .from('residents')
      .select('id, household_code')
      .limit(5);
      
    if (allError) {
      console.log('❌ All residents query failed:', allError.message);
    } else {
      console.log(`✅ Total residents in database: ${allResidents?.length || 0} (sample)`);
      if (allResidents?.length > 0) {
        console.log('   Sample household codes:', [...new Set(allResidents.map(r => r.household_code))]);
      }
    }
    
    // Test 3: Check residents in the user's barangay
    const { data: barangayResidents, error: barangayError } = await supabase
      .from('residents')
      .select(`
        id, 
        first_name, 
        last_name, 
        household_code,
        households!inner(barangay_code)
      `)
      .eq('households.barangay_code', '042114014')
      .limit(3);
      
    if (barangayError) {
      console.log('❌ Barangay residents query failed:', barangayError.message);
    } else {
      console.log(`✅ Found ${barangayResidents?.length || 0} residents in barangay 042114014`);
    }
    
    // Analysis
    console.log('\n📊 Analysis:');
    if ((householdResidents?.length || 0) === 0) {
      console.log('🔍 Issue: No residents found in target household');
      console.log('   → Either no residents exist in this household, or there\'s a data issue');
    } else {
      console.log('✅ Residents exist in target household');
      console.log('🔍 RLS policy might be too restrictive for user access');
    }
    
    return {
      householdHasResidents: (householdResidents?.length || 0) > 0,
      residentsExist: (allResidents?.length || 0) > 0,
      barangayHasResidents: (barangayResidents?.length || 0) > 0
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

testResidentAccess();