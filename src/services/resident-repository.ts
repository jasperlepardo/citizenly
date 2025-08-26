/**
 * Resident Repository
 * Domain-specific repository for resident data operations
 */

import { BaseRepository, type QueryOptions, type RepositoryResult } from './base-repository';
import { validateResidentData } from '@/lib/validation/schemas';
import type { ValidationContext } from '@/lib/validation/types';
import { ResidentRecord } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use database record directly for consistent typing
export type ResidentData = ResidentRecord;

export interface ResidentSearchOptions extends QueryOptions {
  name?: string;
  age?: number;
  sex?: string;
  civil_status?: string;
  household_code?: string;
  is_voter?: boolean;
}

export class ResidentRepository extends BaseRepository<ResidentData> {
  constructor(context?: ValidationContext) {
    super('residents', context);
  }

  /**
   * Create a new resident with validation
   */
  async createResident(
    data: Omit<ResidentData, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RepositoryResult<ResidentData>> {
    try {
      // Validate resident data before creation
      const validationResult = await validateResidentData(data, this.context);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Resident data validation failed',
            details: validationResult.errors,
          },
        };
      }

      return await this.create(validationResult.data || data);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'createResident'),
      };
    }
  }

  /**
   * Update resident with validation
   */
  async updateResident(
    id: string,
    data: Partial<Omit<ResidentData, 'id' | 'created_at'>>
  ): Promise<RepositoryResult<ResidentData>> {
    try {
      // Get existing resident for partial validation
      const existingResult = await this.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return existingResult;
      }

      // Merge with existing data for validation
      const mergedData = { ...existingResult.data, ...data };
      const validationResult = await validateResidentData(mergedData, this.context);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Resident data validation failed',
            details: validationResult.errors,
          },
        };
      }

      return await this.update(id, data);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'updateResident'),
      };
    }
  }

  /**
   * Search residents with advanced filtering
   */
  async searchResidents(options: ResidentSearchOptions = {}): Promise<RepositoryResult<ResidentData[]>> {
    try {
      const queryBuilder = (supabase: SupabaseClient) => {
        let query = supabase
          .from(this.tableName)
          .select('*', { count: 'exact' });

        // Name search (across first, middle, last names)
        if (options.name) {
          const searchTerm = `%${options.name}%`;
          query = query.or(
            `first_name.ilike.${searchTerm},middle_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
          );
        }

        // Age search (calculated from birthdate)
        if (options.age) {
          const currentYear = new Date().getFullYear();
          const birthYear = currentYear - options.age;
          query = query.gte('birthdate', `${birthYear}-01-01`)
                      .lt('birthdate', `${birthYear + 1}-01-01`);
        }

        // Direct field filters
        if (options.sex) query = query.eq('sex', options.sex);
        if (options.civil_status) query = query.eq('civil_status', options.civil_status);
        if (options.household_code) query = query.eq('household_code', options.household_code);
        if (options.is_voter !== undefined) query = query.eq('is_voter', options.is_voter);

        // Apply other filters
        if (options.filters) {
          for (const [key, value] of Object.entries(options.filters)) {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value);
            }
          }
        }

        // Apply ordering
        if (options.orderBy) {
          query = query.order(options.orderBy, { 
            ascending: options.orderDirection !== 'desc' 
          });
        } else {
          // Default order by last name, first name
          query = query.order('last_name').order('first_name');
        }

        // Apply pagination
        if (options.limit) {
          query = query.limit(options.limit);
        }

        if (options.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        return query;
      };

      return await this.executeQuery(queryBuilder, 'SEARCH_RESIDENTS');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'searchResidents'),
      };
    }
  }

  /**
   * Find residents by household
   */
  async findByHousehold(household_code: string): Promise<RepositoryResult<ResidentData[]>> {
    try {
      return await this.findAll({
        filters: { household_code },
        orderBy: 'last_name',
      });
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findByHousehold'),
      };
    }
  }

  /**
   * Find residents by age range
   */
  async findByAgeRange(minAge: number, maxAge: number): Promise<RepositoryResult<ResidentData[]>> {
    try {
      const currentDate = new Date();
      const maxBirthDate = new Date(currentDate.getFullYear() - minAge, currentDate.getMonth(), currentDate.getDate());
      const minBirthDate = new Date(currentDate.getFullYear() - maxAge - 1, currentDate.getMonth(), currentDate.getDate());

      const queryBuilder = (supabase: SupabaseClient) => {
        return supabase
          .from(this.tableName)
          .select('*', { count: 'exact' })
          .gte('birthdate', minBirthDate.toISOString().split('T')[0])
          .lte('birthdate', maxBirthDate.toISOString().split('T')[0])
          .order('birthdate');
      };

      return await this.executeQuery(queryBuilder, 'FIND_BY_AGE_RANGE');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findByAgeRange'),
      };
    }
  }

  /**
   * Get voter statistics
   */
  async getVoterStatistics(): Promise<RepositoryResult<{
    totalResidents: number;
    totalVoters: number;
    residentVoters: number;
    voterTurnoutRate: number;
  }>> {
    try {
      const queryBuilder = (supabase: SupabaseClient) => {
        return supabase
          .from(this.tableName)
          .select(`
            count(*) as totalResidents,
            is_voter,
            is_resident_voter
          `)
          .gte('birthdate', '1900-01-01'); // Basic filter to ensure valid data
      };

      const result = await this.executeQuery(queryBuilder, 'GET_VOTER_STATISTICS');
      
      if (!result.success || !result.data) {
        return result;
      }

      // Calculate statistics from the data
      const stats = {
        totalResidents: 0,
        totalVoters: 0,
        residentVoters: 0,
        voterTurnoutRate: 0,
      };

      // This would need to be adjusted based on actual Supabase aggregation results
      // For now, we'll return the structure
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'getVoterStatistics'),
      };
    }
  }

  /**
   * Check for duplicate residents (same name and birthdate)
   */
  async findPotentialDuplicates(
    first_name: string,
    last_name: string,
    birthdate: string
  ): Promise<RepositoryResult<ResidentData[]>> {
    try {
      const queryBuilder = (supabase: SupabaseClient) => {
        return supabase
          .from(this.tableName)
          .select('*')
          .eq('first_name', first_name)
          .eq('last_name', last_name)
          .eq('birthdate', birthdate);
      };

      return await this.executeQuery(queryBuilder, 'FIND_POTENTIAL_DUPLICATES');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findPotentialDuplicates'),
      };
    }
  }

  /**
   * Soft delete resident (mark as inactive)
   */
  async softDeleteResident(id: string): Promise<RepositoryResult<ResidentData>> {
    try {
      return await this.update(id, {
        is_active: false,
        updated_at: new Date().toISOString(),
      } as any);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'softDeleteResident'),
      };
    }
  }
}