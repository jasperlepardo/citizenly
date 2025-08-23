import React from 'react';
import { InputField, SelectField } from '@/components/molecules';
import { useOptimizedPsgcSearch } from '@/hooks/search/useOptimizedPsgcSearch';

export interface BirthInformationData {
  birthdate: string;
  birthPlaceName: string;
  birthPlaceCode: string;
}

export interface BirthInformationProps {
  value: BirthInformationData;
  onChange: (value: BirthInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function BirthInformation({ 
  value, 
  onChange, 
  errors,
  className = '' 
}: Readonly<BirthInformationProps>) {
  
  // PSGC search hook for birth place
  const { 
    setQuery: setSearchQuery, 
    options: psgcOptions, 
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore
  } = useOptimizedPsgcSearch({
    levels: 'all', // Show all levels for flexible birth place selection
    limit: 20, // Smaller initial load for better performance
    debounceMs: 300,
  });

  const handleChange = (field: keyof BirthInformationData, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

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
          label="Birth Date"
          required
          labelSize="sm"
          errorMessage={errors.birthdate}
          inputProps={{
            type: "date",
            value: value.birthdate,
            onChange: (e) => handleChange('birthdate', e.target.value),
            required: true
          }}
        />
        
        <SelectField
          label="Birth Place"
          required
          labelSize="sm"
          errorMessage={errors.birthPlaceName}
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
            value: value.birthPlaceCode,
            loading: isLoading,
            searchable: true,
            onSearch: setSearchQuery,
            onSelect: (option) => {
              if (option) {
                handleChange('birthPlaceName', (option as any).label);
                handleChange('birthPlaceCode', (option as any).value);
              } else {
                handleChange('birthPlaceName', '');
                handleChange('birthPlaceCode', '');
              }
            },
            // Infinite scroll props
            infiniteScroll: true,
            hasMore: hasMore,
            onLoadMore: loadMore,
            loadingMore: isLoadingMore
          }}
        />
          
          {/* Display selected birth place info (read-only) */}
          {value.birthPlaceCode && value.birthPlaceName && (
            <div className="bg-gray-500 border border-info/20 rounded-md p-3">
              <h6 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Selected Birth Place</h6>
              <div className="text-sm">
                <div>
                  <span className="form-info-title">Location:</span>
                  <div className="form-info-content">{value.birthPlaceName}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{value.birthPlaceCode}</div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default BirthInformation;