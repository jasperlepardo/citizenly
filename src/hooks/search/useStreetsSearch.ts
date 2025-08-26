import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

interface StreetOption {
  value: string;
  label: string;
  subdivision_id: string | null;
  barangay_code: string;
}

interface StreetsResponse {
  success: boolean;
  data: StreetOption[];
  count: number;
}

interface UseStreetsSearchParams {
  barangayCode?: string;
  subdivisionId?: string;
  search?: string;
  enabled?: boolean;
}

export function useStreetsSearch({
  barangayCode,
  subdivisionId,
  search = '',
  enabled = true,
}: UseStreetsSearchParams = {}) {
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

    if (subdivisionId) {
      params.append('subdivision_id', subdivisionId);
    }

    if (debouncedSearch && debouncedSearch.trim() !== '') {
      params.append('search', debouncedSearch.trim());
    }

    return params.toString();
  }, [barangayCode, subdivisionId, debouncedSearch]);

  const queryKey = ['streets', barangayCode, subdivisionId, debouncedSearch];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<StreetsResponse> => {
      const queryString = buildQueryParams();
      const url = `/api/addresses/streets${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch streets');
      }

      return response.json();
    },
    enabled: enabled && !!barangayCode, // Only fetch when barangay is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    streets: data?.data || [],
    loading: isLoading,
    error,
    refetch,
    count: data?.count || 0,
  };
}
