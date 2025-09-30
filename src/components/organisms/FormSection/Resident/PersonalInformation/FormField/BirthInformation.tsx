'use client';

import React, { useMemo, useEffect, useState } from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import { usePsgcSearch } from '@/hooks/search/usePsgcSearch';
import { formatBirthdateWithAgeCompact } from '@/utils/shared/dateUtils';

import type { FormMode } from '@/types/app/ui/forms';
import type { BirthInformationFormData } from '@/types/domain/residents/forms';

export interface BirthInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: BirthInformationFormData;
  onChange: (value: BirthInformationFormData) => void;
  errors: Record<string, string>;
  className?: string;
  // PSGC search functionality for birth place lookup
  onPsgcSearch?: (query: string) => void;
  psgcOptions?: any[];
  psgcLoading?: boolean;
  // Individual field loading states
  loadingStates?: {
    birthdate?: boolean;
    birth_place_name?: boolean;
    birth_place_code?: boolean;
  };
}

export function BirthInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
  onPsgcSearch: externalPsgcSearch,
  psgcOptions: externalPsgcOptions = [],
  psgcLoading: externalPsgcLoading = false,
  loadingStates = {},
}: Readonly<BirthInformationProps>) {
  // State for resolved birth place name when only code is available
  const [resolvedBirthPlaceName, setResolvedBirthPlaceName] = useState<string>('');
  // State to track PSGC lookup loading
  const [isLookingUpPsgc, setIsLookingUpPsgc] = useState(false);

  // PSGC search hook for birth place
  const {
    options: psgcOptions,
    isLoading: psgcLoading,
    setQuery: handlePsgcSearch,
  } = usePsgcSearch({
    levels: 'all', // Allow province, city, and barangay selection
    limit: 20, // Smaller initial load for better performance
    debounceMs: 300,
  });

  // Use external PSGC search function if available, otherwise fall back to internal hook
  const effectivePsgcOptions = externalPsgcOptions.length > 0 ? externalPsgcOptions : psgcOptions;
  const effectivePsgcLoading = externalPsgcSearch ? externalPsgcLoading : (psgcLoading || isLookingUpPsgc);
  const effectiveSearchFunction = externalPsgcSearch || handlePsgcSearch;

  // Lookup birth place name from code for view mode
  useEffect(() => {
    const shouldLookup = mode === 'view' && value.birth_place_code && (!value.birth_place_name || value.birth_place_name.trim() === '') && !resolvedBirthPlaceName;

    console.log('🔍 BirthInformation: useEffect triggered with:', {
      mode,
      birth_place_code: value.birth_place_code,
      birth_place_name: value.birth_place_name,
      birth_place_name_length: value.birth_place_name?.length,
      birth_place_name_trimmed: value.birth_place_name?.trim(),
      resolvedBirthPlaceName,
      shouldLookup
    });

    const lookupBirthPlace = async () => {
      if (shouldLookup) {
        try {
          console.log('🔍 BirthInformation: Starting lookup for code:', value.birth_place_code);
          const response = await fetch(`/api/psgc/lookup?code=${encodeURIComponent(value.birth_place_code || '')}`);
          console.log('🔍 BirthInformation: API response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('🔍 BirthInformation: API response data:', data);

            if (data.data?.name) {
              // Format the display name similar to search results
              let displayName = data.data.name;
              if (data.data.level === 'city' && data.data.province_name) {
                displayName = `${data.data.name}, ${data.data.province_name}`;
              } else if (data.data.level === 'barangay' && data.data.city_name && data.data.province_name) {
                displayName = `${data.data.name}, ${data.data.city_name}, ${data.data.province_name}`;
              }

              console.log('🔍 BirthInformation: Setting resolved birth place name:', displayName);
              setResolvedBirthPlaceName(displayName);
            } else {
              console.warn('🔍 BirthInformation: No name in response data:', data);
            }
          } else {
            console.warn('🔍 BirthInformation: Failed to lookup birth place for code:', value.birth_place_code, 'Status:', response.status);
          }
        } catch (error) {
          console.error('🔍 BirthInformation: Error looking up birth place:', error);
        }
      } else if (value.birth_place_name && value.birth_place_name.trim() !== '') {
        // Use existing birth_place_name if available and not empty
        console.log('🔍 BirthInformation: Using existing birth_place_name:', value.birth_place_name);
        setResolvedBirthPlaceName(value.birth_place_name);
      } else {
        // Clear resolved name if no code or conditions not met
        console.log('🔍 BirthInformation: Clearing resolved name, conditions not met');
        setResolvedBirthPlaceName('');
      }
    };

    lookupBirthPlace();
  }, [mode, value.birth_place_code, value.birth_place_name]);

  // Auto-lookup complete birth place address when we have code but incomplete name
  React.useEffect(() => {
    if (value.birth_place_code && value.birth_place_name) {
      // Check if birth place name looks incomplete (just city name without province)
      const isIncomplete = !value.birth_place_name.includes(',');
      if (isIncomplete && !isLookingUpPsgc) {
        console.log('🔍 BirthInformation: Auto-looking up complete birth place address:', value.birth_place_code);
        setIsLookingUpPsgc(true);
        
        // Use PSGC lookup API to get complete address
        fetch(`/api/psgc/lookup?code=${value.birth_place_code || ''}`)
          .then(response => response.json())
          .then(result => {
            if (result.data) {
              console.log('🔍 BirthInformation: Found complete address data:', result.data);
              
              // Format address without region (city, province only)
              let formattedAddress = '';
              if (result.data.level === 'city' && result.data.city_name && result.data.province_name) {
                formattedAddress = `${result.data.city_name}, ${result.data.province_name}`;
              } else if (result.data.level === 'barangay' && result.data.barangay_name && result.data.city_name && result.data.province_name) {
                formattedAddress = `${result.data.barangay_name}, ${result.data.city_name}, ${result.data.province_name}`;
              } else if (result.data.name && result.data.province_name) {
                formattedAddress = `${result.data.name}, ${result.data.province_name}`;
              } else {
                formattedAddress = result.data.full_address; // Fallback to full address
              }
              
              console.log('🔍 BirthInformation: Formatted address (without region):', formattedAddress);
              
              // Update the birth place name with the formatted address
              onChange({
                ...value,
                birth_place_name: formattedAddress,
              });
            }
          })
          .catch(error => {
            console.error('🔍 BirthInformation: PSGC lookup failed:', error);
          })
          .finally(() => {
            setIsLookingUpPsgc(false);
          });
      }
    }
  }, [value.birth_place_code, value.birth_place_name, isLookingUpPsgc, onChange]);

  const handleChange = (field: keyof BirthInformationFormData, fieldValue: string) => {
    console.log(`🔍 BirthInformation: handleChange called for ${field}:`, fieldValue);
    const newValue = {
      ...value,
      [field]: fieldValue,
    };
    console.log('🔍 BirthInformation: Calling onChange with:', newValue);
    onChange(newValue);
  };

  // Memoize options to prevent infinite re-renders
  const birthPlaceOptions = useMemo(() => {
    console.log('🔍 BirthInformation: Creating birthPlaceOptions from effectivePsgcOptions:', effectivePsgcOptions);
    console.log('🔍 BirthInformation: First place object:', effectivePsgcOptions[0]);
    const allOptions = effectivePsgcOptions
      .filter((place: any) => {
        // Check for both PSGC API format (name) and Select option format (label)
        const hasName = place && (place.name || place.label);
        console.log('🔍 BirthInformation: Filter check -', {
          place: place?.code || place?.value,
          name: place?.name,
          label: place?.label,
          hasName
        });
        return hasName;
      }) // Pre-filter to only places with valid names
      .map((place: any) => {
        console.log('🔍 BirthInformation: Processing place object:', place);
        // Format hierarchical display based on level
        // Handle both PSGC API format (name) and Select option format (label)
        let displayLabel = place.name || place.label;
        let description = '';
        let badge = place.level || 'location';
        console.log(`🔍 BirthInformation: Initial displayLabel: "${displayLabel}", level: "${place.level}"`);

        // Handle both PSGC API format and Select option format
        const placeName = place.name || place.label;
        const provinceInfo = (place as any).province_name || (place as any).description?.split(', ')[1];
        const cityInfo = (place as any).city_name;
        
        if (place.level === 'barangay') {
          // For barangay: "Barangay Name, City, Province"
          if (cityInfo && provinceInfo) {
            displayLabel = `${placeName}, ${cityInfo}, ${provinceInfo}`;
          } else if (cityInfo) {
            displayLabel = `${placeName}, ${cityInfo}`;
          } else if (provinceInfo) {
            displayLabel = `${placeName}, ${provinceInfo}`;
          } else {
            displayLabel = placeName;
          }
          badge = 'barangay';
        } else if (place.level === 'city') {
          // For city/municipality: "City Name, Province"
          if (provinceInfo) {
            displayLabel = `${placeName}, ${provinceInfo}`;
          } else {
            // Fallback: try to extract from description "Mendez, Cavite, Region IV-A"
            const desc = (place as any).description || '';
            if (desc.includes(',')) {
              const parts = desc.split(', ');
              if (parts.length >= 2) {
                displayLabel = `${placeName}, ${parts[1]}`; // "Mendez, Cavite"
              }
            } else {
              displayLabel = placeName;
            }
          }
          badge = (place as any).type || 'city';
        } else if (place.level === 'province') {
          // For province: just "Province Name"
          displayLabel = placeName;
          badge = 'province';
        } else {
          // For other levels, use the name as-is
          displayLabel = placeName;
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

        const placeCode = place.code || place.value;
        console.log(`🔍 BirthInformation: Final displayLabel for ${placeCode}: "${displayLabel}"`);
        const option = {
          value: placeCode,
          label: displayLabel,
          description: description,
          badge: badge,
        };
        console.log('🔍 BirthInformation: Created option:', option);
        return option;
      }); // No need for additional filter since we pre-filtered

    // Ensure current selected value is always in options for proper display in view mode
    if (value.birth_place_code) {
      const exists = allOptions.some((opt: any) => opt.value === value.birth_place_code);
      if (!exists) {
        // Use the resolved birth place name if available, otherwise fall back to stored name, or show code as fallback
        let displayLabel = resolvedBirthPlaceName || value.birth_place_name || value.birth_place_code;
        const matchingOption = effectivePsgcOptions.find((opt: any) => opt.code === value.birth_place_code);
        
        // Only enhance the label if we have complete data from search results
        if (matchingOption && matchingOption.name) {
          if (matchingOption.level === 'city' && (matchingOption as any).province_name) {
            displayLabel = `${matchingOption.name}, ${(matchingOption as any).province_name}`;
          } else if (matchingOption.level === 'barangay') {
            if ((matchingOption as any).city_name && (matchingOption as any).province_name) {
              displayLabel = `${matchingOption.name}, ${(matchingOption as any).city_name}, ${(matchingOption as any).province_name}`;
            } else if ((matchingOption as any).city_name) {
              displayLabel = `${matchingOption.name}, ${(matchingOption as any).city_name}`;
            }
          } else {
            // For other levels, use the enhanced name from search results
            displayLabel = matchingOption.name;
          }
        }
        // Note: Removed the "Loading address..." and fallback logic that was causing "Unknown City" to be searched
        
        allOptions.unshift({
          value: value.birth_place_code,
          label: displayLabel, // This will now always be the actual birth_place_name from database
          description: 'Current selection',
          badge: matchingOption?.level || 'location',
        });
      }
    }

    console.log('🔍 BirthInformation: Final birthPlaceOptions:', allOptions);
    console.log('🔍 BirthInformation: Current value.birth_place_code:', value.birth_place_code);
    console.log('🔍 BirthInformation: Current value.birth_place_name:', value.birth_place_name);
    console.log('🔍 BirthInformation: Current resolvedBirthPlaceName:', resolvedBirthPlaceName);
    console.log('🔍 BirthInformation: Options count:', allOptions.length);

    // Log if we found an option that matches the current birth_place_code
    const matchingOption = allOptions.find((opt: any) => opt.value === value.birth_place_code);
    console.log('🔍 BirthInformation: Matching option for current code:', matchingOption);

    return allOptions;
  }, [effectivePsgcOptions, value.birth_place_code, value.birth_place_name, resolvedBirthPlaceName]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Birth Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Birth date and place information.
        </p>
      </div>

      <div className={mode === 'view' ? 'space-y-4' : 'grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'}>
        <InputField
          mode={mode}
          label="Birth Date"
          required
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.birthdate}
          loading={loadingStates.birthdate}
          inputProps={{
            type: 'date',
            value: mode === 'view' ? formatBirthdateWithAgeCompact(value.birthdate) : value.birthdate,
            onChange: e => handleChange('birthdate', e.target.value),
            required: true,
          }}
        />

        <SelectField
          mode={mode}
          label="Birth Place"
          required
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.birth_place_name}
          helperText={mode === 'view' ? undefined : "Search for the place of birth"}
          loading={loadingStates.birth_place_name || loadingStates.birth_place_code}
          selectProps={{
            placeholder: 'Search for birth place...',
            options: birthPlaceOptions,
            value: value.birth_place_code || '',
            onSelect: option => {
              console.log('🔍 BirthInformation: Birth place selected:', option);
              const newCode = option?.value || '';
              const newName = option?.label || '';
              console.log(`🔍 BirthInformation: Setting birth_place_code to: "${newCode}"`);
              console.log(`🔍 BirthInformation: Setting birth_place_name to: "${newName}"`);

              // Update both fields in a single onChange call to prevent race conditions
              onChange({
                ...value,
                birth_place_code: newCode,
                birth_place_name: newName,
              });
            },
            onSearch: effectiveSearchFunction,
            loading: effectivePsgcLoading,
          }}
        />
      </div>
    </div>
  );
}

export default BirthInformation;
