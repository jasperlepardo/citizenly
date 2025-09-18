import React, { useState, useEffect } from 'react';

import { SelectField } from '@/components';
import { useOptimizedHouseholdSearch } from '@/hooks/search/useOptimizedHouseholdSearch';
import type { FormMode } from '@/types/app/ui/forms';
import type { HouseholdInformationFormData } from '@/types/domain/residents/forms';

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
  // Individual field loading states
  loadingStates?: {
    household_code?: boolean;
    household_name?: boolean;
  };
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
  loadingStates = {},
}: Readonly<HouseholdInformationProps>) {
  // State for household address lookup in view mode
  const [resolvedHouseholdInfo, setResolvedHouseholdInfo] = useState<{
    name?: string;
    address?: string;
    loading?: boolean;
  }>({});

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

  // Lookup household info for view mode
  useEffect(() => {
    const lookupHouseholdInfo = async () => {
      if (mode === 'view' && value.household_code && (!value.household_name || value.household_name.trim() === '')) {
        setResolvedHouseholdInfo({ loading: true });

        try {
          console.log('🔍 HouseholdInformation: Looking up household info for code:', value.household_code);

          // Get auth token for API call
          const { createPublicSupabaseClient } = await import('@/lib/data/client-factory');
          const supabase = createPublicSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();

          console.log('🔍 HouseholdInformation: Auth check:', {
            hasSession: !!session,
            hasToken: !!session?.access_token,
            userId: session?.user?.id
          });

          if (!session?.access_token) {
            throw new Error('No auth session found');
          }

          const apiUrl = `/api/households/${encodeURIComponent(value.household_code)}`;
          console.log('🔍 HouseholdInformation: Making API call to:', apiUrl);

          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('🔍 HouseholdInformation: API Response status:', response.status, response.statusText);

          if (response.ok) {
            const data = await response.json();
            console.log('🔍 HouseholdInformation: Household API response:', data);

            // Try both data formats for flexibility
            const household = data.data || data.household;

            if (household) {
              console.log('🔍 HouseholdInformation: Full household data:', JSON.stringify(household, null, 2));

              // Build full address from available fields with detailed logging
              console.log('🔍 HouseholdInformation: Address components:', {
                house_number: household.house_number,
                street: household.street,
                subdivision: household.subdivision,
                barangay_info: household.barangay_info,
                city_municipality_info: household.city_municipality_info,
                province_info: household.province_info
              });

              const addressParts = [
                household.house_number,
                household.street?.name,
                household.subdivision?.name,
                household.barangay_info?.name,
                household.city_municipality_info?.name,
                household.province_info?.name
              ].filter(part => part && part.trim() !== '');

              console.log('🔍 HouseholdInformation: Filtered address parts:', addressParts);

              const fullAddress = addressParts.length > 0
                ? addressParts.join(', ')
                : household.address || `Household ${value.household_code}`;

              console.log('🔍 HouseholdInformation: Final address:', fullAddress);

              console.log('🔍 HouseholdInformation: Setting resolved household info:', {
                name: household.name,
                address: fullAddress
              });

              setResolvedHouseholdInfo({
                name: household.name || `Household ${value.household_code}`,
                address: fullAddress,
                loading: false
              });
            } else {
              console.warn('🔍 HouseholdInformation: No household data found');
              setResolvedHouseholdInfo({
                name: `Household ${value.household_code}`,
                address: 'Address not found',
                loading: false
              });
            }
          } else {
            let errorDetails;
            try {
              errorDetails = await response.json();
            } catch {
              errorDetails = await response.text();
            }
            console.error('🔍 HouseholdInformation: API Error Details:', {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
              householdCode: value.household_code,
              error: errorDetails
            });

            // Log the full error response for debugging
            console.error('🔍 HouseholdInformation: Full error response body:', errorDetails);

            // Log debug info specifically if it exists
            if (errorDetails && errorDetails.debug) {
              console.error('🔍 HouseholdInformation: Debug details:', JSON.stringify(errorDetails.debug, null, 2));
            }

            setResolvedHouseholdInfo({
              name: `Household ${value.household_code}`,
              address: `API Error: ${response.status}`,
              loading: false
            });
          }
        } catch (error) {
          console.error('🔍 HouseholdInformation: Error looking up household:', error);
          setResolvedHouseholdInfo({
            name: `Household ${value.household_code}`,
            address: 'Address lookup failed',
            loading: false
          });
        }
      } else if (value.household_name && value.household_name.trim() !== '') {
        // Use existing household name
        setResolvedHouseholdInfo({
          name: value.household_name,
          address: '',
          loading: false
        });
      } else {
        // Clear resolved info
        setResolvedHouseholdInfo({});
      }
    };

    lookupHouseholdInfo();
  }, [mode, value.household_code, value.household_name]);

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
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.household_code}
          helperText={mode === 'view' ? undefined : "Search and select an existing household"}
          loading={loadingStates?.household_code || loadingStates?.household_name || resolvedHouseholdInfo.loading}
          selectProps={{
            placeholder: '🏠 Select household...',
            options: mode === 'view' && resolvedHouseholdInfo.name ? [
              // In view mode, show resolved household info
              {
                value: value.household_code,
                label: resolvedHouseholdInfo.address || resolvedHouseholdInfo.name,
                description: resolvedHouseholdInfo.name !== resolvedHouseholdInfo.address ? resolvedHouseholdInfo.name : undefined,
                badge: 'household',
              }
            ] : (householdSearchOptions || []).map((household: any) => ({
              value: household.code,
              label: household.name || `Household ${household.code}`,
              description: `Code: ${household.code}${household.address ? ` • ${household.address}` : ''}`,
              badge: 'household',
            })),
            value: value.household_code,
            loading: isLoading,
            searchable: mode !== 'view',
            onSearch: mode !== 'view' ? setSearchQuery : undefined,
            onSelect: (mode !== 'view'
              ? (option: any) => {
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
                }
              : undefined) as any,
            // Infinite scroll props (only for edit mode)
            infiniteScroll: mode !== 'view',
            hasMore: hasMore,
            onLoadMore: loadMore,
            loadingMore: isLoadingMore,
          }}
        />

        {/* Display selected household info (read-only) */}
        {value.household_code && (mode !== 'view') && (value.household_name || resolvedHouseholdInfo.name) && (
          <div className="bg-info/5 border-info/20 mt-3 rounded-md border p-3">
            <h6 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
              Selected Household
            </h6>
            <div className="text-sm">
              <div>
                <span className="form-info-title">Household:</span>
                <div className="form-info-content">
                  {resolvedHouseholdInfo.name || value.household_name}
                </div>
                {resolvedHouseholdInfo.address && (
                  <div className="form-info-content text-zinc-600 dark:text-zinc-400">
                    📍 {resolvedHouseholdInfo.address}
                  </div>
                )}
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Code: {value.household_code}
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
