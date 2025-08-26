import React, { useEffect } from 'react';

import { InputField, SelectField, ControlField } from '@/components';
import {
  useMigrationInformation,
  MigrationInformationData,
} from '@/hooks/utilities/useMigrationInformation';
import type { FormMode } from '@/types';

export type { MigrationInformationData };

export interface MigrationInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: MigrationInformationData;
  onChange: (value: MigrationInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function MigrationInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
}: Readonly<MigrationInformationProps>) {
  // Use custom hook for migration information management
  const {
    migrationData,
    selectedBarangayInfo,
    barangayOptions,
    isLoadingBarangays,
    updateMigrationData,
    setMigrationData,
    handleBarangaySelect,
    searchBarangays,
    hasMore,
    loadMore,
    isLoadingMore,
    totalCount,
  } = useMigrationInformation({
    initialData: value,
    onChange,
  });

  // Sync with external value changes
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(migrationData)) {
      setMigrationData(value);
    }
  }, [value, migrationData, setMigrationData]);

  return (
    <div
      className={`rounded-lg border border-gray-300 bg-white p-6 shadow-xs dark:border-gray-600 dark:bg-gray-800 ${className}`}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Migration Information
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Details about previous residence and migration timeline.
          </p>
        </div>

        {/* Migration Timeline */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="col-span-4">
            <SelectField
              label="Previous Barangay"
              required
              labelSize="sm"
              errorMessage={errors.previous_barangay_code}
              helperText="Search for the previous barangay"
              mode={mode}
              selectProps={{
                placeholder: 'Search for previous barangay...',
                options: barangayOptions.map(place => {
                  // Format hierarchical display based on level
                  let displayLabel = place.name;
                  let description = '';
                  let badge = place.level;

                  if (place.level === 'barangay') {
                    // For barangay: "Barangay Name, City, Province"
                    if ((place as any).city_name && (place as any).province_name) {
                      displayLabel = `${place.name}, ${(place as any).city_name}, ${(place as any).province_name}`;
                    } else if ((place as any).city_name) {
                      displayLabel = `${place.name}, ${(place as any).city_name}`;
                    }
                    badge = 'barangay';
                  } else if (place.level === 'city') {
                    // For city/municipality: "City Name, Province"
                    if ((place as any).province_name) {
                      displayLabel = `${place.name}, ${(place as any).province_name}`;
                    }
                    badge = (place as any).type || 'city';
                  } else if (place.level === 'province') {
                    // For province: just "Province Name"
                    displayLabel = place.name;
                    badge = 'province';
                  }

                  // Format description for subtext
                  if ((place as any).full_address) {
                    // Use full address but trim to province level (remove region)
                    const parts = (place as any).full_address.split(', ');
                    if (parts.length >= 3) {
                      description = parts.slice(0, 3).join(', '); // Up to Province
                    } else {
                      description = (place as any).full_address;
                    }
                  }

                  return {
                    value: place.code,
                    label: displayLabel,
                    description: description,
                    badge: badge,
                  };
                }),
                value: migrationData.previous_barangay_code || '',
                searchable: true,
                loading: isLoadingBarangays,
                onSelect: option => {
                  if (option) {
                    // Find the original barangay data by matching the value (code)
                    const originalBarangay = barangayOptions.find(b => b.code === option.value);
                    if (originalBarangay) {
                      handleBarangaySelect(originalBarangay);
                    }
                  }
                },
                onSearch: searchBarangays,
                disabled: false,
                // Lazy loading props
                hasMore: hasMore,
                onLoadMore: loadMore,
                loadingMore: isLoadingMore,
                infiniteScroll: true,
              }}
            />

            {/* Display selected address hierarchy (read-only) */}
            {migrationData.previous_barangay_code && selectedBarangayInfo && (
              <div className="bg-info/5 border-info/20 rounded-md border p-3">
                <h6 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                  Selected Previous Address
                </h6>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <span className="form-info-title">Barangay:</span>
                    <div className="form-info-content">
                      {selectedBarangayInfo.barangay || 'Not set'}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {migrationData.previous_barangay_code}
                    </div>
                  </div>
                  <div>
                    <span className="form-info-title">City/Municipality:</span>
                    <div className="form-info-content">
                      {selectedBarangayInfo.city || 'Not set'}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {migrationData.previous_city_municipality_code}
                    </div>
                  </div>
                  <div>
                    <span className="form-info-title">Province:</span>
                    <div className="form-info-content">
                      {selectedBarangayInfo.province || 'Not set'}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {migrationData.previous_province_code}
                    </div>
                  </div>
                  <div>
                    <span className="form-info-title">Region:</span>
                    <div className="form-info-content">
                      {selectedBarangayInfo.region || 'Not set'}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {migrationData.previous_region_code}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <InputField
            label="Length of Stay in Previous Location (months)"
            labelSize="sm"
            errorMessage={errors.length_of_stay_previous_months}
            mode={mode}
            inputProps={{
              type: 'number',
              value: migrationData.length_of_stay_previous_months || '',
              onChange: e =>
                updateMigrationData(
                  'length_of_stay_previous_months',
                  parseInt(e.target.value) || 0
                ),
              placeholder: 'Number of months',
              min: '0',
            }}
          />

          <InputField
            label="Reason for Leaving Previous Location"
            labelSize="sm"
            errorMessage={errors.reason_for_leaving}
            mode={mode}
            inputProps={{
              value: migrationData.reason_for_leaving || '',
              onChange: e => updateMigrationData('reason_for_leaving', e.target.value),
              placeholder: 'e.g., employment, family, education',
            }}
          />

          <InputField
            label="Date of Transfer"
            labelSize="sm"
            errorMessage={errors.date_of_transfer}
            mode={mode}
            inputProps={{
              type: 'date',
              value: migrationData.date_of_transfer || '',
              onChange: e => updateMigrationData('date_of_transfer', e.target.value),
            }}
          />

          <InputField
            label="Reason for Transferring Here"
            labelSize="sm"
            errorMessage={errors.reason_for_transferring}
            mode={mode}
            inputProps={{
              value: migrationData.reason_for_transferring || '',
              onChange: e => updateMigrationData('reason_for_transferring', e.target.value),
              placeholder: 'e.g., job opportunity, family reunion',
            }}
          />

          <InputField
            label="Duration of Stay in Current Location (months)"
            labelSize="sm"
            errorMessage={errors.duration_of_stay_current_months}
            mode={mode}
            inputProps={{
              type: 'number',
              value: migrationData.duration_of_stay_current_months || '',
              onChange: e =>
                updateMigrationData(
                  'duration_of_stay_current_months',
                  parseInt(e.target.value) || 0
                ),
              placeholder: 'Number of months',
              min: '0',
            }}
          />

          <ControlField
            label="Intending to Return?"
            labelSize="sm"
            errorMessage={errors.is_intending_to_return}
            mode={mode}
            toggleText={{
              checked: 'Yes, resident plans to return to previous residence',
              unchecked: 'No, resident does not plan to return',
            }}
            controlProps={{
              type: 'toggle',
              checked: Boolean(migrationData.is_intending_to_return),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                updateMigrationData('is_intending_to_return', e.target.checked),
              size: 'md',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MigrationInformation;
