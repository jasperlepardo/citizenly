/**
 * Geographic Data Hook
 * Manages PSGC geographic location data with proper caching and state management
 */

import { useState, useEffect, useCallback } from 'react';

import { supabase } from '@/lib/data/supabase';

import type { GeographicOption } from '@/types/shared/hooks/apiHooks';

// Interface moved to centralized types

// GeographicData interface moved to centralized types

interface GeographicState {
  regions: GeographicOption[];
  provinces: GeographicOption[];
  cities: GeographicOption[];
  barangays: GeographicOption[];
  streets: GeographicOption[];
  subdivisions: GeographicOption[];
  loading: {
    regions: boolean;
    provinces: boolean;
    cities: boolean;
    barangays: boolean;
    streets: boolean;
    subdivisions: boolean;
  };
  error: {
    regions: string | null;
    provinces: string | null;
    cities: string | null;
    barangays: string | null;
    streets: string | null;
    subdivisions: string | null;
  };
}

export function useGeographicData() {
  const [state, setState] = useState<GeographicState>({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
    streets: [],
    subdivisions: [],
    loading: {
      regions: false,
      provinces: false,
      cities: false,
      barangays: false,
      streets: false,
      subdivisions: false,
    },
    error: {
      regions: null,
      provinces: null,
      cities: null,
      barangays: null,
      streets: null,
      subdivisions: null,
    },
  });

  /**
   * Generic API call function with auth token
   */
  const fetchWithAuth = useCallback(async (url: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  }, []);

  /**
   * Load regions
   */
  const loadRegions = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, regions: true },
      error: { ...prev.error, regions: null },
    }));

    try {
      const data = await fetchWithAuth('/api/addresses/regions');

      const options: GeographicOption[] = data.map((region: any) => ({
        value: region.code,
        label: region.name,
      }));

      setState(prev => ({
        ...prev,
        regions: options,
        loading: { ...prev.loading, regions: false },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, regions: false },
        error: {
          ...prev.error,
          regions: error instanceof Error ? error.message : 'Failed to load regions',
        },
      }));
    }
  }, [fetchWithAuth]);

  /**
   * Load provinces by region
   */
  const loadProvinces = useCallback(
    async (regionCode: string) => {
      if (!regionCode) {
        setState(prev => ({ ...prev, provinces: [], cities: [], barangays: [] }));
        return;
      }

      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, provinces: true },
        error: { ...prev.error, provinces: null },
        provinces: [],
        cities: [],
        barangays: [],
      }));

      try {
        const data = await fetchWithAuth(`/api/addresses/provinces?region=${regionCode}`);

        const options: GeographicOption[] = data.map((province: any) => ({
          value: province.code,
          label: province.name,
        }));

        setState(prev => ({
          ...prev,
          provinces: options,
          loading: { ...prev.loading, provinces: false },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, provinces: false },
          error: {
            ...prev.error,
            provinces: error instanceof Error ? error.message : 'Failed to load provinces',
          },
        }));
      }
    },
    [fetchWithAuth]
  );

  /**
   * Load cities by province
   */
  const loadCities = useCallback(
    async (provinceCode: string) => {
      if (!provinceCode) {
        setState(prev => ({ ...prev, cities: [], barangays: [] }));
        return;
      }

      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, cities: true },
        error: { ...prev.error, cities: null },
        cities: [],
        barangays: [],
      }));

      try {
        const data = await fetchWithAuth(`/api/addresses/cities?province=${provinceCode}`);

        const options: GeographicOption[] = data.map((city: any) => ({
          value: city.code,
          label: `${city.name} (${city.type})`,
        }));

        setState(prev => ({
          ...prev,
          cities: options,
          loading: { ...prev.loading, cities: false },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, cities: false },
          error: {
            ...prev.error,
            cities: error instanceof Error ? error.message : 'Failed to load cities',
          },
        }));
      }
    },
    [fetchWithAuth]
  );

  /**
   * Load barangays by city
   */
  const loadBarangays = useCallback(
    async (cityCode: string) => {
      if (!cityCode) {
        setState(prev => ({ ...prev, barangays: [] }));
        return;
      }

      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, barangays: true },
        error: { ...prev.error, barangays: null },
        barangays: [],
      }));

      try {
        const data = await fetchWithAuth(`/api/addresses/barangays?city=${cityCode}`);

        const options: GeographicOption[] = data.map((barangay: any) => ({
          value: barangay.code,
          label: barangay.name,
        }));

        setState(prev => ({
          ...prev,
          barangays: options,
          loading: { ...prev.loading, barangays: false },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, barangays: false },
          error: {
            ...prev.error,
            barangays: error instanceof Error ? error.message : 'Failed to load barangays',
          },
        }));
      }
    },
    [fetchWithAuth]
  );

  /**
   * Load independent cities for regions without provinces (like NCR)
   */
  const loadIndependentCities = useCallback(
    async (regionCode: string) => {
      if (!regionCode) {
        setState(prev => ({ ...prev, cities: [], barangays: [] }));
        return;
      }

      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, cities: true },
        error: { ...prev.error, cities: null },
        cities: [],
        barangays: [],
      }));

      try {
        // For regions like NCR that don't have provinces, get cities directly
        const data = await fetchWithAuth(`/api/addresses/cities`);

        // Filter for independent cities (no province_code)
        const independentCities = data.filter((city: any) => !city.province_code);

        const options: GeographicOption[] = independentCities.map((city: any) => ({
          value: city.code,
          label: `${city.name} (${city.type})`,
        }));

        setState(prev => ({
          ...prev,
          cities: options,
          loading: { ...prev.loading, cities: false },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, cities: false },
          error: {
            ...prev.error,
            cities: error instanceof Error ? error.message : 'Failed to load cities',
          },
        }));
      }
    },
    [fetchWithAuth]
  );

  /**
   * Load subdivisions by barangay
   */
  const loadSubdivisions = useCallback(
    async (barangayCode: string) => {
      if (!barangayCode) {
        setState(prev => ({ ...prev, subdivisions: [], streets: [] }));
        return;
      }

      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, subdivisions: true },
        error: { ...prev.error, subdivisions: null },
        subdivisions: [],
        streets: [],
      }));

      try {
        const data = await fetchWithAuth(`/api/addresses/subdivisions?barangay=${barangayCode}`);

        const options: GeographicOption[] = data.map((subdivision: any) => ({
          value: subdivision.id,
          label: `${subdivision.name} (${subdivision.type})`,
        }));

        setState(prev => ({
          ...prev,
          subdivisions: options,
          loading: { ...prev.loading, subdivisions: false },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, subdivisions: false },
          error: {
            ...prev.error,
            subdivisions: error instanceof Error ? error.message : 'Failed to load subdivisions',
          },
        }));
      }
    },
    [fetchWithAuth]
  );

  /**
   * Load streets by barangay (and optionally by subdivision)
   */
  const loadStreets = useCallback(
    async (barangayCode: string, subdivisionId?: string) => {
      if (!barangayCode) {
        setState(prev => ({ ...prev, streets: [] }));
        return;
      }

      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, streets: true },
        error: { ...prev.error, streets: null },
        streets: [],
      }));

      try {
        let url = `/api/addresses/streets?barangay=${barangayCode}`;
        if (subdivisionId) {
          url += `&subdivision=${subdivisionId}`;
        }

        const data = await fetchWithAuth(url);

        const options: GeographicOption[] = data.map((street: any) => ({
          value: street.id,
          label: street.name,
        }));

        setState(prev => ({
          ...prev,
          streets: options,
          loading: { ...prev.loading, streets: false },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, streets: false },
          error: {
            ...prev.error,
            streets: error instanceof Error ? error.message : 'Failed to load streets',
          },
        }));
      }
    },
    [fetchWithAuth]
  );

  /**
   * Reset all geographic data
   */
  const resetAll = useCallback(() => {
    setState({
      regions: [],
      provinces: [],
      cities: [],
      barangays: [],
      streets: [],
      subdivisions: [],
      loading: {
        regions: false,
        provinces: false,
        cities: false,
        barangays: false,
        streets: false,
        subdivisions: false,
      },
      error: {
        regions: null,
        provinces: null,
        cities: null,
        barangays: null,
        streets: null,
        subdivisions: null,
      },
    });
  }, []);

  /**
   * Auto-load regions on mount
   */
  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  return {
    // Data
    regions: state.regions,
    provinces: state.provinces,
    cities: state.cities,
    barangays: state.barangays,
    streets: state.streets,
    subdivisions: state.subdivisions,

    // Loading states
    loading: state.loading,

    // Error states
    error: state.error,

    // Actions
    loadRegions,
    loadProvinces,
    loadCities,
    loadBarangays,
    loadIndependentCities,
    loadSubdivisions,
    loadStreets,
    resetAll,

    // Computed states
    isLoading: Object.values(state.loading).some(Boolean),
    hasError: Object.values(state.error).some(Boolean),
  };
}
