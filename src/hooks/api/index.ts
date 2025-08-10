/**
 * API Hooks
 * 
 * React Query hooks for all data operations.
 * These hooks provide consistent caching, error handling,
 * and loading states for all API calls.
 */

// Barangay hooks
export * from './useBarangay';
export { barangayKeys } from './useBarangay';

// Resident hooks
export * from './useResident';
export { residentKeys } from './useResident';

// Household hooks
export * from './useHousehold';
export { householdKeys } from './useHousehold';

/**
 * Usage Examples:
 * 
 * // Search barangays with automatic caching and loading states
 * const { data: barangays, isLoading, error } = useBarangaySearch(searchTerm);
 * 
 * // Get household with members, optimistic updates
 * const { mutate: updateHousehold, isPending } = useUpdateHousehold();
 * 
 * // Statistics with 10-minute cache
 * const { data: stats } = useResidentStatistics(barangayCode);
 * 
 * // Create resident with automatic cache invalidation
 * const { mutate: createResident } = useCreateResident();
 */