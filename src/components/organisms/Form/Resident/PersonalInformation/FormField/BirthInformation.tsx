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
}: BirthInformationProps) {
  
  // PSGC search hook for birth place
  const { 
    query: searchQuery, 
    setQuery: setSearchQuery, 
    options: psgcOptions, 
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    totalCount
  } = useOptimizedPsgcSearch({
    levels: 'province,city', // Show provinces and cities/municipalities for flexible birth place selection
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
          selectProps={{
            placeholder: "Search for province or city/municipality...",
            options: psgcOptions.map(place => {
              // Format consistent display text
              let displayText = place.name;
              if (place.level === 'city' && (place as any).province_name) {
                displayText = `${place.name}, ${(place as any).province_name}`;
              }
              
              return {
                value: place.code,
                label: displayText,
                description: place.full_address,
                level: place.level,
                full_address: place.full_address || place.name,
                badge: (place as any).type || place.level
              };
            }),
            value: value.birthPlaceCode,
            loading: isLoading,
            searchable: true,
            onSearch: setSearchQuery,
            onSelect: (option) => {
              if (option) {
                handleChange('birthPlaceName', (option as any).full_address || (option as any).label);
                handleChange('birthPlaceCode', (option as any).value);
              } else {
                handleChange('birthPlaceName', '');
                handleChange('birthPlaceCode', '');
              }
            },
            // Lazy loading props
            hasMore: hasMore,
            onLoadMore: loadMore,
            loadingMore: isLoadingMore,
            infiniteScroll: true
          }}
        />
      </div>
    </div>
  );
}

export default BirthInformation;