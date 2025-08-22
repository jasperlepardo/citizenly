import React, { useEffect } from 'react';
import { InputField, SelectField, ControlField } from '@/components/molecules';
import { useMigrationInformation, MigrationInformationData } from '@/hooks/utilities/useMigrationInformation';

export type { MigrationInformationData };

export interface MigrationInformationProps {
  value: MigrationInformationData;
  onChange: (value: MigrationInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function MigrationInformation({ 
  value, 
  onChange, 
  errors,
  className = '' 
}: Readonly<MigrationInformationProps>) {
  
  // Use custom hook for migration information management
  const {
    migrationData,
    selectedBarangayInfo,
    barangayOptions,
    isLoadingBarangays,
    updateMigrationData,
    searchBarangays,
    handleBarangaySelect,
    setMigrationData
  } = useMigrationInformation({
    initialData: value,
    onChange
  });

  // Sync with external value changes
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(migrationData)) {
      setMigrationData(value);
    }
  }, [value, migrationData, setMigrationData]);




  return (
    <div className={`bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 ${className}`}>
      <div>
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Migration Information</h4>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Details about previous residence and migration timeline.
        </p>
      </div>

      <div className="space-y-4">
        {/* Previous Address */}
        <div>
          <h5 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Previous Address</h5>
          <div className="grid grid-cols-1 gap-4">
            <SelectField
              label="Previous Barangay"
              labelSize="sm"
              errorMessage={errors.previous_barangay_code}
              selectProps={{
                placeholder: "Search and select previous barangay...",
                options: barangayOptions.map(option => ({
                  value: option.code,
                  label: option.name
                })),
                value: migrationData.previous_barangay_code || '',
                searchable: true,
                loading: isLoadingBarangays,
                onSearch: (searchTerm: string) => { searchBarangays(searchTerm); },
                onSelect: (option: any) => {
                  if (option) {
                    // Find the original PsgcSearchResult by value
                    const originalOption = barangayOptions.find(o => o.code === option.value);
                    if (originalOption) {
                      handleBarangaySelect(originalOption);
                    }
                  }
                }
              }}
            />
            
            {/* Display selected address hierarchy (read-only) */}
            {migrationData.previous_barangay_code && selectedBarangayInfo && (
              <div className="bg-info/5 border border-info/20 rounded-md p-3">
                <h6 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Selected Previous Address</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="form-info-title">Barangay:</span>
                    <div className="form-info-content">{selectedBarangayInfo.barangay || 'Not set'}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{migrationData.previous_barangay_code}</div>
                  </div>
                  <div>
                    <span className="form-info-title">City/Municipality:</span>
                    <div className="form-info-content">{selectedBarangayInfo.city || 'Not set'}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{migrationData.previous_city_municipality_code}</div>
                  </div>
                  <div>
                    <span className="form-info-title">Province:</span>
                    <div className="form-info-content">{selectedBarangayInfo.province || 'Not set'}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{migrationData.previous_province_code}</div>
                  </div>
                  <div>
                    <span className="form-info-title">Region:</span>
                    <div className="form-info-content">{selectedBarangayInfo.region || 'Not set'}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{migrationData.previous_region_code}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Migration Timeline */}
        <div>
          <h5 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Migration Timeline</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Length of Stay in Previous Location (months)"
              labelSize="sm"
              errorMessage={errors.length_of_stay_previous_months}
              inputProps={{
                type: "number",
                value: migrationData.length_of_stay_previous_months || '',
                onChange: (e) => updateMigrationData('length_of_stay_previous_months', parseInt(e.target.value) || 0),
                placeholder: "Number of months",
                min: "0"
              }}
            />
            
            <InputField
              label="Reason for Leaving Previous Location"
              labelSize="sm"
              errorMessage={errors.reason_for_leaving}
              inputProps={{
                value: migrationData.reason_for_leaving || '',
                onChange: (e) => updateMigrationData('reason_for_leaving', e.target.value),
                placeholder: "e.g., employment, family, education"
              }}
            />
            
            <InputField
              label="Date of Transfer"
              labelSize="sm"
              errorMessage={errors.date_of_transfer}
              inputProps={{
                type: "date",
                value: migrationData.date_of_transfer || '',
                onChange: (e) => updateMigrationData('date_of_transfer', e.target.value)
              }}
            />
            
            <InputField
              label="Reason for Transferring Here"
              labelSize="sm"
              errorMessage={errors.reason_for_transferring}
              inputProps={{
                value: migrationData.reason_for_transferring || '',
                onChange: (e) => updateMigrationData('reason_for_transferring', e.target.value),
                placeholder: "e.g., job opportunity, family reunion"
              }}
            />
            
            <InputField
              label="Duration of Stay in Current Location (months)"
              labelSize="sm"
              errorMessage={errors.duration_of_stay_current_months}
              inputProps={{
                type: "number",
                value: migrationData.duration_of_stay_current_months || '',
                onChange: (e) => updateMigrationData('duration_of_stay_current_months', parseInt(e.target.value) || 0),
                placeholder: "Number of months",
                min: "0"
              }}
            />
          </div>
        </div>

        {/* Migration Status */}
        <div>
          <h5 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Migration Status</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ControlField
              label="Intending to Return?"
              labelSize="sm"
              errorMessage={errors.is_intending_to_return}
              toggleText={{
                checked: 'Yes, resident plans to return to previous residence',
                unchecked: 'No, resident does not plan to return'
              }}
              controlProps={{
                type: 'toggle',
                checked: Boolean(migrationData.is_intending_to_return),
                defaultChecked: false,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateMigrationData('is_intending_to_return', e.target.checked),
                size: 'md'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MigrationInformation;