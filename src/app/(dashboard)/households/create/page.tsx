'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';

import { NewHouseholdForm } from '@/components';

export const dynamic = 'force-dynamic';

export default function CreateHouseholdPage() {
  const searchParams = useSearchParams();

  // Parse URL parameters to pre-fill form
  const initialData = useMemo(() => {
    const suggestedName = searchParams.get('suggested_name');
    const suggestedCode = searchParams.get('suggested_id');

    let data: Record<string, unknown> = {};

    // Auto-fill household name if provided (since we now have household name instead of head name)
    if (suggestedName) {
      data = {
        ...data,
        householdName: suggestedName,
      };
    }

    // Auto-fill household code if provided
    if (suggestedCode) {
      data = {
        ...data,
        code: suggestedCode,
      };
    }

    return Object.keys(data).length > 0 ? data : undefined;
  }, [searchParams]);

  // Show a helpful message if the form was pre-filled
  const isPreFilled = Boolean(
    searchParams.get('suggested_name') || searchParams.get('suggested_id')
  );
  const suggestedName = searchParams.get('suggested_name');
  const suggestedCode = searchParams.get('suggested_id');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/households"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-950 shadow-xs hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
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
          <h1 className="text-2xl/8 font-semibold text-zinc-950 dark:text-white">
            Create New Household
          </h1>
          <p className="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            Complete the form to register a new household in the system
          </p>

          {/* Pre-filled notification */}
          {isPreFilled && (suggestedName || suggestedCode) && (
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
                    <strong>Form pre-filled:</strong>
                    {suggestedName &&
                      ` The household name has been populated with "${suggestedName}".`}
                    {suggestedCode && ` The household code has been set to "${suggestedCode}".`} You
                    can edit these values as needed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Household Form */}
      <NewHouseholdForm initialData={initialData} />
    </div>
  );
}
