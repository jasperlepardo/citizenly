import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { barangayService } from '@/services/BarangayService';
import { useNotifications } from '@/providers';

/**
 * React Query hooks for Barangay operations
 */

// Query keys
export const barangayKeys = {
  all: ['barangays'] as const,
  lists: () => [...barangayKeys.all, 'list'] as const,
  list: (filters: string) => [...barangayKeys.lists(), { filters }] as const,
  details: () => [...barangayKeys.all, 'detail'] as const,
  detail: (code: string) => [...barangayKeys.details(), code] as const,
  search: (term: string) => [...barangayKeys.all, 'search', term] as const,
  byCity: (cityCode: string) => [...barangayKeys.all, 'city', cityCode] as const,
  statistics: () => [...barangayKeys.all, 'statistics'] as const,
};

/**
 * Hook to search barangays by name
 */
export function useBarangaySearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: barangayKeys.search(searchTerm),
    queryFn: async () => {
      const { data, error } = await barangayService.searchByName(searchTerm);
      if (error) throw error;
      return data;
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get barangay by code
 */
export function useBarangay(code: string, enabled = true) {
  return useQuery({
    queryKey: barangayKeys.detail(code),
    queryFn: async () => {
      const { data, error } = await barangayService.getByCode(code);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!code,
  });
}

/**
 * Hook to get barangay with full hierarchy
 */
export function useBarangayWithHierarchy(code: string, enabled = true) {
  return useQuery({
    queryKey: [...barangayKeys.detail(code), 'hierarchy'],
    queryFn: async () => {
      const { data, error } = await barangayService.getWithHierarchy(code);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!code,
  });
}

/**
 * Hook to get barangays by city
 */
export function useBarangaysByCity(cityCode: string, enabled = true) {
  return useQuery({
    queryKey: barangayKeys.byCity(cityCode),
    queryFn: async () => {
      const { data, error } = await barangayService.getByCity(cityCode);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!cityCode,
  });
}

/**
 * Hook to get barangay statistics
 */
export function useBarangayStatistics() {
  return useQuery({
    queryKey: barangayKeys.statistics(),
    queryFn: async () => {
      const { data, error } = await barangayService.getStatistics();
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for advanced barangay search
 */
export function useBarangayAdvancedSearch(
  searchTerm: string,
  cityCode?: string,
  provinceCode?: string,
  enabled = true
) {
  return useQuery({
    queryKey: [...barangayKeys.search(searchTerm), { cityCode, provinceCode }],
    queryFn: async () => {
      const { data, error } = await barangayService.advancedSearch(
        searchTerm,
        cityCode,
        provinceCode
      );
      if (error) throw error;
      return data;
    },
    enabled: enabled && searchTerm.length >= 2,
  });
}

/**
 * Hook to validate barangay code
 */
export function useValidateBarangayCode() {
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async (code: string) => {
      const isValid = await barangayService.validateCode(code);
      if (!isValid) {
        throw new Error('Invalid barangay code');
      }
      return isValid;
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Validation failed');
    },
  });
}

/**
 * Hook to prefetch barangay data
 */
export function usePrefetchBarangay() {
  const queryClient = useQueryClient();
  
  return (code: string) => {
    queryClient.prefetchQuery({
      queryKey: barangayKeys.detail(code),
      queryFn: async () => {
        const { data, error } = await barangayService.getByCode(code);
        if (error) throw error;
        return data;
      },
    });
  };
}