/**
 * Unit tests for household fetcher optimization utilities
 * Tests performance improvements and caching functionality
 */

import type { HouseholdData, HouseholdHead } from '@/types';

import {
  batchFetchHouseholdHeads,
  processHouseholdsOptimized,
  searchHouseholdsOptimized,
  householdCache,
} from '../household-fetcher';


// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        in: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => ({
                  // Mock successful response
                  data: [],
                  error: null,
                })),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('Household Fetcher Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    householdCache.clear();
  });

  describe('batchFetchHouseholdHeads', () => {
    it('should return empty map for empty input', async () => {
      const result = await batchFetchHouseholdHeads([]);
      expect(result.size).toBe(0);
    });

    it('should batch fetch household heads successfully', async () => {
      const mockHeads = [
        { id: 'head-1', first_name: 'Juan', middle_name: 'Dela', last_name: 'Cruz' },
        { id: 'head-2', first_name: 'Maria', middle_name: '', last_name: 'Santos' },
      ];

      // Mock supabase response
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValue({
        select: () => ({
          in: () => Promise.resolve({ data: mockHeads, error: null }),
        }),
      });

      const result = await batchFetchHouseholdHeads(['head-1', 'head-2']);

      expect(result.size).toBe(2);
      expect(result.get('head-1')).toEqual(mockHeads[0]);
      expect(result.get('head-2')).toEqual(mockHeads[1]);
    });

    it('should handle database errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValue({
        select: () => ({
          in: () => Promise.resolve({ data: null, error: new Error('DB Error') }),
        }),
      });

      const result = await batchFetchHouseholdHeads(['head-1']);
      expect(result.size).toBe(0);
    });
  });

  describe('processHouseholdsOptimized', () => {
    it('should return empty array for empty input', async () => {
      const result = await processHouseholdsOptimized([]);
      expect(result).toEqual([]);
    });

    it('should process households with batch-fetched heads', async () => {
      const mockHouseholds: HouseholdData[] = [
        {
          code: 'HH001',
          barangay_code: '137401',
          household_head_id: 'head-1',
          house_number: '123',
          geo_streets: [{ id: 'street-1', name: 'Main St' }],
          geo_subdivisions: [],
        },
        {
          code: 'HH002',
          barangay_code: '137401',
          household_head_id: 'head-2',
          house_number: '456',
          geo_streets: [],
          geo_subdivisions: [{ id: 'sub-1', name: 'Subdivision A', type: 'residential' }],
        },
      ];

      const mockHeads = [
        { id: 'head-1', first_name: 'Juan', middle_name: 'Dela', last_name: 'Cruz' },
        { id: 'head-2', first_name: 'Maria', middle_name: '', last_name: 'Santos' },
      ];

      // Mock the batch fetch
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValue({
        select: () => ({
          in: () => Promise.resolve({ data: mockHeads, error: null }),
        }),
      });

      const result = await processHouseholdsOptimized(mockHouseholds);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        value: 'HH001',
        label: 'Household #HH001',
        description: 'Juan Dela Cruz - 123, Main St',
        code: 'HH001',
        head_name: 'Juan Dela Cruz',
        address: '123, Main St',
      });
      expect(result[1]).toEqual({
        value: 'HH002',
        label: 'Household #HH002',
        description: 'Maria Santos - 456, Subdivision A',
        code: 'HH002',
        head_name: 'Maria Santos',
        address: '456, Subdivision A',
      });
    });

    it('should handle households without heads', async () => {
      const mockHouseholds: HouseholdData[] = [
        {
          code: 'HH003',
          barangay_code: '137401',
          // No household_head_id
          geo_streets: [],
          geo_subdivisions: [],
        },
      ];

      const result = await processHouseholdsOptimized(mockHouseholds);

      expect(result).toHaveLength(1);
      expect(result[0].head_name).toBe('No head assigned');
      expect(result[0].address).toBe('No address');
    });
  });

  describe('Household Cache', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = [
        {
          value: 'HH001',
          label: 'Household #HH001',
          description: 'Test household',
          code: 'HH001',
          head_name: 'Test Head',
          address: 'Test Address',
        },
      ];

      const cacheKey = 'test-barangay-query-10';

      // Cache should be empty initially
      expect(householdCache.get(cacheKey)).toBeNull();

      // Set data in cache
      householdCache.set(cacheKey, testData);

      // Should retrieve cached data
      expect(householdCache.get(cacheKey)).toEqual(testData);
    });

    it('should handle cache expiration', () => {
      const testData = [
        {
          value: 'HH001',
          label: 'Household #HH001',
          description: 'Test household',
          code: 'HH001',
          head_name: 'Test Head',
          address: 'Test Address',
        },
      ];

      const cacheKey = 'test-expired';

      // Mock the cache with expired timestamp
      (householdCache as any).cache.set(cacheKey, {
        data: testData,
        timestamp: Date.now() - (6 * 60 * 1000), // 6 minutes ago (expired)
      });

      // Should return null for expired data
      expect(householdCache.get(cacheKey)).toBeNull();

      // Cache should be cleaned up
      expect((householdCache as any).cache.has(cacheKey)).toBe(false);
    });

    it('should clear cache correctly', () => {
      const testData = [
        {
          value: 'HH001',
          label: 'Household #HH001',
          description: 'Test household',
          code: 'HH001',
          head_name: 'Test Head',
          address: 'Test Address',
        },
      ];

      householdCache.set('key1', testData);
      householdCache.set('key2', testData);

      expect(householdCache.get('key1')).toEqual(testData);
      expect(householdCache.get('key2')).toEqual(testData);

      householdCache.clear();

      expect(householdCache.get('key1')).toBeNull();
      expect(householdCache.get('key2')).toBeNull();
    });
  });

  describe('searchHouseholdsOptimized', () => {
    it('should search households with query', async () => {
      const mockHouseholds = [
        {
          code: 'HH001',
          barangay_code: '137401',
          house_number: '123',
          geo_streets: [],
          geo_subdivisions: [],
        },
      ];

      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            or: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: mockHouseholds, error: null }),
              }),
            }),
          }),
        }),
      });

      const result = await searchHouseholdsOptimized('137401', 'test query', 10);

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('HH001');
    });

    it('should handle search errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            or: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: null, error: new Error('Search error') }),
              }),
            }),
          }),
        }),
      });

      const result = await searchHouseholdsOptimized('137401', 'test query');
      expect(result).toEqual([]);
    });
  });

  describe('Performance Benefits', () => {
    it('should demonstrate N+1 to O(1) improvement', async () => {
      const mockHouseholds: HouseholdData[] = Array.from({ length: 10 }, (_, i) => ({
        code: `HH${i + 1}`,
        barangay_code: '137401',
        household_head_id: `head-${i + 1}`,
        geo_streets: [],
        geo_subdivisions: [],
      }));

      const mockHeads = Array.from({ length: 10 }, (_, i) => ({
        id: `head-${i + 1}`,
        first_name: `Name${i + 1}`,
        middle_name: '',
        last_name: 'Surname',
      }));

      let queryCount = 0;
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValue({
        select: () => ({
          in: () => {
            queryCount++; // Count the number of database calls
            return Promise.resolve({ data: mockHeads, error: null });
          },
        }),
      });

      const result = await processHouseholdsOptimized(mockHouseholds);

      // Should make only 1 database call instead of 10 (N+1 problem solved)
      expect(queryCount).toBe(1);
      expect(result).toHaveLength(10);
    });
  });
});