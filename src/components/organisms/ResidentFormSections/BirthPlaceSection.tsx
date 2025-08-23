/**
 * Birth Place Information Section for Resident Forms
 * Handles birth place details including location name and code
 */

import React from 'react';
import { SelectField } from '@/components/molecules';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';
import { useOptimizedPsgcSearch } from '@/hooks/search/useOptimizedPsgcSearch';

interface BirthPlaceSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}


/**
 * Birth Place Information Form Section
 *
 * @description Renders birth place information fields including name, code, and level
 * @param props - Component props
 * @returns JSX element for birth place information section
 *
 * @example
 * ```typescript
 * <BirthPlaceSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function BirthPlaceSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: BirthPlaceSectionProps) {
  // PSGC search hook for birthplace with infinite scroll support
  const { 
    options: psgcOptions, 
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    setQuery 
  } = useOptimizedPsgcSearch({
    levels: 'all',
    limit: 20,  // Reduced to 20 for better pagination
    debounceMs: 300,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  const handlePsgcSelect = (option: any) => {
    if (option) {
      updateField('birth_place_name', option.label);
      updateField('birth_place_code', option.value);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-xs p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Birth Place Information</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Location where the resident was born.
          </p>
        </div>

        <div className="col-span-4">
          <SelectField
            label="Birth Place"
            required
            labelSize="sm"
            errorMessage={errors.birth_place_name}
            helperText="Search for the place of birth"
            selectProps={{
              placeholder: "Search for birth place...",
              options: psgcOptions.map(place => {
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
                  badge: badge
                };
              }),
              value: formData.birth_place_code || '',
              searchable: true,
              loading: isLoading,
              onSelect: handlePsgcSelect,
              onSearch: setQuery,
              disabled: disabled,
              // Infinite scroll props
              infiniteScroll: true,
              hasMore: hasMore,
              onLoadMore: loadMore,
              loadingMore: isLoadingMore
            }}
          />
          
          {/* Display selected birth place info (read-only) */}
          {formData.birth_place_code && formData.birth_place_name && (
            <div className="bg-info/5 border border-info/20 rounded-md p-3">
              <h6 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Selected Birth Place</h6>
              <div className="text-sm">
                <div>
                  <span className="form-info-title">Location:</span>
                  <div className="form-info-content">{formData.birth_place_name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{formData.birth_place_code}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
