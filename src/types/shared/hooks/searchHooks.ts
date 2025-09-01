/**
 * Search Hook Types
 *
 * @fileoverview TypeScript interfaces for search-related React hooks
 * in the Citizenly RBI system.
 */

// PsgcSearchResult type removed - was not defined anywhere
import type { PsocOption, PsgcOption } from '../../domain/residents/api';
import type { HouseholdOption } from '../../domain/households/households';

// =============================================================================
// SEARCH HOOK TYPES
// =============================================================================

/**
 * Generic search hook return interface
 * Consolidates from src/hooks/search/useGenericSearch.ts
 */
export interface UseGenericSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  isLoading: boolean;
  error: Error | null;
  clearSearch: () => void;
  refresh: () => void;
}

/**
 * PSGC search options interface
 * Consolidates from src/hooks/search/usePsgcSearch.ts
 */
export interface UsePsgcSearchOptions {
  levels?: 'region' | 'province' | 'city' | 'municipality' | 'barangay' | 'all';
  limit?: number;
  parentCode?: string;
  debounceMs?: number;
  enableCache?: boolean;
}

/**
 * PSGC search hook return interface
 * Consolidates from src/hooks/search/usePsgcSearch.ts
 */
export interface UsePsgcSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  options: PsgcOption[];
  isLoading: boolean;
  error: Error | null;
  clearSearch: () => void;
  refresh: () => void;
  searchByLevel: (level: string, query: string) => Promise<void>;
  // Lazy loading support
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  totalCount: number;
}

/**
 * Household search result interface
 * Consolidates from src/hooks/search/useOptimizedHouseholdSearch.ts
 */
export interface HouseholdSearchResult {
  id: string;
  code: string;
  name: string;
  address: string;
  house_number?: string;
  geo_streets?: Array<{ name: string }>;
  geo_subdivisions?: Array<{ name: string }>;
  head_resident?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  };
}

/**
 * Household search options interface
 * Consolidates from src/hooks/search/useOptimizedHouseholdSearch.ts
 */
export interface UseHouseholdSearchOptions {
  limit?: number;
  debounceMs?: number;
  enableCache?: boolean;
}

/**
 * Household search hook return interface
 * Consolidates from src/hooks/search/useOptimizedHouseholdSearch.ts
 */
export interface UseHouseholdSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  options: HouseholdSearchResult[];
  isLoading: boolean;
  error: Error | null;
  clearSearch: () => void;
  refresh: () => void;
  // Lazy loading support
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  totalCount: number;
}

/**
 * Generic paginated search hook return interface
 * Consolidates from src/hooks/search/useGenericPaginatedSearch.ts
 */
export interface UseGenericPaginatedSearchReturn<T, F = any> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  error: Error | null;
  filters?: F;
  setFilters: (filters: F) => void;
  clearSearch: () => void;
  refresh: () => void;
  loadMore: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

/**
 * Form searches hook return interface
 * Consolidates from src/hooks/search/useFormSearches.ts
 */
export interface UseFormSearchesReturn {
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