/**
 * Command Menu Utilities - CONSOLIDATED
 * Pure utility functions for command menu operations
 * Database operations remain in services
 */

/**
 * Command menu constants
 */
export const COMMAND_MENU_CONFIG = {
  MAX_SEARCH_LENGTH: 100,
  SEARCH_CACHE_TTL: 30000, // 30 seconds
  MIN_QUERY_LENGTH: 1,
  DEFAULT_LIMIT: 10,
  MAX_RESULTS: 50,
} as const;

/**
 * Sanitize command menu search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  return query.trim().slice(0, COMMAND_MENU_CONFIG.MAX_SEARCH_LENGTH);
}

/**
 * Validate search query
 */
export function isValidSearchQuery(query: string): boolean {
  if (!query || typeof query !== 'string') {
    return false;
  }
  
  const sanitized = sanitizeSearchQuery(query);
  return sanitized.length >= COMMAND_MENU_CONFIG.MIN_QUERY_LENGTH;
}

/**
 * Generate cache key for search results
 */
export function generateCacheKey(query: string, limit: number): string {
  const sanitized = sanitizeSearchQuery(query);
  return `${sanitized}-${limit}`;
}

/**
 * Check if cache entry is valid
 */
export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < COMMAND_MENU_CONFIG.SEARCH_CACHE_TTL;
}

/**
 * Format search result for display
 */
export function formatSearchResult(item: any, type: 'resident' | 'household'): {
  id: string;
  title: string;
  subtitle: string;
  type: string;
} {
  if (type === 'resident') {
    const name = [item.first_name, item.middle_name, item.last_name]
      .filter(Boolean)
      .join(' ');
    
    return {
      id: item.id,
      title: name,
      subtitle: item.household_code || 'No household',
      type: 'resident',
    };
  }
  
  if (type === 'household') {
    const address = [item.house_number, item.street_name, item.barangay_name]
      .filter(Boolean)
      .join(', ');
    
    return {
      id: item.id,
      title: `Household ${item.code}`,
      subtitle: address || 'No address',
      type: 'household',
    };
  }
  
  return {
    id: item.id,
    title: 'Unknown',
    subtitle: '',
    type: 'unknown',
  };
}

/**
 * Limit search results
 */
export function limitResults<T>(results: T[], limit: number): T[] {
  const safeLimit = Math.min(limit, COMMAND_MENU_CONFIG.MAX_RESULTS);
  return results.slice(0, safeLimit);
}

/**
 * Group search results by type
 */
export function groupResultsByType<T extends { type: string }>(results: T[]): Record<string, T[]> {
  return results.reduce((groups, result) => {
    const type = result.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort search results by relevance
 */
export function sortResultsByRelevance<T extends { title: string }>(
  results: T[],
  query: string
): T[] {
  const lowerQuery = query.toLowerCase();
  
  return results.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    
    // Exact matches first
    if (aTitle === lowerQuery && bTitle !== lowerQuery) return -1;
    if (bTitle === lowerQuery && aTitle !== lowerQuery) return 1;
    
    // Starts with query
    if (aTitle.startsWith(lowerQuery) && !bTitle.startsWith(lowerQuery)) return -1;
    if (bTitle.startsWith(lowerQuery) && !aTitle.startsWith(lowerQuery)) return 1;
    
    // Contains query
    const aContains = aTitle.includes(lowerQuery);
    const bContains = bTitle.includes(lowerQuery);
    if (aContains && !bContains) return -1;
    if (bContains && !aContains) return 1;
    
    // Alphabetical order
    return aTitle.localeCompare(bTitle);
  });
}