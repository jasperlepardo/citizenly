/**
 * Households API Route
 * Updated to comply with API Design Standards
 */

import { NextRequest } from 'next/server';
import { withAuth, applyGeographicFilter, createAdminSupabaseClient } from '@/lib/api-auth';
import { createRateLimitHandler, RATE_LIMIT_RULES } from '@/lib/rate-limit';
import { createHouseholdSchema } from '@/lib/api-validation';
import {
  createPaginatedResponse,
  createCreatedResponse,
  createValidationErrorResponse,
  processSearchParams,
  applySearchFilter,
  withErrorHandling,
  withSecurityHeaders
} from '@/lib/api-responses';
import { auditDataOperation } from '@/lib/api-audit';
import { RequestContext } from '@/lib/api-types';
import { z } from 'zod';

// Type the auth result properly
interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  barangayCode?: string;
  cityCode?: string;
  provinceCode?: string;
  regionCode?: string;
}

// GET /api/households - List households with pagination and search
export const GET = withSecurityHeaders(
  withAuth(
    { requiredPermissions: ['households.manage.barangay', 'households.manage.city', 'households.manage.province', 'households.manage.region', 'households.manage.all'] },
    withErrorHandling(async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
      // Apply rate limiting
      const rateLimitResponse = await createRateLimitHandler('SEARCH_RESIDENTS')(request, user.id);
      if (rateLimitResponse) return rateLimitResponse;

      // Process search parameters safely
      const { search, page, limit, offset } = await processSearchParams(
        new URL(request.url).searchParams,
        context
      );

      const supabaseAdmin = createAdminSupabaseClient();

      // Build base query using the optimized view
      let query = supabaseAdmin
        .from('api_households_with_members')
        .select('*', { count: 'exact' })
        .order('code', { ascending: true });

      // Apply geographic filtering based on user's access level
      query = applyGeographicFilter(query, user);

      // Apply search filter if provided
      if (search) {
        query = applySearchFilter(query, search, [
          'code',
          'street_name'
        ]);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data: households, error, count } = await query;

      if (error) {
        // Re-throw error to be handled by withErrorHandling wrapper
        throw error;
      }

      // Audit the data access
      await auditDataOperation('view', 'household', 'list', context, {
        searchTerm: search,
        resultCount: households?.length || 0,
        totalCount: count || 0
      });

      return createPaginatedResponse(
        households || [],
        { page, limit, total: count || 0 },
        'Households retrieved successfully',
        context
      );
    })
  )
);

// POST /api/households - Create new household
export const POST = withSecurityHeaders(
  withAuth(
    { requiredPermissions: ['households.manage.barangay', 'households.manage.city', 'households.manage.province', 'households.manage.region', 'households.manage.all'] },
    withErrorHandling(async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
      // Apply rate limiting
      const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
      if (rateLimitResponse) return rateLimitResponse;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = createHouseholdSchema.safeParse(body);

      if (!validationResult.success) {
        return createValidationErrorResponse(
          validationResult.error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          })),
          context
        );
      }

      const householdData = validationResult.data;

      // Use user's geographic codes if not provided
      const effectiveBarangayCode = householdData.barangayCode || user.barangayCode;
      if (!effectiveBarangayCode) {
        return createValidationErrorResponse(
          [{ field: 'barangayCode', message: 'Barangay code is required' }],
          context
        );
      }

      const supabaseAdmin = createAdminSupabaseClient();

      // Prepare data for insertion
      const insertData = {
        code: householdData.code,
        street_name: householdData.streetName || null,
        subdivision_name: householdData.subdivisionName || null,
        household_number: householdData.householdNumber || null,
        barangay_code: effectiveBarangayCode,
        city_municipality_code: householdData.cityMunicipalityCode || user.cityCode || null,
        province_code: householdData.provinceCode || user.provinceCode || null,
        region_code: householdData.regionCode || user.regionCode || null,
        head_resident_id: householdData.headResidentId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert household
      const { data: newHousehold, error: insertError } = await supabaseAdmin
        .from('households')
        .insert([insertData])
        .select('*')
        .single();

      if (insertError) {
        // Re-throw error to be handled by withErrorHandling wrapper
        throw insertError;
      }

      // Audit the creation
      await auditDataOperation('create', 'household', newHousehold.id, context, {
        barangayCode: effectiveBarangayCode,
        householdCode: householdData.code
      });

      return createCreatedResponse(
        {
          household: newHousehold
        },
        'Household created successfully',
        context
      );
    })
  )
);

// Export rate limiting rules for this endpoint
// export const rateLimitConfig = {
//   GET: RATE_LIMIT_RULES.SEARCH_RESIDENTS,
//   POST: RATE_LIMIT_RULES.RESIDENT_CREATE
// };