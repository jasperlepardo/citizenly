'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// SectoralBadges import removed - not currently used in this component
import { ResidentForm } from '@/components/templates/ResidentForm';
import { supabase, logger, logError } from '@/lib';
// Remove unused enum imports - using types instead
import { fetchWithAuth } from '@/lib/utils/sessionUtils';
import type { FormMode, ResidentWithRelations, SectoralInformation } from '@/types';
import {
  CivilStatusEnum,
  CitizenshipEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  BloodTypeEnum,
  EthnicityEnum,
  ReligionEnum,
} from '@/types';
import type { ResidentFormState } from '@/types/resident-form';

// Tooltip component removed - not used in current implementation

export const dynamic = 'force-dynamic';

// Use consolidated ResidentWithRelations type instead of duplicate interface
type Resident = ResidentWithRelations;

function ResidentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const residentId = params.id as string;
  const [resident, setResident] = useState<Resident | null>(null);
  const [editedResident, setEditedResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('view');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<ResidentFormState | null>(null);

  useEffect(() => {
    const loadResidentDetails = async () => {
      if (!residentId) return;

      try {
        setLoading(true);

        logger.debug('Loading resident details', { residentId });
        // Loading resident details for the specified ID

        // Use API endpoint with session fallback
        const response = await fetchWithAuth(`/api/residents/${residentId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          logger.error('API Error loading resident', errorData);
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        const { resident: residentData, household: householdData } = responseData;

        if (!residentData) {
          setError('No data returned for resident');
          return;
        }

        logger.debug('Resident data loaded successfully via API', { residentId: residentData.id });
        // Resident data loaded successfully
        // Checking resident migration status

        // Household data is already included in the API response
        if (householdData) {
          residentData.household = householdData;
        }

        // Load address information for the resident's barangay
        try {
          logger.debug('Loading address information', { barangayCode: residentData.barangay_code });

          // Try to use the address hierarchy view first (if it exists)
          const { data: addressViewData, error: viewError } = await supabase
            .from('psgc_address_hierarchy')
            .select(
              'barangay_name, city_municipality_name, province_name, region_name, full_address'
            )
            .eq('barangay_code', residentData.barangay_code)
            .single();

          if (addressViewData && !viewError) {
            residentData.address_info = {
              barangay_name: addressViewData.barangay_name,
              city_municipality_name: addressViewData.city_municipality_name,
              province_name: addressViewData.province_name,
              region_name: addressViewData.region_name,
              full_address: addressViewData.full_address,
            };
          } else {
            // Fallback: Try individual table queries
            logger.debug('Address view not available, trying individual table queries');

            const { data: barangayData, error: barangayError } = await supabase
              .from('psgc_barangays')
              .select('name, city_municipality_code')
              .eq('code', residentData.barangay_code)
              .single();

            logger.debug('Barangay query completed', {
              found: !!barangayData,
              hasError: !!barangayError,
            });

            if (barangayData && !barangayError) {
              // Initialize with barangay data only - no fallback values
              residentData.address_info = {
                barangay_name: barangayData.name,
                city_municipality_name: undefined,
                province_name: undefined,
                region_name: undefined,
                full_address: barangayData.name,
              };

              // Try to get city info and trace back to region
              const { data: cityData } = await supabase
                .from('psgc_cities_municipalities')
                .select('name, province_code, is_independent')
                .eq('code', barangayData.city_municipality_code)
                .single();

              if (cityData) {
                residentData.address_info.city_municipality_name = cityData.name;
                residentData.address_info.full_address = `${barangayData.name}, ${cityData.name}`;

                // Try to get province and region info
                if (!cityData.is_independent && cityData.province_code) {
                  const { data: provinceData } = await supabase
                    .from('psgc_provinces')
                    .select('name, region_code')
                    .eq('code', cityData.province_code)
                    .single();

                  if (provinceData) {
                    residentData.address_info.province_name = provinceData.name;

                    // Get region name
                    const { data: regionData } = await supabase
                      .from('psgc_regions')
                      .select('name')
                      .eq('code', provinceData.region_code)
                      .single();

                    if (regionData) {
                      residentData.address_info.region_name = regionData.name;
                    }
                    // No fallback mapping - only use actual database data
                  }
                }
                // No assumptions for independent cities - only use database data
              }
            }
            // No fallback creation - if no barangay data, leave address_info undefined
          }
        } catch (addressError) {
          logger.warn('Address data lookup failed', {
            error: addressError instanceof Error ? addressError.message : 'Unknown error',
          });
          // No fallback data - leave address_info undefined if query fails
        }

        // Household information is now included in the main API response

        // Try to load PSOC information if available
        if (residentData.occupation_code) {
          try {
            const { data: psocData } = await supabase
              .from('occupation_codes')
              .select('code, title, level')
              .eq('code', residentData.occupation_code)
              .single();

            if (psocData) {
              residentData.psoc_info = psocData;
            }
          } catch (psocError) {
            logger.warn('PSOC data lookup failed', {
              error: psocError instanceof Error ? psocError.message : 'Unknown error',
            });
          }
        }

        // Initialize missing fields for comprehensive form
        const initializedResident = {
          ...residentData,
          telephone_number: residentData.telephone_number || '',
          philsys_card_number: residentData.philsys_card_number || '',
          workplace: residentData.workplace || '',
          height_cm: residentData.height_cm || undefined,
          weight_kg: residentData.weight_kg || undefined,
          complexion: residentData.complexion || '',
          mother_first_name: residentData.mother_first_name || '',
          mother_middle_name: residentData.mother_middle_name || '',
          mother_maiden_last_name: residentData.mother_maiden_last_name || '',
          migration_info: residentData.migration_info || {
            is_migrant: false,
            migration_type: null,
            previous_address: '',
            previous_country: '',
            migration_reason: null,
            migration_date: null,
            documentation_status: null,
            is_returning_resident: false,
          },
        };

        // Setting resident state with initialized data
        setResident(initializedResident);
        setEditedResident(updateComputedFields({ ...initializedResident }));
      } catch (err) {
        logError(
          err instanceof Error ? err : new Error('Unknown error loading resident'),
          'RESIDENT_LOAD'
        );
        setError('Failed to load resident details');
      } finally {
        // Setting loading to false after data load attempt
        setLoading(false);
      }
    };

    loadResidentDetails();
  }, [residentId]);

  // Utility functions (kept for potential future use)
  // const formatFullName = (person: {
  //   first_name: string;
  //   middle_name?: string;
  //   last_name: string;
  //   extension_name?: string;
  // }) => {
  //   return [person.first_name, person.middle_name, person.last_name, person.extension_name]
  //     .filter(Boolean)
  //     .join(' ');
  // };

  const _calculateAge = (birthdate: string) => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  // const formatAddress = (household?: Resident['household']) => {
  //   if (!household) return 'No household assigned';
  //   const parts = [household.house_number, household.street_name, household.subdivision].filter(
  //     Boolean
  //   );
  //   return parts.length > 0 ? parts.join(', ') : 'No address';
  // };

  const _formatEnumValue = (value: string | undefined) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const _formatBoolean = (value: boolean | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return value ? 'Yes' : 'No';
  };

  // Extract sectoral information from resident data for badges (kept for future use)
  // const extractSectoralInfo = (resident: Resident): SectoralInformation => {
  //   return {
  //     is_labor_force_employed: resident.is_employed || false,
  //     is_unemployed: resident.is_unemployed || false,
  //     is_overseas_filipino_worker: resident.is_ofw || false,
  //     is_person_with_disability: resident.is_pwd || false,
  //     is_out_of_school_children: resident.is_out_of_school_children || false,
  //     is_out_of_school_youth: resident.is_out_of_school_youth || false,
  //     is_senior_citizen: resident.is_senior_citizen || false,
  //     is_registered_senior_citizen: resident.is_registered_senior_citizen || false,
  //     is_solo_parent: resident.is_solo_parent || false,
  //     is_indigenous_people: resident.is_indigenous_people || false,
  //     is_migrant: resident.is_migrant || false,
  //   };
  // };

  const updateComputedFields = (updatedResident: Resident) => {
    // Update employment-related flags based on employment_status
    const employmentStatus = updatedResident.employment_status;

    updatedResident.is_employed = ['employed', 'self_employed'].includes(employmentStatus || '');
    updatedResident.is_unemployed = employmentStatus === 'unemployed';

    // Update senior citizen flag based on birthdate
    if (updatedResident.birthdate) {
      const age = new Date().getFullYear() - new Date(updatedResident.birthdate).getFullYear();
      updatedResident.is_senior_citizen = age >= 60;
    }

    return updatedResident;
  };

  const _handleFieldChange = (field: keyof Resident, value: unknown) => {
    if (!editedResident) return;

    let updatedResident = {
      ...editedResident,
      [field]: value,
    };

    // Update computed fields when employment status or birthdate changes
    if (field === 'employment_status' || field === 'birthdate') {
      updatedResident = updateComputedFields(updatedResident);
    }

    setEditedResident(updatedResident);
  };

  const _getComputedFieldTooltip = (field: keyof Resident) => {
    switch (field) {
      case 'is_employed':
        return `Automatically calculated from Employment Status. Includes: employed, self-employed`;
      case 'is_unemployed':
        return `Automatically calculated from Employment Status. Only when status is 'unemployed'`;
      case 'is_senior_citizen':
        return `Automatically calculated from Date of Birth. Senior citizen when age is 60 or above`;
      default:
        return 'This field is automatically calculated';
    }
  };

  const transformToFormState = (resident: Resident): ResidentFormState => {
    // Transform resident data to form state format
    // Processing basic resident fields for form

    // Extract sectoral information from the nested object if it exists
    const residentWithNested = resident as Resident & {
      sectoral_info?: SectoralInformation;
      resident_sectoral_info?: SectoralInformation[];
      migrant_info?: Record<string, unknown>;
      resident_migrant_info?: Record<string, unknown>[];
      birth_place_info?: { name?: string; level?: string };
    };
    const sectoralInfo =
      residentWithNested.sectoral_info || residentWithNested.resident_sectoral_info?.[0] || null;
    const migrantInfo =
      residentWithNested.migrant_info || residentWithNested.resident_migrant_info?.[0] || null;

    const formState = {
      // Personal Information
      first_name: resident.first_name || '',
      middle_name: resident.middle_name || '',
      last_name: resident.last_name || '',
      extension_name: resident.extension_name || '',
      sex: resident.sex || '',
      civil_status: resident.civil_status as CivilStatusEnum,
      civil_status_others_specify: '', // Not in current Resident type
      citizenship: (resident.citizenship as CitizenshipEnum) || '',
      birthdate: resident.birthdate || '',
      birth_place_name:
        residentWithNested.birth_place_info?.name ||
        (resident.birth_place_code ? `Loading ${resident.birth_place_code}...` : ''),
      birth_place_code: resident.birth_place_code || '',
      birth_place_level: '' as '' | 'region' | 'province' | 'city_municipality' | 'barangay',
      philsys_card_number: resident.philsys_card_number || '',
      philsys_last4: resident.philsys_last4 || '',
      education_attainment: (resident.education_attainment as EducationLevelEnum) || '',
      is_graduate: resident.is_graduate || false,
      employment_status: (resident.employment_status as EmploymentStatusEnum) || '',
      employment_code: '', // Not in current Resident type
      employment_name: '', // Not in current Resident type
      occupation_code: resident.occupation_code || '',
      psoc_level: resident.psoc_level || 0,
      occupation_title: resident.occupation_title || '',

      // Contact Information
      email: resident.email || '',
      telephone_number: resident.telephone_number || '',
      mobile_number: resident.mobile_number || '',
      household_code: resident.household_code || '',

      // Physical Personal Details
      blood_type: (resident.blood_type as BloodTypeEnum) || '',
      complexion: resident.complexion || '',
      height: resident.height || 0,
      weight: resident.weight || 0,
      ethnicity: (resident.ethnicity as EthnicityEnum) || '',
      religion: (resident.religion as ReligionEnum) || '',
      religion_others_specify: '', // Not in current Resident type
      is_voter: resident.is_voter ?? null,
      is_resident_voter: resident.is_resident_voter ?? null,
      last_voted_date: '', // Not in current Resident type
      mother_maiden_first: resident.mother_maiden_first || '',
      mother_maiden_middle: resident.mother_maiden_middle || '',
      mother_maiden_last: resident.mother_maiden_last || '',

      // Sectoral Information (use sectoral_info if available, otherwise defaults)
      is_labor_force_employed: sectoralInfo?.is_labor_force_employed ?? false,
      is_unemployed: sectoralInfo?.is_unemployed ?? false,
      is_overseas_filipino_worker: sectoralInfo?.is_overseas_filipino_worker ?? false,
      is_person_with_disability: sectoralInfo?.is_person_with_disability ?? false,
      is_out_of_school_children: sectoralInfo?.is_out_of_school_children ?? false,
      is_out_of_school_youth: sectoralInfo?.is_out_of_school_youth ?? false,
      is_senior_citizen: sectoralInfo?.is_senior_citizen ?? false,
      is_registered_senior_citizen: sectoralInfo?.is_registered_senior_citizen ?? false,
      is_solo_parent: sectoralInfo?.is_solo_parent ?? false,
      is_indigenous_people: sectoralInfo?.is_indigenous_people ?? false,
      is_migrant: sectoralInfo?.is_migrant ?? false,

      // Migration Information (use migrant_info if available, otherwise defaults)
      previous_barangay_code: (migrantInfo?.previous_barangay_code as string) || '',
      previous_city_municipality_code:
        (migrantInfo?.previous_city_municipality_code as string) || '',
      previous_province_code: (migrantInfo?.previous_province_code as string) || '',
      previous_region_code: (migrantInfo?.previous_region_code as string) || '',
      length_of_stay_previous_months: (migrantInfo?.length_of_stay_previous_months as number) || 0,
      reason_for_leaving: (migrantInfo?.reason_for_leaving as string) || '',
      date_of_transfer: (migrantInfo?.date_of_transfer as string) || '',
      reason_for_transferring: (migrantInfo?.reason_for_transferring as string) || '',
      duration_of_stay_current_months:
        (migrantInfo?.duration_of_stay_current_months as number) || 0,
      is_intending_to_return: (migrantInfo?.is_intending_to_return as boolean) ?? false,
    };

    // Returning transformed form state
    // Final form state includes migration status
    return formState;
  };

  // Handle resident deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetchWithAuth(`/api/residents/${residentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete resident');
      }

      const result = await response.json();

      toast.success(`Resident ${result.deletedResident?.name || ''} deleted successfully`);

      // Redirect to residents list after successful deletion
      router.push('/residents');
    } catch (err) {
      const error = err as Error;
      logError(error, 'RESIDENT_DELETE');
      logger.error('Failed to delete resident', { error: error.message });
      toast.error(error.message || 'Failed to delete resident');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData: ResidentFormState) => {
    // Handle form submission with form data
    // Form includes migration status and other resident details
    // Processing form submission at current timestamp

    try {
      // Use the API endpoint for updating with session fallback
      // Getting session for form submission authentication

      // Include both resident fields and sectoral information
      // Convert empty strings to null for enum fields to avoid validation errors
      const updatePayload = {
        // Main resident fields
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        extension_name: formData.extension_name,
        birthdate: formData.birthdate,
        birth_place_code: formData.birth_place_code,
        sex: formData.sex,
        civil_status: formData.civil_status || null,
        civil_status_others_specify: formData.civil_status_others_specify,
        citizenship: formData.citizenship || null,
        education_attainment: formData.education_attainment || null,
        is_graduate: formData.is_graduate,
        employment_status: formData.employment_status || null,
        occupation_code: formData.occupation_code,
        email: formData.email,
        mobile_number: formData.mobile_number,
        telephone_number: formData.telephone_number,
        household_code: formData.household_code,
        height: formData.height,
        weight: formData.weight,
        complexion: formData.complexion,
        blood_type: formData.blood_type || null, // Convert empty string to null for enum
        ethnicity: formData.ethnicity || null,
        religion: formData.religion || null,
        religion_others_specify: formData.religion_others_specify,
        is_voter: formData.is_voter,
        is_resident_voter: formData.is_resident_voter,
        last_voted_date: formData.last_voted_date || null,
        mother_maiden_first: formData.mother_maiden_first,
        mother_maiden_middle: formData.mother_maiden_middle,
        mother_maiden_last: formData.mother_maiden_last,

        // Sectoral information fields
        is_labor_force_employed: formData.is_labor_force_employed,
        is_unemployed: formData.is_unemployed,
        is_overseas_filipino_worker: formData.is_overseas_filipino_worker,
        is_person_with_disability: formData.is_person_with_disability,
        is_out_of_school_children: formData.is_out_of_school_children,
        is_out_of_school_youth: formData.is_out_of_school_youth,
        is_senior_citizen: formData.is_senior_citizen,
        is_registered_senior_citizen: formData.is_registered_senior_citizen,
        is_solo_parent: formData.is_solo_parent,
        is_indigenous_people: formData.is_indigenous_people,
        is_migrant: formData.is_migrant,
      };

      const response = await fetchWithAuth(`/api/residents/${residentId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update resident');
      }

      const responseData = await response.json();
      // Successfully received API response

      const { resident: updatedResident } = responseData;
      // Processing updated resident data from API

      // Transform the nested sectoral data from the API response
      let transformedResident = { ...updatedResident };

      if (updatedResident?.resident_sectoral_info?.[0]) {
        const sectoralInfo = updatedResident.resident_sectoral_info[0];
        // Flattening sectoral information into main resident object

        // Flatten sectoral information into the main resident object
        transformedResident = {
          ...transformedResident,
          is_labor_force_employed: sectoralInfo.is_labor_force_employed,
          is_unemployed: sectoralInfo.is_unemployed,
          is_overseas_filipino_worker: sectoralInfo.is_overseas_filipino_worker,
          is_person_with_disability: sectoralInfo.is_person_with_disability,
          is_out_of_school_children: sectoralInfo.is_out_of_school_children,
          is_out_of_school_youth: sectoralInfo.is_out_of_school_youth,
          is_senior_citizen: sectoralInfo.is_senior_citizen,
          is_registered_senior_citizen: sectoralInfo.is_registered_senior_citizen,
          is_solo_parent: sectoralInfo.is_solo_parent,
          is_indigenous_people: sectoralInfo.is_indigenous_people,
          is_migrant: sectoralInfo.is_migrant,
        };

        // Remove the nested object to avoid duplication
        delete transformedResident.resident_sectoral_info;
      }

      if (updatedResident?.resident_migrant_info?.[0]) {
        const migrantInfo = updatedResident.resident_migrant_info[0];
        // Flattening migrant information into main resident object

        // Flatten migrant information into the main resident object
        transformedResident = {
          ...transformedResident,
          previous_barangay_code: migrantInfo.previous_barangay_code,
          previous_city_municipality_code: migrantInfo.previous_city_municipality_code,
          previous_province_code: migrantInfo.previous_province_code,
          previous_region_code: migrantInfo.previous_region_code,
          length_of_stay_previous_months: migrantInfo.length_of_stay_previous_months,
          reason_for_leaving: migrantInfo.reason_for_leaving,
          date_of_transfer: migrantInfo.date_of_transfer,
          reason_for_transferring: migrantInfo.reason_for_transferring,
          duration_of_stay_current_months: migrantInfo.duration_of_stay_current_months,
          is_intending_to_return: migrantInfo.is_intending_to_return,
        };

        // Remove the nested object to avoid duplication
        delete transformedResident.resident_migrant_info;
      }

      // Setting transformed resident state with flattened data
      // Migration status preserved in transformation

      // Update local state and return to view mode
      // Updating resident state with transformed data
      setResident(transformedResident);
      setFormMode('view');
      setCurrentFormData(null); // Clear current form data after successful save
      toast.success('Resident updated successfully!');
    } catch (err) {
      const error = err as Error;
      logError(error, 'RESIDENT_FORM_UPDATE');
      logger.error('Failed to update resident', { error: error.message });
      toast.error(`Failed to update resident: ${error.message}`);
    }
  };

  // Removed unused renderEditableField function

  if (loading) {
    return (
      <div>
        <div className="p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading resident details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resident) {
    // Rendering error state - no resident data available
    return (
      <div>
        <div className="p-6">
          <div className="mx-auto max-w-md text-center">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-red-600">
                <svg
                  className="mx-auto size-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
                Resident Not Found
              </h1>
              <p className="font-montserrat mb-4 text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
              <Link
                href="/residents"
                className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Back to Residents
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendering main resident content

  return (
    <div className="min-h-screen" style={{ minHeight: '100vh' }}>
      <div className="p-6" style={{ padding: '24px' }}>
        {/* Page Header */}
        <div
          className="mb-6 flex items-center justify-between"
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            className="flex items-center gap-4"
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <Link
              href="/residents"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-xs hover:bg-gray-50"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563',
              }}
            >
              <svg
                className="mr-2 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ marginRight: '8px', width: '16px', height: '16px' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Residents
            </Link>
            <div>
              <h1
                className="text-xl font-semibold text-gray-900"
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px',
                }}
              >
                {resident.first_name} {resident.last_name}
              </h1>
              <p className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#6b7280' }}>
                Resident Details
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - ResidentForm Template */}
          <div className="lg:col-span-2">
            {/* ResidentForm Template */}
            {(() => {
              const formData = editedResident ? transformToFormState(editedResident) : undefined;
              // Form data includes resident details and current mode
              return (
                <ResidentForm
                  mode={formMode}
                  initialData={formData}
                  onSubmit={handleFormSubmit}
                  onModeChange={undefined} // Hide FormHeader edit button
                  onChange={setCurrentFormData} // Track current form data changes
                  key={`resident-form-${editedResident?.id}-${editedResident?.updated_at || Date.now()}`} // Force re-render when resident updates
                />
              );
            })()}
          </div>

          {/* Right Column - Side Information */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  Quick Actions
                </h3>
              </div>
              <div className="space-y-3 px-6 py-4">
                {/* Edit/Save mode toggle button with FormHeader styling */}
                <button
                  type="button"
                  onClick={async e => {
                    e.preventDefault();
                    // Save button clicked - processing form action
                    // Checking form mode and data availability

                    if (formMode === 'view') {
                      // Switching to edit mode
                      setFormMode('edit');
                    } else {
                      // Attempting to save form data
                      // The form component handles its own validation and submission
                      // Triggering form submission event
                      const formElement = document.querySelector('form');
                      if (formElement) {
                        // Found form element, triggering submit event
                        const submitEvent = new Event('submit', {
                          bubbles: true,
                          cancelable: true,
                        });
                        formElement.dispatchEvent(submitEvent);
                      } else {
                        logger.error('Form element not found for submission');
                        toast.error('Unable to submit form');
                      }
                    }
                    // Form action completed
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  {formMode === 'view' ? '✏️ Edit' : '💾 Save'}
                </button>
                <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                  Generate Certificate
                </button>
                <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                  Export Data
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting || formMode === 'edit'}
                  className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  {isDeleting ? 'Deleting...' : '🗑️ Delete Resident'}
                </button>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <div
                    className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
                    onClick={() => setShowDeleteConfirm(false)}
                  />
                  <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-gray-800">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900/20">
                          <svg
                            className="h-6 w-6 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                          </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3 className="text-base leading-6 font-semibold text-gray-900 dark:text-gray-100">
                            Delete Resident
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Are you sure you want to delete {resident?.first_name}{' '}
                              {resident?.last_name}? This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-500 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResidentDetailPage() {
  return <ResidentDetailContent />;
}
