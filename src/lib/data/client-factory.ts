/**
 * Supabase Client Factory
 * Centralized client creation with proper error handling and type safety
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from './supabase';

/**
 * Create a Supabase client with proper environment validation
 * @param useServiceRole - Whether to use service role key (admin operations)
 * @returns Configured Supabase client
 */
export function createSupabaseClient(useServiceRole = false): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (useServiceRole) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
    return createClient<Database>(supabaseUrl, serviceRoleKey);
  } else {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    }
    return createClient<Database>(supabaseUrl, anonKey);
  }
}

/**
 * Create admin Supabase client (service role)
 * @returns Admin Supabase client
 */
export function createAdminSupabaseClient(): SupabaseClient<Database> {
  return createSupabaseClient(true);
}

/**
 * Create public Supabase client (anon key)
 * @returns Public Supabase client
 */
export function createPublicSupabaseClient(): SupabaseClient<Database> {
  return createSupabaseClient(false);
}

/**
 * Create server-side authenticated Supabase client for RLS
 * Uses proper server-side authentication pattern
 * @param accessToken - User's access token from session
 * @returns Authenticated Supabase client with user context for RLS
 */
export async function createServerAuthenticatedClient(accessToken: string): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create client and set user session properly for server-side RLS
  const client = createClient<Database>(supabaseUrl, anonKey);
  
  // Get user from token to establish proper session
  const { data: { user }, error } = await client.auth.getUser(accessToken);
  
  if (error || !user) {
    throw new Error(`Authentication failed: ${error?.message}`);
  }

  // Create a new client instance with the user session
  const authenticatedClient = createClient<Database>(supabaseUrl, anonKey);
  
  // Set session using the proper server-side method
  await authenticatedClient.auth.setSession({
    access_token: accessToken,
    refresh_token: '', // Not needed for server queries
  } as any);

  return authenticatedClient;
}
