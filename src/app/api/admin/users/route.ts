import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

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

    // Verify the user token and check admin permissions
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Check if current user has admin permissions
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role_id, roles!inner(name)')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Check if user has admin role (assuming 'admin' or 'super_admin' role names)
    const userRole = (userProfile.roles as any)?.name;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions - Admin role required' },
        { status: 403 }
      );
    }

    // Create the new user account via Supabase Admin API
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email for admin-created users
    });

    if (createUserError) {
      console.error('User creation error:', createUserError);
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user returned' },
        { status: 500 }
      );
    }

    // Create user profile
    const profileData = {
      id: newUser.user.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      barangay_code: userData.barangayCode,
      role_id: userData.roleId,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: profileInsertError } = await supabaseAdmin.from('user_profiles').insert(profileData);

    if (profileInsertError) {
      console.error('Profile creation error:', profileInsertError);
      // Try to clean up the created user account
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    // Create barangay account if specified
    if (userData.barangayCode && userData.roleId) {
      const { error: barangayAccountError } = await supabaseAdmin.from('barangay_accounts').insert({
        user_id: newUser.user.id,
        barangay_code: userData.barangayCode,
        role_id: userData.roleId,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      if (barangayAccountError) {
        console.warn('Barangay account creation failed:', barangayAccountError);
        // Don't fail the entire operation, just log the warning
      }
    }

    return NextResponse.json(
      {
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          profile: profileData,
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin user creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

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

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Check if current user has admin permissions
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role_id, roles!inner(name)')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Check if user has admin role
    const userRole = (userProfile.roles as any)?.name;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions - Admin role required' },
        { status: 403 }
      );
    }

    // Get users list with pagination
    const {
      data: users,
      error: usersError,
      count,
    } = await supabaseAdmin
      .from('user_profiles')
      .select(
        `
        *,
        roles(name),
        barangay_accounts(barangay_code)
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (usersError) {
      console.error('Users query error:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      data: users || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('Admin users list API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
