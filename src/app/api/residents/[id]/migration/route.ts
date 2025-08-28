import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createPublicSupabaseClient, createAdminSupabaseClient } from '@/lib/data/client-factory';
import { UserProfile, ResidentWithHousehold } from '@/types/api';

// Migration information validation schema
const migrationInfoSchema = z.object({
  previous_barangay_code: z.string().max(10).optional().or(z.literal('')),
  previous_city_municipality_code: z.string().max(10).optional().or(z.literal('')),
  previous_province_code: z.string().max(10).optional().or(z.literal('')),
  previous_region_code: z.string().max(10).optional().or(z.literal('')),
  date_of_transfer: z.string().optional().or(z.literal('')),
  reason_for_leaving: z.string().max(500).optional().or(z.literal('')),
  reason_for_transferring: z.string().max(500).optional().or(z.literal('')),
  length_of_stay_previous_months: z.number().int().min(0).optional(),
  duration_of_stay_current_months: z.number().int().min(0).optional(),
  is_intending_to_return: z.boolean().optional(),
});

// GET /api/residents/[id]/migration - Get migration information
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const residentId = resolvedParams.id;

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
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
    const supabaseAdmin = createAdminSupabaseClient() as any;

    // Get user profile to verify barangay access
    const profileResult = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    const userProfile = profileResult.data as UserProfile | null;
    const profileError = profileResult.error;

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Verify resident access through household
    const residentResult = await supabaseAdmin
      .from('residents')
      .select(
        `
        id,
        households!inner(barangay_code)
      `
      )
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code)
      .single();

    const resident = residentResult.data as ResidentWithHousehold | null;
    const residentError = residentResult.error;

    if (residentError || !resident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    // Get migration information
    const { data: migrationInfo, error: migrationError } = await supabaseAdmin
      .from('resident_migrant_info')
      .select('*')
      .eq('resident_id', residentId)
      .maybeSingle();

    if (migrationError) {
      console.error('Migration info query error:', migrationError);
      return NextResponse.json({ error: 'Failed to fetch migration information' }, { status: 500 });
    }

    return NextResponse.json({
      migrationInfo: migrationInfo || null,
      message: 'Migration information retrieved successfully',
    });
  } catch (error) {
    console.error('Migration info API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/residents/[id]/migration - Update migration information
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const residentId = resolvedParams.id;
    const migrationData = await request.json();

    // Validate migration data
    const validationResult = migrationInfoSchema.safeParse(migrationData);
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

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
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
    const supabaseAdmin = createAdminSupabaseClient() as any;

    // Get user profile to verify barangay access
    const profileResult = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    const userProfile = profileResult.data as UserProfile | null;
    const profileError = profileResult.error;

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Verify resident access through household
    const residentResult = await supabaseAdmin
      .from('residents')
      .select(
        `
        id,
        households!inner(barangay_code)
      `
      )
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code)
      .single();

    const resident = residentResult.data as ResidentWithHousehold | null;
    const residentError = residentResult.error;

    if (residentError || !resident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    // Check if migration record exists
    const { data: existingMigration, error: checkError } = await supabaseAdmin
      .from('resident_migrant_info')
      .select('id')
      .eq('resident_id', residentId)
      .maybeSingle();

    if (checkError) {
      console.error('Migration check error:', checkError);
      return NextResponse.json({ error: 'Failed to check migration information' }, { status: 500 });
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    if (existingMigration) {
      // Update existing record
      const { data: updatedMigration, error: updateError } = await supabaseAdmin
        .from('resident_migrant_info')
        .update(updateData as any)
        .eq('resident_id', residentId)
        .select()
        .single();

      if (updateError) {
        console.error('Migration update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update migration information' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        migrationInfo: updatedMigration,
        message: 'Migration information updated successfully',
      });
    } else {
      // Create new record
      const insertData = {
        resident_id: residentId,
        ...updateData,
        created_at: new Date().toISOString(),
      };

      const { data: newMigration, error: insertError } = await supabaseAdmin
        .from('resident_migrant_info')
        .insert(insertData as any)
        .select()
        .single();

      if (insertError) {
        console.error('Migration insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create migration information' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        migrationInfo: newMigration,
        message: 'Migration information created successfully',
      });
    }
  } catch (error) {
    console.error('Migration info API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/residents/[id]/migration - Delete migration information
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const residentId = resolvedParams.id;

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
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
    const supabaseAdmin = createAdminSupabaseClient() as any;

    // Get user profile to verify barangay access
    const profileResult = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    const userProfile = profileResult.data as UserProfile | null;
    const profileError = profileResult.error;

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Verify resident access through household
    const residentResult = await supabaseAdmin
      .from('residents')
      .select(
        `
        id,
        households!inner(barangay_code)
      `
      )
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code)
      .single();

    const resident = residentResult.data as ResidentWithHousehold | null;
    const residentError = residentResult.error;

    if (residentError || !resident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    // Delete migration information
    const { error: deleteError } = await supabaseAdmin
      .from('resident_migrant_info')
      .delete()
      .eq('resident_id', residentId);

    if (deleteError) {
      console.error('Migration delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete migration information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Migration information deleted successfully',
    });
  } catch (error) {
    console.error('Migration delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
