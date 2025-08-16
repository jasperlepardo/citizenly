'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ResidentForm } from '@/components/templates';

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
        <ResidentForm initialData={initialData} />
    </div>
  );
}

export default function CreateResidentPage() {
  return <CreateResidentForm />;
}
