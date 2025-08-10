import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { residentService, Resident, ResidentFilters } from '@/services/ResidentService';
import { useNotifications } from '@/providers';

/**
 * React Query hooks for Resident operations
 */

// Query keys
export const residentKeys = {
  all: ['residents'] as const,
  lists: () => [...residentKeys.all, 'list'] as const,
  list: (filters: ResidentFilters) => [...residentKeys.lists(), { filters }] as const,
  details: () => [...residentKeys.all, 'detail'] as const,
  detail: (id: string) => [...residentKeys.details(), id] as const,
  household: (householdId: string) => [...residentKeys.all, 'household', householdId] as const,
  search: (term: string) => [...residentKeys.all, 'search', term] as const,
  statistics: (barangayCode?: string) => [...residentKeys.all, 'statistics', barangayCode] as const,
};

/**
 * Hook to get resident by ID
 */
export function useResident(id: string, enabled = true) {
  return useQuery({
    queryKey: residentKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await residentService.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Hook to get resident with household info
 */
export function useResidentWithHousehold(id: string, enabled = true) {
  return useQuery({
    queryKey: [...residentKeys.detail(id), 'household'],
    queryFn: async () => {
      const { data, error } = await residentService.getResidentWithHousehold(id);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Hook to search residents by name
 */
export function useResidentSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: residentKeys.search(searchTerm),
    queryFn: async () => {
      const { data, error } = await residentService.searchByName(searchTerm);
      if (error) throw error;
      return data;
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to get residents by household
 */
export function useResidentsByHousehold(householdId: string, enabled = true) {
  return useQuery({
    queryKey: residentKeys.household(householdId),
    queryFn: async () => {
      const { data, error } = await residentService.getByHousehold(householdId);
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!householdId,
  });
}

/**
 * Hook to get filtered residents
 */
export function useFilteredResidents(filters: ResidentFilters, enabled = true) {
  return useQuery({
    queryKey: residentKeys.list(filters),
    queryFn: async () => {
      const { data, error } = await residentService.getFilteredResidents(filters);
      if (error) throw error;
      return data;
    },
    enabled,
  });
}

/**
 * Hook to get resident statistics
 */
export function useResidentStatistics(barangayCode?: string) {
  return useQuery({
    queryKey: residentKeys.statistics(barangayCode),
    queryFn: async () => {
      const { data, error } = await residentService.getStatistics(barangayCode);
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a resident
 */
export function useCreateResident() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async (data: Omit<Resident, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: resident, error } = await residentService.createResident(data);
      if (error) throw error;
      return resident;
    },
    onSuccess: (resident) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: residentKeys.lists() });
      if (resident?.household_id) {
        queryClient.invalidateQueries({ 
          queryKey: residentKeys.household(resident.household_id) 
        });
      }
      notify('success', 'Resident created successfully');
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to create resident');
    },
  });
}

/**
 * Hook to update a resident
 */
export function useUpdateResident() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Resident> }) => {
      const { data: resident, error } = await residentService.updateResident(id, data);
      if (error) throw error;
      return resident;
    },
    onSuccess: (resident, variables) => {
      // Update cache
      queryClient.setQueryData(residentKeys.detail(variables.id), resident);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: residentKeys.lists() });
      if (resident?.household_id) {
        queryClient.invalidateQueries({ 
          queryKey: residentKeys.household(resident.household_id) 
        });
      }
      
      notify('success', 'Resident updated successfully');
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to update resident');
    },
  });
}

/**
 * Hook to delete a resident
 */
export function useDeleteResident() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: success, error } = await residentService.delete(id);
      if (error) throw error;
      return success;
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: residentKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: residentKeys.lists() });
      
      notify('success', 'Resident deleted successfully');
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to delete resident');
    },
  });
}

/**
 * Hook for bulk creating residents
 */
export function useBulkCreateResidents() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  
  return useMutation({
    mutationFn: async (residents: Omit<Resident, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await residentService.bulkCreate(residents);
      if (error) throw error;
      return data;
    },
    onSuccess: (residents) => {
      // Invalidate all resident queries
      queryClient.invalidateQueries({ queryKey: residentKeys.all });
      
      notify('success', `${residents?.length || 0} residents created successfully`);
    },
    onError: (error) => {
      notify('error', error instanceof Error ? error.message : 'Failed to create residents');
    },
  });
}