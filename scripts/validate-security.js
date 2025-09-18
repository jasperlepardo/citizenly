/**
 * Security Validation Script
 * Validates that RLS policies and security functions are working correctly
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateSecurity() {
  console.log('🔒 Validating RLS Security Implementation...\n');

  const results = {
    functionsInstalled: false,
    policiesActive: false,
    indexesCreated: false,
    dataAccess: false,
    performanceOk: false
  };

  try {
    // 1. Check if RLS functions are installed
    console.log('1. Checking RLS functions...');
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT proname, prosecdef 
        FROM pg_proc 
        WHERE proname IN (
          'user_barangay_code', 'user_city_code', 'user_province_code',
          'user_region_code', 'user_role', 'is_super_admin', 'user_access_level'
        )
        ORDER BY proname
      `
    });

    if (funcError) {
      console.log('   ⚠️  Cannot validate functions:', funcError.message);
    } else if (functions && functions.length === 7) {
      console.log('   ✅ All 7 RLS functions installed');
      results.functionsInstalled = true;
    } else {
      console.log(`   ❌ Missing functions. Found ${functions?.length || 0}/7`);
    }

    // 2. Check if RLS policies are active
    console.log('\n2. Checking RLS policies...');
    const { data: policies, error: polError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, policyname, permissive
        FROM pg_policies 
        WHERE tablename = 'residents'
        AND policyname = 'Residents geographic access via households'
      `
    });

    if (polError) {
      console.log('   ⚠️  Cannot validate policies:', polError.message);
    } else if (policies && policies.length > 0) {
      console.log('   ✅ RLS policy active for residents table');
      results.policiesActive = true;
    } else {
      console.log('   ❌ Missing RLS policy for residents');
    }

    // 3. Check if performance indexes exist
    console.log('\n3. Checking performance indexes...');
    const { data: indexes, error: idxError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT tablename, indexname 
        FROM pg_indexes 
        WHERE (
          indexname LIKE '%household_code%' OR
          indexname LIKE '%geographic%' OR
          indexname LIKE '%profiles%'
        )
        AND schemaname = 'public'
      `
    });

    if (idxError) {
      console.log('   ⚠️  Cannot validate indexes:', idxError.message);
    } else if (indexes && indexes.length >= 3) {
      console.log(`   ✅ Performance indexes created (${indexes.length} found)`);
      results.indexesCreated = true;
    } else {
      console.log(`   ⚠️  May need performance indexes (${indexes?.length || 0} found)`);
      console.log('   💡 Run create-rls-indexes.sql for better performance');
    }

    // 4. Test basic data access
    console.log('\n4. Testing data access...');
    const startTime = Date.now();
    
    const { data: residents, error: dataError } = await supabase
      .from('residents')
      .select(`
        id,
        first_name,
        last_name,
        households!inner(
          code,
          barangay_code
        )
      `)
      .limit(10);

    const queryTime = Date.now() - startTime;

    if (dataError) {
      console.log('   ❌ Data access error:', dataError.message);
    } else if (residents && residents.length > 0) {
      console.log(`   ✅ Data access working (${residents.length} residents found)`);
      results.dataAccess = true;
      
      // Verify join constraint
      const validJoins = residents.every(r => r.households?.code);
      if (validJoins) {
        console.log('   ✅ Household joins working correctly');
      } else {
        console.log('   ⚠️  Some household joins may be incomplete');
      }
    } else {
      console.log('   ⚠️  No resident data found (may be expected if no test data)');
    }

    // 5. Check query performance
    if (queryTime < 500) {
      console.log(`   ✅ Query performance good (${queryTime}ms)`);
      results.performanceOk = true;
    } else {
      console.log(`   ⚠️  Query performance slow (${queryTime}ms) - consider running create-rls-indexes.sql`);
    }

    // 6. Test RLS function returns (will be NULL for service role)
    console.log('\n5. Testing RLS functions...');
    const { data: funcTest, error: funcTestError } = await supabase.rpc('user_barangay_code');
    
    if (funcTestError) {
      console.log('   ❌ RLS function test failed:', funcTestError.message);
    } else {
      console.log('   ✅ RLS functions callable (returns NULL for service role - expected)');
    }

  } catch (error) {
    console.error('❌ Security validation failed:', error);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SECURITY VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`RLS Functions Installed:  ${results.functionsInstalled ? '✅' : '❌'}`);
  console.log(`RLS Policies Active:      ${results.policiesActive ? '✅' : '❌'}`);
  console.log(`Performance Indexes:      ${results.indexesCreated ? '✅' : '⚠️'}`);
  console.log(`Data Access Working:      ${results.dataAccess ? '✅' : '❌'}`);
  console.log(`Query Performance:        ${results.performanceOk ? '✅' : '⚠️'}`);

  const allGood = results.functionsInstalled && results.policiesActive && results.dataAccess;
  
  if (allGood) {
    console.log('\n🎉 Security implementation is working correctly!');
    console.log('\n📝 Next Steps:');
    console.log('1. Test with real authenticated users');
    console.log('2. Verify different user roles see appropriate data');
    console.log('3. Monitor query performance in production');
    
    if (!results.indexesCreated) {
      console.log('4. Consider running create-rls-indexes.sql for better performance');
    }
  } else {
    console.log('\n⚠️  Security implementation needs attention:');
    
    if (!results.functionsInstalled) {
      console.log('- Run fix-rls-functions-final.sql in Supabase SQL Editor');
    }
    if (!results.policiesActive) {
      console.log('- Ensure RLS policies are properly created');
    }
    if (!results.dataAccess) {
      console.log('- Check database permissions and table structure');
    }
  }

  console.log('\n🔍 Manual Testing Required:');
  console.log('- Test API endpoints with real user authentication');
  console.log('- Verify geographic access restrictions work');
  console.log('- Check that super admin can access all data');
  console.log('- Confirm barangay admin only sees their barangay data');
}

validateSecurity().then(() => process.exit(0));