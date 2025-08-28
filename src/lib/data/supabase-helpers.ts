/**
 * Supabase Helper Functions
 * Type-safe wrappers for common Supabase operations to resolve 'never' type issues
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type-safe insert operation
 */
export async function safeInsert<T = any>(
  client: SupabaseClient,
  table: string,
  data: Record<string, any> | Record<string, any>[]
): Promise<{ data: T | null; error: any }> {
  const result = await (client as any)
    .from(table)
    .insert(data)
    .select()
    .single();
  
  return {
    data: result.data,
    error: result.error
  };
}

/**
 * Type-safe update operation
 */
export async function safeUpdate<T = any>(
  client: SupabaseClient,
  table: string,
  data: Record<string, any>,
  filters: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  let query = (client as any).from(table).update(data);
  
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  const result = await query.select().single();
  
  return {
    data: result.data,
    error: result.error
  };
}

/**
 * Type-safe select operation with filters
 */
export async function safeSelect<T = any>(
  client: SupabaseClient,
  table: string,
  selectFields: string = '*',
  filters: Record<string, any> = {}
): Promise<{ data: T | null; error: any }> {
  let query = (client as any).from(table).select(selectFields);
  
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  const result = await query.single();
  
  return {
    data: result.data,
    error: result.error
  };
}