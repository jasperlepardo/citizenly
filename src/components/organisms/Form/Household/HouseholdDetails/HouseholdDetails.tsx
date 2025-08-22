import React from 'react';
import { AddressDetails } from './FormField/AddressDetails';
import { GeographicLocation } from './FormField/GeographicLocation';
import { HouseholdStatistics } from './FormField/HouseholdStatistics';
import { FormMode, HouseholdDetailsData } from '../types';

export interface HouseholdDetailsFormProps {
  formData: HouseholdDetailsData;
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors?: Record<string, string>;
  mode?: FormMode;
  className?: string;
}

/**
 * Household Details Form Component
 * 
 * Main form component for household location and statistical information.
 * Includes address details, geographic location hierarchy, and household statistics.
 */
export function HouseholdDetails({
  formData,
  onChange,
  errors,
  mode = 'edit',
  className = '',
}: HouseholdDetailsFormProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Form Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Household Location Details
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Provide the physical address and administrative location information for this household.
        </p>
      </div>

      {/* Address Details Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Physical Address
        </h3>
        <AddressDetails
          formData={formData}
          onChange={onChange}
          errors={errors}
          mode={mode}
        />
      </div>

      {/* Geographic Location Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Administrative Location
        </h3>
        <GeographicLocation
          formData={formData}
          onChange={onChange}
          errors={errors}
          mode={mode}
        />
      </div>

      {/* Household Statistics Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Household Statistics
        </h3>
        <HouseholdStatistics
          formData={formData}
          onChange={onChange}
          errors={errors}
          mode={mode}
        />
      </div>

      {/* Form Footer Information */}
      {mode === 'create' && (
        <div className="bg-info-50 border border-info-200 rounded-lg p-3 dark:bg-info-950 dark:border-info-800">
          <div className="space-y-1.5">
            <p className="font-medium text-info-800 dark:text-info-200">📍 Location Data Requirements</p>
            <p className="text-sm text-info-700 dark:text-info-300">
              All location fields are required for proper household registration. 
              Statistical data helps in barangay planning and resource allocation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}