/**
 * Search Hooks Module
 *
 * @description Collection of search and filtering hooks for data discovery,
 * pagination, and optimized search operations.
 */

// Generic search hooks - keep since useOptimizedPsgcSearch depends on useGenericSearch
export { useGenericSearch, useSearch } from './useGenericSearch';
// DEPRECATED: useGenericPaginatedSearch - not currently used
// export { useGenericPaginatedSearch, usePaginatedSearch } from './useGenericPaginatedSearch';

// Specialized search hooks
export { useOptimizedPsgcSearch, usePsgcSearch } from './useOptimizedPsgcSearch';
// DEPRECATED: useOptimizedHouseholdSearch - not currently used
// export { useOptimizedHouseholdSearch, useHouseholdSearch } from './useOptimizedHouseholdSearch';
export { useFormSearches } from './useFormSearches';
