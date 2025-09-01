/**
 * Resident Repository
 * Domain-specific repository for resident data operations
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { validateResidentData } from '../../infrastructure/validation/schemas';
import type {
  ValidationContext,
  ValidationError
} from '../../../types/shared/validation/validation';
import type { Resident } from '../../../types/domain/residents/core';
import type { ResidentSearchOptions } from '../../../types/infrastructure/services/repositories';
import type { RepositoryResult } from '../../../types/infrastructure/services/services';

import { BaseRepository } from '../../infrastructure/repositories/baseRepository';

// Export types for re-export in services/index.ts
export type { ResidentSearchOptions };

// Import types for address and PSOC fetching
import type { AddressInfo } from '../../../types/domain/addresses/addresses';
import type { PsocInfo } from '../../../types/infrastructure/services/services';

export class ResidentRepository extends BaseRepository<Resident> {
  // Cache for PSOC data
  private readonly psocCache = new Map<string, PsocInfo>();

  constructor(context?: ValidationContext) {
    super('residents', context);
  }

  /**
   * Create a new resident with validation
   */
  async createResident(
    data: Omit<Resident, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RepositoryResult<Resident>> {
    try {
      // Validate resident data before creation
      const validationResult = await validateResidentData(data as any, this.context);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Resident data validation failed',
            details: Array.isArray(validationResult.errors)
              ? validationResult.errors.reduce(
                  (acc: Record<string, string>, error: ValidationError, index: number) => ({
                    ...acc,
                    [`error_${index}`]: error.message,
                  }),
                  {} as Record<string, string>
                )
              : validationResult.errors,
          },
        };
      }

      return await this.create(data);
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
    data: Partial<Omit<Resident, 'id' | 'created_at'>>
  ): Promise<RepositoryResult<Resident>> {
    try {
      // Get existing resident for partial validation
      const existingResult = await this.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return existingResult;
      }

      // Merge with existing data for validation
      const mergedData = { ...existingResult.data, ...data };
      const validationResult = await validateResidentData(mergedData as any, this.context);

      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Resident data validation failed',
            details: Array.isArray(validationResult.errors)
              ? validationResult.errors.reduce(
                  (acc: Record<string, string>, error: ValidationError, index: number) => ({
                    ...acc,
                    [`error_${index}`]: error.message,
                  }),
                  {} as Record<string, string>
                )
              : validationResult.errors,
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
  async searchResidents(
    options: ResidentSearchOptions = {}
  ): Promise<RepositoryResult<Resident[]>> {
    try {
      const queryBuilder = (supabase: SupabaseClient) => {
        let query = supabase.from(this.tableName).select('*', { count: 'exact' });

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
          query = query
            .gte('birthdate', `${birthYear}-01-01`)
            .lt('birthdate', `${birthYear + 1}-01-01`);
        }

        // Direct field filters
        if (options.sex) query = query.eq('sex', options.sex);
        if (options.civil_status) query = query.eq('civil_status', options.civil_status);
        if (options.household_code) query = query.eq('household_code', options.household_code);
        if (options.is_voter !== undefined) query = query.eq('is_voter', options.is_voter);
        if (options.barangay_code) query = query.eq('barangay_code', options.barangay_code);

        // Apply ordering
        if (options.sort) {
          query = query.order(options.sort, {
            ascending: options.order !== 'desc',
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
  async findByHousehold(household_code: string): Promise<RepositoryResult<Resident[]>> {
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
  async findByAgeRange(minAge: number, maxAge: number): Promise<RepositoryResult<Resident[]>> {
    try {
      const currentDate = new Date();
      const maxBirthDate = new Date(
        currentDate.getFullYear() - minAge,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const minBirthDate = new Date(
        currentDate.getFullYear() - maxAge - 1,
        currentDate.getMonth(),
        currentDate.getDate()
      );

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
  async getVoterStatistics(): Promise<
    RepositoryResult<{
      totalResidents: number;
      totalVoters: number;
      residentVoters: number;
      voterTurnoutRate: number;
    }>
  > {
    try {
      const queryBuilder = (supabase: SupabaseClient) => {
        return supabase
          .from(this.tableName)
          .select(
            `
            count(*) as totalResidents,
            is_voter,
            is_resident_voter
          `
          )
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
  ): Promise<RepositoryResult<Resident[]>> {
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
  async softDeleteResident(id: string): Promise<RepositoryResult<Resident>> {
    try {
      return await this.update(id, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'softDeleteResident'),
      };
    }
  }

  /**
   * Fetch address information for a barangay
   * Optimized with view first, then fallback to joins
   */
  async fetchAddressInfo(barangayCode: string): Promise<RepositoryResult<AddressInfo>> {
    try {
      // Try address hierarchy view first (most efficient)
      const viewResult = await this.executeQuery(
        (supabase) =>
          supabase
            .from('psgc_address_hierarchy')
            .select('barangay_name, barangay_code, city_municipality_name, city_municipality_code, province_name, region_name, region_code, full_address')
            .eq('barangay_code', barangayCode)
            .single(),
        'FETCH_ADDRESS_VIEW'
      );

      if (viewResult.success && viewResult.data) {
        return {
          success: true,
          data: {
            barangay_name: viewResult.data.barangay_name,
            barangay_code: viewResult.data.barangay_code || barangayCode,
            city_municipality_name: viewResult.data.city_municipality_name,
            city_municipality_code: viewResult.data.city_municipality_code || '',
            province_name: viewResult.data.province_name,
            region_name: viewResult.data.region_name,
            region_code: viewResult.data.region_code || '',
            full_address: viewResult.data.full_address,
          },
        };
      }

      // Fallback to joined tables
      return await this.fetchAddressFromJoinedTables(barangayCode);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'fetchAddressInfo'),
      };
    }
  }

  /**
   * Fallback address fetch using joins
   */
  private async fetchAddressFromJoinedTables(
    barangayCode: string
  ): Promise<RepositoryResult<AddressInfo>> {
    try {
      const result = await this.executeQuery(
        (supabase) =>
          supabase
            .from('psgc_barangays')
            .select(`
              name,
              code,
              psgc_cities_municipalities(
                name,
                code,
                is_independent,
                psgc_provinces(
                  name,
                  code,
                  psgc_regions(
                    name,
                    code
                  )
                )
              )
            `)
            .eq('code', barangayCode)
            .single(),
        'FETCH_ADDRESS_JOINED'
      );

      if (!result.success || !result.data) {
        return result;
      }

      const data = result.data as any;
      const city = data.psgc_cities_municipalities;
      const province = city?.psgc_provinces;
      const region = province?.psgc_regions;

      const addressParts = [
        data.name,
        city?.name,
        !city?.is_independent ? province?.name : null,
        region?.name,
      ].filter(Boolean);

      return {
        success: true,
        data: {
          barangay_name: data.name,
          barangay_code: data.code,
          city_municipality_name: city?.name,
          city_municipality_code: city?.code || '',
          province_name: !city?.is_independent ? province?.name : undefined,
          region_name: region?.name,
          region_code: region?.code || '',
          full_address: addressParts.join(', '),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'fetchAddressFromJoinedTables'),
      };
    }
  }

  /**
   * Fetch PSOC occupation information with caching
   */
  async fetchPsocInfo(occupationCode: string): Promise<RepositoryResult<PsocInfo>> {
    try {
      // Check cache first
      if (this.psocCache.has(occupationCode)) {
        return {
          success: true,
          data: this.psocCache.get(occupationCode)!,
        };
      }

      const result = await this.executeQuery(
        (supabase) =>
          supabase
            .from('psoc_occupation_search')
            .select('occupation_code, occupation_title, full_hierarchy')
            .eq('occupation_code', occupationCode)
            .single(),
        'FETCH_PSOC_INFO'
      );

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || {
            code: 'NOT_FOUND',
            message: 'PSOC information not found',
          },
        };
      }

      const psocInfo: PsocInfo = {
        code: result.data.occupation_code,
        title: result.data.occupation_title,
        hierarchy: result.data.full_hierarchy || result.data.occupation_title,
        level: 'occupation',
      };

      // Cache the result
      this.psocCache.set(occupationCode, psocInfo);

      return {
        success: true,
        data: psocInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'fetchPsocInfo'),
      };
    }
  }

  /**
   * Clear PSOC cache
   */
  clearPsocCache(): void {
    this.psocCache.clear();
  }

  /**
   * Batch fetch resident details efficiently
   */
  async fetchResidentDetailsOptimized(
    barangayCode?: string,
    occupationCode?: string
  ): Promise<RepositoryResult<{
    addressInfo?: AddressInfo;
    psocInfo?: PsocInfo;
  }>> {
    try {
      const results = await Promise.allSettled([
        barangayCode ? this.fetchAddressInfo(barangayCode) : Promise.resolve({ success: true, data: undefined }),
        occupationCode ? this.fetchPsocInfo(occupationCode) : Promise.resolve({ success: true, data: undefined }),
      ]);

      const addressResult = results[0];
      const psocResult = results[1];

      return {
        success: true,
        data: {
          addressInfo: addressResult.status === 'fulfilled' && addressResult.value.success ? addressResult.value.data : undefined,
          psocInfo: psocResult.status === 'fulfilled' && psocResult.value.success ? psocResult.value.data : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'fetchResidentDetailsOptimized'),
      };
    }
  }
}
