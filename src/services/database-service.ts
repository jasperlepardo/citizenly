/**
 * Database Service
 * Consolidated database client factory and utilities following coding standards
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { createLogger } from '../lib/config/environment';
import type { Database } from '../lib/data/supabase';

const logger = createLogger('DatabaseService');

/**
 * Database Service Class
 * Centralized database operations and client management
 */
export class DatabaseService {
  private adminClient: SupabaseClient<Database> | null = null;
  private publicClient: SupabaseClient<Database> | null = null;

  /**
   * Create a Supabase client with proper environment validation
   */
  private createSupabaseClient(useServiceRole = false): SupabaseClient<Database> {
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
   * Get admin Supabase client (service role) - singleton
   */
  getAdminClient(): SupabaseClient<Database> {
    if (!this.adminClient) {
      this.adminClient = this.createSupabaseClient(true);
      logger.debug('Admin database client initialized');
    }
    return this.adminClient;
  }

  /**
   * Get public Supabase client (anon key) - singleton
   */
  getPublicClient(): SupabaseClient<Database> {
    if (!this.publicClient) {
      this.publicClient = this.createSupabaseClient(false);
      logger.debug('Public database client initialized');
    }
    return this.publicClient;
  }

  /**
   * Get appropriate client based on context
   */
  getClient(useAdmin = false): SupabaseClient<Database> {
    return useAdmin ? this.getAdminClient() : this.getPublicClient();
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const { data, error } = await this.getPublicClient()
        .from('psgc_regions')
        .select('count')
        .limit(1);

      if (error) {
        return { healthy: false, error: error.message };
      }

      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute a query with error handling and logging
   */
  async executeQuery<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>,
    useAdmin = false,
    context?: string
  ): Promise<{ data: T | null; error: any }> {
    const client = this.getClient(useAdmin);
    const startTime = Date.now();

    try {
      const result = await queryFn(client);

      const duration = Date.now() - startTime;
      logger.debug('Query executed', { context, duration, hasError: !!result.error });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Query execution failed', { context, duration, error });

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown query error'),
      };
    }
  }

  /**
   * Execute a stored procedure/function call
   */
  async executeRpc<T>(
    functionName: string,
    params: Record<string, any> = {},
    useAdmin = false
  ): Promise<{ data: T | null; error: any }> {
    const client = this.getClient(useAdmin);
    const startTime = Date.now();

    try {
      const result = await client.rpc(
        functionName,
        Object.keys(params).length > 0 ? params : (undefined as any)
      );

      const duration = Date.now() - startTime;
      logger.debug('RPC executed', { functionName, duration, hasError: !!result.error });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('RPC execution failed', { functionName, duration, error });

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown RPC error'),
      };
    }
  }

  /**
   * Dispose of clients (for cleanup)
   */
  dispose(): void {
    this.adminClient = null;
    this.publicClient = null;
    logger.debug('Database clients disposed');
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Modern service-based exports - use databaseService instead of legacy functions
