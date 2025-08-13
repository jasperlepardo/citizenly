/**
 * Residents API Route
 * Updated to comply with API Design Standards
 */

import { NextRequest } from 'next/server';
import { withAuth, applyGeographicFilter, createAdminSupabaseClient } from '@/lib/api-auth';
import { createRateLimitHandler, RATE_LIMIT_RULES } from '@/lib/rate-limit';
import { createResidentSchema } from '@/lib/api-validation';
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
import { logger, logError } from '@/lib/secure-logger';

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

// GET /api/residents - List residents with pagination and search
export const GET = withSecurityHeaders(
  withAuth(
    { requiredPermissions: ['residents.manage.barangay', 'residents.manage.city', 'residents.manage.province', 'residents.manage.region', 'residents.manage.all'] },
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

      // Build base query with proper field selection
      let query = supabaseAdmin
        .from('residents')
        .select(
          `id, 
           first_name, 
           middle_name, 
           last_name, 
           birthdate, 
           sex, 
           barangay_code, 
           city_municipality_code, 
           province_code, 
           region_code, 
           created_at`,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      // Apply geographic filtering based on user's access level
      query = applyGeographicFilter(query, user);

      // Apply search filter if provided
      if (search) {
        query = applySearchFilter(query, search, [
          'first_name',
          'middle_name', 
          'last_name',
          'email'
        ]);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data: residents, error, count } = await query;

      if (error) {
        logError('Residents query error', error);
        throw error;
      }

      // Audit the data access
      await auditDataOperation('view', 'resident', 'list', context, {
        searchTerm: search,
        resultCount: residents?.length || 0,
        totalCount: count || 0
      });

      return createPaginatedResponse(
        residents || [],
        { page, limit, total: count || 0 },
        'Residents retrieved successfully',
        context
      );
    })
  )
);

// POST /api/residents - Create new resident
export const POST = withSecurityHeaders(
  withAuth(
    { requiredPermissions: ['residents.manage.barangay', 'residents.manage.city', 'residents.manage.province', 'residents.manage.region', 'residents.manage.all'] },
    withErrorHandling(async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
      // Apply rate limiting
      const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
      if (rateLimitResponse) return rateLimitResponse;

      // Parse and validate request body
      const body = await request.json();
      logger.debug('Received create resident request', { hasBody: !!body });
      
      const validationResult = createResidentSchema.safeParse(body);

      if (!validationResult.success) {
        logger.error('Resident validation failed', { 
          issueCount: validationResult.error.issues.length,
          hasIssues: !!validationResult.error.issues
        });
        return createValidationErrorResponse(
          validationResult.error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          })),
          context
        );
      }

      const residentData = validationResult.data;

      // Use user's barangay code if not provided
      const effectiveBarangayCode = residentData.barangayCode || user.barangayCode;
      if (!effectiveBarangayCode) {
        return createValidationErrorResponse(
          [{ field: 'barangayCode', message: 'Barangay code is required' }],
          context
        );
      }

      const supabaseAdmin = createAdminSupabaseClient();

      // Prepare data for insertion
      const insertData = {
        // Required fields
        first_name: residentData.firstName,
        last_name: residentData.lastName,
        birthdate: residentData.birthdate,
        sex: residentData.sex,
        barangay_code: effectiveBarangayCode,
        
        // Optional fields
        middle_name: residentData.middleName || null,
        extension_name: residentData.extensionName || null,
        mobile_number: residentData.mobileNumber || null,
        telephone_number: residentData.telephoneNumber || null,
        email: residentData.email || null,
        mother_maiden_first: residentData.motherMaidenFirstName || null,
        mother_maiden_middle: residentData.motherMaidenMiddleName || null,
        mother_maiden_last: residentData.motherMaidenLastName || null,
        birth_place_code: residentData.birthPlaceCode || null,
        birth_place_level: residentData.birthPlaceLevel || null,
        birth_place_name: residentData.birthPlaceName || null,
        household_code: residentData.householdCode || null,
        city_municipality_code: residentData.cityMunicipalityCode || user.cityCode || null,
        province_code: residentData.provinceCode || user.provinceCode || null,
        region_code: residentData.regionCode || user.regionCode || null,
        zip_code: residentData.zipCode || null,
        
        // Additional fields with defaults
        civil_status: residentData.civilStatus,
        citizenship: residentData.citizenship,
        blood_type: residentData.bloodType,
        ethnicity: residentData.ethnicity,
        religion: residentData.religion,
        religion_others_specify: residentData.religionOthersSpecify || null,
        employment_status: residentData.employmentStatus,
        education_attainment: residentData.educationAttainment || null,
        is_graduate: residentData.isGraduate,
        psoc_code: residentData.psocCode || null,
        psoc_level: residentData.psocLevel || null,
        occupation_title: residentData.occupationTitle || null,
        height: residentData.height ? parseFloat(residentData.height) : null,
        weight: residentData.weight ? parseFloat(residentData.weight) : null,
        complexion: residentData.complexion || null,
        philsys_card_number: residentData.philsysCardNumber || null,
        is_voter: residentData.isVoter,
        is_resident_voter: residentData.isResidentVoter,
        last_voted_date: residentData.lastVotedDate || null,
        is_active: true,
        created_by: user.id,
        updated_by: user.id
      };

      // Insert resident
      const { data: newResident, error: insertError } = await supabaseAdmin
        .from('residents')
        .insert([insertData])
        .select('id, first_name, last_name, birthdate, sex, barangay_code, created_at')
        .single();

      if (insertError) {
        logError('Resident creation error', insertError);
        throw insertError;
      }

      // Audit the creation
      await auditDataOperation('create', 'resident', newResident.id, context, {
        barangayCode: effectiveBarangayCode,
        fullName: `${residentData.firstName} ${residentData.lastName}`
      });

      return createCreatedResponse(
        {
          resident_id: newResident.id,
          resident: newResident
        },
        'Resident created successfully',
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