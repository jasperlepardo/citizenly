/**
 * Search Hook Types
 *
 * @fileoverview TypeScript interfaces for search-related React hooks
 * in the Citizenly RBI system.
 */

// PsgcSearchResult type removed - was not defined anywhere
import type { HouseholdOption } from '@/types/domain/households/households';
import type { PsocOption, PsgcOption } from '@/types/domain/residents/api';

// Re-export types for external use
export type { HouseholdOption, PsocOption, PsgcOption };

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

/**
 * Paginated search configuration interface
 * Consolidates from src/hooks/search/useGenericPaginatedSearch.ts
 */
export interface PaginatedSearchConfig {
  initialPageSize?: number;
  debounceMs?: number;
  enableInfiniteScroll?: boolean;
  cacheResults?: boolean;
  minQueryLength?: number;
  onError?: (error: Error) => void;
}

/**
 * Paginated search state interface
 * Consolidates from src/hooks/search/useGenericPaginatedSearch.ts
 */
export interface PaginatedSearchState<T> {
  query: string;
  results: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  error: Error | null;
}

/**
 * Paginated search function type
 * Consolidates from src/hooks/search/useGenericPaginatedSearch.ts
 */
export type PaginatedSearchFunction<T, F = any> = (query: string, page: number, pageSize: number, filters?: F) => Promise<{
  data: T[];
  total: number;
  hasMore: boolean;
}>;

// =============================================================================
// GENERIC SEARCH TYPES
// =============================================================================

/**
 * Base search configuration interface
 * Consolidates from src/hooks/search/useGenericSearch.ts
 */
export interface BaseSearchConfig {
  debounceMs?: number;
  minQueryLength?: number;
  initialQuery?: string;
  onError?: (error: Error) => void;
}

/**
 * Search state interface
 * Consolidates from src/hooks/search/useGenericSearch.ts
 */
export interface SearchState<T> {
  query: string;
  results: T[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Search function type
 * Consolidates from src/hooks/search/useGenericSearch.ts
 */
export type SearchFunction<T> = (query: string) => Promise<T[]>;

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