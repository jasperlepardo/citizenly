/**
 * Database Query Builders - Consolidated Query Building Utilities
 *
 * @fileoverview Production-ready, reusable query building utilities that eliminate
 * duplicate query building patterns across repository services. Provides standardized
 * filtering, pagination, ordering, and search functionality for Supabase queries.
 *
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// QUERY BUILDER TYPES
// =============================================================================

import type { BaseSearchOptions, GeographicFilterOptions, NameSearchOptions, DateRangeOptions } from '@/types/infrastructure/services';

/**
 * Query builder function type
 */
export type QueryBuilderFn = (supabase: SupabaseClient) => any;

// =============================================================================
// CORE QUERY BUILDERS
// =============================================================================

/**
 * Creates a basic select query builder
 */
export function createSelectQueryBuilder(
  tableName: string,
  selectFields: string = '*',
  options: { count?: boolean } = {}
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    return supabase
      .from(tableName)
      .select(selectFields, { count: options.count ? 'exact' : undefined });
  };
}

/**
 * Creates a single record query builder with filtering
 */
export function createFindByFieldQueryBuilder(
  tableName: string,
  field: string,
  value: any,
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    return supabase.from(tableName).select(selectFields).eq(field, value).single();
  };
}

/**
 * Creates a query builder with standard filtering, ordering, and pagination
 */
export function createSearchQueryBuilder(
  tableName: string,
  options: BaseSearchOptions = {},
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

    // Apply filters
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
        ascending: options.orderDirection !== 'desc',
      });
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
}

// =============================================================================
// SPECIALIZED QUERY BUILDERS
// =============================================================================

/**
 * Creates a geographic area query builder
 */
export function createGeographicQueryBuilder(
  tableName: string,
  geoOptions: GeographicFilterOptions,
  baseOptions: BaseSearchOptions = {},
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

    // Geographic filters
    if (geoOptions.barangay_code) {
      query = query.eq('barangay_code', geoOptions.barangay_code);
    }
    if (geoOptions.city_municipality_code) {
      query = query.eq('city_municipality_code', geoOptions.city_municipality_code);
    }
    if (geoOptions.province_code) {
      query = query.eq('province_code', geoOptions.province_code);
    }
    if (geoOptions.region_code) {
      query = query.eq('region_code', geoOptions.region_code);
    }

    // Apply base filters
    if (baseOptions.filters) {
      for (const [key, value] of Object.entries(baseOptions.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (baseOptions.orderBy) {
      query = query.order(baseOptions.orderBy, {
        ascending: baseOptions.orderDirection !== 'desc',
      });
    }

    // Apply pagination
    if (baseOptions.limit) {
      query = query.limit(baseOptions.limit);
    }

    if (baseOptions.offset) {
      query = query.range(baseOptions.offset, baseOptions.offset + (baseOptions.limit || 10) - 1);
    }

    return query;
  };
}

/**
 * Creates a name search query builder for person entities
 */
export function createNameSearchQueryBuilder(
  tableName: string,
  nameOptions: NameSearchOptions,
  baseOptions: BaseSearchOptions = {},
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

    // Name search logic
    if (nameOptions.name) {
      // Full name search across all name fields
      const namePattern = `%${nameOptions.name}%`;
      query = query.or(
        `first_name.ilike.${namePattern},middle_name.ilike.${namePattern},last_name.ilike.${namePattern}`
      );
    } else {
      // Individual name field searches
      if (nameOptions.first_name) {
        query = query.ilike('first_name', `%${nameOptions.first_name}%`);
      }
      if (nameOptions.middle_name) {
        query = query.ilike('middle_name', `%${nameOptions.middle_name}%`);
      }
      if (nameOptions.last_name) {
        query = query.ilike('last_name', `%${nameOptions.last_name}%`);
      }
    }

    // Apply base filters
    if (baseOptions.filters) {
      for (const [key, value] of Object.entries(baseOptions.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (baseOptions.orderBy) {
      query = query.order(baseOptions.orderBy, {
        ascending: baseOptions.orderDirection !== 'desc',
      });
    } else {
      // Default ordering for name searches
      query = query.order('last_name').order('first_name');
    }

    // Apply pagination
    if (baseOptions.limit) {
      query = query.limit(baseOptions.limit);
    }

    if (baseOptions.offset) {
      query = query.range(baseOptions.offset, baseOptions.offset + (baseOptions.limit || 10) - 1);
    }

    return query;
  };
}

/**
 * Creates a date range query builder
 */
export function createDateRangeQueryBuilder(
  tableName: string,
  dateOptions: DateRangeOptions,
  baseOptions: BaseSearchOptions = {},
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

    const dateField = dateOptions.dateField || 'created_at';

    // Date range filters
    if (dateOptions.startDate) {
      query = query.gte(dateField, dateOptions.startDate);
    }
    if (dateOptions.endDate) {
      query = query.lte(dateField, dateOptions.endDate);
    }

    // Apply base filters
    if (baseOptions.filters) {
      for (const [key, value] of Object.entries(baseOptions.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (baseOptions.orderBy) {
      query = query.order(baseOptions.orderBy, {
        ascending: baseOptions.orderDirection !== 'desc',
      });
    } else {
      // Default ordering by date field
      query = query.order(dateField, { ascending: false });
    }

    // Apply pagination
    if (baseOptions.limit) {
      query = query.limit(baseOptions.limit);
    }

    if (baseOptions.offset) {
      query = query.range(baseOptions.offset, baseOptions.offset + (baseOptions.limit || 10) - 1);
    }

    return query;
  };
}

/**
 * Creates an age range query builder (for birthdate filtering)
 */
export function createAgeRangeQueryBuilder(
  tableName: string,
  minAge: number,
  maxAge: number,
  baseOptions: BaseSearchOptions = {},
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
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

    let query = supabase
      .from(tableName)
      .select(selectFields, { count: 'exact' })
      .gte('birthdate', minBirthDate.toISOString().split('T')[0])
      .lte('birthdate', maxBirthDate.toISOString().split('T')[0]);

    // Apply base filters
    if (baseOptions.filters) {
      for (const [key, value] of Object.entries(baseOptions.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (baseOptions.orderBy) {
      query = query.order(baseOptions.orderBy, {
        ascending: baseOptions.orderDirection !== 'desc',
      });
    } else {
      // Default ordering by birthdate
      query = query.order('birthdate');
    }

    // Apply pagination
    if (baseOptions.limit) {
      query = query.limit(baseOptions.limit);
    }

    if (baseOptions.offset) {
      query = query.range(baseOptions.offset, baseOptions.offset + (baseOptions.limit || 10) - 1);
    }

    return query;
  };
}

// =============================================================================
// UTILITY QUERY BUILDERS
// =============================================================================

/**
 * Creates a text search query builder with multiple field support
 */
export function createTextSearchQueryBuilder(
  tableName: string,
  searchTerm: string,
  searchFields: string[],
  baseOptions: BaseSearchOptions = {},
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

    if (searchTerm && searchFields.length > 0) {
      const searchPattern = `%${searchTerm}%`;
      const searchConditions = searchFields
        .map(field => `${field}.ilike.${searchPattern}`)
        .join(',');

      query = query.or(searchConditions);
    }

    // Apply base filters
    if (baseOptions.filters) {
      for (const [key, value] of Object.entries(baseOptions.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (baseOptions.orderBy) {
      query = query.order(baseOptions.orderBy, {
        ascending: baseOptions.orderDirection !== 'desc',
      });
    }

    // Apply pagination
    if (baseOptions.limit) {
      query = query.limit(baseOptions.limit);
    }

    if (baseOptions.offset) {
      query = query.range(baseOptions.offset, baseOptions.offset + (baseOptions.limit || 10) - 1);
    }

    return query;
  };
}

/**
 * Creates a boolean filter query builder
 */
export function createBooleanFilterQueryBuilder(
  tableName: string,
  booleanFilters: Record<string, boolean | null>,
  baseOptions: BaseSearchOptions = {},
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

    // Apply boolean filters
    for (const [field, value] of Object.entries(booleanFilters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(field, value);
      }
    }

    // Apply base filters
    if (baseOptions.filters) {
      for (const [key, value] of Object.entries(baseOptions.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (baseOptions.orderBy) {
      query = query.order(baseOptions.orderBy, {
        ascending: baseOptions.orderDirection !== 'desc',
      });
    }

    // Apply pagination
    if (baseOptions.limit) {
      query = query.limit(baseOptions.limit);
    }

    if (baseOptions.offset) {
      query = query.range(baseOptions.offset, baseOptions.offset + (baseOptions.limit || 10) - 1);
    }

    return query;
  };
}

// =============================================================================
// QUERY BUILDER COMBINATORS
// =============================================================================

/**
 * Combines multiple query builders into a single complex query
 */
export function combineQueryBuilders(
  tableName: string,
  builders: Array<(query: any) => any>,
  selectFields: string = '*'
): QueryBuilderFn {
  return (supabase: SupabaseClient) => {
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

    // Apply each builder function to the query
    for (const builder of builders) {
      query = builder(query);
    }

    return query;
  };
}

// =============================================================================
// REPOSITORY INTEGRATION HELPERS
// =============================================================================

/**
 * Pre-configured query builders for common repository patterns
 */
export const CommonQueryBuilders = {
  /**
   * Find by code pattern (common in household, resident repositories)
   */
  findByCode: (tableName: string, code: string) =>
    createFindByFieldQueryBuilder(tableName, 'code', code),

  /**
   * Find by ID pattern (universal)
   */
  findById: (tableName: string, id: string) => createFindByFieldQueryBuilder(tableName, 'id', id),

  /**
   * Find by user ID pattern (common in profile repositories)
   */
  findByUserId: (tableName: string, userId: string) =>
    createFindByFieldQueryBuilder(tableName, 'user_id', userId),

  /**
   * Find by household ID pattern
   */
  findByHouseholdId: (tableName: string, householdId: string) =>
    createFindByFieldQueryBuilder(tableName, 'household_id', householdId),

  /**
   * Basic search with standard options
   */
  search: (tableName: string, options: BaseSearchOptions = {}) =>
    createSearchQueryBuilder(tableName, options),

  /**
   * Geographic area search
   */
  searchGeographic: (
    tableName: string,
    geoOptions: GeographicFilterOptions,
    baseOptions: BaseSearchOptions = {}
  ) => createGeographicQueryBuilder(tableName, geoOptions, baseOptions),

  /**
   * Name-based search for people
   */
  searchByName: (
    tableName: string,
    nameOptions: NameSearchOptions,
    baseOptions: BaseSearchOptions = {}
  ) => createNameSearchQueryBuilder(tableName, nameOptions, baseOptions),
} as const;

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// BEFORE (duplicate queryBuilder implementations):

// In householdRepository.ts
const queryBuilder = (supabase: SupabaseClient) => {
  return supabase.from(this.tableName).select('*').eq('code', code).single();
};

// In residentRepository.ts  
const queryBuilder = (supabase: SupabaseClient) => {
  return supabase.from(this.tableName).select('*').eq('code', code).single();
};

// AFTER (consolidated):

// In both repositories
const queryBuilder = CommonQueryBuilders.findByCode(this.tableName, code);

// Custom search example:
const queryBuilder = createSearchQueryBuilder(this.tableName, {
  filters: { barangay_code: 'BR001' },
  orderBy: 'created_at',
  orderDirection: 'desc',
  limit: 20,
  offset: 0
});
*/
