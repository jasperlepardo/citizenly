import React, { useMemo } from 'react';

import { InputField, SelectField } from '@/components';
import { usePsgcSearch } from '@/hooks/search/usePsgcSearch';
import { formatBirthdateWithAgeCompact } from '@/utils/shared/dateUtils';
import type { FormMode, BirthInformationFormData } from '@/types';

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
}: Readonly<BirthInformationProps>) {
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

  // State to track PSGC lookup loading
  const [isLookingUpPsgc, setIsLookingUpPsgc] = React.useState(false);
  
  // Auto-lookup complete birth place address when we have code but incomplete name
  React.useEffect(() => {
    if (value.birth_place_code && value.birth_place_name) {
      // Check if birth place name looks incomplete (just city name without province)
      const isIncomplete = !value.birth_place_name.includes(',');
      if (isIncomplete && !isLookingUpPsgc) {
        console.log('🔍 BirthInformation: Auto-looking up complete birth place address:', value.birth_place_code);
        setIsLookingUpPsgc(true);
        
        // Use PSGC lookup API to get complete address
        fetch(`/api/psgc/lookup?code=${value.birth_place_code}`)
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

  const handleChange = (field: keyof BirthInformationFormData, fieldValue: any) => {
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
      .filter(place => {
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
      .map(place => {
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
    if (value.birth_place_code && value.birth_place_name) {
      const exists = allOptions.some(opt => opt.value === value.birth_place_code);
      if (!exists) {
        // Always use the actual birth_place_name from database as display label
        // This prevents "Unknown City" fallback text from being used as search query
        let displayLabel = value.birth_place_name;
        const matchingOption = effectivePsgcOptions.find(opt => opt.code === value.birth_place_code);
        
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
    return allOptions;
  }, [effectivePsgcOptions, value.birth_place_code, value.birth_place_name, effectivePsgcLoading]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Birth Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Birth date and place information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <InputField
          mode={mode}
          label="Birth Date"
          required
          labelSize="sm"
          errorMessage={errors.birthdate}
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
          errorMessage={errors.birth_place_name}
          helperText="Search for the place of birth"
          selectProps={{
            placeholder: 'Search for birth place...',
            options: birthPlaceOptions,
            value: value.birth_place_code,
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
