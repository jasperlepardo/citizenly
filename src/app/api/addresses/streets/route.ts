/**
 * Streets API Route
 * Database implementation for geo_streets table
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barangayCode = searchParams.get('barangay_code');
    const subdivisionId = searchParams.get('subdivision_id');
    const search = searchParams.get('search');

    // Use service role client to bypass RLS for geographic reference data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query for geo_streets table
    let query = supabase
      .from('geo_streets')
      .select('id, name, subdivision_id, barangay_code')
      .eq('is_active', true)
      .order('name');

    // Filter by barangay if provided
    if (barangayCode) {
      query = query.eq('barangay_code', barangayCode);
    }

    // Filter by subdivision if provided
    if (subdivisionId) {
      query = query.eq('subdivision_id', subdivisionId);
    }

    // Add search filter if provided
    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: streets, error } = await query;

    if (error) {
      console.error('Error fetching streets:', error);
      return NextResponse.json({ error: `Failed to fetch streets: ${error.message}` }, { status: 500 });
    }

    // Transform to expected format
    const options = (streets || []).map((street: any) => ({
      value: street.id,
      label: street.name,
      subdivision_id: street.subdivision_id,
      barangay_code: street.barangay_code,
    }));

    return NextResponse.json({
      data: options,
      message: 'Streets retrieved successfully'
    });
  } catch (error) {
    console.error('Streets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, barangay_code, subdivision_id } = body;

    // Validate required fields
    if (!name || !barangay_code) {
      return NextResponse.json({
        error: 'Missing required fields: name and barangay_code are required'
      }, { status: 400 });
    }

    // Get auth header from the request for POST operations (creating data requires auth)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify user authentication
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await publicClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if street already exists in the same barangay/subdivision
    let existingQuery = supabase
      .from('geo_streets')
      .select('id, name')
      .eq('name', name.trim())
      .eq('barangay_code', barangay_code)
      .eq('is_active', true);

    if (subdivision_id) {
      existingQuery = existingQuery.eq('subdivision_id', subdivision_id);
    } else {
      existingQuery = existingQuery.is('subdivision_id', null);
    }

    const { data: existingStreet } = await existingQuery.single();

    if (existingStreet) {
      return NextResponse.json({
        error: 'A street with this name already exists in the selected area'
      }, { status: 409 });
    }

    // Get city and province from barangay for auto-population
    const { data: barangayData } = await supabase
      .from('psgc_barangays')
      .select('city_municipality_code')
      .eq('code', barangay_code)
      .single();

    let cityCode = null;
    let provinceCode = null;
    let regionCode = null;

    if (barangayData) {
      // Get city data
      const { data: cityData } = await supabase
        .from('psgc_cities_municipalities')
        .select('code, province_code')
        .eq('code', barangayData.city_municipality_code)
        .single();

      if (cityData) {
        cityCode = cityData.code;
        provinceCode = cityData.province_code;

        // Get region from province
        if (provinceCode) {
          const { data: provinceData } = await supabase
            .from('psgc_provinces')
            .select('region_code')
            .eq('code', provinceCode)
            .single();

          if (provinceData) {
            regionCode = provinceData.region_code;
          }
        }
      }
    }

    // Insert new street with authenticated user
    const { data: newStreet, error: insertError } = await supabase
      .from('geo_streets')
      .insert({
        name: name.trim(),
        barangay_code,
        subdivision_id: subdivision_id || null,
        city_municipality_code: cityCode,
        province_code: provinceCode,
        region_code: regionCode,
        is_active: true,
        created_by: user.id,
        updated_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, name, subdivision_id, barangay_code')
      .single();

    if (insertError) {
      console.error('Error creating street:', insertError);
      return NextResponse.json({
        error: `Failed to create street: ${insertError.message}`
      }, { status: 500 });
    }

    // Transform to expected format
    const streetOption = {
      value: newStreet.id,
      label: newStreet.name,
      subdivision_id: newStreet.subdivision_id,
      barangay_code: newStreet.barangay_code,
    };

    return NextResponse.json({
      data: streetOption,
      message: 'Street created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Streets POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
