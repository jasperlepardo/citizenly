import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { supabase } from '@/lib/data/supabase';

export async function GET() {
  try {
    console.log('🎭 RLS Policy Simulator Starting...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🧮 Simulating RLS Policy Logic Step by Step');

    // Step 1: Get all the components the policy uses
    const policyComponents = {
      // Current user ID
      authUid: user.id,
      
      // RLS function results
      userAccessLevel: await supabase.rpc('user_access_level'),
      userBarangayCode: await supabase.rpc('user_barangay_code'),
      userCityCode: { data: null, error: { message: 'Function not implemented' } },
      
      // Target household (admin view)
      targetHousehold: await adminSupabase
        .from('households')
        .select('code, barangay_code, city_municipality_code, province_code, region_code, created_by')
        .eq('code', '042114014-0000-0001-0001')
        .single()
    };

    console.log('🔧 Policy Components:', {
      userLevel: policyComponents.userAccessLevel.data?.level,
      userBarangay: policyComponents.userBarangayCode.data,
      targetBarangay: policyComponents.targetHousehold.data?.barangay_code
    });

    // Step 2: Manually evaluate the RLS policy
    const policyEvaluation = {
      // Current RLS Policy Logic:
      // CASE user_access_level()::json->>'level'
      //     WHEN 'barangay' THEN barangay_code = user_barangay_code()
      //     WHEN 'city' THEN city_municipality_code = user_city_code()
      //     ...
      
      accessLevel: policyComponents.userAccessLevel.data?.level,
      
      barangayCheck: {
        userBarangayCode: policyComponents.userBarangayCode.data,
        householdBarangayCode: policyComponents.targetHousehold.data?.barangay_code,
        codesMatch: policyComponents.userBarangayCode.data === policyComponents.targetHousehold.data?.barangay_code,
        shouldAllowAccess: policyComponents.userAccessLevel.data?.level === 'barangay' && 
                          policyComponents.userBarangayCode.data === policyComponents.targetHousehold.data?.barangay_code
      },
      
      cityCheck: {
        userCityCode: policyComponents.userCityCode.data,
        householdCityCode: policyComponents.targetHousehold.data?.city_municipality_code,
        codesMatch: policyComponents.userCityCode.data === policyComponents.targetHousehold.data?.city_municipality_code,
        shouldAllowAccess: policyComponents.userAccessLevel.data?.level === 'city' && 
                          policyComponents.userCityCode.data === policyComponents.targetHousehold.data?.city_municipality_code
      }
    };

    // Step 3: Test the actual policy behavior with different approaches
    const policyTests = {
      // Test 1: Standard query (what's failing)
      standardQuery: await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('code', '042114014-0000-0001-0001'),

      // Test 2: Query with explicit RLS function calls in SELECT
      explicitFunctionQuery: await supabase
        .from('households')
        .select(`
          code, 
          barangay_code,
          user_barangay_code(),
          user_access_level()
        `)
        .eq('code', '042114014-0000-0001-0001'),

      // Test 3: Query all households in the barangay (not just target)
      allBarangayHouseholds: await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('barangay_code', policyComponents.userBarangayCode.data)
        .limit(3),

      // Test 4: Check if we can see any households at all
      anyHouseholds: await supabase
        .from('households')
        .select('code, barangay_code')
        .limit(1)
    };

    // Step 4: Debug the CASE statement evaluation
    const caseStatementDebug = {
      userAccessLevelRaw: policyComponents.userAccessLevel.data,
      userAccessLevelJson: JSON.stringify(policyComponents.userAccessLevel.data),
      levelProperty: policyComponents.userAccessLevel.data?.level,
      
      // Test if the JSON extraction works
      jsonExtraction: {
        manual: policyComponents.userAccessLevel.data?.level,
        expectedByPolicy: 'barangay', // what the policy expects
        matches: policyComponents.userAccessLevel.data?.level === 'barangay'
      }
    };

    // Step 5: Type checking and data validation
    const typeValidation = {
      userBarangayCodeType: typeof policyComponents.userBarangayCode.data,
      householdBarangayCodeType: typeof policyComponents.targetHousehold.data?.barangay_code,
      userBarangayLength: policyComponents.userBarangayCode.data?.length,
      householdBarangayLength: policyComponents.targetHousehold.data?.barangay_code?.length,
      
      strictEquality: policyComponents.userBarangayCode.data === policyComponents.targetHousehold.data?.barangay_code,
      looseEquality: policyComponents.userBarangayCode.data == policyComponents.targetHousehold.data?.barangay_code,
      
      // Check for invisible characters or encoding issues
      userBarangayHex: policyComponents.userBarangayCode.data ? 
        Array.from(String(policyComponents.userBarangayCode.data)).map(c => c.charCodeAt(0).toString(16)).join(' ') : null,
      householdBarangayHex: policyComponents.targetHousehold.data?.barangay_code ? 
        Array.from(String(policyComponents.targetHousehold.data.barangay_code)).map(c => c.charCodeAt(0).toString(16)).join(' ') : null
    };

    // Step 6: Test alternative policy approaches
    const alternativePolicyTest = {
      // What if we bypass the CASE statement entirely?
      directComparison: await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('barangay_code', policyComponents.userBarangayCode.data)
        .limit(1),
        
      // Test if functions work in WHERE clauses
      functionInWhere: await supabase
        .from('auth_user_profiles')
        .select('id, barangay_code')
        .eq('id', user.id) // This tests if auth.uid() works in WHERE
    };

    console.log('📋 Policy Evaluation Result:', {
      shouldAllow: policyEvaluation.barangayCheck.shouldAllowAccess,
      actualResult: (policyTests.standardQuery.data?.length || 0) > 0
    });

    // Final analysis
    const finalAnalysis = {
      policyLogicCorrect: policyEvaluation.barangayCheck.shouldAllowAccess,
      actualAccessGranted: (policyTests.standardQuery.data?.length || 0) > 0,
      
      discrepancy: policyEvaluation.barangayCheck.shouldAllowAccess && 
                  (policyTests.standardQuery.data?.length || 0) === 0,
      
      possibleCauses: [
        !policyComponents.userAccessLevel.data ? 'user_access_level() returns null' : null,
        !policyComponents.userBarangayCode.data ? 'user_barangay_code() returns null' : null,
        !caseStatementDebug.jsonExtraction.matches ? 'JSON extraction in CASE statement failing' : null,
        typeValidation.userBarangayCodeType !== 'string' ? 'user_barangay_code() returns wrong type' : null,
        !typeValidation.strictEquality && typeValidation.looseEquality ? 'Type coercion issue' : null,
        typeValidation.userBarangayHex !== typeValidation.householdBarangayHex ? 'String encoding mismatch' : null,
        policyEvaluation.barangayCheck.shouldAllowAccess && 
        (policyTests.standardQuery.data?.length || 0) === 0 ? 'CASE statement syntax error' : null
      ].filter(Boolean)
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      userId: user.id,
      
      policyComponents: {
        authUid: policyComponents.authUid,
        userAccessLevel: policyComponents.userAccessLevel.data,
        userBarangayCode: policyComponents.userBarangayCode.data,
        userCityCode: policyComponents.userCityCode.data,
        targetHousehold: policyComponents.targetHousehold.data,
        errors: {
          accessLevel: policyComponents.userAccessLevel.error?.message,
          barangayCode: policyComponents.userBarangayCode.error?.message,
          targetHousehold: policyComponents.targetHousehold.error?.message
        }
      },
      
      policyEvaluation,
      
      policyTests: {
        standardQuery: {
          count: policyTests.standardQuery.data?.length || 0,
          error: policyTests.standardQuery.error?.message
        },
        explicitFunctionQuery: {
          count: policyTests.explicitFunctionQuery.data?.length || 0,
          data: policyTests.explicitFunctionQuery.data?.[0],
          error: policyTests.explicitFunctionQuery.error?.message
        },
        allBarangayHouseholds: {
          count: policyTests.allBarangayHouseholds.data?.length || 0,
          error: policyTests.allBarangayHouseholds.error?.message
        },
        anyHouseholds: {
          count: policyTests.anyHouseholds.data?.length || 0,
          error: policyTests.anyHouseholds.error?.message
        }
      },
      
      caseStatementDebug,
      typeValidation,
      
      alternativePolicyTest: {
        directComparison: {
          count: alternativePolicyTest.directComparison.data?.length || 0,
          error: alternativePolicyTest.directComparison.error?.message
        },
        functionInWhere: {
          accessible: !!alternativePolicyTest.functionInWhere.data,
          error: alternativePolicyTest.functionInWhere.error?.message
        }
      },
      
      finalAnalysis,
      
      recommendations: finalAnalysis.possibleCauses.length > 0 ? 
        finalAnalysis.possibleCauses.map(cause => {
          switch(cause) {
            case 'CASE statement syntax error':
              return 'Rewrite RLS policy with simpler logic to avoid CASE statement issues';
            case 'JSON extraction in CASE statement failing':
              return 'Test user_access_level()::json->>"level" syntax separately';
            case 'Type coercion issue':
              return 'Add explicit type casting in RLS policy';
            case 'String encoding mismatch':
              return 'Check for unicode/encoding issues in barangay codes';
            default:
              return `Fix: ${cause}`;
          }
        }) : ['Policy logic appears correct - investigate Supabase RLS engine behavior']
    });

  } catch (err) {
    console.error('🚨 Policy Simulator Error:', err);
    return NextResponse.json({ 
      error: 'Policy simulation failed', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}