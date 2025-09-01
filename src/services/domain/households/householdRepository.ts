/**
 * Household Repository
 * Domain-specific repository for household data operations
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { CommonQueryBuilders } from '../../../lib/database/query-builders';
import type { HouseholdHead, HouseholdOption } from '../../../types/domain/households/households';
import type { CacheEntry } from '../../../types/infrastructure/cache/cache';
import type {
  HouseholdData,
  HouseholdSearchOptions,
} from '../../../types/infrastructure/services/repositories';
import type { RepositoryResult } from '../../../types/infrastructure/services/services';
import type { ValidationContext, ValidationError } from '../../../types/shared/validation/validation';
import { BaseRepository } from '../../infrastructure/repositories/baseRepository';
import { validateHouseholdData } from '../../infrastructure/validation/schemas';

// Export types for re-export in services/index.ts
export type { HouseholdData, HouseholdSearchOptions };

export class HouseholdRepository extends BaseRepository<HouseholdData> {
  // Cache for frequently accessed household data
  private readonly householdCache = new Map<string, CacheEntry<HouseholdOption[]>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
            details: Array.isArray(validationResult.errors)
              ? validationResult.errors.reduce((acc: Record<string, string>, err: ValidationError) => {
                  acc[err.field || 'general'] = err.message || 'Validation error';
                  return acc;
                }, {})
              : validationResult.errors,
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

      return await this.create(data);
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
            details: Array.isArray(validationResult.errors)
              ? validationResult.errors.reduce((acc: Record<string, string>, err: ValidationError) => {
                  acc[err.field || 'general'] = err.message || 'Validation error';
                  return acc;
                }, {})
              : validationResult.errors,
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
      // Use consolidated query builder - eliminates 3 lines of duplicate code
      const queryBuilder = CommonQueryBuilders.findByCode(this.tableName, code);

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
  /**
   * Build search query with all filters
   */
  private buildSearchQuery(supabase: SupabaseClient, options: HouseholdSearchOptions) {
    let query = supabase.from(this.tableName).select('*', { count: 'exact' });
    
    // Apply text search filters
    if (options.code) {
      query = query.ilike('code', `%${options.code}%`);
    }
    
    // Apply geographic filters using a data-driven approach
    const geoFilters: Array<{ field: string; value: string | undefined }> = [
      { field: 'barangay_code', value: options.barangay_code },
      { field: 'city_municipality_code', value: options.city_municipality_code },
      { field: 'province_code', value: options.province_code },
      { field: 'region_code', value: options.region_code },
      { field: 'street_id', value: options.street_id },
    ];

    for (const filter of geoFilters) {
      if (filter.value) {
        query = query.eq(filter.field, filter.value);
      }
    }
    
    // Apply relationship filters
    if (options.household_head_id) {
      query = query.eq('household_head_id', options.household_head_id);
    }
    
    // Apply sorting
    const sortField = options.sort || 'code';
    const ascending = options.order !== 'desc';
    query = query.order(sortField, { ascending });
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      const limit = options.limit || 10;
      query = query.range(options.offset, options.offset + limit - 1);
    }
    
    return query;
  }

  async searchHouseholds(
    options: HouseholdSearchOptions = {}
  ): Promise<RepositoryResult<HouseholdData[]>> {
    try {
      const queryBuilder = (supabase: SupabaseClient) => 
        this.buildSearchQuery(supabase, options);

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
      // Use consolidated geographic query builder - eliminates 8 lines of filter building
      const queryBuilder = CommonQueryBuilders.searchGeographic(
        this.tableName,
        {
          barangay_code: barangayCode,
          city_municipality_code: cityCode,
          province_code: provinceCode,
          region_code: regionCode,
        },
        { orderBy: 'code' }
      );

      return await this.executeQuery(queryBuilder, 'FIND_BY_GEOGRAPHIC_AREA');
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
  async getHouseholdStatistics(barangayCode?: string): Promise<
    RepositoryResult<{
      totalHouseholds: number;
      averageHouseholdSize: number;
      householdsWithCoordinates: number;
      coordinateCoverage: number;
    }>
  > {
    try {
      const filters: Record<string, string> = {};
      if (barangayCode) {
        filters.barangay_code = barangayCode;
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

      const totalSize = households.reduce((sum, h) => sum + (h.no_of_household_members || 0), 0);
      const averageHouseholdSize = totalHouseholds > 0 ? totalSize / totalHouseholds : 0;

      // Note: HouseholdRecord doesn't include latitude/longitude fields
      // This would require a separate location/coordinates table
      const householdsWithCoordinates = 0;

      const coordinateCoverage =
        totalHouseholds > 0 ? (householdsWithCoordinates / totalHouseholds) * 100 : 0;

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
      const queryBuilder = (supabase: SupabaseClient) => {
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
      const queryBuilder = (supabase: SupabaseClient) => {
        // This is a complex query that would need to be implemented
        // based on the actual database schema and relationships
        return supabase.rpc('update_household_size', { household_code: householdCode });
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
      const queryBuilder = (supabase: SupabaseClient) => {
        return supabase
          .from(this.tableName)
          .select('code')
          .eq('barangay_code', barangayCode)
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

  /**
   * Cache helper methods
   */
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_TTL;
  }

  private getCached(key: string): HouseholdOption[] | null {
    const cached = this.householdCache.get(key);
    if (!cached || this.isExpired(cached.timestamp)) {
      this.householdCache.delete(key);
      return null;
    }
    return cached.data;
  }

  private setCached(key: string, data: HouseholdOption[]): void {
    this.householdCache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL,
      tags: ['households'],
    });
  }

  /**
   * Batch fetch household heads to eliminate N+1 queries
   */
  async batchFetchHouseholdHeads(householdHeadIds: string[]): Promise<RepositoryResult<Map<string, HouseholdHead>>> {
    if (householdHeadIds.length === 0) {
      return { success: true, data: new Map() };
    }

    try {
      const result = await this.executeQuery(
        (supabase) =>
          supabase
            .from('residents')
            .select('id, first_name, middle_name, last_name')
            .in('id', householdHeadIds),
        'BATCH_FETCH_HEADS'
      );

      if (!result.success || !result.data) {
        return { success: true, data: new Map() };
      }

      // Create a map for O(1) lookup
      const headsMap = new Map<string, HouseholdHead>();
      (result.data as HouseholdHead[]).forEach(head => {
        headsMap.set(head.id, head);
      });

      return { success: true, data: headsMap };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'batchFetchHouseholdHeads'),
      };
    }
  }

  /**
   * Build query for household search
   */
  private buildHouseholdSearchQuery(
    supabase: SupabaseClient,
    barangayCode: string,
    query?: string,
    limit: number = 20
  ) {
    let householdQuery = supabase
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
      .eq('barangay_code', barangayCode)
      .order('code', { ascending: true })
      .limit(limit);

    // Add search filtering if query provided
    if (query?.trim()) {
      householdQuery = householdQuery.or(`code.ilike.%${query}%,house_number.ilike.%${query}%`);
    }

    return householdQuery;
  }

  /**
   * Format resident name from head data
   */
  private formatResidentName(headResident?: HouseholdHead): string {
    if (!headResident) return '';
    
    return [headResident.first_name, headResident.middle_name, headResident.last_name]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Format household address from components
   */
  private formatHouseholdAddress(household: {
    house_number?: string;
    geo_streets?: { name: string };
    geo_subdivisions?: { name: string };
  }): string {
    return [
      household.house_number,
      household.geo_streets?.name,
      household.geo_subdivisions?.name
    ]
      .filter(Boolean)
      .join(', ') || 'No address';
  }

  /**
   * Transform household data to option format
   */
  private transformToHouseholdOption(
    household: {
      code: string;
      name?: string;
      house_number?: string;
      household_head_id?: string;
      geo_streets?: { name: string };
      geo_subdivisions?: { name: string };
    },
    headResident?: HouseholdHead
  ): HouseholdOption {
    const headName = this.formatResidentName(headResident);
    
    return {
      value: household.code,
      label: `${household.code} - ${household.house_number || 'No House #'}`,
      description: `${household.name || 'Unnamed'} - Head: ${headName || 'Unknown'}`,
      code: household.code,
      head_name: headName,
      address: this.formatHouseholdAddress(household),
    };
  }

  /**
   * Search households with optimized head fetching and caching
   */
  async searchHouseholdsOptimized(
    barangayCode: string,
    query?: string,
    limit: number = 20
  ): Promise<RepositoryResult<HouseholdOption[]>> {
    try {
      const cacheKey = `${barangayCode}-${query || 'all'}-${limit}`;
      
      // Check cache first
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      // Build and execute query
      const queryBuilder = (supabase: SupabaseClient) => 
        this.buildHouseholdSearchQuery(supabase, barangayCode, query, limit);

      const householdsResult = await this.executeQuery(queryBuilder, 'SEARCH_HOUSEHOLDS');

      if (!householdsResult.success || !householdsResult.data) {
        return householdsResult;
      }

      const householdsData = householdsResult.data as Array<{
        code: string;
        name?: string;
        house_number?: string;
        household_head_id?: string;
        geo_streets?: { name: string };
        geo_subdivisions?: { name: string };
      }>;

      // Extract all household head IDs that exist
      const householdHeadIds = householdsData
        .map(household => household.household_head_id)
        .filter(Boolean) as string[];

      // Batch fetch all household heads in one query
      const headsResult = await this.batchFetchHouseholdHeads(householdHeadIds);
      const headsMap = headsResult.success && headsResult.data 
        ? headsResult.data 
        : new Map<string, HouseholdHead>();

      // Process households with their heads (now O(1) lookup)
      const processedHouseholds = householdsData.map(household => {
        const headResident = household.household_head_id
          ? headsMap.get(household.household_head_id)
          : undefined;

        return this.transformToHouseholdOption(household, headResident);
      });

      // Cache the results
      this.setCached(cacheKey, processedHouseholds);

      return { success: true, data: processedHouseholds };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'searchHouseholdsOptimized'),
      };
    }
  }

  /**
   * Clear household cache
   */
  clearCache(): void {
    this.householdCache.clear();
  }
}
