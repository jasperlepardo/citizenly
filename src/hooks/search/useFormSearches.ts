'use client';

import { useState, useCallback } from 'react';

import { formatPsocOption, formatPsgcOption } from '@/services/domain/residents/residentMapper';
import { container } from '@/services/container';
import type { PsocOption, PsgcOption, HouseholdOption, UseFormSearchesReturn } from '@/types';

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
  const handleHouseholdSearch = useCallback(
    async (query: string) => {
      if (!userBarangayCode) {
        // No barangay code available
        return;
      }

      setHouseholdLoading(true);
      try {
        // Use HouseholdDomainService through container
        const householdService = container.getHouseholdService();
        const result = await householdService.findHouseholds({
          barangayCode: userBarangayCode,
          searchTerm: query,
          limit: 20
        });
        
        if (result.success) {
          const households = result.data?.map(h => ({
            value: h.code,
            label: `${h.code} - ${h.house_number || 'No house number'}`,
            data: h
          })) || [];
          setHouseholdOptions(households);
        } else {
          setHouseholdOptions([]);
        }
      } catch (error) {
        // Error handled by setting empty options
        setHouseholdOptions([]);
      } finally {
        setHouseholdLoading(false);
      }
    },
    [userBarangayCode]
  );

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
