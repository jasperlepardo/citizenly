import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
      .select('barangay_code, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Get resident data with household join to check barangay access
    const { data: residentWithHousehold, error: residentError } = await supabaseAdmin
      .from('residents')
      .select(`
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
      `)
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code) // Ensure same barangay through household
      .single();

    if (residentError || !residentWithHousehold) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }
    
    // Get sectoral info separately to avoid join issues
    const { data: sectoralInfoArray, error: sectoralError } = await supabaseAdmin
      .from('resident_sectoral_info')
      .select('*')
      .eq('resident_id', residentId);
    
    // Handle the array result - take first record if exists
    const sectoralInfo = sectoralInfoArray && sectoralInfoArray.length > 0 ? sectoralInfoArray[0] : null;

    // Extract household info and merge with resident data
    const { households, ...residentData } = residentWithHousehold;
    
    const resident = {
      ...residentData,
      ...(sectoralInfo || {})
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
          .select(`
            code,
            name,
            psgc_cities_municipalities!inner(
              name,
              type,
              psgc_provinces!inner(name)
            )
          `)
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
            }
          };
        } else {
          // Try city/municipality
          const { data: cityData } = await supabaseAdmin
            .from('psgc_cities_municipalities')
            .select(`
              code,
              name,
              type,
              psgc_provinces!inner(name)
            `)
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
              }
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
                }
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
                  }
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
          .select('psoc_code, occupation_title, display_text, psoc_level, level_name, parent_code, parent_title')
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

    return NextResponse.json({
      resident: {
        ...resident,
        ...geoInfo,
        ...birthPlaceInfo,
        ...occupationInfo,
      },
      household
    });
  } catch (error) {
    console.error('Resident detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const residentId = resolvedParams.id;
    const updateData = await request.json();

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

    // First check if resident exists and user has access through household
    const { data: existingResident, error: checkError } = await supabaseAdmin
      .from('residents')
      .select(`
        id,
        household_code,
        households!inner(barangay_code)
      `)
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code)
      .single();

    if (checkError || !existingResident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
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
    } = updateData;

    // Only include sectoral fields that are explicitly set (not undefined)
    const sectoralData: Record<string, boolean> = {};
    
    if (is_labor_force_employed !== undefined) sectoralData.is_labor_force_employed = is_labor_force_employed;
    if (is_unemployed !== undefined) sectoralData.is_unemployed = is_unemployed;
    if (is_overseas_filipino_worker !== undefined) sectoralData.is_overseas_filipino_worker = is_overseas_filipino_worker;
    if (is_person_with_disability !== undefined) sectoralData.is_person_with_disability = is_person_with_disability;
    if (is_out_of_school_children !== undefined) sectoralData.is_out_of_school_children = is_out_of_school_children;
    if (is_out_of_school_youth !== undefined) sectoralData.is_out_of_school_youth = is_out_of_school_youth;
    if (is_senior_citizen !== undefined) sectoralData.is_senior_citizen = is_senior_citizen;
    if (is_registered_senior_citizen !== undefined) sectoralData.is_registered_senior_citizen = is_registered_senior_citizen;
    if (is_solo_parent !== undefined) sectoralData.is_solo_parent = is_solo_parent;
    if (is_indigenous_people !== undefined) sectoralData.is_indigenous_people = is_indigenous_people;
    if (is_migrant !== undefined) sectoralData.is_migrant = is_migrant;

    // Update resident data (access already verified)
    const { data: updatedResident, error: updateError } = await supabaseAdmin
      .from('residents')
      .update({
        ...mainResidentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', residentId)
      .select()
      .single();

    if (updateError) {
      console.error('Resident update error:', updateError);
      return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
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
        checkError: checkError?.message 
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
            residentId
          });
          return NextResponse.json({ 
            error: `Failed to update sectoral information: ${sectoralUpdateError.message || 'Unknown error'}` 
          }, { status: 500 });
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
        
        console.log('Attempting to insert sectoral data:', JSON.stringify(sectoralInsertData, null, 2));
        
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
            residentId
          });
          return NextResponse.json({ 
            error: `Failed to create sectoral information: ${sectoralInsertError.message || 'Unknown error'}`,
            details: sectoralInsertError.details 
          }, { status: 500 });
        }
        
        console.log('Successfully inserted sectoral data:', insertedData);
      }
    }

    if (!updatedResident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    // Fetch the complete resident record with sectoral information for the response
    const { data: completeResident, error: fetchError } = await supabaseAdmin
      .from('residents')
      .select(`
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
      `)
      .eq('id', residentId)
      .eq('is_active', true)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching complete resident record:', fetchError);
      // Still return the basic record if fetch fails
      return NextResponse.json({
        resident: updatedResident,
        message: 'Resident updated successfully',
      });
    }

    return NextResponse.json({
      resident: completeResident || updatedResident,
      message: 'Resident updated successfully',
    });
  } catch (error) {
    console.error('Resident update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // First check if resident exists and user has access through household
    const { data: existingResident, error: checkError } = await supabaseAdmin
      .from('residents')
      .select(`
        id,
        household_code,
        first_name,
        last_name,
        households!inner(barangay_code)
      `)
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code)
      .single();

    if (checkError || !existingResident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    // Log the deletion for audit purposes
    console.log('Deleting resident:', {
      residentId,
      name: `${existingResident.first_name} ${existingResident.last_name}`,
      deletedBy: user.id,
      timestamp: new Date().toISOString()
    });

    // Soft delete: Update is_active to false instead of hard delete
    const { error: softDeleteError } = await supabaseAdmin
      .from('residents')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('id', residentId);

    if (softDeleteError) {
      console.error('Resident soft delete error:', softDeleteError);
      // If soft delete fails, try hard delete (CASCADE will handle related records)
      const { error: hardDeleteError } = await supabaseAdmin
        .from('residents')
        .delete()
        .eq('id', residentId);

      if (hardDeleteError) {
        console.error('Resident hard delete error:', hardDeleteError);
        return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Resident deleted successfully',
      deletedResident: {
        id: residentId,
        name: `${existingResident.first_name} ${existingResident.last_name}`
      }
    });
  } catch (error) {
    console.error('Resident delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
