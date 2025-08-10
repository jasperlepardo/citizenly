import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const residentData = await request.json();

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to bypass RLS for this specific operation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user profile to get barangay_code
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Ensure resident is created in user's barangay
    const newResidentData = {
      ...residentData,
      barangay_code: userProfile.barangay_code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    const { data: newResident, error: createError } = await supabaseAdmin
      .from('residents')
      .insert([newResidentData])
      .select()
      .single();

    if (createError) {
      console.error('Resident creation error:', createError);
      return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 });
    }

    return NextResponse.json(
      {
        resident: newResident,
        message: 'Resident created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Resident creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const searchTerm = searchParams.get('search') || '';

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to bypass RLS for this specific query
    // This is safe because we've already verified the user's authentication
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user profile to get barangay_code
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Build the query
    let query = supabaseAdmin
      .from('residents')
      .select(
        `*, household:households!residents_household_code_fkey(code, street_name, house_number, subdivision)`,
        { count: 'exact' }
      )
      .eq('barangay_code', userProfile.barangay_code)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Add search if provided
    if (searchTerm.trim()) {
      // Search in name fields and email
      query = query.or(
        `first_name.ilike.%${searchTerm}%,middle_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    // Add pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: residents, error: residentsError, count } = await query;

    if (residentsError) {
      console.error('Residents query error:', residentsError);
      return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
    }

    return NextResponse.json({
      data: residents || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('Residents API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
