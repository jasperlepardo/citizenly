'use client';

import { useState, useCallback } from 'react';
import { usePsgcSearch, PsgcSearchResult } from '../search/useOptimizedPsgcSearch';

export interface MigrationInformationData {
  previous_barangay_code?: string;
  previous_city_municipality_code?: string;
  previous_province_code?: string;
  previous_region_code?: string;
  length_of_stay_previous_months?: number;
  reason_for_leaving?: string;
  date_of_transfer?: string;
  reason_for_transferring?: string;
  duration_of_stay_current_months?: number;
  is_intending_to_return?: boolean | null;
}

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
}

interface UseMigrationInformationProps {
  initialData?: MigrationInformationData;
  onChange?: (data: MigrationInformationData) => void;
}

export function useMigrationInformation({
  initialData = {},
  onChange
}: UseMigrationInformationProps = {}): UseMigrationInformationReturn {
  
  const [migrationData, setMigrationDataState] = useState<MigrationInformationData>(initialData);
  const [selectedBarangayInfo, setSelectedBarangayInfo] = useState<SelectedBarangayInfo | null>(null);
  
  // Use PSGC search hook for barangay searching
  const {
    options: barangayOptions,
    isLoading: isLoadingBarangays,
    searchByLevel: searchPsgc
  } = usePsgcSearch({ levels: 'barangay', limit: 50 });

  const updateMigrationData = useCallback((field: keyof MigrationInformationData, value: any) => {
    const updatedData = {
      ...migrationData,
      [field]: value,
    };
    setMigrationDataState(updatedData);
    onChange?.(updatedData);
  }, [migrationData, onChange]);

  const setMigrationData = useCallback((data: MigrationInformationData) => {
    setMigrationDataState(data);
    onChange?.(data);
  }, [onChange]);

  const searchBarangays = useCallback(async (searchTerm: string) => {
    await searchPsgc('barangay', searchTerm);
  }, [searchPsgc]);

  const handleBarangaySelect = useCallback((option: PsgcSearchResult) => {
    if (option?.code) {
      // Extract the barangay code from the PSGC option
      const updatedData = {
        ...migrationData,
        previous_barangay_code: option.code,
        // Note: We only have the barangay code - other codes would need to be resolved separately
        // or included in the PSGC search result if needed
        previous_city_municipality_code: option.parent_code || '',
        previous_province_code: '',
        previous_region_code: '',
      };
      
      // Store the selected barangay info for display
      setSelectedBarangayInfo({
        barangay: option.name,
        city: '',
        province: '',
        region: '',
      });
      
      setMigrationDataState(updatedData);
      onChange?.(updatedData);
    }
  }, [migrationData, onChange]);

  return {
    migrationData,
    selectedBarangayInfo,
    barangayOptions,
    isLoadingBarangays,
    updateMigrationData,
    searchBarangays,
    handleBarangaySelect,
    setMigrationData
  };
}