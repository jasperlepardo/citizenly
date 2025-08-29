import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  withAuth,
  createAdminSupabaseClient,
  getAccessLevel,
  logger,
  logError,
  auditDataOperation,
  createSuccessResponse,
  createValidationErrorResponse,
  withNextRequestErrorHandling,
  withSecurityHeaders,
  createResidentSchema,
} from '@/lib';
import { RequestContext, Role } from '@/lib/authentication/types';
import { createRateLimitHandler } from '@/lib/security/rate-limit';
import { ResidentFormData } from '@/types';
import type { AuthenticatedUser } from '@/types/auth';

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
        // Extract params from the URL path since this is a dynamic route
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const residentId = pathSegments[pathSegments.length - 1];

        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('SEARCH_RESIDENTS')(
          request,
          user.id
        );
        if (rateLimitResponse) return rateLimitResponse;

        const supabaseAdmin = createAdminSupabaseClient() as any;

        // Get access level for geographic filtering
        const accessLevel = getAccessLevel(user.role);

        // Build query with geographic filtering
        let query = supabaseAdmin
          .from('residents')
          .select(
            `
            *,
            households!inner(
              code,
              barangay_code,
              name,
              address,
              house_number,
              street_id,
              subdivision_id,
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
              created_by,
              updated_by,
              created_at,
              updated_at
            )
          `
          )
          .eq('id', residentId)
          .eq('is_active', true);

        // Apply geographic filtering based on user's access level
        switch (accessLevel) {
          case 'barangay':
            if (user.barangayCode) {
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

        const { data: residentWithHousehold, error: residentError } = await query.single();

        if (residentError || !residentWithHousehold) {
          logError(new Error('Resident not found'), `ID: ${residentId}`);
          throw new Error('Resident not found or access denied');
        }

        // Get sectoral info separately to avoid join issues
        const { data: sectoralInfoArray, error: sectoralError } = await supabaseAdmin
          .from('resident_sectoral_info')
          .select('*')
          .eq('resident_id', residentId);

        // Handle the array result - take first record if exists
        const sectoralInfo =
          sectoralInfoArray && sectoralInfoArray.length > 0 ? sectoralInfoArray[0] : null;

        // Extract household info and merge with resident data
        const { households, ...residentData } = residentWithHousehold;

        const resident = {
          ...residentData,
          ...(sectoralInfo || {}),
        };
        const household = households;

        // Get geographic information
        let geoInfo = {};
        try {
          const { data: barangayData } = await supabaseAdmin
            .from('psgc_barangays')
            .select(
              `
          code,
          name,
          psgc_cities_municipalities!inner(
            code,
            name,
            type,
            psgc_provinces!inner(
              code,
              name,
              psgc_regions!inner(
                code,
                name
              )
            )
          )
          `
            )
            .eq('code', household.barangay_code)
            .single();

          if (barangayData) {
            const cityMunData = barangayData.psgc_cities_municipalities as any;
            const province = cityMunData.psgc_provinces;
            const region = province.psgc_regions;

            geoInfo = {
              barangay_info: {
                code: barangayData.code,
                name: barangayData.name,
              },
              city_municipality_info: {
                code: cityMunData.code,
                name: cityMunData.name,
                type: cityMunData.type,
              },
              province_info: {
                code: province.code,
                name: province.name,
              },
              region_info: {
                code: region.code,
                name: region.name,
              },
            };
          }
        } catch (geoError) {
          console.warn('Geographic info load failed:', geoError);
        }

        // Get birth place information if birth_place_code exists
        let birthPlaceInfo = {};
        if (resident.birth_place_code) {
          try {
            // Resolve from PSGC tables directly with hierarchical formatting
            // Try barangay first (most specific)
            const { data: barangayData } = await supabaseAdmin
              .from('psgc_barangays')
              .select(
                `
            code,
            name,
            psgc_cities_municipalities!inner(
              name,
              type,
              psgc_provinces!inner(name)
            )
          `
              )
              .eq('code', resident.birth_place_code)
              .maybeSingle();

            if (barangayData) {
              const city = barangayData.psgc_cities_municipalities as any;
              const province = city.psgc_provinces;
              birthPlaceInfo = {
                birth_place_info: {
                  code: barangayData.code,
                  name: `${city.name}, ${province.name}`,
                  level: 'barangay',
                },
              };
            } else {
              // Try city/municipality
              const { data: cityData } = await supabaseAdmin
                .from('psgc_cities_municipalities')
                .select(
                  `
              code,
              name,
              type,
              psgc_provinces!inner(name)
            `
                )
                .eq('code', resident.birth_place_code)
                .maybeSingle();

              if (cityData) {
                const province = cityData.psgc_provinces as any;
                birthPlaceInfo = {
                  birth_place_info: {
                    code: cityData.code,
                    name: `${cityData.name}, ${province.name}`,
                    level: 'city_municipality',
                    type: cityData.type, // Include the actual type (city or municipality)
                  },
                };
              } else {
                // Try province
                const { data: provinceData } = await supabaseAdmin
                  .from('psgc_provinces')
                  .select('code, name')
                  .eq('code', resident.birth_place_code)
                  .maybeSingle();

                if (provinceData) {
                  birthPlaceInfo = {
                    birth_place_info: {
                      code: provinceData.code,
                      name: provinceData.name,
                      level: 'province',
                    },
                  };
                } else {
                  // Try region (least specific)
                  const { data: regionData } = await supabaseAdmin
                    .from('psgc_regions')
                    .select('code, name')
                    .eq('code', resident.birth_place_code)
                    .maybeSingle();

                  if (regionData) {
                    birthPlaceInfo = {
                      birth_place_info: {
                        code: regionData.code,
                        name: regionData.name,
                        level: 'region',
                      },
                    };
                  } else {
                    // All fallbacks failed
                    console.warn('Could not resolve birth place:', resident.birth_place_code);
                  }
                }
              }
            }
          } catch (birthPlaceError) {
            console.warn('Birth place info load failed:', birthPlaceError);
          }
        }

        // Get occupation title and hierarchy if occupation_code exists
        let occupationInfo = {};
        if (resident.occupation_code) {
          try {
            const { data: psocData } = await supabaseAdmin
              .from('psoc_unified_search')
              .select(
                'psoc_code, occupation_title, display_text, psoc_level, level_name, parent_code, parent_title'
              )
              .eq('psoc_code', resident.occupation_code)
              .maybeSingle();

            if (psocData) {
              // Build the complete hierarchy from bottom to top
              const hierarchyParts = [];

              // Start with the occupation title
              hierarchyParts.push(psocData.occupation_title);

              // Add parent if it exists (Level 3)
              if (psocData.parent_title) {
                hierarchyParts.push(psocData.parent_title);
              }

              // For a complete hierarchy, we could traverse up further, but
              // showing occupation + immediate parent is usually sufficient
              // Full format: "Graphic And Multimedia Designers › Architects, Planners, Surveyors And Designers"
              const hierarchy = hierarchyParts.join(' › ');

              occupationInfo = {
                occupation_title: hierarchy,
                occupation_code_display: psocData.psoc_code, // Keep the code for reference
                occupation_level: psocData.level_name, // e.g., "Unit Group"
              };
            }
          } catch (occupationError) {
            console.warn('Occupation info load failed:', occupationError);
          }
        }

        // Audit the data access
        await auditDataOperation('view', 'resident', residentId, context, {
          fullName: `${resident.first_name || ''} ${resident.last_name || ''}`,
        });

        return createSuccessResponse(
          {
            resident: {
              ...resident,
              ...geoInfo,
              ...birthPlaceInfo,
              ...occupationInfo,
            },
            household,
          },
          'Resident retrieved successfully',
          context
        );
      }
    )
  )
);

export const PUT = withSecurityHeaders(
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
        // Extract params from the URL path since this is a dynamic route
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const residentId = pathSegments[pathSegments.length - 1];
        console.log('🔧 PUT /api/residents/[id] - Received request for resident ID:', residentId);

        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
        if (rateLimitResponse) return rateLimitResponse;

        // Parse and validate request body
        const body = await request.json();
        console.log('🔧 PUT /api/residents/[id] - Update data keys:', Object.keys(body));

        const validationResult = createResidentSchema.safeParse(body);

        if (!validationResult.success) {
          logger.error('Resident update validation failed', {
            issueCount: validationResult.error.issues.length,
            allIssues: validationResult.error.issues.map(i => ({
              path: i.path,
              message: i.message,
              code: (i as any).code,
            })),
          });
          return createValidationErrorResponse(
            validationResult.error.issues.map((err: z.ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
            context
          );
        }

        const updateData = validationResult.data as ResidentFormData;
        const supabaseAdmin = createAdminSupabaseClient() as any;

        // Get access level for geographic filtering
        const accessLevel = getAccessLevel(user.role);

        // Check if resident exists and user has access through household
        let checkQuery = supabaseAdmin
          .from('residents')
          .select(
            `
            id,
            household_code,
            households!inner(barangay_code, city_municipality_code, province_code, region_code)
          `
          )
          .eq('id', residentId)
          .eq('is_active', true);

        // Apply geographic filtering based on user's access level
        switch (accessLevel) {
          case 'barangay':
            if (user.barangayCode) {
              checkQuery = checkQuery.eq('households.barangay_code', user.barangayCode);
            }
            break;
          case 'city':
            if (user.cityCode) {
              checkQuery = checkQuery.eq('households.city_municipality_code', user.cityCode);
            }
            break;
          case 'province':
            if (user.provinceCode) {
              checkQuery = checkQuery.eq('households.province_code', user.provinceCode);
            }
            break;
          case 'region':
            if (user.regionCode) {
              checkQuery = checkQuery.eq('households.region_code', user.regionCode);
            }
            break;
          case 'national':
            // No filtering for national access
            break;
        }

        const { data: existingResident, error: checkError } = await checkQuery.single();

        if (checkError || !existingResident) {
          logError(new Error('Resident not found for update'), `ID: ${residentId}`);
          throw new Error('Resident not found or access denied');
        }

        // Separate sectoral data from main resident data
        const {
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
          is_migrant,
          ...mainResidentData
        } = updateData as ResidentFormData & {
          is_labor_force_employed?: boolean;
          is_unemployed?: boolean;
          is_overseas_filipino_worker?: boolean;
          is_person_with_disability?: boolean;
          is_out_of_school_children?: boolean;
          is_out_of_school_youth?: boolean;
          is_senior_citizen?: boolean;
          is_registered_senior_citizen?: boolean;
          is_solo_parent?: boolean;
          is_indigenous_people?: boolean;
          is_migrant?: boolean;
        };

        // Only include sectoral fields that are explicitly set (not undefined)
        const sectoralData: Record<string, boolean> = {};

        if (is_labor_force_employed !== undefined)
          sectoralData.is_labor_force_employed = is_labor_force_employed;
        if (is_unemployed !== undefined) sectoralData.is_unemployed = is_unemployed;
        if (is_overseas_filipino_worker !== undefined)
          sectoralData.is_overseas_filipino_worker = is_overseas_filipino_worker;
        if (is_person_with_disability !== undefined)
          sectoralData.is_person_with_disability = is_person_with_disability;
        if (is_out_of_school_children !== undefined)
          sectoralData.is_out_of_school_children = is_out_of_school_children;
        if (is_out_of_school_youth !== undefined)
          sectoralData.is_out_of_school_youth = is_out_of_school_youth;
        if (is_senior_citizen !== undefined) sectoralData.is_senior_citizen = is_senior_citizen;
        if (is_registered_senior_citizen !== undefined)
          sectoralData.is_registered_senior_citizen = is_registered_senior_citizen;
        if (is_solo_parent !== undefined) sectoralData.is_solo_parent = is_solo_parent;
        if (is_indigenous_people !== undefined)
          sectoralData.is_indigenous_people = is_indigenous_people;
        if (is_migrant !== undefined) sectoralData.is_migrant = is_migrant;

        // Prepare data for update with exact database field names
        const insertData = {
          // Required fields
          first_name: mainResidentData.first_name,
          last_name: mainResidentData.last_name,
          birthdate: mainResidentData.birthdate,
          sex: mainResidentData.sex,

          // Optional fields (using exact database field names)
          middle_name: mainResidentData.middle_name || null,
          extension_name: mainResidentData.extension_name || null,
          mobile_number: mainResidentData.mobile_number || null,
          telephone_number: mainResidentData.telephone_number || null,
          email: mainResidentData.email || null,
          mother_maiden_first: mainResidentData.mother_maiden_first || null,
          mother_maiden_middle: mainResidentData.mother_maiden_middle || null,
          mother_maiden_last: mainResidentData.mother_maiden_last || null,
          birth_place_code: mainResidentData.birth_place_code || null,
          household_code: mainResidentData.household_code,

          // Additional fields with defaults
          civil_status: mainResidentData.civil_status || 'single',
          civil_status_others_specify: mainResidentData.civil_status_others_specify || null,
          citizenship: mainResidentData.citizenship || 'filipino',
          blood_type: mainResidentData.blood_type || null,
          ethnicity: mainResidentData.ethnicity || null,
          religion: mainResidentData.religion || 'roman_catholic',
          religion_others_specify: mainResidentData.religion_others_specify || null,
          employment_status: mainResidentData.employment_status || null,
          education_attainment: mainResidentData.education_attainment || null,
          is_graduate: mainResidentData.is_graduate || false,
          occupation_code: mainResidentData.occupation_code || null,
          height: mainResidentData.height || null,
          weight: mainResidentData.weight || null,
          complexion: mainResidentData.complexion || null,
          philsys_card_number: mainResidentData.philsys_card_number || null,
          is_voter: mainResidentData.is_voter || null,
          is_resident_voter: mainResidentData.is_resident_voter || null,
          last_voted_date:
            mainResidentData.last_voted_date && mainResidentData.last_voted_date !== ''
              ? mainResidentData.last_voted_date
              : null,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        };

        // Update resident data (access already verified)
        const { data: updatedResident, error: updateError } = await supabaseAdmin
          .from('residents')
          .update(insertData)
          .eq('id', residentId)
          .select()
          .single();

        if (updateError) {
          logError(new Error('Resident update error'), JSON.stringify(updateError));
          throw updateError;
        }

        // Update sectoral information if any sectoral fields were provided
        if (Object.keys(sectoralData).length > 0) {
          // Check if sectoral record exists
          const { data: existingSectoral, error: checkError } = await supabaseAdmin
            .from('resident_sectoral_info')
            .select('resident_id')
            .eq('resident_id', residentId)
            .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record exists

          // Log the check result for debugging
          console.log('Sectoral record check:', {
            exists: !!existingSectoral,
            residentId,
            checkError: checkError?.message,
          });

          if (existingSectoral) {
            // Update existing sectoral record
            const { data: updatedData, error: sectoralUpdateError } = await supabaseAdmin
              .from('resident_sectoral_info')
              .update({
                ...sectoralData,
                updated_at: new Date().toISOString(),
              })
              .eq('resident_id', residentId)
              .select();

            if (sectoralUpdateError) {
              console.error('Sectoral update error:', {
                errorMessage: sectoralUpdateError.message,
                errorCode: sectoralUpdateError.code,
                data: sectoralData,
                residentId,
              });
              throw new Error(
                `Failed to update sectoral information: ${sectoralUpdateError.message || 'Unknown error'}`
              );
            }

            console.log('Successfully updated sectoral data:', updatedData);
          } else {
            // Create new sectoral record (table doesn't have created_by/updated_by columns)
            const sectoralInsertData = {
              resident_id: residentId,
              ...sectoralData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            console.log(
              'Attempting to insert sectoral data:',
              JSON.stringify(sectoralInsertData, null, 2)
            );

            const { data: insertedData, error: sectoralInsertError } = await supabaseAdmin
              .from('resident_sectoral_info')
              .insert(sectoralInsertData)
              .select();

            if (sectoralInsertError) {
              console.error('Sectoral insert error details:', {
                errorMessage: sectoralInsertError.message,
                errorCode: sectoralInsertError.code,
                errorDetails: sectoralInsertError.details,
                errorHint: sectoralInsertError.hint,
                data: sectoralInsertData,
                residentId,
              });
              throw new Error(
                `Failed to create sectoral information: ${sectoralInsertError.message || 'Unknown error'}`
              );
            }

            console.log('Successfully inserted sectoral data:', insertedData);
          }
        }

        if (!updatedResident) {
          throw new Error('Resident not found or access denied');
        }

        // Audit the update
        await auditDataOperation('update', 'resident', residentId, context, {
          fullName: `${mainResidentData.first_name || ''} ${mainResidentData.last_name || ''}`,
        });

        // Fetch the complete resident record with sectoral information for the response
        const { data: completeResident, error: fetchError } = await supabaseAdmin
          .from('residents')
          .select(
            `
            *,
            resident_sectoral_info (
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
            resident_migrant_info (
              previous_barangay_code,
              previous_city_municipality_code,
              previous_province_code,
              previous_region_code,
              length_of_stay_previous_months,
              reason_for_migration,
              date_of_transfer,
              duration_of_stay_current_months,
              is_intending_to_return
            )
          `
          )
          .eq('id', residentId)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError) {
          logger.warn('Error fetching complete resident record', fetchError);
          // Still return the basic record if fetch fails
          return createSuccessResponse(
            { resident: updatedResident },
            'Resident updated successfully',
            context
          );
        }

        return createSuccessResponse(
          { resident: completeResident || updatedResident },
          'Resident updated successfully',
          context
        );
      }
    )
  )
);

export const DELETE = withSecurityHeaders(
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
        // Extract params from the URL path since this is a dynamic route
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const residentId = pathSegments[pathSegments.length - 1];

        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
        if (rateLimitResponse) return rateLimitResponse;

        const supabaseAdmin = createAdminSupabaseClient() as any;
        const accessLevel = getAccessLevel(user.role);

        // Check if resident exists and user has access through household
        let checkQuery = supabaseAdmin
          .from('residents')
          .select(
            `
            id,
            household_code,
            first_name,
            last_name,
            households!inner(barangay_code, city_municipality_code, province_code, region_code)
          `
          )
          .eq('id', residentId)
          .eq('is_active', true);

        // Apply geographic filtering based on user's access level
        switch (accessLevel) {
          case 'barangay':
            if (user.barangayCode) {
              checkQuery = checkQuery.eq('households.barangay_code', user.barangayCode);
            }
            break;
          case 'city':
            if (user.cityCode) {
              checkQuery = checkQuery.eq('households.city_municipality_code', user.cityCode);
            }
            break;
          case 'province':
            if (user.provinceCode) {
              checkQuery = checkQuery.eq('households.province_code', user.provinceCode);
            }
            break;
          case 'region':
            if (user.regionCode) {
              checkQuery = checkQuery.eq('households.region_code', user.regionCode);
            }
            break;
          case 'national':
            // No filtering for national access
            break;
        }

        const { data: existingResident, error: checkError } = await checkQuery.single();

        if (checkError || !existingResident) {
          logError(new Error('Resident not found for deletion'), `ID: ${residentId}`);
          throw new Error('Resident not found or access denied');
        }

        // Audit the deletion before performing it
        await auditDataOperation('delete', 'resident', residentId, context, {
          fullName: `${existingResident.first_name} ${existingResident.last_name}`,
        });

        // Soft delete: Update is_active to false instead of hard delete
        const { error: softDeleteError } = await supabaseAdmin
          .from('residents')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', residentId);

        if (softDeleteError) {
          logError(new Error('Resident soft delete error'), JSON.stringify(softDeleteError));
          // If soft delete fails, try hard delete (CASCADE will handle related records)
          const { error: hardDeleteError } = await supabaseAdmin
            .from('residents')
            .delete()
            .eq('id', residentId);

          if (hardDeleteError) {
            logError(new Error('Resident hard delete error'), JSON.stringify(hardDeleteError));
            throw new Error('Failed to delete resident');
          }
        }

        return createSuccessResponse(
          {
            id: residentId,
            name: `${existingResident.first_name} ${existingResident.last_name}`,
          },
          'Resident deleted successfully',
          context
        );
      }
    )
  )
);
