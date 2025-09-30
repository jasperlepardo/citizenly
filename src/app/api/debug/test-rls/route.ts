import { NextResponse } from 'next/server';

import { supabase } from '@/lib/data/supabase';

export async function GET() {
  try {
    console.log('Debug: Testing RLS components...');
    
    // Test 1: Get user ID directly
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'No authenticated user', 
        details: userError?.message 
      }, { status: 401 });
    }

    // Test 2: Test individual RLS functions
    const { data: accessLevel, error: accessError } = await supabase.rpc('user_access_level');
    const { data: barangayCode, error: barangayError } = await supabase.rpc('user_barangay_code');
    
    // Test 3: Try a simple query that should work
    const { data: userProfile, error: profileError } = await supabase
      .from('auth_user_profiles')
      .select('id, barangay_code')
      .eq('id', user.id)
      .single();

    // Test 4: Try to bypass RLS with explicit condition
    const { data: householdsExplicit, error: explicitError } = await supabase
      .from('households')
      .select('code, barangay_code, created_by')
      .eq('barangay_code', barangayCode)
      .limit(3);

    // Test 5: Test specific household that should be accessible
    const targetHouseholdCode = '042114014-0000-0001-0001';
    const { data: targetHousehold, error: targetError } = await supabase
      .from('households')
      .select('code, barangay_code, created_by')
      .eq('code', targetHouseholdCode);

    console.log('Debug results:', {
      userId: user.id,
      accessLevel,
      barangayCode,
      userProfile,
      householdsExplicit: householdsExplicit?.length,
      targetHousehold: targetHousehold?.length
    });
    
    return NextResponse.json({
      userId: user.id,
      rlsFunctions: {
        accessLevel,
        barangayCode,
        errors: {
          accessError: accessError?.message,
          barangayError: barangayError?.message
        }
      },
      userProfile,
      householdTests: {
        explicit: {
          count: householdsExplicit?.length || 0,
          error: explicitError?.message,
          samples: householdsExplicit?.slice(0, 2)
        },
        targetHousehold: {
          count: targetHousehold?.length || 0,
          error: targetError?.message,
          result: targetHousehold?.[0]
        }
      },
      analysis: {
        authWorking: !!user.id,
        rlsFunctionsWorking: !accessError && !barangayError,
        profileAccessible: !!userProfile && !profileError,
        householdsAccessible: !explicitError && (householdsExplicit?.length || 0) > 0,
        possibleIssue: !householdsExplicit || householdsExplicit.length === 0 ? 
          'RLS policy is blocking household access despite correct barangay codes' : 
          'RLS appears to be working correctly'
      }
    });

  } catch (err) {
    console.error('Debug: Exception in RLS test:', err);
    return NextResponse.json({ 
      error: 'Debug endpoint error', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}