/**
 * Performance optimization for household head fetching
 * Eliminates N+1 query problem by batching database calls
 */

import { supabase } from '@/lib/supabase';
import { HouseholdData, HouseholdHead, HouseholdOption } from '@/lib/types/resident';
import { formatHouseholdOption } from '@/lib/mappers/residentMapper';

/**
 * Batch fetch household heads to eliminate N+1 queries
 * BEFORE: N individual queries for N households
 * AFTER: 1 batch query for all household heads
 */
export const batchFetchHouseholdHeads = async (
  householdHeadIds: string[]
): Promise<Map<string, HouseholdHead>> => {
  if (householdHeadIds.length === 0) {
    return new Map();
  }

  const { data: headsData, error } = await supabase
    .from('residents')
    .select('id, first_name, middle_name, last_name')
    .in('id', householdHeadIds);

  if (error) {
    console.error('Error batch fetching household heads:', error);
    return new Map();
  }

  // Create a map for O(1) lookup
  const headsMap = new Map<string, HouseholdHead>();
  headsData?.forEach(head => {
    headsMap.set(head.id, head);
  });

  return headsMap;
};

/**
 * Optimized household processing with batch head fetching
 * Performance improvement: O(n) instead of O(n²)
 */
export const processHouseholdsOptimized = async (
  householdsData: HouseholdData[]
): Promise<HouseholdOption[]> => {
  if (!householdsData || householdsData.length === 0) {
    return [];
  }

  // Extract all household head IDs that exist
  const householdHeadIds = householdsData
    .map(household => household.household_head_id)
    .filter(Boolean) as string[];

  // Batch fetch all household heads in one query
  const headsMap = await batchFetchHouseholdHeads(householdHeadIds);

  // Process households with their heads (now O(1) lookup)
  return householdsData.map(household => {
    const headResident = household.household_head_id 
      ? headsMap.get(household.household_head_id)
      : undefined;
    
    return formatHouseholdOption(household, headResident);
  });
};

/**
 * Build optimized household query with proper typing
 */
export const buildHouseholdQuery = (barangayCode: string) => {
  return supabase
    .from('households')
    .select(`
      code,
      name,
      house_number,
      street_id,
      subdivision_id,
      barangay_code,
      household_head_id,
      geo_streets(id, name),
      geo_subdivisions(id, name, type)
    `)
    .eq('barangay_code', barangayCode);
};

/**
 * Optimized household search with performance improvements
 */
export const searchHouseholdsOptimized = async (
  barangayCode: string,
  query?: string,
  limit: number = 20
): Promise<HouseholdOption[]> => {
  try {
    let householdQuery = buildHouseholdQuery(barangayCode)
      .order('code', { ascending: true })
      .limit(limit);

    // Add search filtering if query provided
    if (query && query.trim()) {
      householdQuery = householdQuery
        .or(`code.ilike.%${query}%,house_number.ilike.%${query}%`);
    }

    const { data: householdsData, error } = await householdQuery;

    if (error) {
      console.error('Error searching households:', error);
      return [];
    }

    // Use optimized processing
    return await processHouseholdsOptimized(householdsData || []);
  } catch (error) {
    console.error('Household search error:', error);
    return [];
  }
};

/**
 * Cache for frequently accessed household data
 * Simple in-memory cache with TTL
 */
class HouseholdCache {
  private cache = new Map<string, { data: HouseholdOption[]; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.TTL;
  }

  get(key: string): HouseholdOption[] | null {
    const cached = this.cache.get(key);
    if (!cached || this.isExpired(cached.timestamp)) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  set(key: string, data: HouseholdOption[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const householdCache = new HouseholdCache();

/**
 * Cached household search for even better performance
 */
export const searchHouseholdsCached = async (
  barangayCode: string,
  query?: string,
  limit: number = 20
): Promise<HouseholdOption[]> => {
  const cacheKey = `${barangayCode}-${query || 'all'}-${limit}`;
  
  // Check cache first
  const cached = householdCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const results = await searchHouseholdsOptimized(barangayCode, query, limit);
  householdCache.set(cacheKey, results);
  
  return results;
};