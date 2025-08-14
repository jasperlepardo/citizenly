import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { barangayCode } = await request.json();

    if (!barangayCode) {
      return NextResponse.json({ error: 'Missing barangayCode' }, { status: 400 });
    }

    // Get the barangay_admin role ID
    const { data: adminRole } = await supabaseAdmin
      .from('auth_roles')
      .select('id')
      .eq('name', 'barangay_admin')
      .single();

    if (!adminRole) {
      return NextResponse.json({ hasAdmin: false });
    }

    // Check for existing admin in this barangay
    const { data: existingAdmin } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('id')
      .eq('barangay_code', barangayCode)
      .eq('role_id', adminRole.id)
      .eq('is_active', true);

    const hasAdmin = existingAdmin && existingAdmin.length > 0;

    return NextResponse.json({ hasAdmin });
  } catch (error) {
    console.error('Error checking barangay admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
