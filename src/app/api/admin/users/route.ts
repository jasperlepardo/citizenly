import { NextRequest, NextResponse } from 'next/server';

import { createPublicSupabaseClient, createAdminSupabaseClient } from '@/lib/data/client-factory';

// CreateUserData moved to src/types/api-requests.ts for consolidation
import type { CreateUserData } from '@/types/api-requests';

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();

    // Type the userData properly
    const userData: CreateUserData = {
      email: rawData.email,
      password: rawData.password,
      firstName: rawData.firstName,
      lastName: rawData.lastName,
      mobileNumber: rawData.mobileNumber,
      barangayCode: rawData.barangayCode,
      roleId: rawData.roleId,
    };

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }

    const supabase = createPublicSupabaseClient();

    // Verify the user token and check admin permissions
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing service role key configuration' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // Check if current user has admin permissions
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Get the role name separately
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('name')
      .eq('id', (userProfile as any).role_id)
      .single();

    if (roleError || !userRole) {
      return NextResponse.json({ error: 'User role not found' }, { status: 400 });
    }

    // Check if user has admin role (assuming 'admin' or 'super_admin' role names)
    const roleName = (userRole as { name: string }).name;
    if (!roleName || !['admin', 'super_admin'].includes(roleName)) {
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
      phone: userData.mobileNumber || null,
      barangay_code: userData.barangayCode || null,
      role_id: userData.roleId,
      is_active: true,
      created_at: new Date().toISOString(),
    } as const;

    const { error: profileInsertError } = await supabaseAdmin
      .from('auth_user_profiles')
      .insert(profileData as any);

    if (profileInsertError) {
      console.error('Profile creation error:', profileInsertError);
      // Try to clean up the created user account (best-effort)
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      } catch (cleanupErr) {
        console.warn('Cleanup failed (deleteUser):', cleanupErr);
      }
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    // Create barangay account if specified
    if (userData.barangayCode) {
      const barangayAccountData = {
        user_id: newUser.user.id,
        barangay_code: userData.barangayCode,
        is_primary: true,
        created_at: new Date().toISOString(),
      } as const;

      const { error: barangayAccountError } = await supabaseAdmin
        .from('auth_barangay_accounts')
        .insert(barangayAccountData as any);

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
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get('pageSize') || '20', 10) || 20)
    );

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }

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
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing service role key configuration' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // Check if current user has admin permissions
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Get the role name separately
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('name')
      .eq('id', (userProfile as any).role_id)
      .single();

    if (roleError || !userRole) {
      return NextResponse.json({ error: 'User role not found' }, { status: 400 });
    }

    // Check if user has admin role
    const roleName = (userRole as { name: string }).name;
    if (!roleName || !['admin', 'super_admin'].includes(roleName)) {
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
      .from('auth_user_profiles')
      .select(
        `
        *,
        barangay_accounts(barangay_code)
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    // If we got users, fetch their role names separately
    if (users && users.length > 0) {
      const roleIds = Array.from(new Set((users as any[]).map(u => u.role_id).filter(Boolean)));
      if (roleIds.length > 0) {
        const { data: rolesData } = await supabaseAdmin
          .from('auth_roles')
          .select('id, name')
          .in('id', roleIds);

        if (rolesData) {
          const roleMap = Object.fromEntries((rolesData as any[]).map(r => [r.id, r.name]));
          (users as any[]).forEach(user => {
            user.role_name = user.role_id ? roleMap[user.role_id] : null;
          });
        }
      }
    }

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
