'use client';

import { useState, useCallback, useEffect } from 'react';

import { MigrationInformationData } from '@/types/services';

import { usePsgcSearch, PsgcSearchResult } from '../search/usePsgcSearch';

export { type MigrationInformationData };

interface SelectedBarangayInfo {
  barangay: string;
  city: string;
  province: string;
  region: string;
}

interface UseMigrationInformationReturn {
  // Data state
  migrationData: MigrationInformationData;
  selectedBarangayInfo: SelectedBarangayInfo | null;

  // Search functionality
  barangayOptions: PsgcSearchResult[];
  isLoadingBarangays: boolean;

  // Actions
  updateMigrationData: (field: keyof MigrationInformationData, value: any) => void;
  searchBarangays: (searchTerm: string) => Promise<void>;
  handleBarangaySelect: (option: PsgcSearchResult) => void;
  setMigrationData: (data: MigrationInformationData) => void;

  // Lazy loading
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  totalCount: number;
}

interface UseMigrationInformationProps {
  initialData?: MigrationInformationData;
  onChange?: (data: MigrationInformationData) => void;
}

export function useMigrationInformation({
  initialData = {},
  onChange,
}: UseMigrationInformationProps = {}): UseMigrationInformationReturn {
  const [migrationData, setMigrationDataState] = useState<MigrationInformationData>(initialData);
  const [selectedBarangayInfo, setSelectedBarangayInfo] = useState<SelectedBarangayInfo | null>(
    null
  );

  // Use PSGC search hook for hierarchical searching (province, city, barangay)
  const {
    options: barangayOptions,
    isLoading: isLoadingBarangays,
    setQuery: setSearchQuery,
    hasMore,
    loadMore,
    isLoadingMore,
    totalCount,
  } = usePsgcSearch({ levels: 'all', limit: 20 });

  // Function to lookup PSGC data by code
  const lookupPsgcByCode = useCallback(
    async (code: string) => {
      if (!code || code.length < 6) {
        setSelectedBarangayInfo(null);
        return;
      }

      try {
        const response = await fetch(`/api/psgc/lookup?code=${encodeURIComponent(code)}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data;

          if (data) {
            setSelectedBarangayInfo({
              barangay: data.barangay_name || data.name,
              city: data.city_name || '',
              province: data.province_name || '',
              region: data.region_name || '',
            });

            // Update related codes if this is a barangay lookup
            if (data.level === 'barangay') {
              const updatedData = {
                ...migrationData,
                previous_barangay_code: code,
                previous_city_municipality_code: data.city_code || '',
                previous_province_code: data.province_code || '',
                previous_region_code: data.region_code || '',
              };
              setMigrationDataState(updatedData);
              onChange?.(updatedData);
            }
          }
        } else {
          setSelectedBarangayInfo(null);
        }
      } catch (error) {
        console.error('Failed to lookup PSGC code:', error);
        setSelectedBarangayInfo(null);
      }
    },
    [migrationData, onChange]
  );

  const updateMigrationData = useCallback(
    (field: keyof MigrationInformationData, value: any) => {
      const updatedData = {
        ...migrationData,
        [field]: value,
      };
      setMigrationDataState(updatedData);
      onChange?.(updatedData);

      // Auto-lookup when barangay code is updated
      if (field === 'previous_barangay_code' && typeof value === 'string') {
        lookupPsgcByCode(value);
      }
    },
    [migrationData, onChange, lookupPsgcByCode]
  );

  const setMigrationData = useCallback(
    (data: MigrationInformationData) => {
      setMigrationDataState(data);
      onChange?.(data);

      // Auto-lookup when data is set with a barangay code
      if (data.previous_barangay_code) {
        lookupPsgcByCode(data.previous_barangay_code);
      }
    },
    [onChange, lookupPsgcByCode]
  );

  // Auto-lookup on initial load if barangay code exists
  useEffect(() => {
    if (migrationData.previous_barangay_code && !selectedBarangayInfo) {
      lookupPsgcByCode(migrationData.previous_barangay_code);
    }
  }, [migrationData.previous_barangay_code, selectedBarangayInfo, lookupPsgcByCode]);

  const searchBarangays = useCallback(
    async (searchTerm: string) => {
      setSearchQuery(searchTerm);
    },
    [setSearchQuery]
  );

  const handleBarangaySelect = useCallback(
    (option: any) => {
      if (option?.value) {
        // Use the lookup API to get full address hierarchy
        lookupPsgcByCode(option.value);
      } else if (option === null) {
        // Handle clearing the selection
        const clearedData = {
          ...migrationData,
          previous_barangay_code: '',
          previous_city_municipality_code: '',
          previous_province_code: '',
          previous_region_code: '',
        };
        setMigrationDataState(clearedData);
        onChange?.(clearedData);
        setSelectedBarangayInfo(null);
      }
    },
    [lookupPsgcByCode, migrationData, onChange]
  );

  return {
    migrationData,
    selectedBarangayInfo,
    barangayOptions,
    isLoadingBarangays,
    updateMigrationData,
    searchBarangays,
    handleBarangaySelect,
    setMigrationData,
    hasMore,
    loadMore,
    isLoadingMore,
    totalCount,
  };
}
