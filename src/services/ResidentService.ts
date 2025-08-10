import { ServiceBase, ServiceResponse, SearchOptions } from './base/ServiceBase';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/secure-logger';

export interface Resident {
  id: string;
  household_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  relationship_to_head: string;
  birth_date: string;
  age?: number;
  sex: 'male' | 'female';
  civil_status: string;
  is_pwd: boolean;
  is_registered_voter: boolean;
  is_indigenous: boolean;
  ethnicity?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResidentWithHousehold extends Resident {
  household?: {
    household_number: string;
    address: string;
    barangay_code: string;
  };
}

export interface ResidentFilters {
  household_id?: string;
  barangay_code?: string;
  is_pwd?: boolean;
  is_registered_voter?: boolean;
  is_indigenous?: boolean;
  age_min?: number;
  age_max?: number;
  sex?: 'male' | 'female';
  civil_status?: string;
}

/**
 * Service for managing resident data and operations
 */
export class ResidentService extends ServiceBase {
  constructor() {
    super('residents', 'RESIDENT');
  }

  /**
   * Create a new resident
   */
  async createResident(data: Omit<Resident, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Resident>> {
    // Calculate age from birth date
    const birthDate = new Date(data.birth_date);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    
    return this.create<Resident>({ ...data, age });
  }

  /**
   * Update resident information
   */
  async updateResident(id: string, data: Partial<Resident>): Promise<ServiceResponse<Resident>> {
    // Recalculate age if birth date is updated
    if (data.birth_date) {
      const birthDate = new Date(data.birth_date);
      data.age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
    
    return this.update<Resident>(id, data);
  }

  /**
   * Get resident by ID with household info
   */
  async getResidentWithHousehold(id: string): Promise<ServiceResponse<ResidentWithHousehold>> {
    return this.fetch<ResidentWithHousehold>(() =>
      supabase
        .from(this.tableName)
        .select(`
          *,
          household:households(
            household_number,
            address,
            barangay_code
          )
        `)
        .eq('id', id)
        .single()
    );
  }

  /**
   * Search residents by name
   */
  async searchByName(searchTerm: string, options: SearchOptions = {}): Promise<ServiceResponse<Resident[]>> {
    return this.fetch<Resident[]>(() => {
      const { page = 1, limit = 20 } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      return supabase
        .from(this.tableName)
        .select()
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,middle_name.ilike.%${searchTerm}%`)
        .range(from, to)
        .order('last_name', { ascending: true });
    });
  }

  /**
   * Get residents by household
   */
  async getByHousehold(householdId: string): Promise<ServiceResponse<Resident[]>> {
    return this.fetch<Resident[]>(() =>
      supabase
        .from(this.tableName)
        .select()
        .eq('household_id', householdId)
        .order('birth_date', { ascending: true })
    );
  }

  /**
   * Get residents with advanced filters
   */
  async getFilteredResidents(filters: ResidentFilters, options: SearchOptions = {}): Promise<ServiceResponse<Resident[]>> {
    return this.fetch<Resident[]>(() => {
      const { page = 1, limit = 50 } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from(this.tableName)
        .select()
        .range(from, to);

      // Apply filters
      if (filters.household_id) {
        query = query.eq('household_id', filters.household_id);
      }
      if (filters.is_pwd !== undefined) {
        query = query.eq('is_pwd', filters.is_pwd);
      }
      if (filters.is_registered_voter !== undefined) {
        query = query.eq('is_registered_voter', filters.is_registered_voter);
      }
      if (filters.is_indigenous !== undefined) {
        query = query.eq('is_indigenous', filters.is_indigenous);
      }
      if (filters.sex) {
        query = query.eq('sex', filters.sex);
      }
      if (filters.civil_status) {
        query = query.eq('civil_status', filters.civil_status);
      }
      if (filters.age_min !== undefined) {
        query = query.gte('age', filters.age_min);
      }
      if (filters.age_max !== undefined) {
        query = query.lte('age', filters.age_max);
      }

      // Join with households for barangay filter
      if (filters.barangay_code) {
        query = query
          .select(`
            *,
            household!inner(barangay_code)
          `)
          .eq('household.barangay_code', filters.barangay_code);
      }

      return query.order('created_at', { ascending: false });
    });
  }

  /**
   * Get resident statistics
   */
  async getStatistics(barangayCode?: string): Promise<ServiceResponse<{
    total: number;
    byGender: { male: number; female: number };
    byAgeGroup: Record<string, number>;
    pwdCount: number;
    voterCount: number;
    indigenousCount: number;
    byCivilStatus: Record<string, number>;
  }>> {
    try {
      let baseQuery = supabase.from(this.tableName).select('*');
      
      if (barangayCode) {
        baseQuery = baseQuery
          .select(`
            *,
            household!inner(barangay_code)
          `)
          .eq('household.barangay_code', barangayCode);
      }

      const { data, error } = await baseQuery;

      if (error) {
        return { data: null, error };
      }

      if (!data) {
        return { 
          data: {
            total: 0,
            byGender: { male: 0, female: 0 },
            byAgeGroup: {},
            pwdCount: 0,
            voterCount: 0,
            indigenousCount: 0,
            byCivilStatus: {}
          },
          error: null 
        };
      }

      // Calculate statistics
      const stats = {
        total: data.length,
        byGender: { male: 0, female: 0 },
        byAgeGroup: {
          '0-12': 0,
          '13-17': 0,
          '18-35': 0,
          '36-59': 0,
          '60+': 0
        },
        pwdCount: 0,
        voterCount: 0,
        indigenousCount: 0,
        byCivilStatus: {} as Record<string, number>
      };

      data.forEach((resident: any) => {
        // Gender
        if (resident.sex === 'male') stats.byGender.male++;
        if (resident.sex === 'female') stats.byGender.female++;

        // Age groups
        const age = resident.age || 0;
        if (age <= 12) stats.byAgeGroup['0-12']++;
        else if (age <= 17) stats.byAgeGroup['13-17']++;
        else if (age <= 35) stats.byAgeGroup['18-35']++;
        else if (age <= 59) stats.byAgeGroup['36-59']++;
        else stats.byAgeGroup['60+']++;

        // Special categories
        if (resident.is_pwd) stats.pwdCount++;
        if (resident.is_registered_voter) stats.voterCount++;
        if (resident.is_indigenous) stats.indigenousCount++;

        // Civil status
        const status = resident.civil_status || 'unknown';
        stats.byCivilStatus[status] = (stats.byCivilStatus[status] || 0) + 1;
      });

      return { data: stats, error: null };
    } catch (error) {
      logError(error as Error, 'RESIDENT_STATISTICS_ERROR');
      return { data: null, error: error as Error };
    }
  }

  /**
   * Bulk create residents (for household registration)
   */
  async bulkCreate(residents: Omit<Resident, 'id' | 'created_at' | 'updated_at'>[]): Promise<ServiceResponse<Resident[]>> {
    try {
      // Calculate age for each resident
      const residentsWithAge = residents.map(resident => {
        const birthDate = new Date(resident.birth_date);
        const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        return { ...resident, age };
      });

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(residentsWithAge)
        .select();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError(error as Error, 'RESIDENT_BULK_CREATE_ERROR');
      return { data: null, error: error as Error };
    }
  }
}

// Export singleton instance
export const residentService = new ResidentService();