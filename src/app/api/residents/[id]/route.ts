/**
 * Individual Resident API Route
 * Clean architecture implementation using domain services
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAuthenticatedServerClient } from '@/lib/data/server-auth-client';
import { logger, logError } from '@/lib/logging/secure-logger';
import { withAuth, extractToken } from '@/lib/middleware/authMiddleware';
import { createRateLimitHandler } from '@/lib/security/rateLimit';
import { container } from '@/services/container';
import { securityAuditService } from '@/services/domain/auth/securityAuditService';
import { ResidentDomainService } from '@/services/domain/residents/residentDomainService';
import { SupabaseResidentRepository } from '@/services/infrastructure/repositories/SupabaseResidentRepository';
import type { RequestContext, AuthenticatedUser } from '@/types/app/auth/auth';
import type { ResidentFormData } from '@/types/domain/residents/forms';
import {
  createSuccessResponse,
  createValidationErrorResponse,
  withNextRequestErrorHandling,
  withSecurityHeaders,
} from '@/utils/auth/apiResponseHandlers';
import { createResidentSchema, updateResidentSchema } from '@/utils/shared/validationUtils';

/**
 * GET /api/residents/[id]
 * Get a specific resident by ID
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
        // Extract resident ID from URL
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const residentId = pathSegments[pathSegments.length - 1];

        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('SEARCH_RESIDENTS')(
          request,
          user.id
        );
        if (rateLimitResponse) return rateLimitResponse;

        // Create client with proper auth context using createClient with auth
        const token = extractToken(request);
        console.log('🔍 Debug - Token extracted:', !!token, 'User ID:', user.id);
        
        if (!token) {
          return NextResponse.json({ error: 'Missing authentication token' }, { status: 401 });
        }

        // Import createClient from Supabase directly
        const { createClient } = await import('@supabase/supabase-js');
        
        const authenticatedSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );
        
        console.log('🔍 Debug - Created authenticated client with token in headers');

        // Create repository with authenticated client
        const authenticatedRepository = new SupabaseResidentRepository(authenticatedSupabase);
        const residentService = new ResidentDomainService(
          authenticatedRepository,
          undefined, // use default household repository
          authenticatedSupabase // pass authenticated client for potential sectoral operations
        );
        const result = await residentService.getResidentById(residentId);

        if (!result.success) {
          const status = result.error === 'Resident not found' ? 404 : 400;
          logError(new Error('Resident not found'), `ID: ${residentId}`);
          return NextResponse.json({ error: result.error }, { status });
        }

        // Audit the data access
        await securityAuditService.auditDataAccess(
          'read',
          'resident',
          residentId,
          user.id,
          true,
          {
            fullName: `${result.data?.first_name || ''} ${result.data?.last_name || ''}`,
          }
        );

        return createSuccessResponse(
          {
            resident: result.data,
          },
          'Resident retrieved successfully',
          context
        );
      }
    )
  )
);

/**
 * PUT /api/residents/[id]
 * Update a specific resident
 */
export const PUT = withSecurityHeaders(
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
        // Extract resident ID from URL
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const residentId = pathSegments[pathSegments.length - 1];

        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
        if (rateLimitResponse) return rateLimitResponse;

        // Parse and validate request body
        const body = await request.json();
        const validationResult = updateResidentSchema.safeParse(body);

        if (!validationResult.success) {
          logger.error('Resident update validation failed', {
            issueCount: validationResult.error.issues.length,
            allIssues: validationResult.error.issues.map(i => ({
              path: i.path,
              message: i.message,
              code: (i as any).code,
            })),
          });
          return createValidationErrorResponse(
            validationResult.error.issues.map((err: z.ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
            context
          );
        }

        const updateData = validationResult.data as ResidentFormData;

        // Create authenticated client for RLS compliance
        const token = extractToken(request);
        if (!token) {
          return NextResponse.json({ error: 'Missing authentication token' }, { status: 401 });
        }

        const { client: authenticatedClient } = await createAuthenticatedServerClient(token);
        
        // Create service with authenticated repository and client for sectoral updates
        const authenticatedRepository = new SupabaseResidentRepository(authenticatedClient);
        const residentService = new ResidentDomainService(
          authenticatedRepository,
          undefined, // use default household repository
          authenticatedClient // pass authenticated client for sectoral info updates
        );
        const result = await residentService.updateResident(residentId, updateData);

        if (!result.success) {
          const status = result.error === 'Resident not found' ? 404 : 400;
          logError(new Error('Resident update failed'), result.error || 'Unknown error');
          return NextResponse.json({ error: result.error }, { status });
        }

        // Audit the update
        await securityAuditService.auditDataAccess(
          'update',
          'resident',
          residentId,
          user.id,
          true,
          {
            fullName: `${result.data?.first_name || ''} ${result.data?.last_name || ''}`,
          }
        );

        return createSuccessResponse(
          { resident: result.data },
          'Resident updated successfully',
          context
        );
      }
    )
  )
);

/**
 * DELETE /api/residents/[id]
 * Delete a specific resident
 */
export const DELETE = withSecurityHeaders(
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
        // Extract resident ID from URL
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const residentId = pathSegments[pathSegments.length - 1];

        // Apply rate limiting
        const rateLimitResponse = await createRateLimitHandler('RESIDENT_CREATE')(request, user.id);
        if (rateLimitResponse) return rateLimitResponse;

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
          authenticatedClient // pass authenticated client for potential operations
        );
        
        // First get the resident for audit purposes (including inactive ones)
        const getResult = await residentService.getResidentByIdIncludingInactive(residentId);
        if (!getResult.success) {
          const status = getResult.error === 'Resident not found' ? 404 : 400;
          logError(new Error('Resident not found for deletion'), `ID: ${residentId}`);
          return NextResponse.json({ error: getResult.error }, { status });
        }

        // Check if already deleted (is_active = false)
        if (getResult.data && getResult.data.is_active === false) {
          // Already deleted, return success
          console.log('🗑️ API: Resident already deleted, returning success');
          
          await securityAuditService.auditDataAccess(
            'delete',
            'resident',
            residentId,
            user.id,
            true,
            {
              fullName: `${getResult.data?.first_name} ${getResult.data?.last_name}`,
              note: 'Already deleted',
            }
          );

          return createSuccessResponse(
            {
              id: residentId,
              name: `${getResult.data?.first_name} ${getResult.data?.last_name}`,
              alreadyDeleted: true,
            },
            'Resident was already deleted',
            context
          );
        }

        // Audit the deletion before performing it
        await securityAuditService.auditDataAccess(
          'delete',
          'resident',
          residentId,
          user.id,
          true,
          {
            fullName: `${getResult.data?.first_name} ${getResult.data?.last_name}`,
          }
        );

        // Perform the deletion
        const deleteResult = await residentService.deleteResident(residentId);
        if (!deleteResult.success) {
          logError(new Error('Resident deletion failed'), deleteResult.error || 'Unknown error');
          return NextResponse.json({ error: deleteResult.error || 'Failed to delete resident' }, { status: 500 });
        }

        return createSuccessResponse(
          {
            id: residentId,
            name: `${getResult.data?.first_name} ${getResult.data?.last_name}`,
          },
          'Resident deleted successfully',
          context
        );
      }
    )
  )
);