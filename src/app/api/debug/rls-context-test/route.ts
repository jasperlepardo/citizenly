import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { supabase } from '@/lib/data/supabase';

export async function GET() {
  try {
    console.log('🧪 RLS Context Test Starting...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Admin client
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🎯 Testing RLS Functions in Different Contexts');

    // Context 1: Direct RPC calls (what we've been testing)
    const directRPC = {
      userAccessLevel: await supabase.rpc('user_access_level'),
      userBarangayCode: await supabase.rpc('user_barangay_code'),
    };

    // Context 2: Within a query context (how RLS actually uses them)
    const queryContext = await supabase
      .from('auth_user_profiles')
      .select(`
        id,
        barangay_code,
        (user_barangay_code()) as rpc_barangay_code,
        (user_access_level()) as rpc_access_level
      `)
      .eq('id', user.id)
      .single();

    // Context 3: Test if we can query households with explicit joins
    const explicitJoin = await supabase
      .from('auth_user_profiles')
      .select(`
        id,
        barangay_code,
        households:households!inner(code, barangay_code)
      `)
      .eq('id', user.id)
      .eq('households.barangay_code', directRPC.userBarangayCode.data);

    // Context 4: Test the actual RLS policy logic step by step
    const rlsPolicyStep1 = await supabase
      .from('households')
      .select('code, barangay_code, (user_barangay_code()) as user_barangay')
      .eq('barangay_code', '042114014')
      .limit(1);

    // Context 5: Test if auth.uid() works in queries
    const authUidTest = await supabase
      .from('auth_user_profiles')
      .select('id, barangay_code')
      .eq('id', user.id); // This should work if auth.uid() is working

    // Context 6: Admin tests for comparison
    const adminTests = {
      // What admin sees for households
      adminHouseholds: await adminSupabase
        .from('households')
        .select('code, barangay_code')
        .eq('barangay_code', '042114014')
        .limit(3),

      // What admin sees for user profile
      adminUserProfile: await adminSupabase
        .from('auth_user_profiles')
        .select('id, barangay_code, role_id')
        .eq('id', user.id)
        .single(),

      // Test if RLS functions work for admin
      adminRLSFunctions: {
        // This should return null/error since admin doesn't have a user context
        userBarangayCode: { data: null, error: { message: 'Admin context has no user functions' } },
        userAccessLevel: { data: null, error: { message: 'Admin context has no user functions' } }
      }
    };

    // Context 7: Test manual policy logic
    const manualPolicyLogic = {
      // Step 1: Get user's access level manually
      userProfile: queryContext.data,
      
      // Step 2: Check if household exists and what barangay it's in
      targetHouseholdAdmin: await adminSupabase
        .from('households')
        .select('code, barangay_code, created_by')
        .eq('code', '042114014-0000-0001-0001')
        .single(),
      
      // Step 3: Manual comparison
      manualComparison: {
        userBarangay: directRPC.userBarangayCode.data,
        targetBarangay: '042114014',
        shouldMatch: directRPC.userBarangayCode.data === '042114014'
      }
    };

    // Analysis
    const analysis = {
      directRPCWorking: !directRPC.userAccessLevel.error && !directRPC.userBarangayCode.error,
      queryContextWorking: !!queryContext.data && !queryContext.error,
      authUidWorking: !authUidTest.error && !!authUidTest.data,
      rlsPolicyStepWorking: !rlsPolicyStep1.error && Array.isArray(rlsPolicyStep1.data),
      explicitJoinWorking: !explicitJoin.error && Array.isArray(explicitJoin.data),
      
      contextComparirison: {
        directBarangayCode: directRPC.userBarangayCode.data,
        queryContextBarangayCode: (queryContext.data as any)?.rpc_barangay_code,
        profileBarangayCode: (queryContext.data as any)?.barangay_code,
        allMatch: directRPC.userBarangayCode.data === (queryContext.data as any)?.rpc_barangay_code &&
                 directRPC.userBarangayCode.data === (queryContext.data as any)?.barangay_code
      },

      householdAccessTest: {
        adminCanSeeTarget: !!adminTests.adminHouseholds.data?.length,
        adminCanSeeUserProfile: !!adminTests.adminUserProfile.data,
        userCanSeeOwnProfile: !!authUidTest.data?.length,
        rlsPolicyStepReturnsData: !!rlsPolicyStep1.data?.length
      }
    };

    console.log('📊 Context Test Results:', analysis);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      userId: user.id,
      
      contexts: {
        directRPC: {
          userAccessLevel: directRPC.userAccessLevel.data,
          userBarangayCode: directRPC.userBarangayCode.data,
          errors: {
            accessLevel: directRPC.userAccessLevel.error?.message,
            barangayCode: directRPC.userBarangayCode.error?.message
          }
        },
        
        queryContext: {
          data: queryContext.data,
          error: queryContext.error?.message
        },
        
        explicitJoin: {
          count: explicitJoin.data?.length || 0,
          data: explicitJoin.data,
          error: explicitJoin.error?.message
        },
        
        rlsPolicyStep: {
          count: rlsPolicyStep1.data?.length || 0,
          data: rlsPolicyStep1.data?.[0],
          error: rlsPolicyStep1.error?.message
        },
        
        authUidTest: {
          canAccessOwnProfile: !!authUidTest.data?.length,
          error: authUidTest.error?.message
        }
      },

      adminTests: {
        households: {
          count: adminTests.adminHouseholds.data?.length || 0,
          samples: adminTests.adminHouseholds.data?.slice(0, 2)
        },
        userProfile: adminTests.adminUserProfile.data,
        rlsFunctions: {
          barangayCode: adminTests.adminRLSFunctions.userBarangayCode.data,
          accessLevel: adminTests.adminRLSFunctions.userAccessLevel.data,
          errors: {
            barangay: adminTests.adminRLSFunctions.userBarangayCode.error?.message,
            access: adminTests.adminRLSFunctions.userAccessLevel.error?.message
          }
        }
      },

      manualPolicyLogic,
      analysis,
      
      diagnostics: {
        issue: analysis.directRPCWorking && analysis.queryContextWorking && analysis.authUidWorking && 
               analysis.contextComparirison.allMatch && !analysis.householdAccessTest.rlsPolicyStepReturnsData ?
               'RLS policy logic error - functions work but policy blocks access' :
               'Need to investigate specific failing component',
        
        nextSteps: [
          !analysis.directRPCWorking ? 'Fix RLS functions' : null,
          !analysis.authUidWorking ? 'Fix auth.uid() context' : null,
          !analysis.contextComparirison.allMatch ? 'Fix context inconsistencies' : null,
          analysis.directRPCWorking && analysis.authUidWorking && analysis.contextComparirison.allMatch && 
          !analysis.householdAccessTest.rlsPolicyStepReturnsData ? 'Fix RLS policy syntax/logic' : null
        ].filter(Boolean)
      }
    });

  } catch (err) {
    console.error('🚨 RLS Context Test Error:', err);
    return NextResponse.json({ 
      error: 'Context test failed', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}