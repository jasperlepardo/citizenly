/**
 * Households API Route
 * Updated to comply with API Design Standards
 */

import { NextRequest } from 'next/server';
import { withAuth, applyGeographicFilter, createAdminSupabaseClient } from '@/lib/api/authUtils';
import { createRateLimitHandler } from '@/lib/security/rate-limit';
import { createHouseholdSchema } from '@/services/api/validationUtils';
import {
  createPaginatedResponse,
  createCreatedResponse,
  createValidationErrorResponse,
  processSearchParams,
  applySearchFilter,
  withNextRequestErrorHandling,
  withSecurityHeaders,
} from '@/lib/api/responseUtils';
import { auditDataOperation } from '@/lib/api/auditUtils';
import { RequestContext, Role } from '@/lib/api/types';
import { z } from 'zod';

// Type the auth result properly
interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  barangayCode?: string;
  cityCode?: string;
  provinceCode?: string;
  regionCode?: string;
}

// GET /api/households - List households with pagination and search
export const GET = withSecurityHeaders(
  withAuth(
    {
      requiredPermissions: [
        'households.manage.barangay',
        'households.manage.city',
        'households.manage.province',
        'households.manage.region',
        'households.manage.all',
      ],
    },
    withNextRequestErrorHandling(
      async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('SEARCH_RESIDENTS')(
          request,
          user.id
        );
        if (rateLimitResponse) return rateLimitResponse;

        // Process search parameters safely
        const { search, page, limit, offset } = await processSearchParams(
          new URL(request.url).searchParams,
          context
        );

        const supabaseAdmin = createAdminSupabaseClient();

        // Build base query using exact database field names
        let query = supabaseAdmin
          .from('households')
          .select(`
            code,
            name,
            address,
            house_number,
            street_id,
            subdivision_id,
            barangay_code,
            city_municipality_code,
            province_code,
            region_code,
            zip_code,
            no_of_families,
            no_of_household_members,
            no_of_migrants,
            household_type,
            tenure_status,
            tenure_others_specify,
            household_unit,
            monthly_income,
            income_class,
            household_head_id,
            household_head_position,
            is_active,
            created_at,
            updated_at
          `, { count: 'exact' })
          .eq('is_active', true)
          .order('code', { ascending: true });

        // Apply geographic filtering based on user's access level
        query = applyGeographicFilter(query, user);

        // Apply search filter if provided
        if (search) {
          query = applySearchFilter(query, search, ['code', 'house_number']);
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
          totalCount: count || 0,
        });

        return createPaginatedResponse(
          households || [],
          { page, limit, total: count || 0 },
          'Households retrieved successfully',
          context
        );
      }
    )
  )
);

// POST /api/households - Create new household
export const POST = withSecurityHeaders(
  withAuth(
    {
      requiredPermissions: [
        'households.manage.barangay',
        'households.manage.city',
        'households.manage.province',
        'households.manage.region',
        'households.manage.all',
      ],
    },
    withNextRequestErrorHandling(
      async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
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
              message: err.message,
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

        // Prepare data for insertion - using exact database field names
        const insertData = {
          code: householdData.code,
          name: householdData.name || null,
          address: householdData.address || null,
          house_number: householdData.houseNumber,
          street_id: householdData.streetId, // UUID reference
          subdivision_id: householdData.subdivisionId || null, // UUID reference
          barangay_code: effectiveBarangayCode,
          city_municipality_code: householdData.cityMunicipalityCode || user.cityCode || null,
          province_code: householdData.provinceCode || user.provinceCode || null,
          region_code: householdData.regionCode || user.regionCode || null,
          zip_code: householdData.zipCode || null,
          no_of_families: householdData.noOfFamilies || 1,
          no_of_household_members: householdData.noOfHouseholdMembers || 0,
          no_of_migrants: householdData.noOfMigrants || 0,
          household_type: householdData.householdType || null,
          tenure_status: householdData.tenureStatus || null,
          tenure_others_specify: householdData.tenureOthersSpecify || null,
          household_unit: householdData.householdUnit || null,
          monthly_income: householdData.monthlyIncome || null,
          income_class: householdData.incomeClass || null,
          household_head_id: householdData.householdHeadId || null, // UUID reference
          household_head_position: householdData.householdHeadPosition || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
          householdCode: householdData.code,
        });

        return createCreatedResponse(
          {
            household: newHousehold,
          },
          'Household created successfully',
          context
        );
      }
    )
  )
);

// Export rate limiting rules for this endpoint
// export const rateLimitConfig = {
//   GET: RATE_LIMIT_RULES.SEARCH_RESIDENTS,
//   POST: RATE_LIMIT_RULES.RESIDENT_CREATE
// };
