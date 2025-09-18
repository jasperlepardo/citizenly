/**
 * Debug RLS Functions
 * Test endpoint to check what RLS functions return with server-side auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, extractToken } from '@/lib/middleware/authMiddleware';
import { createAuthenticatedServerClient } from '@/lib/data/server-auth-client';
import { createAdminSupabaseClient } from '@/lib/data/client-factory';
import type { RequestContext, AuthenticatedUser } from '@/types/app/auth/auth';
import { withNextRequestErrorHandling } from '@/utils/auth/apiResponseHandlers';

export const GET = withAuth(
  {
    requiredPermissions: ['residents.manage.barangay', 'residents.manage.city', 'residents.manage.province', 'residents.manage.region', 'residents.manage.all'],
  },
  withNextRequestErrorHandling(
    async (request: NextRequest, context: RequestContext, user: AuthenticatedUser) => {
      const token = extractToken(request);
      if (!token) {
        return NextResponse.json({ error: 'No auth token found' }, { status: 401 });
      }

      try {
        // Test with authenticated client
        const { client: authClient } = await createAuthenticatedServerClient(token);
        
        // Test RLS functions with authenticated client
        const rlsTests = await Promise.allSettled([
          authClient.rpc('user_barangay_code'),
          authClient.rpc('user_city_code'),
          authClient.rpc('user_province_code'),
          authClient.rpc('user_region_code'),
          authClient.rpc('user_role'),
          authClient.rpc('is_super_admin'),
          authClient.rpc('user_access_level'),
        ]);

        // Test with admin client for comparison
        const adminClient = createAdminSupabaseClient();
        const adminTests = await Promise.allSettled([
          adminClient.rpc('user_barangay_code'),
          adminClient.rpc('user_city_code'),
          adminClient.rpc('user_province_code'),
          adminClient.rpc('user_region_code'),
          adminClient.rpc('user_role'),
          adminClient.rpc('is_super_admin'),
          adminClient.rpc('user_access_level'),
        ]);

        // Test actual residents query
        const { data: authResidents, error: authError } = await authClient
          .from('residents')
          .select('id, first_name, last_name, households!inner(barangay_code)')
          .limit(3);

        const { data: adminResidents, error: adminError } = await adminClient
          .from('residents')
          .select('id, first_name, last_name, households!inner(barangay_code)')
          .limit(3);

        return NextResponse.json({
          success: true,
          debug: {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              barangayCode: user.barangayCode,
            },
            rls_functions: {
              authenticated_client: {
                user_barangay_code: rlsTests[0],
                user_city_code: rlsTests[1],
                user_province_code: rlsTests[2],
                user_region_code: rlsTests[3],
                user_role: rlsTests[4],
                is_super_admin: rlsTests[5],
                user_access_level: rlsTests[6],
              },
              admin_client: {
                user_barangay_code: adminTests[0],
                user_city_code: adminTests[1],
                user_province_code: adminTests[2],
                user_region_code: adminTests[3],
                user_role: adminTests[4],
                is_super_admin: adminTests[5],
                user_access_level: adminTests[6],
              }
            },
            residents_query: {
              authenticated_client: {
                count: authResidents?.length || 0,
                error: authError?.message,
                sample: authResidents?.[0]
              },
              admin_client: {
                count: adminResidents?.length || 0,
                error: adminError?.message,
                sample: adminResidents?.[0]
              }
            }
          }
        });

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
      }
    }
  )
);