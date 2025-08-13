import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create Supabase client for user verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role for checks
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[RBI Preflight] Checking system state for user:', user.id);

    // Check 1: Active encryption key
    const { data: encryptionKey, error: keyError } = await supabaseAdmin
      .from('system_encryption_keys')
      .select('key_name, is_active')
      .eq('key_name', 'pii_master_key')
      .eq('is_active', true)
      .single();

    // Check 2: User has barangay assignment via profile (simpler and consistent with API)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    // Check 3: Function existence (attempt simple no-op call with bogus params to test availability)
    let funcExists = true;
    let funcError: any = null;
    try {
      // Minimal safe call that should fail on validation but confirm function exists in schema
      await supabaseAdmin.rpc('insert_resident_encrypted', {
        p_first_name: 'X',
        p_last_name: 'Y',
        p_birthdate: '2000-01-01',
        p_sex: 'male',
        p_barangay_code: profile?.barangay_code || null
      });
    } catch (e: any) {
      const message = (e?.message || '').toLowerCase();
      if (message.includes('function') && message.includes('does not exist')) {
        funcExists = false;
        funcError = e?.message;
      } else {
        // Function exists; we ignore expected validation/rls errors
        funcExists = true;
        funcError = null;
      }
    }

    return NextResponse.json({
      user_id: user.id,
      preflight_checks: {
        encryption_key: {
          exists: !!encryptionKey,
          error: keyError?.message || null,
          data: encryptionKey
        },
        profile_barangay: {
          code: profile?.barangay_code || null,
          error: profileError?.message || null
        },
        function_check: {
          exists: funcExists,
          error: funcError,
        }
      },
      diagnosis: {
        ready_for_rbi: !!encryptionKey && !!profile?.barangay_code && funcExists,
        issues: [
          !encryptionKey ? 'Missing active pii_master_key' : null,
          !profile?.barangay_code ? 'No barangay assigned on profile' : null,
          !funcExists ? 'insert_resident_encrypted function not available' : null
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error('[RBI Preflight] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}