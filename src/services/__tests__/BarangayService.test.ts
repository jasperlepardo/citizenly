import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BarangayService } from '../BarangayService';
import { supabase } from '@/lib/supabase';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      count: vi.fn(),
    })),
  },
}));

// Mock logger
vi.mock('@/lib/secure-logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
  logError: vi.fn(),
}));

describe('BarangayService', () => {
  let barangayService: BarangayService;
  let mockQuery: any;

  beforeEach(() => {
    barangayService = new BarangayService();
    mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    
    vi.mocked(supabase.from).mockReturnValue(mockQuery);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('searchByName', () => {
    it('should search barangays by name successfully', async () => {
      const mockData = [
        { code: '123', name: 'San Jose' },
        { code: '456', name: 'San Antonio' },
      ];

      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await barangayService.searchByName('San');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%San%');
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
    });

    it('should handle search errors', async () => {
      const mockError = new Error('Database connection failed');
      mockQuery.single.mockResolvedValue({ data: null, error: mockError });

      const result = await barangayService.searchByName('San');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle empty search terms', async () => {
      const result = await barangayService.searchByName('');
      
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
      expect(mockQuery.ilike).not.toHaveBeenCalled();
    });
  });

  describe('getByCode', () => {
    it('should get barangay by code successfully', async () => {
      const mockData = { code: '123', name: 'San Jose' };
      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await barangayService.getByCode('123');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.eq).toHaveBeenCalledWith('code', '123');
      expect(mockQuery.single).toHaveBeenCalled();
    });

    it('should handle non-existent barangay codes', async () => {
      mockQuery.single.mockResolvedValue({ data: null, error: null });

      const result = await barangayService.getByCode('999');

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('validateCode', () => {
    it('should return true for valid barangay code', async () => {
      const mockCount = {
        count: vi.fn(() => ({ count: 1, error: null })),
      };
      vi.mocked(supabase.from).mockReturnValue(mockCount as any);

      const result = await barangayService.validateCode('123');

      expect(result).toBe(true);
    });

    it('should return false for invalid barangay code', async () => {
      const mockCount = {
        count: vi.fn(() => ({ count: 0, error: null })),
      };
      vi.mocked(supabase.from).mockReturnValue(mockCount as any);

      const result = await barangayService.validateCode('999');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      const mockCount = {
        count: vi.fn(() => ({ count: null, error: new Error('DB Error') })),
      };
      vi.mocked(supabase.from).mockReturnValue(mockCount as any);

      const result = await barangayService.validateCode('123');

      expect(result).toBe(false);
    });
  });

  describe('getWithHierarchy', () => {
    it('should get barangay with full hierarchy', async () => {
      const mockData = {
        code: '123',
        name: 'San Jose',
        city: {
          code: '456',
          name: 'Manila',
          province: {
            code: '789',
            name: 'Metro Manila',
            region: {
              code: '13',
              name: 'National Capital Region',
            },
          },
        },
      };

      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await barangayService.getWithHierarchy('123');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.select).toHaveBeenCalledWith(expect.stringContaining('city:'));
    });
  });

  describe('getStatistics', () => {
    it('should return barangay statistics', async () => {
      // Mock the count query
      const mockCountResult = { data: 100, error: null };
      vi.spyOn(barangayService as any, 'count').mockResolvedValue(mockCountResult);

      // Mock the city and province queries
      mockQuery.single.mockResolvedValueOnce({ 
        data: [
          { city_code: '123' },
          { city_code: '123' },
          { city_code: '456' },
        ], 
        error: null 
      });
      
      mockQuery.single.mockResolvedValueOnce({ 
        data: [
          { province_code: '789', barangays: [{ count: 2 }] },
          { province_code: '789', barangays: [{ count: 1 }] },
        ], 
        error: null 
      });

      const result = await barangayService.getStatistics();

      expect(result.data).toHaveProperty('totalBarangays', 100);
      expect(result.data).toHaveProperty('barangaysByCity');
      expect(result.data).toHaveProperty('barangaysByProvince');
      expect(result.error).toBeNull();
    });

    it('should handle statistics errors gracefully', async () => {
      vi.spyOn(barangayService as any, 'count').mockResolvedValue({ 
        data: null, 
        error: new Error('Count failed') 
      });

      const result = await barangayService.getStatistics();

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search with filters', async () => {
      const mockData = [
        { code: '123', name: 'San Jose' },
      ];

      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await barangayService.advancedSearch('San', '456', '789');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%San%');
      expect(mockQuery.eq).toHaveBeenCalledWith('city_code', '456');
    });

    it('should search without optional filters', async () => {
      const mockData = [{ code: '123', name: 'San Jose' }];
      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await barangayService.advancedSearch('San');

      expect(result.data).toEqual(mockData);
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%San%');
      expect(mockQuery.eq).not.toHaveBeenCalled();
    });
  });
});