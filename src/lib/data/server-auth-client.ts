/**
 * Server-side Authenticated Supabase Client
 * Proper implementation for RLS with user context on server
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

import { Database } from './supabase';

/**
 * Create server-side Supabase client with user authentication for RLS
 * This properly sets the user context for database RLS policies
 */
export function createServerSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        // Server-side cookies are read-only in this context
      },
      remove(name: string, options: any) {
        // Server-side cookies are read-only in this context
      },
    },
  });
}

/**
 * Create authenticated server client from Authorization header
 * This creates a client with user context for RLS queries
 */
export async function createAuthenticatedServerClient(authToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // First, validate the token
  const validateClient = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  });

  const { data: { user }, error } = await validateClient.auth.getUser(authToken);
  
  if (error || !user) {
    throw new Error(`Authentication failed: ${error?.message || 'Invalid token'}`);
  }

  // Create client with the user's session for RLS
  // This uses a different pattern - setting the Authorization header globally
  const authenticatedClient = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  });

  return { client: authenticatedClient, user };
}

// Force rebuild