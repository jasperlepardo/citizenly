import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HouseholdService } from '../HouseholdService';
import { residentService } from '../ResidentService';
import { supabase } from '@/lib/supabase';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('../ResidentService', () => ({
  residentService: {
    bulkCreate: vi.fn(),
    createResident: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/secure-logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
  logError: vi.fn(),
}));

describe('HouseholdService', () => {
  let householdService: HouseholdService;
  let mockQuery: any;

  beforeEach(() => {
    householdService = new HouseholdService();
    mockQuery = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    };
    
    vi.mocked(supabase.from).mockReturnValue(mockQuery);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('registerHousehold', () => {
    it('should register household with members successfully', async () => {
      const mockHousehold = { 
        id: 'household-1',
        household_number: 'HH-001',
        address: '123 Main St',
        barangay_code: '123456'
      };
      
      const mockResidents = [
        { 
          id: 'resident-1',
          household_id: 'household-1',
          first_name: 'John',
          last_name: 'Doe'
        }
      ];

      const registrationData = {
        household: {
          household_number: 'HH-001',
          household_type: 'nuclear',
          address: '123 Main St',
          barangay_code: '123456',
        },
        residents: [
          {
            first_name: 'John',
            middle_name: '',
            last_name: 'Doe',
            relationship_to_head: 'head',
            birth_date: '1990-01-01',
            sex: 'male' as const,
            civil_status: 'married',
            is_pwd: false,
            is_registered_voter: true,
            is_indigenous: false,
          }
        ]
      };

      mockQuery.single.mockResolvedValueOnce({ 
        data: mockHousehold, 
        error: null 
      });

      vi.mocked(residentService.bulkCreate).mockResolvedValue({
        data: mockResidents,
        error: null
      });

      const result = await householdService.registerHousehold(registrationData);

      expect(result.data).toEqual({
        ...mockHousehold,
        residents: mockResidents,
        member_count: 1
      });
      expect(result.error).toBeNull();
      
      expect(mockQuery.insert).toHaveBeenCalledWith(registrationData.household);
      expect(residentService.bulkCreate).toHaveBeenCalledWith([
        { ...registrationData.residents[0], household_id: 'household-1' }
      ]);
    });

    it('should rollback on resident creation failure', async () => {
      const mockHousehold = { 
        id: 'household-1',
        household_number: 'HH-001' 
      };
      
      const registrationData = {
        household: {
          household_number: 'HH-001',
          household_type: 'nuclear',
          address: '123 Main St',
          barangay_code: '123456',
        },
        residents: [
          {
            first_name: 'John',
            middle_name: '',
            last_name: 'Doe',
            relationship_to_head: 'head',
            birth_date: '1990-01-01',
            sex: 'male' as const,
            civil_status: 'married',
            is_pwd: false,
            is_registered_voter: true,
            is_indigenous: false,
          }
        ]
      };

      mockQuery.single.mockResolvedValueOnce({ 
        data: mockHousehold, 
        error: null 
      });

      const residentError = new Error('Resident creation failed');
      vi.mocked(residentService.bulkCreate).mockResolvedValue({
        data: null,
        error: residentError
      });

      // Mock delete for rollback
      vi.spyOn(householdService, 'delete').mockResolvedValue({
        data: true,
        error: null
      });

      const result = await householdService.registerHousehold(registrationData);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(residentError);
      expect(householdService.delete).toHaveBeenCalledWith('household-1');
    });

    it('should handle household creation failure', async () => {
      const householdError = new Error('Household creation failed');
      
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: householdError 
      });

      const registrationData = {
        household: {
          household_number: 'HH-001',
          household_type: 'nuclear',
          address: '123 Main St',
          barangay_code: '123456',
        },
        residents: []
      };

      const result = await householdService.registerHousehold(registrationData);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(householdError);
      expect(residentService.bulkCreate).not.toHaveBeenCalled();
    });
  });

  describe('searchHouseholds', () => {
    it('should search households by number or address', async () => {
      const mockData = [
        { 
          id: 'household-1',
          household_number: 'HH-001',
          address: '123 Main St'
        }
      ];

      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await householdService.searchHouseholds('HH-001');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.or).toHaveBeenCalledWith(
        'household_number.ilike.%HH-001%,address.ilike.%HH-001%'
      );
    });
  });

  describe('getFilteredHouseholds', () => {
    it('should apply multiple filters correctly', async () => {
      const mockData = [{ id: 'household-1' }];
      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const filters = {
        barangay_code: '123456',
        household_type: 'nuclear',
        income_min: 10000,
        income_max: 50000,
      };

      const result = await householdService.getFilteredHouseholds(filters);

      expect(result.data).toEqual(mockData);
      expect(mockQuery.eq).toHaveBeenCalledWith('barangay_code', '123456');
      expect(mockQuery.eq).toHaveBeenCalledWith('household_type', 'nuclear');
      expect(mockQuery.gte).toHaveBeenCalledWith('monthly_income', 10000);
      expect(mockQuery.lte).toHaveBeenCalledWith('monthly_income', 50000);
    });

    it('should work without filters', async () => {
      const mockData = [{ id: 'household-1' }];
      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await householdService.getFilteredHouseholds({});

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });
  });

  describe('addMember', () => {
    it('should add member to household successfully', async () => {
      const mockResident = {
        id: 'resident-1',
        household_id: 'household-1',
        first_name: 'Jane',
        last_name: 'Doe'
      };

      const residentData = {
        first_name: 'Jane',
        middle_name: '',
        last_name: 'Doe',
        relationship_to_head: 'spouse',
        birth_date: '1992-01-01',
        sex: 'female' as const,
        civil_status: 'married',
        is_pwd: false,
        is_registered_voter: true,
        is_indigenous: false,
      };

      vi.mocked(residentService.createResident).mockResolvedValue({
        data: mockResident,
        error: null
      });

      const result = await householdService.addMember('household-1', residentData);

      expect(result.data).toEqual(mockResident);
      expect(result.error).toBeNull();
      expect(residentService.createResident).toHaveBeenCalledWith({
        ...residentData,
        household_id: 'household-1'
      });
    });
  });

  describe('generateHouseholdNumber', () => {
    it('should generate unique household number', async () => {
      vi.spyOn(householdService as any, 'count').mockResolvedValue({
        data: 5,
        error: null
      });

      // Mock current year
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);

      const result = await householdService.generateHouseholdNumber('123456');

      expect(result).toBe('123456-2024-00006');
    });

    it('should handle count errors', async () => {
      vi.spyOn(householdService as any, 'count').mockResolvedValue({
        data: null,
        error: new Error('Count failed')
      });

      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);

      const result = await householdService.generateHouseholdNumber('123456');

      expect(result).toBe('123456-2024-00001');
    });
  });

  describe('getStatistics', () => {
    it('should return household statistics', async () => {
      const mockData = [
        {
          id: 'household-1',
          household_type: 'nuclear',
          psoc_classification: 'poor',
          monthly_income: 15000,
          residents: [{ count: 4 }]
        },
        {
          id: 'household-2', 
          household_type: 'extended',
          psoc_classification: 'non-poor',
          monthly_income: 35000,
          residents: [{ count: 6 }]
        }
      ];

      mockQuery.single.mockResolvedValue({ data: mockData, error: null });

      const result = await householdService.getStatistics();

      expect(result.data).toEqual({
        totalHouseholds: 2,
        byType: {
          nuclear: 1,
          extended: 1
        },
        byPSOC: {
          poor: 1,
          'non-poor': 1
        },
        averageMembers: 5.0,
        averageIncome: 25000,
        incomeDistribution: {
          below10k: 0,
          '10k-25k': 1,
          '25k-50k': 1,
          '50k-100k': 0,
          above100k: 0
        }
      });
      expect(result.error).toBeNull();
    });

    it('should handle empty statistics', async () => {
      mockQuery.single.mockResolvedValue({ data: [], error: null });

      const result = await householdService.getStatistics();

      expect(result.data?.totalHouseholds).toBe(0);
      expect(result.data?.averageMembers).toBe(0);
      expect(result.data?.averageIncome).toBe(0);
    });
  });
});