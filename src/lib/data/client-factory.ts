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