/**
 * Birth Place Information Section for Resident Forms
 * Handles birth place details including location name and code
 */

import React from 'react';
import { InputField as FieldSet, FormSection, SelectField } from '@/components/molecules';
import { Input } from '@/components/atoms';
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
    <FormSection title="Birth Place Information" description="Location where the resident was born">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectField
          label="Birth Place Name"
          required
          labelSize="sm"
          errorMessage={errors.birth_place_name}
          helperText="Search for the place of birth (e.g., 'Cavite')"
          selectProps={{
            placeholder: "Type to search for birth place...",
            options: psgcOptions.map(place => ({
              value: place.code,
              label: `${place.name} (${place.level})`
            })),
            value: formData.birth_place_code || '',
            searchable: true,
            loading: isLoading,
            onSelect: handlePsgcSelect,
            onSearch: setQuery,  // Trigger search when user types
            disabled: disabled,
            // Infinite scroll props
            infiniteScroll: true,
            hasMore: hasMore,
            onLoadMore: loadMore,
            loadingMore: isLoadingMore
          }}
        />

        <FieldSet
          label="Birth Place Code"
          errorMessage={errors.birth_place_code}
          helperText="Official PSGC code if known"
        >
          <Input
            name="birth_place_code"
            value={formData.birth_place_code || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.birth_place_code}
            placeholder="e.g., 137404000"
          />
        </FieldSet>

      </div>
    </FormSection>
  );
}
