import { NextRequest, NextResponse } from 'next/server';

import { createPublicSupabaseClient, createAdminSupabaseClient } from '@/lib/data/client-factory';
import type { Database } from '@/lib/data/supabase';
import type { HouseholdRecord } from '@/types/api';
import type { AuthUserProfile } from '@/types/auth';

type DbHouseholdUpdate = Database['public']['Tables']['households']['Update'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const householdCode = resolvedParams.id;

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

    // Get household data with head resident info using correct foreign key reference
    const householdResult = await supabaseAdmin
      .from('households')
      .select(
        `
        *,
        head_resident:residents!household_head_id(
          id,
          first_name,
          middle_name,
          last_name,
          email,
          mobile_number,
          sex,
          birthdate,
          civil_status
        )
        `
      )
      .eq('code', householdCode)
      .eq('barangay_code', userProfile.barangay_code)
      .single();

    const household = householdResult.data as HouseholdRecord | null;
    const householdError = householdResult.error;

    if (householdError || !household) {
      return NextResponse.json({ error: 'Household not found or access denied' }, { status: 404 });
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

    return NextResponse.json({
      household: {
        ...household,
        ...geoInfo,
        member_count: members?.length || 0,
      },
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
