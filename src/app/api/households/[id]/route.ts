import { NextRequest, NextResponse } from 'next/server';

import { createPublicSupabaseClient, createAdminSupabaseClient } from '@/lib/data/client-factory';
import type { Database } from '@/lib/data/supabase';
import type { HouseholdRecord } from '@/types/infrastructure/database/database';
import type { AuthUserProfile } from '@/types/app/auth/auth';

type DbHouseholdUpdate = Database['public']['Tables']['households']['Update'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const householdCode = resolvedParams.id;

    console.log('🔍 Household API: GET request for code:', householdCode);
    console.log('🔍 Household API: Request URL:', request.url);
    console.log('🔍 Household API: Request method:', request.method);

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 Household API: No auth header found');
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 Household API: Token found, length:', token.length);

    // Create regular client to verify user
    const supabase = createPublicSupabaseClient();

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    console.log('🔍 Household API: Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    });

    if (authError || !user) {
      console.log('🔍 Household API: Auth failed:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createAdminSupabaseClient() as any;

    // Get user profile to verify barangay access
    const profileResult = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    console.log('🔍 Household API: Profile result:', {
      hasProfile: !!profileResult.data,
      barangayCode: profileResult.data?.barangay_code,
      profileError: profileResult.error?.message
    });

    const userProfile = profileResult.data as AuthUserProfile | null;
    const profileError = profileResult.error;

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Get household data with head resident info first (without potentially problematic joins)
    console.log('🔍 Household API: About to query households table with:', {
      householdCode,
      userBarangayCode: userProfile.barangay_code
    });

    // First try with head_resident JOIN - this might be causing the 404
    let householdResult = await supabaseAdmin
      .from('households')
      .select('*')
      .eq('code', householdCode)
      .eq('barangay_code', userProfile.barangay_code)
      .single();

    // If successful, try to add head resident info separately
    if (!householdResult.error && householdResult.data && householdResult.data.household_head_id) {
      try {
        console.log('🔍 Household API: Fetching head resident info for household_head_id:', householdResult.data.household_head_id);
        const headResidentResult = await supabaseAdmin
          .from('residents')
          .select('id, first_name, middle_name, last_name, email, mobile_number, sex, birthdate, civil_status')
          .eq('id', householdResult.data.household_head_id)
          .single();

        if (!headResidentResult.error && headResidentResult.data) {
          (householdResult.data as any).head_resident = headResidentResult.data;
          console.log('🔍 Household API: Successfully added head resident info');
        } else {
          console.log('🔍 Household API: Head resident not found:', headResidentResult.error?.message);
          (householdResult.data as any).head_resident = null;
        }
      } catch (error) {
        console.warn('🔍 Household API: Failed to fetch head resident:', error);
        (householdResult.data as any).head_resident = null;
      }
    } else {
      console.log('🔍 Household API: No household_head_id found, skipping head resident lookup');
    }

    console.log('🔍 Household API: Initial query result:', {
      success: !householdResult.error,
      error: householdResult.error?.message,
      errorCode: householdResult.error?.code,
      dataExists: !!householdResult.data,
      householdCode: householdResult.data?.code,
      householdBarangay: householdResult.data?.barangay_code
    });

    // If successful, try to enrich with street and subdivision data
    if (!householdResult.error && householdResult.data) {
      try {
        // Try to get street name if street_id exists
        if (householdResult.data.street_id) {
          const streetResult = await supabaseAdmin
            .from('geo_streets')
            .select('id, name')
            .eq('id', householdResult.data.street_id)
            .single();

          if (!streetResult.error && streetResult.data) {
            (householdResult.data as any).street = streetResult.data;
          }
        }

        // Try to get subdivision name if subdivision_id exists
        if (householdResult.data.subdivision_id) {
          const subdivisionResult = await supabaseAdmin
            .from('geo_subdivisions')
            .select('id, name')
            .eq('id', householdResult.data.subdivision_id)
            .single();

          if (!subdivisionResult.error && subdivisionResult.data) {
            (householdResult.data as any).subdivision = subdivisionResult.data;
          }
        }
      } catch (enrichmentError) {
        console.warn('🔍 Household API: Failed to enrich with street/subdivision data:', enrichmentError);
        // Continue without enrichment - basic household data is still available
      }
    }

    const household = householdResult.data as HouseholdRecord | null;
    const householdError = householdResult.error;

    if (householdError || !household) {
      // Additional diagnostic: Check if household exists without barangay filter
      console.log('🔍 Household API: Main query failed, checking if household exists at all...');
      const diagnosticResult = await supabaseAdmin
        .from('households')
        .select('code, barangay_code, name')
        .eq('code', householdCode)
        .single();

      console.log('🔍 Household API: Diagnostic query result:', {
        found: !diagnosticResult.error,
        error: diagnosticResult.error?.message,
        data: diagnosticResult.data
      });

      return NextResponse.json({
        error: 'Household not found or access denied',
        debug: {
          householdCode,
          userBarangayCode: userProfile.barangay_code,
          householdExists: !diagnosticResult.error,
          householdBarangayCode: diagnosticResult.data?.barangay_code
        }
      }, { status: 404 });
    }

    // Get all household members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('household_code', householdCode)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (membersError) {
      console.warn('Failed to fetch household members:', membersError);
    }

    // Get geographic information
    let geoInfo = {};
    try {
      const { data: barangayData } = await supabaseAdmin
        .from('psgc_barangays')
        .select(
          `
          code,
          name,
          psgc_cities_municipalities!inner(
            code,
            name,
            type,
            psgc_provinces!inner(
              code,
              name,
              psgc_regions!inner(
                code,
                name
              )
            )
          )
          `
        )
        .eq('code', household.barangay_code)
        .single();

      if (barangayData) {
        const cityMunData = (barangayData as any)?.psgc_cities_municipalities ?? null;
        const province = (cityMunData as any)?.psgc_provinces ?? null;
        const region = (province as any)?.psgc_regions ?? null;

        geoInfo = {
          barangay_info: {
            code: (barangayData as any).code,
            name: (barangayData as any).name,
          },
          city_municipality_info: {
            code: (cityMunData as any)?.code ?? null,
            name: (cityMunData as any)?.name ?? null,
            type: (cityMunData as any)?.type ?? null,
          },
          province_info: {
            code: (province as any)?.code ?? null,
            name: (province as any)?.name ?? null,
          },
          region_info: {
            code: (region as any)?.code ?? null,
            name: (region as any)?.name ?? null,
          },
        };
      }
    } catch (geoError) {
      console.warn('Geographic info load failed:', geoError);
    }

    const householdWithInfo = {
      ...household,
      ...geoInfo,
      member_count: members?.length || 0,
    };

    return NextResponse.json({
      success: true,
      data: householdWithInfo,     // For consistency
      household: householdWithInfo, // For backward compatibility
      members: members || [],
    });
  } catch (error) {
    console.error('Household detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const householdCode = resolvedParams.id;
    const updateData = await request.json();

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabase = createPublicSupabaseClient();

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createAdminSupabaseClient() as any;

    // Get user profile to verify barangay access
    const profileResult = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    const userProfile = profileResult.data as AuthUserProfile | null;
    const profileError = profileResult.error;

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Prepare a typed, sanitized payload (block immutable fields)
    const {
      code: _code,
      barangay_code: _brgy,
      created_at: _created,
      updated_at: _prevUpdated,
      ...rest
    } = (updateData as Record<string, any>) ?? {};
    const updateResult = await supabaseAdmin
      .from('households')
      .update({
        ...(rest as DbHouseholdUpdate),
        updated_at: new Date().toISOString(),
      })
      .eq('code', householdCode)
      .eq('barangay_code', userProfile.barangay_code)
      .select()
      .single();

    const updatedHousehold = updateResult.data;
    const updateError = updateResult.error;

    if (updateError) {
      console.error('Household update error:', updateError);
      return NextResponse.json({ error: 'Failed to update household' }, { status: 500 });
    }

    if (!updatedHousehold) {
      return NextResponse.json({ error: 'Household not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      household: updatedHousehold,
      message: 'Household updated successfully',
    });
  } catch (error) {
    console.error('Household update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
