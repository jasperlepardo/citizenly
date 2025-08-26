/**
 * Residents API Route
 * Updated to comply with API Design Standards
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ResidentRecord, ResidentMigrantInfo } from '@/types/database';
import { ResidentSectoralInfo } from '@/types/residents';

import {
  withAuth,
  applyGeographicFilter,
  createAdminSupabaseClient,
  getAccessLevel,
  logger,
  logError,
} from '@/lib';
import { auditDataOperation } from '@/lib/api/auditUtils';
import {
  createPaginatedResponse,
  createCreatedResponse,
  createValidationErrorResponse,
  processSearchParams,
  applySearchFilter,
  withNextRequestErrorHandling,
  withSecurityHeaders,
} from '@/lib/api/responseUtils';
import { RequestContext, Role } from '@/lib/api/types';
import { createResidentSchema } from '@/lib/api/validationUtils';
import { createRateLimitHandler } from '@/lib/security/rate-limit';
import { ResidentFormData } from '@/types';

// Type the auth result properly
interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  barangay_code?: string;
  city_code?: string;
  province_code?: string;
  region_code?: string;
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
             reason_for_migration,
             is_intending_to_return,
             length_of_stay_previous_months,
             duration_of_stay_current_months,
             migration_type,
             is_whole_family_migrated
           )`,
            { count: 'exact' }
          )
          .order('created_at', { ascending: false });

        // Apply geographic filtering based on user's access level through households
        // All residents must have households, and filtering is done based on household location
        const accessLevel = getAccessLevel(user.role);

        // Ensure we only show residents with households and active residents (soft delete support)
        query = query.not('household_code', 'is', null).eq('is_active', true);

        // Apply geographic filter based on the joined household data
        switch (accessLevel) {
          case 'barangay':
            if (user.barangay_code) {
              // Filter residents whose households are in the user's barangay
              query = query.eq('households.barangay_code', user.barangay_code);
            }
            break;
          case 'city':
            if (user.city_code) {
              query = query.eq('households.city_municipality_code', user.city_code);
            }
            break;
          case 'province':
            if (user.province_code) {
              query = query.eq('households.province_code', user.province_code);
            }
            break;
          case 'region':
            if (user.region_code) {
              query = query.eq('households.region_code', user.region_code);
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

        // Execute query with count
        const { data: residents, error, count } = await query;

        // Handle count fallback if needed
        let actualCount = count || 0;
        if ((count || 0) === 0 && residents && residents.length > 0) {
          // Use data length as fallback count
          actualCount = residents.length;
        }

        if (error) {
          logError(new Error('Residents query error'), JSON.stringify(error));
          throw error;
        }

        // Audit the data access
        await auditDataOperation('view', 'resident', 'list', context, {
          searchTerm: search,
          resultCount: residents?.length || 0,
          totalCount: actualCount,
        });

        return createPaginatedResponse(
          residents || [],
          { page, limit, total: actualCount },
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
            employment_status_issues: validationResult.error.issues.filter(i =>
              i.path.includes('employment_status')
            ),
            allIssues: validationResult.error.issues.map(i => ({
              path: i.path,
              message: i.message,
              received: (i as any).received,
              expected: (i as any).expected,
              code: (i as any).code,
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

        // Prepare data for insertion (using exact database field names)
        const insertData = {
          // Required fields
          first_name: residentData.first_name,
          last_name: residentData.last_name,
          birthdate: residentData.birthdate,
          sex: residentData.sex,

          // Optional fields (using exact database field names)
          middle_name: residentData.middle_name || null,
          extension_name: residentData.extension_name || null,
          mobile_number: residentData.mobile_number || null,
          telephone_number: residentData.telephone_number || null,
          email: residentData.email || null,
          mother_maiden_first: residentData.mother_maiden_first || null,
          mother_maiden_middle: residentData.mother_maiden_middle || null,
          mother_maiden_last: residentData.mother_maiden_last || null,
          birth_place_code: residentData.birth_place_code || null,
          household_code: residentData.household_code,

          // Additional fields with defaults
          civil_status: residentData.civil_status || 'single',
          civil_status_others_specify: residentData.civil_status_others_specify || null,
          citizenship: residentData.citizenship || 'filipino',
          blood_type: residentData.blood_type || null,
          ethnicity: residentData.ethnicity || null,
          religion: residentData.religion || 'roman_catholic',
          religion_others_specify: residentData.religion_others_specify || null,
          employment_status: residentData.employment_status || null,
          education_attainment: residentData.education_attainment || null,
          is_graduate: residentData.is_graduate || false,
          occupation_code: residentData.occupation_code || null,
          height: residentData.height || null,
          weight: residentData.weight || null,
          complexion: residentData.complexion || null,
          philsys_card_number: residentData.philsys_card_number || null,
          is_voter: residentData.is_voter || null,
          is_resident_voter: residentData.is_resident_voter || null,
          last_voted_date:
            residentData.last_voted_date && residentData.last_voted_date !== ''
              ? residentData.last_voted_date
              : null,
          is_active: true,
          created_by: user.id,
          updated_by: user.id,
        };

        // Use a transaction-like approach by tracking operations for rollback
        let newResident = null;
        let sectoralRecordCreated = false;
        let migrationRecordCreated = false;

        try {
          // Insert resident
          const { data: resident, error: insertError } = await supabaseAdmin
            .from('residents')
            .insert([insertData])
            .select('id, first_name, last_name, birthdate, sex, birth_place_code, created_at')
            .single();

          if (insertError) {
            logError(new Error('Resident creation error'), JSON.stringify(insertError));
            throw insertError;
          }

          newResident = resident;

          // Handle sectoral information if provided
          const sectoralFields = [
            'is_labor_force_employed',
            'is_unemployed',
            'is_overseas_filipino_worker',
            'is_person_with_disability',
            'is_out_of_school_children',
            'is_out_of_school_youth',
            'is_senior_citizen',
            'is_registered_senior_citizen',
            'is_solo_parent',
            'is_indigenous_people',
            'is_migrant',
          ];

          const hasSectoralData = sectoralFields.some(field => field in residentData);

          if (hasSectoralData && newResident?.id) {
            const sectoralData: Partial<ResidentSectoralInfo> = {
              resident_id: newResident.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Add sectoral fields that are present
            sectoralFields.forEach(field => {
              if (field in residentData) {
                sectoralData[field as keyof ResidentSectoralInfo] = (residentData as Record<string, unknown>)[field] || false;
              }
            });

            const { error: sectoralError } = await supabaseAdmin
              .from('resident_sectoral_info')
              .insert(sectoralData);

            if (sectoralError) {
              console.error('Failed to create sectoral information:', sectoralError);
              throw new Error('Failed to create sectoral information');
            }

            sectoralRecordCreated = true;
          }

          // Handle migration information if provided
          const migrationFields = [
            'previous_barangay_code',
            'previous_city_municipality_code',
            'previous_province_code',
            'previous_region_code',
            'date_of_transfer',
            'reason_for_leaving',
            'reason_for_transferring',
            'length_of_stay_previous_months',
            'duration_of_stay_current_months',
            'is_intending_to_return',
          ];

          const hasMigrationData = migrationFields.some(
            field => field in residentData && (residentData as Record<string, unknown>)[field]
          );

          if (hasMigrationData && newResident?.id) {
            const migrationData: Partial<ResidentMigrantInfo> = {
              resident_id: newResident.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Add migration fields that are present and not empty
            migrationFields.forEach(field => {
              if (field in residentData && (residentData as Record<string, unknown>)[field]) {
                migrationData[field as keyof ResidentMigrantInfo] = (residentData as Record<string, unknown>)[field];
              }
            });

            const { error: migrationError } = await supabaseAdmin
              .from('resident_migrant_info')
              .insert(migrationData);

            if (migrationError) {
              console.error('Failed to create migration information:', migrationError);
              throw new Error('Failed to create migration information');
            }

            migrationRecordCreated = true;
          }
        } catch (transactionError) {
          // Rollback operations in reverse order
          console.error('Transaction error, rolling back:', transactionError);

          // Rollback migration info if created
          if (migrationRecordCreated && newResident?.id) {
            await supabaseAdmin
              .from('resident_migrant_info')
              .delete()
              .eq('resident_id', newResident.id);
          }

          // Rollback sectoral info if created
          if (sectoralRecordCreated && newResident?.id) {
            await supabaseAdmin
              .from('resident_sectoral_info')
              .delete()
              .eq('resident_id', newResident.id);
          }

          // Rollback resident if created
          if (newResident?.id) {
            await supabaseAdmin.from('residents').delete().eq('id', newResident.id);
          }

          throw transactionError;
        }

        // Audit the creation
        await auditDataOperation('create', 'resident', newResident.id, context, {
          fullName: `${residentData.first_name} ${residentData.last_name}`,
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
