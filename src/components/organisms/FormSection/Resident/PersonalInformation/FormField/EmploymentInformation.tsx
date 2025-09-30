import React from 'react';

import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import { EMPLOYMENT_STATUS_OPTIONS_WITH_EMPTY } from '@/constants/residentEnums';

import type { FormMode } from '@/types/app/ui/forms';
import type { EmploymentInformationFormData } from '@/types/domain/residents/forms';
import type { SelectOption } from '@/utils/ui/selectUtils';

export interface EmploymentInformationProps {
  value: EmploymentInformationFormData;
  onChange: (value: EmploymentInformationFormData) => void;
  errors: Record<string, string>;
  // PSOC search functionality
  onPsocSearch?: (query: string) => void;
  psocOptions?: SelectOption[];
  psocLoading?: boolean;
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  className?: string;
  // Loading states
  loading?: boolean;
  loadingStates?: {
    employment_status?: boolean;
    occupation_code?: boolean;
    occupation_title?: boolean;
  };
}

export function EmploymentInformation({
  value,
  onChange,
  errors,
  onPsocSearch,
  psocOptions = [],
  psocLoading = false,
  mode = 'create',
  className = '',
  loading = false,
  loadingStates = {},
}: EmploymentInformationProps) {
  
  console.log('🔍 EmploymentInformation component rendered:', { value, mode });
  
  // State to track PSOC lookup loading
  const [isLookingUpPsoc, setIsLookingUpPsoc] = React.useState(false);
  
  // When we have an occupation code, auto-lookup to get the complete occupation hierarchy
  React.useEffect(() => {
    console.log('🔍 EmploymentInformation useEffect triggered:', {
      occupation_code: value.occupation_code,
      occupation_title: value.occupation_title,
      isLookingUpPsoc,
      mode
    });
    
    if (value.occupation_code && !isLookingUpPsoc) {
      // Check if occupation title looks incomplete or has hierarchical prefixes
      const hasHierarchicalPrefix = value.occupation_title && (
        value.occupation_title.includes(':') || 
        value.occupation_title.includes('Unit Group') ||
        value.occupation_title.includes('Major Group') ||
        value.occupation_title.includes('Sub Major Group')
      );
      
      const isIncompleteTitle = !value.occupation_title || // No title at all
                               value.occupation_title.length < 10 || // Very short titles are likely codes
                               /^\d+$/.test(value.occupation_title) || // Purely numeric titles are codes
                               value.occupation_title.startsWith('Occupation Code:'); // Pattern like "Occupation Code: 3343"
      
      console.log('🔍 EmploymentInformation: Title analysis:', {
        hasHierarchicalPrefix,
        isIncompleteTitle,
        titleLength: value.occupation_title?.length || 0,
        startsWithCode: value.occupation_title?.startsWith('Occupation Code:') || false
      });
      
      if (hasHierarchicalPrefix || isIncompleteTitle) {
        console.log('🔍 EmploymentInformation: Auto-looking up complete occupation hierarchy for code:', value.occupation_code);
        setIsLookingUpPsoc(true);
        
        // Use PSOC search API to get clean occupation title
        fetch(`/api/psoc/search?q=${value.occupation_code}&limit=5&levels=occupation`)
          .then(response => response.json())
          .then(result => {
            if (result.data && result.data.length > 0) {
              // Find the exact match by code
              const exactMatch = result.data.find((item: any) => 
                item.code === value.occupation_code
              );
              
              if (exactMatch) {
                // Use the complete hierarchy from level 1 to selected occupation
                const fullHierarchy = exactMatch.hierarchy || exactMatch.title;
                
                console.log('🔍 EmploymentInformation: Found complete occupation hierarchy:', fullHierarchy);
                console.log('🔍 EmploymentInformation: Replacing title:', value.occupation_title, '->', fullHierarchy);
                
                // Update the occupation title with the complete hierarchy
                onChange({
                  ...value,
                  occupation_title: fullHierarchy,
                });
              }
            }
          })
          .catch(error => {
            console.error('🔍 EmploymentInformation: PSOC lookup failed:', error);
          })
          .finally(() => {
            setIsLookingUpPsoc(false);
          });
      }
    }
  }, [value.occupation_code, value.occupation_title, isLookingUpPsoc, onChange]);
  const handleChange = (field: keyof EmploymentInformationFormData, fieldValue: string) => {
    console.log(`🔍 EmploymentInformation: handleChange called for ${String(field)}:`, fieldValue);
    const newValue = {
      ...value,
      [field]: fieldValue,
    };
    console.log('🔍 EmploymentInformation: Calling onChange with:', newValue);
    onChange(newValue);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Employment Information
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Employment status and occupation details.
        </p>
      </div>

      <div className={mode === 'view' ? 'space-y-4' : 'grid grid-cols-1 gap-6 sm:grid-cols-2'}>
        <SelectField
          label="Employment Status"
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.employment_status}
          mode={mode}
          loading={loading || loadingStates?.employment_status}
          selectProps={{
            placeholder: 'Select employment status...',
            options: EMPLOYMENT_STATUS_OPTIONS_WITH_EMPTY,
            value: value.employment_status || '',
            onSelect: (option: any) => handleChange('employment_status', option?.value || ''),
          }}
        />

        <SelectField
          label="Occupation Name"
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.occupation_title || errors.occupation_code}
          mode={mode}
          multiline={true}
          loading={loading || loadingStates?.occupation_code}
          optionsLoading={psocLoading || isLookingUpPsoc}
          selectProps={{
            placeholder: 'Search occupation from level 1-5...',
            options: (() => {
              // Ensure the current selected value is in options
              const currentOptions = [...psocOptions];
              
              console.log('🔍 EmploymentInformation options debug:', {
                occupation_code: value.occupation_code,
                occupation_title: value.occupation_title,
                psocOptionsLength: psocOptions.length,
                hasCode: !!value.occupation_code,
                hasTitle: !!value.occupation_title
              });
              
              if (value.occupation_code) {
                // Check if current selection is already in options
                const hasCurrentOption = currentOptions.some(
                  opt => opt.value === value.occupation_code
                );
                if (!hasCurrentOption) {
                  // Try to find the title from existing psocOptions first
                  let displayLabel = value.occupation_title;
                  
                  // If no title is stored, try to find it from the current PSOC search results
                  if (!displayLabel) {
                    const matchingOption = psocOptions.find(opt => 
                      opt.value === value.occupation_code || 
                      (opt as any).code === value.occupation_code
                    );
                    if (matchingOption) {
                      displayLabel = matchingOption.label || (matchingOption as any).title;
                    }
                  }
                  
                  // Keep the complete hierarchy for display - no cleaning needed
                  
                  // Fallback to loading state if still no title
                  if (!displayLabel) {
                    displayLabel = psocLoading || isLookingUpPsoc ? 'Loading occupation...' : `Occupation Code: ${value.occupation_code}`;
                  }
                  
                  console.log('🔍 EmploymentInformation: Adding missing option with label:', displayLabel);
                  currentOptions.unshift({
                    value: value.occupation_code || '',
                    label: displayLabel,
                    description: `PSOC Code: ${value.occupation_code}`,
                  });
                }
              }
              return currentOptions;
            })(),
            value: value.occupation_code || '',
            loading: psocLoading,
            onSearch: (query: any) => {
              console.log('🔍 EmploymentInformation: onSearch called with query:', query);
              if (onPsocSearch) {
                onPsocSearch(query);
              } else {
                console.log('⚠️ EmploymentInformation: onPsocSearch is not provided');
              }
            },
            onSelect: (option: any) => {
              console.log('🔍 EmploymentInformation: Occupation selected:', option);
              if (option) {
                // Accept occupation, unit_sub_group, and unit_group as valid selections
                if ((option as any).level_type === 'occupation' || (option as any).level_type === 'unit_sub_group' || (option as any).level_type === 'unit_group') {
                  const occupationCode = (option as any).code || (option as any).value;
                  const occupationTitle = (option as any).title || (option as any).label;
                  console.log(`🔍 EmploymentInformation: Setting occupation_code to: "${occupationCode}"`);
                  console.log(`🔍 EmploymentInformation: Setting occupation_title to: "${occupationTitle}"`);
                  
                  // Update both fields in a single onChange call to prevent race conditions
                  onChange({
                    ...value,
                    occupation_code: occupationCode,
                    occupation_title: occupationTitle,
                  });
                } else {
                  console.log('🔍 EmploymentInformation: Higher level selected, clearing fields');
                  // If higher level is selected, clear the fields
                  onChange({
                    ...value,
                    occupation_code: '',
                    occupation_title: '',
                  });
                }
              } else {
                console.log('🔍 EmploymentInformation: No option selected, clearing fields');
                onChange({
                  ...value,
                  occupation_code: '',
                  occupation_title: '',
                });
              }
            },
          }}
        />
      </div>
    </div>
  );
}

export default EmploymentInformation;
