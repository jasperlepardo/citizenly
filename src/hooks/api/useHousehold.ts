import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  householdService, 
  Household, 
  HouseholdFilters, 
  HouseholdRegistrationData 
} from '@/services/HouseholdService';
import { useNotifications } from '@/providers';

/**
 * React Query hooks for Household operations
 */

// Query keys
export const householdKeys = {
  all: ['households'] as const,
  lists: () => [...householdKeys.all, 'list'] as const,
  list: (filters: HouseholdFilters) => [...householdKeys.lists(), { filters }] as const,
  details: () => [...householdKeys.all, 'detail'] as const,
  detail: (id: string) => [...householdKeys.details(), id] as const,
  barangay: (barangayCode: string) => [...householdKeys.all, 'barangay', barangayCode] as const,
  search: (term: string) => [...householdKeys.all, 'search', term] as const,
  statistics: (barangayCode?: string) => [...householdKeys.all, 'statistics', barangayCode] as const,
};

/**
 * Hook to get household by ID
 */
export function useHousehold(id: string, enabled = true) {
  return useQuery({
    queryKey: householdKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await householdService.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Hook to get household with members
 */
export function useHouseholdWithMembers(id: string, enabled = true) {
  return useQuery({
    queryKey: [...householdKeys.detail(id), 'members'],
    queryFn: async () => {
      const { data, error } = await householdService.getHouseholdWithMembers(id);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Hook to search households
 */
export function useHouseholdSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: householdKeys.search(searchTerm),
    queryFn: async () => {
      const { data, error } = await householdService.searchHouseholds(searchTerm);
      if (error) throw error;
      return data;
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to get households by barangay
 */
export function useHouseholdsByBarangay(barangayCode: string, enabled = true) {
  return useQuery({
    queryKey: householdKeys.barangay(barangayCode),
    queryFn: async () => {
      const { data, error } = await householdService.getByBarangay(barangayCode);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!barangayCode,
  });
}

/**
 * Hook to get filtered households
 */
export function useFilteredHouseholds(filters: HouseholdFilters, enabled = true) {
  return useQuery({
    queryKey: householdKeys.list(filters),
    queryFn: async () => {
      const { data, error } = await householdService.getFilteredHouseholds(filters);
      if (error) throw error;
      return data;
    },
    enabled,
  });
}

/**
 * Hook to get household statistics
 */
export function useHouseholdStatistics(barangayCode?: string) {
  return useQuery({
    queryKey: householdKeys.statistics(barangayCode),
    queryFn: async () => {
      const { data, error } = await householdService.getStatistics(barangayCode);
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to register a household with members
 */
export function useRegisterHousehold() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async (data: HouseholdRegistrationData) => {
      const { data: household, error } = await householdService.registerHousehold(data);
      if (error) throw error;
      return household;
    },
    onSuccess: (household) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: householdKeys.lists() });
      if (household?.barangay_code) {
        queryClient.invalidateQueries({ 
          queryKey: householdKeys.barangay(household.barangay_code) 
        });
      }
      
      notify('success', `Household ${household?.household_number} registered successfully`);
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to register household');
    },
  });
}

/**
 * Hook to update a household
 */
export function useUpdateHousehold() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Household> }) => {
      const { data: household, error } = await householdService.updateHousehold(id, data);
      if (error) throw error;
      return household;
    },
    onSuccess: (household, variables) => {
      // Update cache
      queryClient.setQueryData(householdKeys.detail(variables.id), household);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: householdKeys.lists() });
      if (household?.barangay_code) {
        queryClient.invalidateQueries({ 
          queryKey: householdKeys.barangay(household.barangay_code) 
        });
      }
      
      notify('success', 'Household updated successfully');
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to update household');
    },
  });
}

/**
 * Hook to delete a household
 */
export function useDeleteHousehold() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: success, error } = await householdService.delete(id);
      if (error) throw error;
      return success;
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: householdKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: householdKeys.lists() });
      
      notify('success', 'Household deleted successfully');
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to delete household');
    },
  });
}

/**
 * Hook to add member to household
 */
export function useAddHouseholdMember() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async ({ 
      householdId, 
      resident 
    }: { 
      householdId: string; 
      resident: Parameters<typeof householdService.addMember>[1];
    }) => {
      const { data, error } = await householdService.addMember(householdId, resident);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate household with members query
      queryClient.invalidateQueries({ 
        queryKey: [...householdKeys.detail(variables.householdId), 'members'] 
      });
      
      notify('success', 'Member added to household successfully');
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to add member');
    },
  });
}

/**
 * Hook to generate household number
 */
export function useGenerateHouseholdNumber(barangayCode: string) {
  return useQuery({
    queryKey: ['household-number', barangayCode],
    queryFn: () => householdService.generateHouseholdNumber(barangayCode),
    enabled: !!barangayCode,
    staleTime: 0, // Always fresh
  });
}