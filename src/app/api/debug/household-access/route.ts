import { NextResponse } from 'next/server';
import { supabase } from '@/lib/data/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const householdCode = searchParams.get('code') || '042114014-0000-0001-0001';
    
    console.log('Debug: Testing access to household:', householdCode);
    
    // Test 1: Get user's access info
    const { data: userAccessLevel } = await supabase.rpc('user_access_level');
    const { data: userBarangayCode } = await supabase.rpc('user_barangay_code');
    
    // Test 2: Try to query the specific household directly
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('code, barangay_code, city_municipality_code, province_code, region_code')
      .eq('code', householdCode);

    // Test 3: Try with service role (bypasses RLS)
    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: adminHousehold, error: adminError } = await adminSupabase
      .from('households')
      .select('code, barangay_code, city_municipality_code, province_code, region_code')
      .eq('code', householdCode);

    console.log('Debug: User access results:', { userAccessLevel, userBarangayCode });
    console.log('Debug: User query results:', { household, error: householdError?.message });
    console.log('Debug: Admin query results:', { adminHousehold, error: adminError?.message });
    
    return NextResponse.json({
      householdCode,
      userAccess: {
        accessLevel: userAccessLevel,
        barangayCode: userBarangayCode
      },
      userQuery: {
        results: household,
        error: householdError?.message,
        count: household?.length || 0
      },
      adminQuery: {
        results: adminHousehold,
        error: adminError?.message,
        count: adminHousehold?.length || 0
      },
      rlsAnalysis: {
        userCanAccess: !householdError && household && household.length > 0,
        adminCanAccess: !adminError && adminHousehold && adminHousehold.length > 0,
        possibleIssue: householdError ? 'RLS policy blocking access' : 
                      (adminHousehold && adminHousehold.length === 0) ? 'Household does not exist' : 
                      'No obvious issue detected'
      }
    });

  } catch (err) {
    console.error('Debug: Exception in household access test:', err);
    return NextResponse.json({ 
      error: 'Debug endpoint error', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}