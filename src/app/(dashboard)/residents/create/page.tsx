'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ResidentForm } from '@/components/templates';
import { useResidentOperations } from '@/hooks/crud/useResidentOperations';
import { EducationLevelEnum } from '@/types/residents';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

// Utility function to parse a full name into components
function parseFullName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      middleName: '',
      lastName: '',
    };
  } else if (nameParts.length === 2) {
    return {
      firstName: nameParts[0],
      middleName: '',
      lastName: nameParts[1],
    };
  } else if (nameParts.length === 3) {
    return {
      firstName: nameParts[0],
      middleName: nameParts[1],
      lastName: nameParts[2],
    };
  } else {
    // For more than 3 parts, first name is first part, last name is last part, middle is everything in between
    return {
      firstName: nameParts[0],
      middleName: nameParts.slice(1, -1).join(' '),
      lastName: nameParts[nameParts.length - 1],
    };
  }
}

function CreateResidentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Setup resident operations hook with success/error handlers
  const { createResident, isSubmitting, validationErrors } = useResidentOperations({
    onSuccess: (data) => {
      toast.success('Resident created successfully!');
      // Redirect to the resident details page
      if (data?.resident?.id) {
        router.push(`/residents/${data.resident.id}`);
      } else {
        router.push('/residents');
      }
    },
    onError: (error) => {
      toast.error(error || 'Failed to create resident');
    }
  });

  // Handle form submission - transform snake_case to camelCase
  const handleSubmit = async (formData: any) => {    
    // Transform form data to match validation schema EXACTLY
    const transformedData = {
      // Required fields - validation schema
      firstName: formData.first_name || '',
      lastName: formData.last_name || '',
      birthdate: formData.birthdate || '',
      sex: formData.sex || '',

      // Optional personal info - validation schema
      middleName: formData.middle_name || '',
      extensionName: formData.extension_name || '',

      // Contact information - validation schema
      email: formData.email || '',
      mobileNumber: formData.mobile_number || '',
      telephoneNumber: formData.telephone_number || '',

      // Personal details - validation schema (with defaults)
      civilStatus: formData.civil_status || 'single',
      civilStatusOthersSpecify: formData.civil_status_others_specify || '',
      citizenship: formData.citizenship || 'filipino',
      bloodType: formData.blood_type || '',
      ethnicity: formData.ethnicity || '',
      religion: formData.religion || 'roman_catholic',
      religionOthersSpecify: formData.religion_others_specify || '',

      // Physical characteristics - validation schema
      height: formData.height?.toString() || '',
      weight: formData.weight?.toString() || '',
      complexion: formData.complexion || '',

      // Birth place information - validation schema
      birthPlaceCode: formData.birth_place_code || '',

      // Documentation - validation schema
      philsysCardNumber: formData.philsys_card_number || '',

      // Family information - validation schema
      motherMaidenFirstName: formData.mother_maiden_first || '',
      motherMaidenMiddleName: formData.mother_maiden_middle || '',
      motherMaidenLastName: formData.mother_maiden_last || '',

      // Birth place information - validation schema
      birthPlaceName: formData.birth_place_name || '',
      birthPlaceLevel: formData.birth_place_level || '',

      // Education and employment - validation schema (with defaults)
      educationLevel: (formData.education_attainment as EducationLevelEnum) || 'elementary',
      educationStatus: formData.is_graduate ? 'graduate' : 'not_graduate',
      isGraduate: formData.is_graduate !== undefined ? formData.is_graduate : false,
      employmentStatus: formData.employment_status || 'not_in_labor_force',
      employmentCode: formData.employment_code || '',
      employmentName: formData.employment_name || '',
      occupationCode: formData.occupation_code || '',
      psocLevel: parseInt(formData.psoc_level?.toString() || '0'),
      positionTitleId: formData.position_title_id || '',
      occupationTitle: formData.occupation_title || '',

      // Voting information - validation schema
      isVoter: formData.is_voter ?? null,
      isResidentVoter: formData.is_resident_voter ?? null,
      lastVotedDate: formData.last_voted_date || '',

      // Household - validation schema
      householdCode: formData.household_code || '',
      
      // Sectoral Information
      isLaborForce: formData.is_labor_force,
      isLaborForceEmployed: formData.is_labor_force_employed,
      isUnemployed: formData.is_unemployed,
      isOverseasFilipinoWorker: formData.is_overseas_filipino_worker,
      isPersonWithDisability: formData.is_person_with_disability,
      isOutOfSchoolChildren: formData.is_out_of_school_children,
      isOutOfSchoolYouth: formData.is_out_of_school_youth,
      isSeniorCitizen: formData.is_senior_citizen,
      isRegisteredSeniorCitizen: formData.is_registered_senior_citizen,
      isSoloParent: formData.is_solo_parent,
      isIndigenousPeople: formData.is_indigenous_people,
      isMigrant: formData.is_migrant,
      
      // Migration Information
      previousBarangayCode: formData.previous_barangay_code,
      previousCityMunicipalityCode: formData.previous_city_municipality_code,
      previousProvinceCode: formData.previous_province_code,
      previousRegionCode: formData.previous_region_code,
      lengthOfStayPreviousMonths: formData.length_of_stay_previous_months,
      reasonForLeaving: formData.reason_for_leaving,
      dateOfTransfer: formData.date_of_transfer,
      reasonForTransferring: formData.reason_for_transferring,
      durationOfStayCurrentMonths: formData.duration_of_stay_current_months,
      isIntendingToReturn: formData.is_intending_to_return,
    };
    
    await createResident(transformedData);
  };

  // Parse URL parameters to pre-fill form
  const initialData = useMemo(() => {
    const suggestedName = searchParams.get('suggested_name');
    const suggestedId = searchParams.get('suggested_id');

    let data: any = {};

    // Auto-fill name if provided
    if (suggestedName) {
      const { firstName, middleName, lastName } = parseFullName(suggestedName);
      data = {
        ...data,
        firstName,
        middleName,
        lastName,
      };
    }

    // Auto-fill ID if provided (though residents typically get auto-generated IDs)
    if (suggestedId) {
      // You could pre-fill other fields based on the suggested ID if needed
      // For now, we'll just note it in the form data
      data = {
        ...data,
        // Note: Most resident forms don't allow manual ID input as they're auto-generated
        // But you could use this for other purposes like pre-filling reference numbers
      };
    }

    return Object.keys(data).length > 0 ? data : undefined;
  }, [searchParams]);

  // Show a helpful message if the form was pre-filled
  const isPreFilled = Boolean(searchParams.get('suggested_name') || searchParams.get('suggested_id'));
  const suggestedName = searchParams.get('suggested_name');

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/residents"
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm/6 font-medium text-gray-600 dark:text-gray-400 shadow-xs"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl/8 font-semibold text-gray-600 dark:text-gray-400">Add New Resident</h1>
            <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
              Complete the form to register a new resident in the system
            </p>
            
            {/* Pre-filled notification */}
            {isPreFilled && suggestedName && (
              <div className="mt-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Form pre-filled:</strong> The name fields have been populated with "{suggestedName}". You can edit these values as needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Single Page Form */}
        <ResidentForm 
          initialData={initialData} 
          onSubmit={handleSubmit}
          onCancel={() => router.push('/residents')}
        />
    </div>
  );
}

export default function CreateResidentPage() {
  return <CreateResidentForm />;
}
