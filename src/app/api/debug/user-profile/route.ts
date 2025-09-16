import { NextResponse } from 'next/server';
import { supabase } from '@/lib/data/supabase';

export async function GET() {
  try {
    console.log('Debug: Checking user profile and access level...');
    
    // Get the current session to get user ID
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ 
        error: 'No active session', 
        details: sessionError?.message 
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('Debug: User ID:', userId);

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('auth_user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Debug: Error querying user profile:', profileError);
      return NextResponse.json({ 
        error: profileError.message, 
        code: profileError.code,
        details: profileError.details 
      }, { status: 500 });
    }

    // Test RLS functions by calling them directly
    const { data: accessLevel, error: accessError } = await supabase
      .rpc('user_access_level');

    const { data: barangayCode, error: barangayError } = await supabase
      .rpc('user_barangay_code');

    console.log('Debug: User profile loaded:', !!userProfile);
    console.log('Debug: Access level result:', accessLevel);
    console.log('Debug: Barangay code result:', barangayCode);
    
    return NextResponse.json({
      userId,
      userProfile,
      accessLevel,
      barangayCode,
      rlsErrors: {
        accessError: accessError?.message,
        barangayError: barangayError?.message
      },
      message: 'User profile debug data'
    });

  } catch (err) {
    console.error('Debug: Exception in user profile debug:', err);
    return NextResponse.json({ 
      error: 'Debug endpoint error', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}