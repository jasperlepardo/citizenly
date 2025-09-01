import React from 'react';

import { SelectField } from '@/components';
import { useOptimizedHouseholdSearch } from '@/hooks/search/useOptimizedHouseholdSearch';
import type { FormMode, HouseholdInformationFormData } from '@/types';

export interface HouseholdInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: HouseholdInformationFormData;
  onChange: (value: HouseholdInformationFormData) => void;
  errors: Record<string, string>;
  className?: string;
  // Optional external search functionality (HouseholdSelector has its own built-in search)
  onHouseholdSearch?: (query: string) => Promise<any>;
  householdOptions?: any[];
  householdLoading?: boolean;
}

export function HouseholdInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
  onHouseholdSearch,
  householdOptions,
  householdLoading,
}: HouseholdInformationProps) {
  // Household search hook
  const {
    setQuery: setSearchQuery,
    options: householdSearchOptions = [],
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useOptimizedHouseholdSearch({
    limit: 20,
    debounceMs: 300,
  });

  // Load initial households on mount
  React.useEffect(() => {
    setSearchQuery(''); // Trigger initial load with empty search
  }, [setSearchQuery]);

  const handleChange = (field: keyof HouseholdInformationFormData, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Household Information
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Household assignment and relationship details.
        </p>
      </div>

      <div>
        <SelectField
          mode={mode}
          label="Current Household *"
          labelSize="sm"
          errorMessage={errors.household_code}
          helperText="Search and select an existing household"
          selectProps={{
            placeholder: '🏠 Select household...',
            options: (householdSearchOptions || []).map((household: any) => ({
              value: household.code,
              label: household.name || `Household ${household.code}`,
              description: `Code: ${household.code}${household.address ? ` • ${household.address}` : ''}`,
              badge: 'household',
            })),
            value: value.household_code,
            loading: isLoading,
            searchable: true,
            onSearch: setSearchQuery,
            onSelect: option => {
              if (option) {
                // Update both values in a single call to avoid race condition
                const newValue = {
                  ...value,
                  household_code: (option as any).value,
                  household_name: (option as any).label,
                };
                onChange(newValue);
              } else {
                const newValue = {
                  ...value,
                  household_code: '',
                  household_name: '',
                };
                onChange(newValue);
              }
            },
            // Infinite scroll props
            infiniteScroll: true,
            hasMore: hasMore,
            onLoadMore: loadMore,
            loadingMore: isLoadingMore,
          }}
        />

        {/* Display selected household info (read-only) */}
        {value.household_code && value.household_name && (
          <div className="bg-info/5 border-info/20 mt-3 rounded-md border p-3">
            <h6 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
              Selected Household
            </h6>
            <div className="text-sm">
              <div>
                <span className="form-info-title">Household:</span>
                <div className="form-info-content">{value.household_name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {value.household_code}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HouseholdInformation;
