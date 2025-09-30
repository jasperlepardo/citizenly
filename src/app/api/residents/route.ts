/**
 * Residents API Route
 * Updated to comply with API Design Standards
 */

import { NextRequest } from 'next/server';

import { createAuthenticatedServerClient } from '@/lib/data/server-auth-client';
import { logger, logError } from '@/lib/logging/secure-logger';
import { withAuth, extractToken } from '@/lib/middleware/authMiddleware';
import { createRateLimitHandler } from '@/lib/security/rateLimit';
import { securityAuditService } from '@/services/domain/auth/securityAuditService';
import { RequestContext } from '@/types/app/auth/auth';
import type { AuthenticatedUser } from '@/types/app/auth/auth';
import { ResidentFormData } from '@/types/domain/residents/forms';
import {
  createPaginatedResponse,
  createCreatedResponse,
  createValidationErrorResponse,
  processSearchParams,
  withNextRequestErrorHandling,
  withSecurityHeaders,
} from '@/utils/auth/apiResponseHandlers';
import { createResidentSchema } from '@/utils/shared/validationUtils';



// AuthenticatedUser type consolidated to src/types/auth.ts

// GET /api/residents - List residents with pagination and search
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

        // Process search parameters safely
        const { search, page, limit } = await processSearchParams(
          new URL(request.url).searchParams,
          context
        );

        // Create properly authenticated server client for RLS
        const token = extractToken(request);
        if (!token) {
          throw new Error('No auth token found');
        }
        
        const { client: authenticatedClient } = await createAuthenticatedServerClient(token);
        
        // Use authenticated client - RLS policies will enforce security
        const { SupabaseResidentRepository } = await import('@/services/infrastructure/repositories/SupabaseResidentRepository');
        const repository = new SupabaseResidentRepository(authenticatedClient);
        
        // Use clean architecture - security enforced by RLS + middleware
        const { ResidentDomainService } = await import('@/services/domain/residents/residentDomainService');
        const residentService = new ResidentDomainService(
          repository,
          undefined, // use default household repository
          authenticatedClient // pass authenticated client for potential sectoral operations
        );
        
        // Query parameters
        const queryParams = {
          search: search || undefined,
          page,
          limit,
          barangayCode: user.barangayCode || undefined,
          cityCode: user.cityMunicipalityCode || undefined,
          provinceCode: user.provinceCode || undefined,
          regionCode: user.regionCode || undefined
        };
        
        const result = await residentService.findResidents(queryParams);

        if (!result.success) {
          logError(new Error('Residents query error'), result.error || 'Unknown error');
          throw new Error(result.error || 'Failed to fetch residents');
        }

        const residents = result.data || [];
        const actualCount = result.total || residents.length;
        
        // Debug logging
        console.log('[DEBUG] Domain service result:', { 
          success: result.success, 
          dataLength: residents.length, 
          total: actualCount 
        });

        // Audit the data access
        await securityAuditService.auditDataAccess(
          'read',
          'resident',
          'list',
          user.id,
          true,
          {
            searchTerm: search || '',
            resultCount: residents.length,
          }
        );

        return createPaginatedResponse(
          residents,
          { page, limit, total: actualCount },
          'Residents retrieved successfully',
          context
        );
      }
    )
  )
);

// POST /api/residents - Create new resident
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
        const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
        if (rateLimitResponse) return rateLimitResponse;

        // Parse and validate request body
        const body = await request.json();
        logger.debug('POST /api/residents - Received CREATE request');
        logger.debug('Received create resident request', {
          hasBody: !!body,
          bodyKeys: Object.keys(body),
        });

        const validationResult = createResidentSchema.safeParse(body);

        if (!validationResult.success) {
          logger.error('Resident validation failed', {
            issueCount: validationResult.error.issues.length,
            hasIssues: !!validationResult.error.issues,
            employment_status_issues: validationResult.error.issues.filter((i: any) =>
              i.path.includes('employment_status')
            ),
            allIssues: validationResult.error.issues.map((i: any) => ({
              path: i.path,
              message: i.message,
              received: i.received,
              expected: i.expected,
              code: i.code,
            })),
            errorCount: validationResult.error.issues.length,
          });
          return createValidationErrorResponse(
            validationResult.error.issues.map((err: any) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
            context
          );
        }

        const residentData = validationResult.data as ResidentFormData;

        // Create properly authenticated server client for RLS
        const token = extractToken(request);
        if (!token) {
          throw new Error('No auth token found');
        }
        
        const { client: authenticatedClient } = await createAuthenticatedServerClient(token);
        
        // Use authenticated client - RLS policies will enforce security
        const { SupabaseResidentRepository } = await import('@/services/infrastructure/repositories/SupabaseResidentRepository');
        const repository = new SupabaseResidentRepository(authenticatedClient);

        // Use clean architecture - security enforced by RLS + middleware
        const { ResidentDomainService } = await import('@/services/domain/residents/residentDomainService');
        const residentService = new ResidentDomainService(repository, undefined, authenticatedClient);

        const result = await residentService.createResident(residentData);

        if (!result.success) {
          logError(new Error('Resident creation failed'), result.error || 'Unknown error');
          return createValidationErrorResponse(
            [{ field: 'general', message: result.error || 'Failed to create resident' }],
            context
          );
        }

        const newResident = result.data;

        // Audit the creation
        await securityAuditService.auditDataAccess(
          'create',
          'resident',
          newResident?.id || '',
          user.id,
          true,
          {
            fullName: `${newResident?.first_name} ${newResident?.last_name}`,
          }
        );

        return createCreatedResponse(
          {
            resident_id: newResident?.id,
            resident: newResident,
          },
          'Resident created successfully',
          context
        );
      }
    )
  )
);

// Export rate limiting rules for this endpoint
// export const rateLimitConfig = {
//   GET: RATE_LIMIT_RULES.SEARCH_RESIDENTS,
//   POST: RATE_LIMIT_RULES.RESIDENT_CREATE
// };
