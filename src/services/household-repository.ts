/**
 * Household Repository
 * Domain-specific repository for household data operations
 */

import { BaseRepository, type QueryOptions, type RepositoryResult } from './base-repository';
import { validateHouseholdData } from '@/lib/validation/schemas';
import type { ValidationContext } from '@/lib/validation/types';

export interface HouseholdData {
  id?: string;
  code: string;
  houseNumber?: string;
  streetName?: string;
  subdivisionName?: string;
  barangayCode: string;
  cityCode: string;
  provinceCode: string;
  regionCode: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  householdSize?: number;
  headOfHousehold?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HouseholdSearchOptions extends QueryOptions {
  code?: string;
  barangayCode?: string;
  cityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  streetName?: string;
  headOfHousehold?: string;
}

export class HouseholdRepository extends BaseRepository<HouseholdData> {
  constructor(context?: ValidationContext) {
    super('households', context);
  }

  /**
   * Create a new household with validation
   */
  async createHousehold(
    data: Omit<HouseholdData, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RepositoryResult<HouseholdData>> {
    try {
      // Validate household data before creation
      const validationResult = await validateHouseholdData(data, this.context);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Household data validation failed',
            details: validationResult.errors,
          },
        };
      }

      // Check for duplicate household code
      const duplicateCheck = await this.findByCode(data.code);
      if (duplicateCheck.success && duplicateCheck.data) {
        return {
          success: false,
          error: {
            code: 'DUPLICATE_HOUSEHOLD_CODE',
            message: 'A household with this code already exists',
            field: 'code',
          },
        };
      }

      return await this.create(validationResult.data || data);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'createHousehold'),
      };
    }
  }

  /**
   * Update household with validation
   */
  async updateHousehold(
    id: string,
    data: Partial<Omit<HouseholdData, 'id' | 'created_at'>>
  ): Promise<RepositoryResult<HouseholdData>> {
    try {
      // Get existing household for partial validation
      const existingResult = await this.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return existingResult;
      }

      // If updating code, check for duplicates
      if (data.code && data.code !== existingResult.data.code) {
        const duplicateCheck = await this.findByCode(data.code);
        if (duplicateCheck.success && duplicateCheck.data) {
          return {
            success: false,
            error: {
              code: 'DUPLICATE_HOUSEHOLD_CODE',
              message: 'A household with this code already exists',
              field: 'code',
            },
          };
        }
      }

      // Merge with existing data for validation
      const mergedData = { ...existingResult.data, ...data };
      const validationResult = await validateHouseholdData(mergedData, this.context);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Household data validation failed',
            details: validationResult.errors,
          },
        };
      }

      return await this.update(id, data);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'updateHousehold'),
      };
    }
  }

  /**
   * Find household by code
   */
  async findByCode(code: string): Promise<RepositoryResult<HouseholdData>> {
    try {
      const queryBuilder = (supabase: any) => {
        return supabase
          .from(this.tableName)
          .select('*')
          .eq('code', code)
          .single();
      };

      return await this.executeQuery(queryBuilder, 'FIND_BY_CODE');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findByCode'),
      };
    }
  }

  /**
   * Search households with advanced filtering
   */
  async searchHouseholds(options: HouseholdSearchOptions = {}): Promise<RepositoryResult<HouseholdData[]>> {
    try {
      const queryBuilder = (supabase: any) => {
        let query = supabase
          .from(this.tableName)
          .select('*', { count: 'exact' });

        // Code search (partial match)
        if (options.code) {
          query = query.ilike('code', `%${options.code}%`);
        }

        // Geographic filters
        if (options.barangayCode) query = query.eq('barangayCode', options.barangayCode);
        if (options.cityCode) query = query.eq('cityCode', options.cityCode);
        if (options.provinceCode) query = query.eq('provinceCode', options.provinceCode);
        if (options.regionCode) query = query.eq('regionCode', options.regionCode);

        // Street name search
        if (options.streetName) {
          query = query.ilike('streetName', `%${options.streetName}%`);
        }

        // Head of household search
        if (options.headOfHousehold) {
          query = query.ilike('headOfHousehold', `%${options.headOfHousehold}%`);
        }

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
          // Default order by code
          query = query.order('code');
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

      return await this.executeQuery(queryBuilder, 'SEARCH_HOUSEHOLDS');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'searchHouseholds'),
      };
    }
  }

  /**
   * Find households by geographic area
   */
  async findByGeographicArea(
    barangayCode?: string,
    cityCode?: string,
    provinceCode?: string,
    regionCode?: string
  ): Promise<RepositoryResult<HouseholdData[]>> {
    try {
      const filters: Record<string, string> = {};
      
      if (regionCode) filters.regionCode = regionCode;
      if (provinceCode) filters.provinceCode = provinceCode;
      if (cityCode) filters.cityCode = cityCode;
      if (barangayCode) filters.barangayCode = barangayCode;

      return await this.findAll({
        filters,
        orderBy: 'code',
      });
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findByGeographicArea'),
      };
    }
  }

  /**
   * Get household statistics by area
   */
  async getHouseholdStatistics(
    barangayCode?: string
  ): Promise<RepositoryResult<{
    totalHouseholds: number;
    averageHouseholdSize: number;
    householdsWithCoordinates: number;
    coordinateCoverage: number;
  }>> {
    try {
      const filters: Record<string, any> = {};
      if (barangayCode) {
        filters.barangayCode = barangayCode;
      }

      const householdsResult = await this.findAll({ filters });
      
      if (!householdsResult.success || !householdsResult.data) {
        return {
          success: false,
          error: householdsResult.error || {
            code: 'DATA_ERROR',
            message: 'Failed to retrieve household data',
          },
        };
      }

      const households = householdsResult.data;
      const totalHouseholds = households.length;
      
      const totalSize = households.reduce((sum, h) => sum + (h.householdSize || 0), 0);
      const averageHouseholdSize = totalHouseholds > 0 ? totalSize / totalHouseholds : 0;
      
      const householdsWithCoordinates = households.filter(
        h => h.latitude && h.longitude
      ).length;
      
      const coordinateCoverage = totalHouseholds > 0 
        ? (householdsWithCoordinates / totalHouseholds) * 100 
        : 0;

      return {
        success: true,
        data: {
          totalHouseholds,
          averageHouseholdSize,
          householdsWithCoordinates,
          coordinateCoverage,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'getHouseholdStatistics'),
      };
    }
  }

  /**
   * Find households within geographic bounds
   */
  async findWithinBounds(
    northEast: { lat: number; lng: number },
    southWest: { lat: number; lng: number }
  ): Promise<RepositoryResult<HouseholdData[]>> {
    try {
      const queryBuilder = (supabase: any) => {
        return supabase
          .from(this.tableName)
          .select('*')
          .gte('latitude', southWest.lat)
          .lte('latitude', northEast.lat)
          .gte('longitude', southWest.lng)
          .lte('longitude', northEast.lng)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);
      };

      return await this.executeQuery(queryBuilder, 'FIND_WITHIN_BOUNDS');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findWithinBounds'),
      };
    }
  }

  /**
   * Update household size based on resident count
   */
  async updateHouseholdSize(householdCode: string): Promise<RepositoryResult<HouseholdData>> {
    try {
      // This would typically involve a join with residents table
      // For now, we'll provide the structure
      const queryBuilder = (supabase: any) => {
        // This is a complex query that would need to be implemented
        // based on the actual database schema and relationships
        return supabase
          .rpc('update_household_size', { household_code: householdCode });
      };

      return await this.executeQuery(queryBuilder, 'UPDATE_HOUSEHOLD_SIZE');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'updateHouseholdSize'),
      };
    }
  }

  /**
   * Generate next household code for a barangay
   */
  async generateNextCode(barangayCode: string): Promise<RepositoryResult<string>> {
    try {
      const queryBuilder = (supabase: any) => {
        return supabase
          .from(this.tableName)
          .select('code')
          .eq('barangayCode', barangayCode)
          .order('code', { ascending: false })
          .limit(1);
      };

      const result = await this.executeQuery(queryBuilder, 'GET_LATEST_CODE');
      
      if (!result.success) {
        return result;
      }

      // Generate next code based on existing pattern
      let nextCode = `${barangayCode}-001`;
      
      if (result.data && result.data.length > 0) {
        const latestCode = result.data[0].code;
        const match = latestCode.match(/-(\d+)$/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          nextCode = `${barangayCode}-${nextNumber.toString().padStart(3, '0')}`;
        }
      }

      return {
        success: true,
        data: nextCode,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'generateNextCode'),
      };
    }
  }
}