import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { supabase } from '@/lib/data/supabase';

export async function GET() {
  try {
    console.log('🔍 Deep RLS Analysis Starting...');
    
    // Step 1: Basic Auth Check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication failed', details: userError?.message }, { status: 401 });
    }

    // Step 2: Admin client for bypassing RLS
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('👤 User ID:', user.id);

    // Step 3: RLS Function Tests
    const rlsTests = {
      userAccessLevel: await supabase.rpc('user_access_level'),
      userBarangayCode: await supabase.rpc('user_barangay_code'),
      userCityCode: { data: null, error: { message: 'Function not implemented' } },
      userProvinceCode: { data: null, error: { message: 'Function not implemented' } },
      userRegionCode: { data: null, error: { message: 'Function not implemented' } }
    };

    console.log('🔧 RLS Functions:', {
      accessLevel: rlsTests.userAccessLevel.data,
      barangayCode: rlsTests.userBarangayCode.data,
      cityCode: rlsTests.userCityCode.data
    });

    // Step 4: User Profile Direct Query
    const userProfileDirect = await supabase
      .from('auth_user_profiles')
      .select('id, barangay_code, city_municipality_code, province_code, region_code, role_id')
      .eq('id', user.id)
      .single();

    console.log('👥 User Profile:', userProfileDirect.data);

    // Step 5: Admin queries to see what data actually exists
    const adminQueries = {
      // All households in user's barangay
      householdsInUserBarangay: await adminSupabase
        .from('households')
        .select('code, barangay_code, city_municipality_code, created_by')
        .eq('barangay_code', rlsTests.userBarangayCode.data)
        .limit(5),
      
      // Specific target household
      targetHousehold: await adminSupabase
        .from('households')
        .select('*')
        .eq('code', '042114014-0000-0001-0001')
        .single(),
      
      // All households (limited)
      allHouseholds: await adminSupabase
        .from('households')
        .select('code, barangay_code, city_municipality_code')
        .limit(5)
    };

    console.log('🏠 Admin Household Queries:', {
      inUserBarangay: adminQueries.householdsInUserBarangay.data?.length,
      targetExists: !!adminQueries.targetHousehold.data,
      totalExists: adminQueries.allHouseholds.data?.length
    });

    // Step 6: User queries (with RLS)
    const userQueries = {
      // Try to get any households
      anyHouseholds: await supabase
        .from('households')
        .select('code, barangay_code')
        .limit(5),
      
      // Try specific barangay filter
      barangayFiltered: await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('barangay_code', rlsTests.userBarangayCode.data)
        .limit(5),
      
      // Try target household
      targetHousehold: await supabase
        .from('households')
        .select('code, barangay_code, created_by')
        .eq('code', '042114014-0000-0001-0001'),
      
      // Try other tables for comparison
      userProfile: await supabase
        .from('auth_user_profiles')
        .select('id, barangay_code')
        .eq('id', user.id)
        .single(),
    };

    console.log('🚫 User RLS Queries:', {
      anyHouseholds: userQueries.anyHouseholds.data?.length,
      barangayFiltered: userQueries.barangayFiltered.data?.length,
      targetHousehold: userQueries.targetHousehold.data?.length,
      canAccessOwnProfile: !!userQueries.userProfile.data
    });

    // Step 7: Test raw SQL with explicit auth context
    const rawSqlTest = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            auth.uid() as current_uid,
            user_barangay_code() as current_barangay,
            user_access_level() as current_access_level,
            (
              SELECT COUNT(*) 
              FROM households 
              WHERE barangay_code = user_barangay_code()
            ) as households_count_in_barangay
        `
      })
;

    // Step 8: Policy Analysis
    const policyAnalysis = {
      userHasCorrectBarangay: userProfileDirect.data?.barangay_code === '042114014',
      rlsFunctionReturnsCorrectBarangay: rlsTests.userBarangayCode.data === '042114014',
      targetHouseholdExists: !!adminQueries.targetHousehold.data,
      targetHouseholdBarangay: adminQueries.targetHousehold.data?.barangay_code,
      barangayCodesMatch: adminQueries.targetHousehold.data?.barangay_code === rlsTests.userBarangayCode.data,
      userCanAccessAnyHouseholds: (userQueries.anyHouseholds.data?.length || 0) > 0,
      adminCanSeeHouseholdsInBarangay: (adminQueries.householdsInUserBarangay.data?.length || 0) > 0,
    };

    console.log('🔍 Policy Analysis:', policyAnalysis);

    // Step 9: Potential Issues Detection
    const potentialIssues = [];
    
    if (!policyAnalysis.userHasCorrectBarangay) {
      potentialIssues.push('User profile missing barangay_code');
    }
    
    if (!policyAnalysis.rlsFunctionReturnsCorrectBarangay) {
      potentialIssues.push('user_barangay_code() function not working');
    }
    
    if (!policyAnalysis.targetHouseholdExists) {
      potentialIssues.push('Target household does not exist in database');
    }
    
    if (!policyAnalysis.barangayCodesMatch) {
      potentialIssues.push('Barangay codes do not match between user and household');
    }
    
    if (policyAnalysis.userHasCorrectBarangay && 
        policyAnalysis.rlsFunctionReturnsCorrectBarangay && 
        policyAnalysis.barangayCodesMatch && 
        !policyAnalysis.userCanAccessAnyHouseholds) {
      potentialIssues.push('RLS policy syntax/logic error - all conditions met but access denied');
    }

    if (!userQueries.userProfile.data) {
      potentialIssues.push('User cannot access own profile - auth.uid() might not be working');
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      userId: user.id,
      rlsTests: {
        functions: {
          accessLevel: rlsTests.userAccessLevel.data,
          barangayCode: rlsTests.userBarangayCode.data,
          cityCode: rlsTests.userCityCode.data,
        },
        errors: {
          accessLevelError: rlsTests.userAccessLevel.error?.message,
          barangayCodeError: rlsTests.userBarangayCode.error?.message,
          cityCodeError: rlsTests.userCityCode.error?.message,
        }
      },
      userProfile: userProfileDirect,
      adminQueries: {
        householdsInUserBarangay: {
          count: adminQueries.householdsInUserBarangay.data?.length || 0,
          samples: adminQueries.householdsInUserBarangay.data?.slice(0, 2),
          error: adminQueries.householdsInUserBarangay.error?.message
        },
        targetHousehold: {
          exists: !!adminQueries.targetHousehold.data,
          barangayCode: adminQueries.targetHousehold.data?.barangay_code,
          createdBy: adminQueries.targetHousehold.data?.created_by,
          error: adminQueries.targetHousehold.error?.message
        },
        totalHouseholds: {
          count: adminQueries.allHouseholds.data?.length || 0,
          samples: adminQueries.allHouseholds.data?.slice(0, 2)
        }
      },
      userQueries: {
        anyHouseholds: {
          count: userQueries.anyHouseholds.data?.length || 0,
          error: userQueries.anyHouseholds.error?.message
        },
        barangayFiltered: {
          count: userQueries.barangayFiltered.data?.length || 0,
          error: userQueries.barangayFiltered.error?.message
        },
        targetHousehold: {
          found: (userQueries.targetHousehold.data?.length || 0) > 0,
          error: userQueries.targetHousehold.error?.message
        },
        ownProfile: {
          accessible: !!userQueries.userProfile.data,
          error: userQueries.userProfile.error?.message
        }
      },
      rawSqlTest: {
        result: rawSqlTest.data,
        error: rawSqlTest.error?.message
      },
      policyAnalysis,
      potentialIssues,
      recommendations: potentialIssues.length > 0 ? 
        potentialIssues.map(issue => {
          switch(issue) {
            case 'RLS policy syntax/logic error - all conditions met but access denied':
              return 'Check RLS policy syntax, particularly the CASE statement evaluation';
            case 'User cannot access own profile - auth.uid() might not be working':
              return 'Check auth context and session validity';
            default:
              return `Address: ${issue}`;
          }
        }) : ['All basic checks passed - investigate policy logic']
    });

  } catch (err) {
    console.error('🚨 Deep RLS Analysis Error:', err);
    return NextResponse.json({ 
      error: 'Analysis failed', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}