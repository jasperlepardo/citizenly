'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms';
import { useHouseholds, type Household } from '@/hooks/crud/useHouseholds';


function HouseholdsContent() {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedHouseholds, setSelectedHouseholds] = useState<Set<string>>(new Set());

  // Use React Query for data fetching
  const { 
    households, 
    total, 
    isLoading, 
    error
  } = useHouseholds({
    searchTerm: localSearchTerm,
  });


  const handleSelectAll = () => {
    if (selectedAll) {
      setSelectedHouseholds(new Set());
    } else {
      setSelectedHouseholds(new Set(households.map(h => h.code)));
    }
    setSelectedAll(!selectedAll);
  };

  const handleSelectHousehold = (householdCode: string) => {
    const newSelected = new Set(selectedHouseholds);
    if (newSelected.has(householdCode)) {
      newSelected.delete(householdCode);
    } else {
      newSelected.add(householdCode);
    }
    setSelectedHouseholds(newSelected);
    setSelectedAll(newSelected.size === households.length && households.length > 0);
  };

  const formatFullName = (person?: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  }) => {
    if (!person) return 'No head assigned';
    return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ');
  };

  const formatAddress = (household: Household) => {
    const parts = [household.house_number, household.street_name, household.subdivision].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  const formatFullAddress = (household: Household) => {
    const localAddress = formatAddress(household);
    const geoParts = [];

    if (household.barangay_info?.name) {
      geoParts.push(`Brgy. ${household.barangay_info.name}`);
    }

    if (household.city_municipality_info?.name && household.city_municipality_info?.type) {
      geoParts.push(
        `${household.city_municipality_info.name} (${household.city_municipality_info.type})`
      );
    }

    if (household.province_info?.name) {
      geoParts.push(household.province_info.name);
    }

    if (household.region_info?.name) {
      geoParts.push(household.region_info.name);
    }

    if (localAddress === 'No address' && geoParts.length === 0) {
      return 'Address not available';
    }

    if (localAddress === 'No address') {
      return geoParts.join(', ');
    }

    return geoParts.length > 0 ? `${localAddress}, ${geoParts.join(', ')}` : localAddress;
  };

  return (
    <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-gray-600 dark:text-gray-400">
              Households
            </h1>
            <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
              {total} total households
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/households/create"
              className="font-montserrat rounded-sm bg-green-600 px-4 py-2 text-base font-medium text-white dark:text-black hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Create Household
            </Link>
            <Link
              href="/residents/create"
              className="font-montserrat rounded-sm bg-blue-600 px-4 py-2 text-base font-medium text-white dark:text-black hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add new resident
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden">
          {/* Table Header */}
          <div className="bg-white dark:bg-gray-800 flex items-center border-b border-gray-200 dark:border-gray-700 p-0">
            {/* Select All */}
            <div className="flex items-center p-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSelectAll}
                  variant="neutral-outline"
                  size="sm"
                  className="size-4 min-w-0 p-0"
                >
                  {selectedAll && <div className="size-2 rounded-xs bg-blue-600"></div>}
                </Button>
                <span className="font-montserrat text-base font-normal text-gray-600 dark:text-gray-400">
                  Select all
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ml-4 flex items-center gap-1">
              <Button
                variant="neutral-outline"
                size="sm"
                leftIcon={
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                }
              >
                Properties
              </Button>

              <Button
                variant="neutral-outline"
                size="sm"
                leftIcon={
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                }
              >
                Sort
              </Button>

              <Button
                variant="neutral-outline"
                size="sm"
                leftIcon={
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                }
              >
                Filter
              </Button>

              <Button variant="neutral-outline" size="sm" iconOnly>
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>
            </div>

            {/* Search Households */}
            <div className="ml-auto mr-0">
              <div className="bg-white dark:bg-gray-800 flex w-60 items-center gap-2 rounded-sm border border-gray-200 dark:border-gray-700 p-2">
                <div className="size-5 text-gray-600 dark:text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search households"
                  value={localSearchTerm}
                  onChange={e => setLocalSearchTerm(e.target.value)}
                  className="font-montserrat placeholder:text-gray-500 dark:text-gray-400 flex-1 bg-transparent text-base font-normal text-gray-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Table Column Headers */}
          <div className="bg-gray-100 dark:bg-gray-700 flex items-center border-b border-gray-200 dark:border-gray-700 p-0">
            {/* Checkbox Column */}
            <div className="w-12 p-2"></div>

            {/* Column Headers */}
            <div className="grid flex-1 grid-cols-5 gap-4 p-2">
              <div className="p-2">
                <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-400">
                  Household #
                </span>
              </div>
              <div className="p-2">
                <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-400">
                  Head of Household
                </span>
              </div>
              <div className="p-2">
                <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-400">Address</span>
              </div>
              <div className="p-2">
                <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-400">Members</span>
              </div>
              <div className="p-2">
                <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-400">Created</span>
              </div>
            </div>

            {/* Actions Column */}
            <div className="w-12 p-1"></div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(() => {
              if (isLoading) {
                return (
                  <div className="p-8 text-center">
                    <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-600">Loading households...</p>
                  </div>
                );
              }

              if (households.length === 0) {
                const noResultsMessage = localSearchTerm
                  ? `No households found matching "${localSearchTerm}"`
                  : 'No households found';

                return (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">{noResultsMessage}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                      Households are created automatically when you add residents.
                    </p>
                  </div>
                );
              }

              return households.map(household => (
                <div
                  key={household.code}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-700 flex items-center p-0 transition-colors"
                >
                  {/* Checkbox */}
                  <div className="p-2">
                    <Button
                      onClick={() => handleSelectHousehold(household.code)}
                      variant="neutral-outline"
                      size="sm"
                      className="size-4 min-w-0 p-0"
                    >
                      {selectedHouseholds.has(household.code) && (
                        <div className="size-2 rounded-xs bg-blue-600"></div>
                      )}
                    </Button>
                  </div>

                  {/* Content Columns */}
                  <div className="grid flex-1 grid-cols-5 gap-4 p-2">
                    <div className="p-2">
                      <Link
                        href={`/households/${household.code}`}
                        className="font-montserrat text-base font-normal text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:underline"
                      >
                        #{household.code}
                      </Link>
                    </div>
                    <div className="p-2">
                      <div className="font-montserrat text-base font-normal text-gray-600 dark:text-gray-400">
                        {formatFullName(household.head_resident)}
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="font-montserrat text-base font-normal text-gray-600 dark:text-gray-400">
                        {formatFullAddress(household)}
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="font-montserrat text-base font-normal text-gray-600 dark:text-gray-400">
                        {household.member_count} member{household.member_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="font-montserrat text-base font-normal text-gray-600 dark:text-gray-400">
                        {new Date(household.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="p-1">
                    <Button variant="neutral-outline" size="sm" iconOnly>
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
    </div>
  );
}

export default function HouseholdsPage() {
  return <HouseholdsContent />;
}
