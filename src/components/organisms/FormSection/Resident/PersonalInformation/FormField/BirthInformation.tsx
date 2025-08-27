import React, { useMemo } from 'react';

import { InputField, SelectField } from '@/components';
import { useOptimizedPsgcSearch } from '@/hooks/search/useOptimizedPsgcSearch';
import type { FormMode } from '@/types';

export interface BirthInformationData {
  birthdate: string;
  birth_place_name: string;
  birth_place_code: string;
}

export interface BirthInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: BirthInformationData;
  onChange: (value: BirthInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function BirthInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
}: Readonly<BirthInformationProps>) {
  // PSGC search hook for birth place
  const {
    options: psgcOptions,
    isLoading: psgcLoading,
    searchTerm: psgcSearchTerm,
    handleSearch: handlePsgcSearch,
  } = useOptimizedPsgcSearch({
    initialValue: value.birth_place_name,
    minChars: 2,
    levels: ['province', 'city', 'barangay'], // Allow province, city, and barangay selection
    limit: 20, // Smaller initial load for better performance
    debounceMs: 300,
  });

  const handleChange = (field: keyof BirthInformationData, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Memoize options to prevent infinite re-renders
  const birthPlaceOptions = useMemo(() => {
    const allOptions = psgcOptions.map(place => {
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
    });

    // Ensure current selected value is always in options for proper display in view mode
    if (value.birth_place_code && value.birth_place_name) {
      const exists = allOptions.some(opt => opt.value === value.birth_place_code);
      if (!exists) {
        allOptions.unshift({
          value: value.birth_place_code,
          label: value.birth_place_name,
          description: 'Current selection',
          badge: 'selected',
        });
      }
    }
    
    return allOptions;
  }, [psgcOptions, value.birth_place_code, value.birth_place_name]);

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
            value: value.birthdate,
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
              handleChange('birth_place_code', option?.value || '');
              handleChange('birth_place_name', option?.label || '');
            },
            onSearch: handlePsgcSearch,
            loading: psgcLoading,
            clearable: true,
          }}
        />
      </div>
    </div>
  );
}

export default BirthInformation;