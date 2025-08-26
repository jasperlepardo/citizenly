import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Bulk operations validation schema
const bulkOperationSchema = z.object({
  operation: z.enum(['delete', 'activate', 'deactivate', 'update_sectoral']),
  resident_ids: z.array(z.string().uuid()).min(1).max(100), // Limit to 100 at a time
  data: z.object({}).optional(), // Additional data for update operations
});

// POST /api/residents/bulk - Perform bulk operations on residents
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Validate request data
    const validationResult = bulkOperationSchema.safeParse(requestData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { operation, resident_ids, data } = validationResult.data;

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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile to verify barangay access
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Verify all residents belong to user's barangay
    const { data: accessibleResidents, error: accessError } = await supabaseAdmin
      .from('residents')
      .select(
        `
        id,
        first_name,
        last_name,
        households!inner(barangay_code)
      `
      )
      .in('id', resident_ids)
      .eq('households.barangay_code', userProfile.barangay_code);

    if (accessError) {
      console.error('Access check error:', accessError);
      return NextResponse.json({ error: 'Failed to verify resident access' }, { status: 500 });
    }

    if (!accessibleResidents || accessibleResidents.length !== resident_ids.length) {
      return NextResponse.json(
        {
          error: 'Some residents not found or access denied',
          accessible_count: accessibleResidents?.length || 0,
          requested_count: resident_ids.length,
        },
        { status: 403 }
      );
    }

    // Perform bulk operation
    let results: any = {};
    let affectedCount = 0;

    switch (operation) {
      case 'delete':
        // Soft delete residents
        const { error: deleteError } = await supabaseAdmin
          .from('residents')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .in('id', resident_ids);

        if (deleteError) {
          console.error('Bulk delete error:', deleteError);
          return NextResponse.json({ error: 'Failed to delete residents' }, { status: 500 });
        }

        results = { operation: 'soft_delete', affected_residents: resident_ids.length };
        affectedCount = resident_ids.length;
        break;

      case 'activate':
        const { error: activateError } = await supabaseAdmin
          .from('residents')
          .update({
            is_active: true,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .in('id', resident_ids);

        if (activateError) {
          console.error('Bulk activate error:', activateError);
          return NextResponse.json({ error: 'Failed to activate residents' }, { status: 500 });
        }

        results = { operation: 'activate', affected_residents: resident_ids.length };
        affectedCount = resident_ids.length;
        break;

      case 'deactivate':
        const { error: deactivateError } = await supabaseAdmin
          .from('residents')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .in('id', resident_ids);

        if (deactivateError) {
          console.error('Bulk deactivate error:', deactivateError);
          return NextResponse.json({ error: 'Failed to deactivate residents' }, { status: 500 });
        }

        results = { operation: 'deactivate', affected_residents: resident_ids.length };
        affectedCount = resident_ids.length;
        break;

      case 'update_sectoral':
        if (!data) {
          return NextResponse.json(
            { error: 'Sectoral data required for update_sectoral operation' },
            { status: 400 }
          );
        }

        // Update or create sectoral information for multiple residents
        const sectoralUpdates = resident_ids.map(residentId => ({
          resident_id: residentId,
          ...data,
          updated_at: new Date().toISOString(),
        }));

        const { error: sectoralError } = await supabaseAdmin
          .from('resident_sectoral_info')
          .upsert(sectoralUpdates, {
            onConflict: 'resident_id',
            ignoreDuplicates: false,
          });

        if (sectoralError) {
          console.error('Bulk sectoral update error:', sectoralError);
          return NextResponse.json(
            { error: 'Failed to update sectoral information' },
            { status: 500 }
          );
        }

        results = { operation: 'update_sectoral', affected_residents: resident_ids.length };
        affectedCount = resident_ids.length;
        break;

      default:
        return NextResponse.json({ error: 'Unsupported operation' }, { status: 400 });
    }

    // Log the bulk operation
    console.log('Bulk operation completed:', {
      operation,
      userId: user.id,
      residentCount: resident_ids.length,
      affectedCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: `Bulk ${operation} completed successfully`,
      results,
      summary: {
        requested_residents: resident_ids.length,
        affected_residents: affectedCount,
        operation: operation,
        processed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Bulk operation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/residents/bulk/status - Get status of bulk operations (placeholder for future enhancement)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Bulk operations status endpoint',
    supported_operations: ['delete', 'activate', 'deactivate', 'update_sectoral'],
    max_residents_per_operation: 100,
    note: 'Use POST to /api/residents/bulk to perform bulk operations',
  });
}
