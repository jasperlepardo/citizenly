/**
 * Geography API Route
 * Clean architecture implementation for Philippine geographic data (PSGC)
 * Consolidates PSGC lookup and search functionality
 */

import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from '@/lib/middleware/authMiddleware';
import { createRateLimitHandler } from '@/lib/security/rateLimit';
import { container } from '@/services/container';
import type { RequestContext, AuthenticatedUser } from '@/types/app/auth/auth';
import {
  createSuccessResponse,
  withNextRequestErrorHandling,
  withSecurityHeaders,
} from '@/utils/auth/apiResponseHandlers';

type GeographicLevel = 'region' | 'province' | 'city' | 'barangay';

/**
 * GET /api/geography
 * Get hierarchical Philippine geographic data (PSGC)
 * Supports both hierarchical requests and search functionality
 */
export const GET = withSecurityHeaders(
  withAuth(
    {
      requiredPermissions: [
        'residents.manage.barangay',
        'residents.manage.city',
        'residents.manage.province',
        'residents.manage.region',
        'residents.manage.all',
      ],
    },
    withNextRequestErrorHandling(
      async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('SEARCH_RESIDENTS')(
          request,
          user.id
        );
        if (rateLimitResponse) return rateLimitResponse;

        const { searchParams } = new URL(request.url);
        const level = searchParams.get('level') as GeographicLevel | null;
        const regionCode = searchParams.get('regionCode');
        const provinceCode = searchParams.get('provinceCode');
        const cityCode = searchParams.get('cityCode');
        const searchQuery = searchParams.get('search');

        const geographicService = container.getGeographicService();

        // Handle search requests
        if (searchQuery) {
          return handleSearchRequest(geographicService, searchQuery, level, context);
        }

        // Handle hierarchical requests
        return handleHierarchicalRequest(
          geographicService,
          level,
          regionCode,
          provinceCode,
          cityCode,
          context
        );
      }
    )
  )
);

/**
 * POST /api/geography
 * Build complete address from geographic codes
 */
export const POST = withSecurityHeaders(
  withAuth(
    {
      requiredPermissions: [
        'residents.manage.barangay',
        'residents.manage.city',
        'residents.manage.province',
        'residents.manage.region',
        'residents.manage.all',
      ],
    },
    withNextRequestErrorHandling(
      async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('SEARCH_RESIDENTS')(
          request,
          user.id
        );
        if (rateLimitResponse) return rateLimitResponse;

        const codes = await request.json();
        const geographicService = container.getGeographicService();

        // Validate address hierarchy first
        const validation = await geographicService.validateAddressHierarchy(codes);

        if (!validation.isValid) {
          return NextResponse.json(
            { error: 'Invalid address hierarchy', details: validation.errors },
            { status: 400 }
          );
        }

        // Build complete address
        const result = await geographicService.buildCompleteAddress(codes);

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return createSuccessResponse(
          { address: result.data },
          'Address built successfully',
          context
        );
      }
    )
  )
);

// Helper functions
async function handleSearchRequest(
  geographicService: any,
  searchQuery: string,
  level: GeographicLevel | null,
  context: RequestContext
) {
  const result = await geographicService.searchLocations(searchQuery, level || undefined);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return createSuccessResponse(
    { locations: result.data },
    'Search completed successfully',
    context
  );
}

async function handleHierarchicalRequest(
  geographicService: any,
  level: GeographicLevel | null,
  regionCode: string | null,
  provinceCode: string | null,
  cityCode: string | null,
  context: RequestContext
) {
  if (level === 'region' || (!level && !regionCode)) {
    return handleRegionsRequest(geographicService, context);
  }

  if (level === 'province' && regionCode) {
    return handleProvincesRequest(geographicService, regionCode, context);
  }

  if (level === 'city' && provinceCode) {
    return handleCitiesRequest(geographicService, provinceCode, context);
  }

  if (level === 'barangay' && cityCode) {
    return handleBarangaysRequest(geographicService, cityCode, context);
  }

  return NextResponse.json(
    { error: 'Invalid parameters. Provide level and appropriate parent codes.' },
    { status: 400 }
  );
}

async function handleRegionsRequest(geographicService: any, context: RequestContext) {
  const result = await geographicService.getRegions();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return createSuccessResponse(
    { regions: result.data },
    'Regions retrieved successfully',
    context
  );
}

async function handleProvincesRequest(
  geographicService: any,
  regionCode: string,
  context: RequestContext
) {
  const result = await geographicService.getProvinces(regionCode);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return createSuccessResponse(
    { provinces: result.data },
    'Provinces retrieved successfully',
    context
  );
}

async function handleCitiesRequest(
  geographicService: any,
  provinceCode: string,
  context: RequestContext
) {
  const result = await geographicService.getCities(provinceCode);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return createSuccessResponse(
    { cities: result.data },
    'Cities retrieved successfully',
    context
  );
}

async function handleBarangaysRequest(
  geographicService: any,
  cityCode: string,
  context: RequestContext
) {
  const result = await geographicService.getBarangays(cityCode);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return createSuccessResponse(
    { barangays: result.data },
    'Barangays retrieved successfully',
    context
  );
}