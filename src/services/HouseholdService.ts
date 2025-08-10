import { ServiceBase, ServiceResponse, SearchOptions } from './base/ServiceBase';
import { supabase } from '@/lib/supabase';
import { Resident, residentService } from './ResidentService';

export interface Household {
  id: string;
  household_number: string;
  psoc_classification?: string;
  household_type: string;
  monthly_income?: number;
  address: string;
  barangay_code: string;
  contact_number?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HouseholdWithMembers extends Household {
  residents: Resident[];
  head_of_household?: Resident;
  member_count?: number;
}

export interface HouseholdFilters {
  barangay_code?: string;
  psoc_classification?: string;
  household_type?: string;
  income_min?: number;
  income_max?: number;
}

export interface HouseholdRegistrationData {
  household: Omit<Household, 'id' | 'created_at' | 'updated_at'>;
  residents: Omit<Resident, 'id' | 'household_id' | 'created_at' | 'updated_at'>[];
}

/**
 * Service for managing household data and operations
 */
export class HouseholdService extends ServiceBase {
  constructor() {
    super('households', 'HOUSEHOLD');
  }

  /**
   * Register a new household with members
   */
  async registerHousehold(data: HouseholdRegistrationData): Promise<ServiceResponse<HouseholdWithMembers>> {
    try {
      // Start a transaction
      const { data: household, error: householdError } = await supabase
        .from(this.tableName)
        .insert(data.household)
        .select()
        .single();

      if (householdError || !household) {
        return { data: null, error: householdError };
      }

      // Add household_id to all residents
      const residentsWithHouseholdId = data.residents.map(resident => ({
        ...resident,
        household_id: household.id
      }));

      // Bulk create residents
      const { data: residents, error: residentsError } = await residentService.bulkCreate(residentsWithHouseholdId);

      if (residentsError) {
        // Rollback by deleting the household
        await this.delete(household.id);
        return { data: null, error: residentsError };
      }

      return {
        data: {
          ...household,
          residents: residents || [],
          member_count: residents?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get household with all members
   */
  async getHouseholdWithMembers(id: string): Promise<ServiceResponse<HouseholdWithMembers>> {
    return this.fetch<HouseholdWithMembers>(() =>
      supabase
        .from(this.tableName)
        .select(`
          *,
          residents(*)
        `)
        .eq('id', id)
        .single()
    );
  }

  /**
   * Search households by number or address
   */
  async searchHouseholds(searchTerm: string, options: SearchOptions = {}): Promise<ServiceResponse<Household[]>> {
    return this.fetch<Household[]>(() => {
      const { page = 1, limit = 20 } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      return supabase
        .from(this.tableName)
        .select()
        .or(`household_number.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .range(from, to)
        .order('created_at', { ascending: false });
    });
  }

  /**
   * Get households by barangay
   */
  async getByBarangay(barangayCode: string, options: SearchOptions = {}): Promise<ServiceResponse<Household[]>> {
    const { page = 1, limit = 50 } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return this.fetch<Household[]>(() =>
      supabase
        .from(this.tableName)
        .select()
        .eq('barangay_code', barangayCode)
        .range(from, to)
        .order('household_number', { ascending: true })
    );
  }

  /**
   * Get households with filters
   */
  async getFilteredHouseholds(
    filters: HouseholdFilters,
    options: SearchOptions = {}
  ): Promise<ServiceResponse<HouseholdWithMembers[]>> {
    return this.fetch<HouseholdWithMembers[]>(() => {
      const { page = 1, limit = 50 } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          residents(*),
          member_count:residents(count)
        `)
        .range(from, to);

      // Apply filters
      if (filters.barangay_code) {
        query = query.eq('barangay_code', filters.barangay_code);
      }
      if (filters.psoc_classification) {
        query = query.eq('psoc_classification', filters.psoc_classification);
      }
      if (filters.household_type) {
        query = query.eq('household_type', filters.household_type);
      }
      if (filters.income_min !== undefined) {
        query = query.gte('monthly_income', filters.income_min);
      }
      if (filters.income_max !== undefined) {
        query = query.lte('monthly_income', filters.income_max);
      }

      return query.order('created_at', { ascending: false });
    });
  }

  /**
   * Update household information
   */
  async updateHousehold(id: string, data: Partial<Household>): Promise<ServiceResponse<Household>> {
    return this.update<Household>(id, data);
  }

  /**
   * Add member to household
   */
  async addMember(
    householdId: string,
    resident: Omit<Resident, 'id' | 'household_id' | 'created_at' | 'updated_at'>
  ): Promise<ServiceResponse<Resident>> {
    return residentService.createResident({
      ...resident,
      household_id: householdId
    });
  }

  /**
   * Remove member from household
   */
  async removeMember(residentId: string): Promise<ServiceResponse<boolean>> {
    return residentService.delete(residentId);
  }

  /**
   * Get household statistics
   */
  async getStatistics(barangayCode?: string): Promise<ServiceResponse<{
    totalHouseholds: number;
    byType: Record<string, number>;
    byPSOC: Record<string, number>;
    averageMembers: number;
    averageIncome: number;
    incomeDistribution: {
      below10k: number;
      '10k-25k': number;
      '25k-50k': number;
      '50k-100k': number;
      above100k: number;
    };
  }>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          residents(count)
        `);

      if (barangayCode) {
        query = query.eq('barangay_code', barangayCode);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return {
          data: {
            totalHouseholds: 0,
            byType: {},
            byPSOC: {},
            averageMembers: 0,
            averageIncome: 0,
            incomeDistribution: {
              below10k: 0,
              '10k-25k': 0,
              '25k-50k': 0,
              '50k-100k': 0,
              above100k: 0
            }
          },
          error: null
        };
      }

      // Calculate statistics
      const stats = {
        totalHouseholds: data.length,
        byType: {} as Record<string, number>,
        byPSOC: {} as Record<string, number>,
        averageMembers: 0,
        averageIncome: 0,
        incomeDistribution: {
          below10k: 0,
          '10k-25k': 0,
          '25k-50k': 0,
          '50k-100k': 0,
          above100k: 0
        }
      };

      let totalMembers = 0;
      let totalIncome = 0;
      let incomeCount = 0;

      data.forEach((household: any) => {
        // Household type
        const type = household.household_type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // PSOC classification
        const psoc = household.psoc_classification || 'unclassified';
        stats.byPSOC[psoc] = (stats.byPSOC[psoc] || 0) + 1;

        // Member count
        const memberCount = household.residents?.[0]?.count || 0;
        totalMembers += memberCount;

        // Income
        if (household.monthly_income !== null && household.monthly_income !== undefined) {
          const income = household.monthly_income;
          totalIncome += income;
          incomeCount++;

          // Income distribution
          if (income < 10000) stats.incomeDistribution.below10k++;
          else if (income < 25000) stats.incomeDistribution['10k-25k']++;
          else if (income < 50000) stats.incomeDistribution['25k-50k']++;
          else if (income < 100000) stats.incomeDistribution['50k-100k']++;
          else stats.incomeDistribution.above100k++;
        }
      });

      stats.averageMembers = data.length > 0 ? Math.round(totalMembers / data.length * 10) / 10 : 0;
      stats.averageIncome = incomeCount > 0 ? Math.round(totalIncome / incomeCount) : 0;

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Generate household number
   */
  async generateHouseholdNumber(barangayCode: string): Promise<string> {
    const { data: count } = await this.count({ barangay_code: barangayCode });
    const paddedCount = String((count || 0) + 1).padStart(5, '0');
    const year = new Date().getFullYear();
    return `${barangayCode}-${year}-${paddedCount}`;
  }
}

// Export singleton instance
export const householdService = new HouseholdService();