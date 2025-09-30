import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration:', {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey,
  });
}

// Create Supabase client with service role key for admin operations
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available - missing environment variables');
      return NextResponse.json({ error: 'Service configuration error' }, { status: 500 });
    }

    const { userId, barangayCode } = await request.json();

    if (!userId || !barangayCode) {
      return NextResponse.json({ error: 'Missing userId or barangayCode' }, { status: 400 });
    }

    // Get the barangay_admin role
    const { data: role, error: roleError } = await supabaseAdmin
      .from('auth_roles')
      .select('id, name')
      .eq('name', 'barangay_admin')
      .single();

    if (roleError || !role) {
      console.error('Failed to get barangay_admin role:', roleError);
      return NextResponse.json(
        {
          error: 'Could not find administrator role',
          details: roleError?.message || 'Role not found',
        },
        { status: 500 }
      );
    }

    // Check if barangay already has an admin
    const { data: existingAdmin } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('id')
      .eq('barangay_code', barangayCode)
      .eq('role_id', role.id)
      .eq('is_active', true);

    if (existingAdmin && existingAdmin.length > 0) {
      return NextResponse.json(
        { error: 'This barangay already has an administrator' },
        { status: 409 }
      );
    }

    // Return the role ID for the frontend to use
    return NextResponse.json({
      roleId: role.id,
      roleName: role.name,
      message: 'Role assigned successfully',
    });
  } catch (error) {
    console.error('Error in assign-role API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
