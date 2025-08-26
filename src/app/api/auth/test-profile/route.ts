import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib';

interface TestResults {
  timestamp: string;
  userId: string;
  tests: {
    adminUserLookup?: {
      success: boolean;
      hasData?: boolean;
      hasUser?: boolean;
      error: string | null;
      confirmed?: boolean;
    };
    userInList?: {
      success: boolean;
      totalUsers?: number;
      userFound?: boolean;
      error: string | null;
    };
    existingProfile?: {
      success: boolean;
      profileExists?: boolean;
      error: string | null;
    };
    profileCreation?: {
      success: boolean;
      profileCreated?: boolean;
      error: string | null;
      errorCode?: string | null;
    };
  };
}

/**
 * Test endpoint to diagnose profile creation issues
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const body = await request.json();
    const { userId } = body;

    console.log('🧪 Testing profile creation for user:', { id: '[REDACTED]' });

    const results: TestResults = {
      timestamp: new Date().toISOString(),
      userId: '[REDACTED]',
      tests: {},
    };

    // Test 1: Admin client user lookup
    try {
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(userId);
      results.tests.adminUserLookup = {
        success: !!userData?.user,
        hasData: !!userData,
        hasUser: !!userData?.user,
        error: userError?.message || null,
        confirmed: userData?.user?.email_confirmed_at ? true : false,
      };
    } catch (error) {
      results.tests.adminUserLookup = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 2: List all users to see if user exists
    try {
      const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      const userInList = allUsers?.users?.find(u => u.id === userId);
      results.tests.userInList = {
        success: !listError,
        totalUsers: allUsers?.users?.length || 0,
        userFound: !!userInList,
        error: listError?.message || null,
      };
    } catch (error) {
      results.tests.userInList = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 3: Check if profile already exists
    try {
      const { data: existingProfile, error: profileError } = await supabaseAdmin
        .from('auth_user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      results.tests.existingProfile = {
        success: !profileError,
        profileExists: !!existingProfile,
        error: profileError?.message || null,
      };
    } catch (error) {
      results.tests.existingProfile = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 4: Try to create minimal profile
    try {
      const minimalProfile = {
        id: userId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role_id: '3fd5bb4b-0f55-4e96-aa9f-69a63e783cc6', // barangay_admin from debug output
        is_active: true,
      };

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('auth_user_profiles')
        .upsert(minimalProfile)
        .select()
        .single();

      results.tests.profileCreation = {
        success: !createError,
        profileCreated: !!createdProfile,
        error: createError?.message || null,
        errorCode: createError?.code || null,
      };
    } catch (error) {
      results.tests.profileCreation = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    return NextResponse.json({
      message: 'Profile creation test completed',
      results,
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      {
        error: 'Test API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
