/**
 * PSGC Route Handlers - Consolidated Philippine Standard Geographic Code API Utilities
 *
 * @fileoverview Production-ready utilities for handling PSGC address data queries.
 * Eliminates duplicate patterns across regions, provinces, cities, barangays, and streets API routes.
 * Integrates with existing authentication and response utilities.
 *
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

import { NextRequest } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/data/supabase';
import {
  createSuccessResponse,
  withNextRequestErrorHandling,
} from '@/utils/auth/apiResponseHandlers';
import { sanitizeSearchInput } from '@/utils/validation/validationUtils';

// =============================================================================
// TYPES
// =============================================================================

import type { PSGCQueryConfig, PSGCOption } from '@/types';

/**
 * Database entity interfaces
 */
type GeoSubdivision = {
  id: string;
  name: string;
  type: string;
  barangay_code: string;
  is_active: boolean;
};

type GeoStreet = {
  id: string;
  name: string;
  subdivision_id: string | null;
  barangay_code: string;
  is_active: boolean;
};


// =============================================================================
// CORE PSGC HANDLER
// =============================================================================

/**
 * Creates a standardized PSGC GET route handler
 * Eliminates duplicate patterns across all PSGC endpoints
 */
export function createPSGCHandler(config: PSGCQueryConfig) {
  return withNextRequestErrorHandling(async (request: NextRequest) => {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Build base query
    let query = supabase
      .from(config.table)
      .select(config.selectFields)
      .order(config.orderField || 'name');

    // Apply filter if configured
    if (config.filterField && config.filterParam) {
      const filterValue = searchParams.get(config.filterParam);
      if (filterValue) {
        query = query.eq(config.filterField, filterValue);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error(`${config.errorContext} query error:`, error);
      throw new Error(`Failed to fetch ${config.errorContext.toLowerCase()}`);
    }

    // Transform data to standard SelectField format
    const options: PSGCOption[] =
      data?.map((item: Record<string, unknown>) => {
        const option: PSGCOption = {
          value: String(item.code || ''),
          label: String(item.name || ''),
        };

        // Add additional fields dynamically (preserve all database fields)
        Object.keys(item).forEach(key => {
          if (!['code', 'name'].includes(key)) {
            const value = item[key];
            if (value !== undefined && value !== null) {
              option[key] = value as string | number | boolean;
            }
          }
        });

        return option;
      }) || [];

    const response = createSuccessResponse(
      options,
      `${config.errorContext} retrieved successfully`
    );

    // Add cache headers for static reference data
    if (['Regions', 'Provinces'].includes(config.errorContext)) {
      response.headers.set('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600'); // Cache for 24 hours
    }

    return response;
  });
}

// =============================================================================
// PRE-CONFIGURED PSGC HANDLERS
// =============================================================================

/**
 * Pre-configured PSGC route handlers for all address levels
 * These replace the duplicate implementations in individual route files
 */
export const PSGCHandlers = {
  /**
   * Regions handler - No filtering, returns all regions
   * Usage: export const GET = PSGCHandlers.regions;
   */
  regions: createPSGCHandler({
    table: 'psgc_regions',
    selectFields: 'code, name',
    errorContext: 'Regions',
  }),

  /**
   * Provinces handler - Optionally filter by region
   * Usage: export const GET = PSGCHandlers.provinces;
   * Query: ?region=REGION_CODE
   */
  provinces: createPSGCHandler({
    table: 'psgc_provinces',
    selectFields: 'code, name, region_code',
    filterField: 'region_code',
    filterParam: 'region',
    errorContext: 'Provinces',
  }),

  /**
   * Cities/Municipalities handler - Optionally filter by province
   * Usage: export const GET = PSGCHandlers.cities;
   * Query: ?province=PROVINCE_CODE
   */
  cities: createPSGCHandler({
    table: 'psgc_cities_municipalities',
    selectFields: 'code, name, type, province_code',
    filterField: 'province_code',
    filterParam: 'province',
    errorContext: 'Cities',
  }),

  /**
   * Barangays handler - Optionally filter by city
   * Usage: export const GET = PSGCHandlers.barangays;
   * Query: ?city=CITY_CODE
   */
  barangays: createPSGCHandler({
    table: 'psgc_barangays',
    selectFields: 'code, name, city_municipality_code',
    filterField: 'city_municipality_code',
    filterParam: 'city',
    errorContext: 'Barangays',
  }),

  /**
   * Subdivisions handler - Special geo_subdivisions table with search
   * Usage: export const GET = PSGCHandlers.subdivisions;
   * Query: ?barangay_code=BARANGAY_CODE&search=SEARCH_TERM
   */
  subdivisions: withNextRequestErrorHandling(async (request: NextRequest) => {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const barangayCode = searchParams.get('barangay_code');
    const search = searchParams.get('search');

    let query = supabase
      .from('geo_subdivisions')
      .select('id, name, type, barangay_code, is_active')
      .eq('is_active', true)
      .order('name');

    // Filter by barangay if provided
    if (barangayCode) {
      query = query.eq('barangay_code', barangayCode);
    }

    // Add search filter if provided (with sanitization)
    if (search && search.trim() !== '') {
      const sanitizedSearch = sanitizeSearchInput(search);
      if (sanitizedSearch) {
        query = query.ilike('name', `%${sanitizedSearch}%`);
      }
    }

    const { data: subdivisions, error } = await query.limit(100);

    if (error) {
      console.error('Subdivisions query error:', error);
      throw new Error('Failed to fetch subdivisions');
    }

    // Transform data to SelectField format
    const options: PSGCOption[] =
      subdivisions?.map((subdivision: GeoSubdivision) => ({
        value: subdivision.id,
        label: subdivision.name,
        barangay_code: subdivision.barangay_code,
        type: subdivision.type,
      })) || [];

    return createSuccessResponse(options, 'Subdivisions retrieved successfully');
  }),

  /**
   * Streets handler - Special geo_streets table with search and subdivision filtering
   * Usage: export const GET = PSGCHandlers.streets;
   * Query: ?barangay_code=BARANGAY_CODE&subdivision_id=SUBDIVISION_ID&search=SEARCH_TERM
   */
  streets: withNextRequestErrorHandling(async (request: NextRequest) => {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const barangayCode = searchParams.get('barangay_code');
    const subdivisionId = searchParams.get('subdivision_id');
    const search = searchParams.get('search');

    let query = supabase
      .from('geo_streets')
      .select('id, name, subdivision_id, barangay_code, is_active')
      .eq('is_active', true)
      .order('name');

    // Filter by barangay if provided
    if (barangayCode) {
      query = query.eq('barangay_code', barangayCode);
    }

    // Filter by subdivision if provided
    if (subdivisionId) {
      query = query.eq('subdivision_id', subdivisionId);
    }

    // Add search filter if provided (with sanitization)
    if (search && search.trim() !== '') {
      const sanitizedSearch = sanitizeSearchInput(search);
      if (sanitizedSearch) {
        query = query.ilike('name', `%${sanitizedSearch}%`);
      }
    }

    const { data: streets, error } = await query.limit(100);

    if (error) {
      console.error('Streets query error:', error);
      throw new Error('Failed to fetch streets');
    }

    // Transform data to SelectField format
    const options: PSGCOption[] =
      streets?.map((street: GeoStreet) => ({
        value: street.id,
        label: street.name,
        subdivision_id: street.subdivision_id,
        barangay_code: street.barangay_code,
      })) || [];

    return createSuccessResponse(options, 'Streets retrieved successfully');
  }),
} as const;

// =============================================================================
// RESPONSE FORMAT UTILITIES
// =============================================================================

/**
 * Legacy response format converter
 * Converts modern response format to legacy format for backward compatibility
 * @deprecated Use standard response format instead
 */
export function createLegacyPSGCResponse(options: PSGCOption[]) {
  return createSuccessResponse({
    success: true,
    data: options,
    count: options.length,
  });
}

/**
 * Creates a custom PSGC handler with additional processing
 * Use this when you need to modify the standard behavior
 */
export function createCustomPSGCHandler<T = PSGCOption>(
  config: PSGCQueryConfig,
  transformer?: (data: Record<string, unknown>[]) => T[]
) {
  return withNextRequestErrorHandling(async (request: NextRequest) => {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Build base query
    let query = supabase
      .from(config.table)
      .select(config.selectFields)
      .order(config.orderField || 'name');

    // Apply filter if configured
    if (config.filterField && config.filterParam) {
      const filterValue = searchParams.get(config.filterParam);
      if (filterValue) {
        query = query.eq(config.filterField, filterValue);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error(`${config.errorContext} query error:`, error);
      throw new Error(`Failed to fetch ${config.errorContext.toLowerCase()}`);
    }

    // Apply custom transformation or default transformation
    const processedData = transformer
      ? transformer(data || [])
      : data?.map((item: Record<string, unknown>) => {
          const option: PSGCOption = {
            value: String(item.code || ''),
            label: String(item.name || ''),
          };

          // Add additional fields
          Object.keys(item).forEach(key => {
            if (!['code', 'name'].includes(key)) {
              const value = item[key];
              if (value !== undefined && value !== null) {
                option[key] = value as string | number | boolean;
              }
            }
          });

          return option;
        }) || [];

    return createSuccessResponse(processedData, `${config.errorContext} retrieved successfully`);
  });
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// BEFORE (duplicate implementations):

// src/app/api/addresses/regions/route.ts
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient() as any;
    const { data: regions, error: regionsError } = await supabase
      .from('psgc_regions')
      .select('code, name')
      .order('name');
    // ... more duplicate error handling and response formatting
  } catch (error) {
    // ... duplicate error handling
  }
}

// AFTER (consolidated):

// src/app/api/addresses/regions/route.ts
export { PSGCHandlers.regions as GET };

// OR if you need the named export:
// export const GET = PSGCHandlers.regions;

// Custom usage example:
export const GET = createCustomPSGCHandler(
  {
    table: 'psgc_regions',
    selectFields: 'code, name, abbreviation',
    errorContext: 'Regions'
  },
  (data) => data.map(item => ({
    value: item.code,
    label: `${item.name} (${item.abbreviation})`,
    code: item.code,
    name: item.name,
    abbreviation: item.abbreviation
  }))
);
*/
