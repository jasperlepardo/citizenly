/**
 * HouseholdLocationInfo Component
 * Displays geographic location information for a household
 */

import React from 'react';

interface AddressDisplayInfo {
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
}

interface HouseholdLocationInfoProps {
  addressDisplayInfo: AddressDisplayInfo;
  barangayCode?: string;
}

export default function HouseholdLocationInfo({
  addressDisplayInfo,
  barangayCode,
}: HouseholdLocationInfoProps) {
  return (
    <div className="-m-4 mb-6 border-b border-green-200 bg-green-50 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-green-600">📍</span>
        <div>
          <h5 className="mb-2 font-medium text-green-800">Household Location</h5>
          <div className="space-y-1 text-sm text-green-700">
            <div>
              <strong>Region:</strong> {addressDisplayInfo.region}
            </div>
            <div>
              <strong>Province:</strong> {addressDisplayInfo.province}
            </div>
            <div>
              <strong>City/Municipality:</strong> {addressDisplayInfo.cityMunicipality}
            </div>
            <div>
              <strong>Barangay:</strong> {addressDisplayInfo.barangay}
            </div>
            {barangayCode && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">Code: {barangayCode}</div>
            )}
            <div className="mt-2 text-xs text-green-600">
              All household geographic details are auto-populated from your barangay assignment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
