import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

interface SubdivisionOption {
  value: string;
  label: string;
  barangay_code: string;
  type: string;
}

interface SubdivisionsResponse {
  success: boolean;
  data: SubdivisionOption[];
  count: number;
}

interface UseSubdivisionsSearchParams {
  barangayCode?: string;
  search?: string;
  enabled?: boolean;
}

export function useSubdivisionsSearch({
  barangayCode,
  search = '',
  enabled = true,
}: UseSubdivisionsSearchParams = {}) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    if (barangayCode) {
      params.append('barangay_code', barangayCode);
    }

    if (debouncedSearch && debouncedSearch.trim() !== '') {
      params.append('search', debouncedSearch.trim());
    }

    return params.toString();
  }, [barangayCode, debouncedSearch]);

  const queryKey = ['subdivisions', barangayCode, debouncedSearch];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<SubdivisionsResponse> => {
      const queryString = buildQueryParams();
      const url = `/api/addresses/subdivisions${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subdivisions');
      }

      return response.json();
    },
    enabled: enabled && !!barangayCode, // Only fetch when barangay is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    subdivisions: data?.data || [],
    loading: isLoading,
    error,
    refetch,
    count: data?.count || 0,
  };
}
