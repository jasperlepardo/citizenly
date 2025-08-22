'use client';

import { useState, useCallback } from 'react';
import { HouseholdOption, PsocOption, PsgcOption } from '@/lib/types/resident';
import { formatPsocOption, formatPsgcOption } from '@/lib/mappers/residentMapper';
import { searchHouseholdsCached } from '@/lib/optimizers/householdFetcher';

interface UseFormSearchesReturn {
  // PSOC search state
  psocOptions: PsocOption[];
  psocLoading: boolean;
  handlePsocSearch: (query: string) => Promise<void>;
  
  // PSGC search state
  psgcOptions: PsgcOption[];
  psgcLoading: boolean;
  handlePsgcSearch: (query: string) => Promise<void>;
  setPsgcOptions: React.Dispatch<React.SetStateAction<PsgcOption[]>>;
  
  // Household search state
  householdOptions: HouseholdOption[];
  householdLoading: boolean;
  handleHouseholdSearch: (query: string) => Promise<void>;
}

export const useFormSearches = (userBarangayCode?: string): UseFormSearchesReturn => {
  // PSOC search state
  const [psocOptions, setPsocOptions] = useState<PsocOption[]>([]);
  const [psocLoading, setPsocLoading] = useState(false);

  // PSGC search state
  const [psgcOptions, setPsgcOptions] = useState<PsgcOption[]>([]);
  const [psgcLoading, setPsgcLoading] = useState(false);

  // Household search state
  const [householdOptions, setHouseholdOptions] = useState<HouseholdOption[]>([]);
  const [householdLoading, setHouseholdLoading] = useState(false);

  // Handle PSOC search
  const handlePsocSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPsocOptions([]);
      setPsocLoading(false);
      return;
    }

    if (query.length < 2) {
      setPsocOptions([]);
      return;
    }

    setPsocLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '20',
      });
      
      const response = await fetch(`/api/psoc/search?${params}`);
      if (!response.ok) throw new Error('PSOC search failed');
      
      const data = await response.json();
      const formattedOptions = (data.data || []).map(formatPsocOption);
      setPsocOptions(formattedOptions);
    } catch (error) {
      // Error handled by setting empty options
      setPsocOptions([]);
    } finally {
      setPsocLoading(false);
    }
  }, []);

  // Handle PSGC search
  const handlePsgcSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setPsgcLoading(false);
      return;
    }
    
    setPsgcLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '50',
        levels: 'province,city',
        maxLevel: 'city',
        minLevel: 'province',
      });
      
      const response = await fetch(`/api/psgc/search?${params}`);
      if (!response.ok) throw new Error('PSGC search failed');
      
      const data = await response.json();
      const formattedOptions = (data.data || []).map(formatPsgcOption);
      setPsgcOptions(formattedOptions);
    } catch (error) {
      // Error handled by setting empty options
      setPsgcOptions([]);
    } finally {
      setPsgcLoading(false);
    }
  }, []);

  // Handle household search
  const handleHouseholdSearch = useCallback(async (query: string) => {
    if (!userBarangayCode) {
      // No barangay code available
      return;
    }

    setHouseholdLoading(true);
    try {
      const households = await searchHouseholdsCached(query, userBarangayCode);
      setHouseholdOptions(households);
    } catch (error) {
      // Error handled by setting empty options
      setHouseholdOptions([]);
    } finally {
      setHouseholdLoading(false);
    }
  }, [userBarangayCode]);

  return {
    // PSOC
    psocOptions,
    psocLoading,
    handlePsocSearch,
    
    // PSGC
    psgcOptions,
    psgcLoading,
    handlePsgcSearch,
    setPsgcOptions,
    
    // Household
    householdOptions,
    householdLoading,
    handleHouseholdSearch,
  };
};