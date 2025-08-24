/**
 * Residents API Route
 * Updated to comply with API Design Standards
 */

import { NextRequest } from 'next/server';
import { withAuth, applyGeographicFilter, createAdminSupabaseClient, getAccessLevel } from '@/lib/api/authUtils';
import { createRateLimitHandler } from '@/lib/security/rate-limit';
import { createResidentSchema } from '@/lib/api/validationUtils';
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
import { ResidentFormData } from '@/types/residents';
import { z } from 'zod';
import { logger, logError } from '@/lib/logging/secure-logger';

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

// GET /api/residents - List residents with pagination and search
export const GET = withSecurityHeaders(
  withAuth(
    {
      requiredPermissions: [
        'residents.manage.barangay',
        'residents.manage.city',
        'residents.manage.province',
        'residents.manage.region',
        'residents.manage.all',
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

        // Build base query with proper field selection including sectoral info and household
        let query = supabaseAdmin
          .from('residents')
          .select(
            `id, 
           first_name, 
           middle_name, 
           last_name, 
           birthdate, 
           sex, 
           birth_place_code, 
           household_code,
           email,
           mobile_number,
           civil_status,
           occupation_code,
           created_at,
           households!inner(
             code,
             name,
             barangay_code,
             city_municipality_code,
             province_code,
             region_code,
             house_number,
             street_id,
             subdivision_id
           ),
           resident_sectoral_info(
             is_labor_force,
             is_labor_force_employed,
             is_unemployed,
             is_overseas_filipino_worker,
             is_person_with_disability,
             is_out_of_school_children,
             is_out_of_school_youth,
             is_senior_citizen,
             is_registered_senior_citizen,
             is_solo_parent,
             is_indigenous_people,
             is_migrant
           ),
           resident_migrant_info(
             previous_barangay_code,
             previous_city_municipality_code,
             previous_province_code,
             previous_region_code,
             date_of_transfer,
             is_intending_to_return
           )`,
            { count: 'exact' }
          )
          .order('created_at', { ascending: false });

        // Apply geographic filtering based on user's access level through households
        // First, we need to filter based on the household relationship
        const accessLevel = getAccessLevel(user.role);
        
        // Since we're using a foreign key join, we need to filter residents who have households in the right location
        // We'll add a filter that only includes residents with non-null household_code
        query = query.not('household_code', 'is', null);
        
        // Then apply the geographic filter based on the joined household data
        switch (accessLevel) {
          case 'barangay':
            if (user.barangayCode) {
              // Filter residents whose households are in the user's barangay
              query = query.eq('households.barangay_code', user.barangayCode);
            }
            break;
          case 'city':
            if (user.cityCode) {
              query = query.eq('households.city_municipality_code', user.cityCode);
            }
            break;
          case 'province':
            if (user.provinceCode) {
              query = query.eq('households.province_code', user.provinceCode);
            }
            break;
          case 'region':
            if (user.regionCode) {
              query = query.eq('households.region_code', user.regionCode);
            }
            break;
          case 'national':
            // No filtering for national access
            break;
        }

        // Apply search filter if provided
        if (search) {
          query = applySearchFilter(query, search, [
            'first_name',
            'middle_name',
            'last_name',
            'email',
          ]);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Execute query
        const { data: residents, error, count } = await query;

        if (error) {
          logError(new Error('Residents query error'), JSON.stringify(error));
          throw error;
        }

        // Audit the data access
        await auditDataOperation('view', 'resident', 'list', context, {
          searchTerm: search,
          resultCount: residents?.length || 0,
          totalCount: count || 0,
        });

        return createPaginatedResponse(
          residents || [],
          { page, limit, total: count || 0 },
          'Residents retrieved successfully',
          context
        );
      }
    )
  )
);

// POST /api/residents - Create new resident
export const POST = withSecurityHeaders(
  withAuth(
    {
      requiredPermissions: [
        'residents.manage.barangay',
        'residents.manage.city',
        'residents.manage.province',
        'residents.manage.region',
        'residents.manage.all',
      ],
    },
    withNextRequestErrorHandling(
      async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
        if (rateLimitResponse) return rateLimitResponse;

        // Parse and validate request body
        const body = await request.json();
        logger.debug('Received create resident request', { 
          hasBody: !!body,
          bodyKeys: Object.keys(body),
        });

        const validationResult = createResidentSchema.safeParse(body);

        if (!validationResult.success) {
          logger.error('Resident validation failed', {
            issueCount: validationResult.error.issues.length,
            hasIssues: !!validationResult.error.issues,
            employmentStatusIssues: validationResult.error.issues.filter(i => i.path.includes('employmentStatus')),
            allIssues: validationResult.error.issues.map(i => ({ 
              path: i.path, 
              message: i.message, 
              received: (i as any).received,
              expected: (i as any).expected,
              code: (i as any).code 
            })),
            detailedErrors: validationResult.error.format(),
          });
          return createValidationErrorResponse(
            validationResult.error.issues.map((err: z.ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
            context
          );
        }

        const residentData = validationResult.data as ResidentFormData;

        const supabaseAdmin = createAdminSupabaseClient();

        // Prepare data for insertion (using actual database schema)
        const insertData = {
          // Required fields
          first_name: residentData.firstName,
          last_name: residentData.lastName,
          birthdate: residentData.birthdate,
          sex: residentData.sex,

          // Optional fields (matching actual database schema)
          middle_name: residentData.middleName || null,
          extension_name: residentData.extensionName || null,
          mobile_number: residentData.mobileNumber || null,
          telephone_number: residentData.phoneNumber || residentData.telephoneNumber || null,
          email: residentData.email || null,
          mother_maiden_first: residentData.motherMaidenFirstName || null,
          mother_maiden_middle: residentData.motherMaidenMiddleName || null,
          mother_maiden_last: residentData.motherMaidenLastName || null,
          birth_place_code: residentData.birthPlaceCode || null,
          household_code: residentData.householdCode || null,

          // Additional fields with defaults
          civil_status: residentData.civilStatus,
          citizenship: residentData.citizenship,
          blood_type: residentData.bloodType,
          ethnicity: residentData.ethnicity,
          religion: residentData.religion,
          religion_others_specify: residentData.religionOthersSpecify || null,
          employment_status: residentData.employmentStatus,
          education_attainment: residentData.educationLevel || residentData.educationAttainment || null,
          is_graduate: residentData.isGraduate,
          occupation_code: residentData.occupationCode || null,
          height: residentData.height ? parseFloat(residentData.height) : null,
          weight: residentData.weight ? parseFloat(residentData.weight) : null,
          complexion: residentData.complexion || null,
          philsys_card_number: residentData.philsysCardNumber || null,
          is_voter: residentData.isVoter,
          is_resident_voter: residentData.isResidentVoter,
          last_voted_date: residentData.lastVotedDate && residentData.lastVotedDate !== '' ? residentData.lastVotedDate : null,
          is_active: true,
          created_by: user.id,
          updated_by: user.id,
        };

        // Insert resident
        const { data: newResident, error: insertError } = await supabaseAdmin
          .from('residents')
          .insert([insertData])
          .select('id, first_name, last_name, birthdate, sex, birth_place_code, created_at')
          .single();

        if (insertError) {
          logError(new Error('Resident creation error'), JSON.stringify(insertError));
          throw insertError;
        }

        // Insert sectoral information if provided
        if (residentData.isLaborForce !== undefined || 
            residentData.isLaborForceEmployed !== undefined ||
            residentData.isOverseasFilipinoWorker !== undefined ||
            residentData.isPersonWithDisability !== undefined ||
            residentData.isSeniorCitizen !== undefined ||
            residentData.isSoloParent !== undefined ||
            residentData.isIndigenousPeople !== undefined ||
            residentData.isMigrant !== undefined) {
          
          const sectoralData = {
            resident_id: newResident.id,
            is_labor_force: residentData.isLaborForce || false,
            is_labor_force_employed: residentData.isLaborForceEmployed || false,
            is_unemployed: residentData.isUnemployed || false,
            is_overseas_filipino_worker: residentData.isOverseasFilipinoWorker || false,
            is_person_with_disability: residentData.isPersonWithDisability || false,
            is_out_of_school_children: residentData.isOutOfSchoolChildren || false,
            is_out_of_school_youth: residentData.isOutOfSchoolYouth || false,
            is_senior_citizen: residentData.isSeniorCitizen || false,
            is_registered_senior_citizen: residentData.isRegisteredSeniorCitizen || false,
            is_solo_parent: residentData.isSoloParent || false,
            is_indigenous_people: residentData.isIndigenousPeople || false,
            is_migrant: residentData.isMigrant || false,
            created_by: user.id,
            updated_by: user.id,
          };

          const { error: sectoralError } = await supabaseAdmin
            .from('resident_sectoral_info')
            .insert([sectoralData]);

          if (sectoralError) {
            logError(new Error('Sectoral info creation error'), JSON.stringify(sectoralError));
            // Don't throw - sectoral data is optional
          }
        }

        // Insert migration information if provided
        if (residentData.isMigrant && (
            residentData.previousBarangayCode ||
            residentData.previousCityMunicipalityCode ||
            residentData.dateOfTransfer)) {
          
          const migrantData = {
            resident_id: newResident.id,
            previous_barangay_code: residentData.previousBarangayCode || null,
            previous_city_municipality_code: residentData.previousCityMunicipalityCode || null,
            previous_province_code: residentData.previousProvinceCode || null,
            previous_region_code: residentData.previousRegionCode || null,
            length_of_stay_previous_months: residentData.lengthOfStayPreviousMonths || null,
            reason_for_leaving: residentData.reasonForLeaving || null,
            date_of_transfer: residentData.dateOfTransfer || null,
            reason_for_transferring: residentData.reasonForTransferring || null,
            duration_of_stay_current_months: residentData.durationOfStayCurrentMonths || null,
            is_intending_to_return: residentData.isIntendingToReturn || false,
            created_by: user.id,
            updated_by: user.id,
          };

          const { error: migrantError } = await supabaseAdmin
            .from('resident_migrant_info')
            .insert([migrantData]);

          if (migrantError) {
            logError(new Error('Migrant info creation error'), JSON.stringify(migrantError));
            // Don't throw - migration data is optional
          }
        }

        // Audit the creation
        await auditDataOperation('create', 'resident', newResident.id, context, {
          fullName: `${residentData.firstName} ${residentData.lastName}`,
        });

        return createCreatedResponse(
          {
            resident_id: newResident.id,
            resident: newResident,
          },
          'Resident created successfully',
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
