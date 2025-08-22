'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ResidentForm } from '@/components/templates';
import { useResidentOperations } from '@/hooks/crud/useResidentOperations';
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
    // Transform form data from snake_case (database fields) to camelCase (service expects)
    const transformedData = {
      // Personal Information
      firstName: formData.first_name || '',
      middleName: formData.middle_name || '',
      lastName: formData.last_name || '',
      extensionName: formData.extension_name || '',
      birthdate: formData.birthdate || '',
      sex: formData.sex || '',
      civilStatus: formData.civil_status || '',
      citizenship: formData.citizenship || '',
      
      // Education & Employment
      educationLevel: formData.education_attainment || '',
      educationStatus: formData.is_graduate ? 'graduate' : 'undergraduate',
      occupationCode: formData.occupation_code || '',
      psocLevel: formData.psoc_level || '',
      positionTitleId: formData.position_title_id || '', // Required field
      occupationDescription: formData.occupation_title || '',
      employmentStatus: formData.employment_status || '',
      workplace: formData.employment_name || '',
      
      // Contact & Documentation
      email: formData.email || '',
      mobileNumber: formData.mobile_number || '',
      telephoneNumber: formData.telephone_number || '',
      philsysCardNumber: formData.philsys_card_number || '',
      
      // Physical & Identity Information
      bloodType: formData.blood_type || '',
      height: formData.height || '',
      weight: formData.weight || '',
      complexion: formData.complexion || '',
      ethnicity: formData.ethnicity || '',
      religion: formData.religion || '',
      
      // Voting Information
      voterRegistrationStatus: formData.is_voter || false,
      residentVoterStatus: formData.is_resident_voter || false,
      lastVotedYear: formData.last_voted_date || '',
      
      // Family Information
      motherMaidenFirstName: formData.mother_maiden_first || '',
      motherMaidenMiddleName: formData.mother_maiden_middle || '',
      motherMaidenLastName: formData.mother_maiden_last || '',
      
      // Migration Information
      migrationInfo: {
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
      },
      
      // Address Information (PSGC Codes) - auto-populated from user's barangay
      regionCode: '', // Will be populated by service from user address
      provinceCode: '', // Will be populated by service from user address
      cityMunicipalityCode: '', // Will be populated by service from user address
      barangayCode: '', // Will be populated by service from user address
      
      // Household Assignment
      householdCode: formData.household_code || '',
      householdRole: 'Member' as const, // Default to member
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
