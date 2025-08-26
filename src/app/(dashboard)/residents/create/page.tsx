'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';

import { ResidentForm } from '@/components';
import { useResidentOperations } from '@/hooks/crud/useResidentOperations';
import { ResidentFormData } from '@/services/resident.service';
import { EducationLevelEnum } from '@/types';

export const dynamic = 'force-dynamic';

// Utility function to parse a full name into components
function parseFullName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length === 1) {
    return {
      first_name: nameParts[0],
      middleName: '',
      last_name: '',
    };
  } else if (nameParts.length === 2) {
    return {
      first_name: nameParts[0],
      middleName: '',
      last_name: nameParts[1],
    };
  } else if (nameParts.length === 3) {
    return {
      first_name: nameParts[0],
      middleName: nameParts[1],
      last_name: nameParts[2],
    };
  } else {
    // For more than 3 parts, first name is first part, last name is last part, middle is everything in between
    return {
      first_name: nameParts[0],
      middleName: nameParts.slice(1, -1).join(' '),
      last_name: nameParts[nameParts.length - 1],
    };
  }
}

function CreateResidentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Setup resident operations hook with success/error handlers
  const { createResident, isSubmitting, validationErrors } = useResidentOperations({
    onSuccess: data => {
      toast.success('Resident created successfully!');
      console.log(
        'Resident created successfully - redirecting to residents list to check visibility'
      );
      // Always redirect to residents list to check if the new resident is visible
      router.push('/residents');
    },
    onError: error => {
      console.error('Resident creation error:', error);
      toast.error(error || 'Failed to create resident');
    },
  });

  // Handle form submission - transform snake_case to camelCase
  const handleSubmit = async (formData: any) => {
    console.log('Raw form data received:', formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('is_voter value:', formData.is_voter);
    console.log('is_resident_voter value:', formData.is_resident_voter);

    // Validate required fields before submission
    const requiredFields = ['first_name', 'last_name', 'birthdate', 'sex', 'household_code'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      const fieldLabels: Record<string, string> = {
        first_name: 'First Name',
        last_name: 'Last Name',
        birthdate: 'Birthdate',
        sex: 'Sex',
        household_code: 'Household Assignment',
      };
      const missingLabels = missingFields.map(field => fieldLabels[field] || field);
      toast.error(`Please fill in required fields: ${missingLabels.join(', ')}`);
      return;
    }

    // Transform form data to match ResidentFormData service interface
    // Note: Hidden fields are already filtered out by ResidentForm component
    const transformedData = {
      // Personal Information
      first_name: formData.first_name || '',
      middle_name: formData.middle_name || '',
      last_name: formData.last_name || '',
      extension_name: formData.extension_name || '',
      birthdate: formData.birthdate || '',
      sex: formData.sex as 'male' | 'female',
      civil_status: formData.civil_status || 'single',
      citizenship: formData.citizenship || 'filipino',

      // Education & Employment
      education_attainment: formData.education_attainment || '',
      is_graduate: formData.is_graduate !== undefined ? formData.is_graduate : false,
      occupation_code: formData.occupation_code || '',
      employment_status: formData.employment_status || 'not_in_labor_force',

      // Contact Information
      email: formData.email || '',
      mobile_number: formData.mobile_number || '',
      telephone_number: formData.telephone_number || '',
      philsys_card_number: formData.philsys_card_number || '',

      // Address Information (PSGC Codes)
      region_code: formData.region_code || '',
      province_code: formData.province_code || '',
      city_municipality_code: formData.city_municipality_code || '',
      barangay_code: formData.barangay_code || '',

      // Household Assignment
      household_code: formData.household_code || '',

      // Include any additional fields that weren't filtered out
      ...Object.fromEntries(
        Object.entries(formData).filter(
          ([key]) =>
            ![
              'first_name',
              'middle_name',
              'last_name',
              'extension_name',
              'birthdate',
              'sex',
              'civil_status',
              'citizenship',
              'education_attainment',
              'is_graduate',
              'occupation_code',
              'employment_status',
              'email',
              'mobile_number',
              'telephone_number',
              'philsys_card_number',
              'region_code',
              'province_code',
              'city_municipality_code',
              'barangay_code',
              'household_code',
            ].includes(key)
        )
      ),
    };

    console.log('Submitting resident data (filtered by form):', transformedData);
    console.log('Fields included:', Object.keys(transformedData));

    const result = await createResident(transformedData);

    // Log validation errors if any
    if (!result?.success && validationErrors) {
      console.error('Validation errors:', validationErrors);
    }
  };

  // Parse URL parameters to pre-fill form
  const initialData = useMemo(() => {
    const suggestedName = searchParams.get('suggested_name');
    const suggestedId = searchParams.get('suggested_id');

    let data: any = {};

    // Auto-fill name if provided
    if (suggestedName) {
      const { first_name, middleName, last_name } = parseFullName(suggestedName);
      data = {
        ...data,
        first_name,
        middle_name: middleName,
        last_name,
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
  const isPreFilled = Boolean(
    searchParams.get('suggested_name') || searchParams.get('suggested_id')
  );
  const suggestedName = searchParams.get('suggested_name');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/residents"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm/6 font-medium text-gray-600 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
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
          <h1 className="text-2xl/8 font-semibold text-gray-600 dark:text-gray-400">
            Add New Resident
          </h1>
          <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
            Complete the form to register a new resident in the system
          </p>

          {/* Pre-filled notification */}
          {isPreFilled && suggestedName && (
            <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
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
                    <strong>Form pre-filled:</strong> The name fields have been populated with "
                    {suggestedName}". You can edit these values as needed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Display validation errors if any */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                There were errors with your submission
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc space-y-1 pl-5">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Page Form */}
      <ResidentForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/residents')}
        hidePhysicalDetails={false}
        hideSectoralInfo={false}
      />
    </div>
  );
}

export default function CreateResidentPage() {
  return <CreateResidentForm />;
}
