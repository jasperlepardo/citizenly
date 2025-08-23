/**
 * Base Repository Pattern
 * Abstract base class for all data repositories
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../logging/secure-logger';
import { storeSecurityAuditLog } from '../security/audit-storage';
import type { ValidationContext } from '../validation/types';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface RepositoryError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: RepositoryError;
  count?: number;
}

export abstract class BaseRepository<T extends Record<string, any>> {
  protected supabase: SupabaseClient;
  protected tableName: string;
  protected context?: ValidationContext;

  constructor(tableName: string, context?: ValidationContext) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.tableName = tableName;
    this.context = context;
  }

  /**
   * Set request context for auditing
   */
  setContext(context: ValidationContext): void {
    this.context = context;
  }

  /**
   * Log repository operation for audit
   */
  protected async auditOperation(
    operation: string,
    resourceId?: string,
    success: boolean = true,
    details?: Record<string, any>
  ): Promise<void> {
    if (!this.context) return;

    try {
      await storeSecurityAuditLog({
        operation: `${this.tableName.toUpperCase()}_${operation.toUpperCase()}`,
        user_id: this.context.userId || 'system',
        resource_type: this.tableName,
        resource_id: resourceId,
        severity: 'low',
        details: details || {},
        ip_address: this.context.ipAddress,
        user_agent: '',
        timestamp: new Date().toISOString(),
        success,
      });
    } catch (error) {
      logger.error('Failed to audit repository operation', { error, operation });
    }
  }

  /**
   * Handle database errors consistently
   */
  protected handleError(error: any, operation: string): RepositoryError {
    logger.error(`Repository ${operation} error`, { error, table: this.tableName });

    // Map common database errors
    if (error.code === '23505') {
      return {
        code: 'UNIQUE_VIOLATION',
        message: 'A record with this information already exists',
        details: error.details,
      };
    }

    if (error.code === '23503') {
      return {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced record does not exist',
        details: error.details,
      };
    }

    if (error.code === '42P01') {
      return {
        code: 'TABLE_NOT_FOUND',
        message: 'Database table not found',
        details: error.details,
      };
    }

    if (error.code === 'PGRST116') {
      return {
        code: 'NOT_FOUND',
        message: 'Record not found',
        details: error.details,
      };
    }

    return {
      code: 'DATABASE_ERROR',
      message: error.message || 'Database operation failed',
      details: error.details,
    };
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<RepositoryResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        await this.auditOperation('READ', id, false, { error: error.message });
        return {
          success: false,
          error: this.handleError(error, 'findById'),
        };
      }

      await this.auditOperation('READ', id, true);
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      await this.auditOperation('READ', id, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, 'findById'),
      };
    }
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(options: QueryOptions = {}): Promise<RepositoryResult<T[]>> {
    try {
      let query = this.supabase.from(this.tableName).select('*', { count: 'exact' });

      // Apply filters
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        await this.auditOperation('READ_ALL', undefined, false, { error: error.message });
        return {
          success: false,
          error: this.handleError(error, 'findAll'),
        };
      }

      await this.auditOperation('READ_ALL', undefined, true, { count });
      return {
        success: true,
        data: data as T[],
        count: count || 0,
      };
    } catch (error) {
      await this.auditOperation('READ_ALL', undefined, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, 'findAll'),
      };
    }
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<RepositoryResult<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        await this.auditOperation('CREATE', undefined, false, { error: error.message });
        return {
          success: false,
          error: this.handleError(error, 'create'),
        };
      }

      await this.auditOperation('CREATE', result.id, true, { data });
      return {
        success: true,
        data: result as T,
      };
    } catch (error) {
      await this.auditOperation('CREATE', undefined, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, 'create'),
      };
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<RepositoryResult<T>> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        await this.auditOperation('UPDATE', id, false, { error: error.message });
        return {
          success: false,
          error: this.handleError(error, 'update'),
        };
      }

      await this.auditOperation('UPDATE', id, true, { data });
      return {
        success: true,
        data: result as T,
      };
    } catch (error) {
      await this.auditOperation('UPDATE', id, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, 'update'),
      };
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<RepositoryResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        await this.auditOperation('DELETE', id, false, { error: error.message });
        return {
          success: false,
          error: this.handleError(error, 'delete'),
        };
      }

      await this.auditOperation('DELETE', id, true);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      await this.auditOperation('DELETE', id, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, 'delete'),
      };
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: Record<string, any>): Promise<RepositoryResult<number>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Apply filters
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        }
      }

      const { count, error } = await query;

      if (error) {
        await this.auditOperation('COUNT', undefined, false, { error: error.message });
        return {
          success: false,
          error: this.handleError(error, 'count'),
        };
      }

      await this.auditOperation('COUNT', undefined, true, { count });
      return {
        success: true,
        data: count || 0,
      };
    } catch (error) {
      await this.auditOperation('COUNT', undefined, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, 'count'),
      };
    }
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<RepositoryResult<boolean>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        await this.auditOperation('EXISTS', id, false, { error: error.message });
        return {
          success: false,
          error: this.handleError(error, 'exists'),
        };
      }

      const exists = !!data;
      await this.auditOperation('EXISTS', id, true, { exists });
      return {
        success: true,
        data: exists,
      };
    } catch (error) {
      await this.auditOperation('EXISTS', id, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, 'exists'),
      };
    }
  }

  /**
   * Execute custom query
   */
  protected async executeQuery<R = any>(
    queryBuilder: (client: SupabaseClient) => any,
    operation: string
  ): Promise<RepositoryResult<R>> {
    try {
      const result = await queryBuilder(this.supabase);
      
      if (result.error) {
        await this.auditOperation(operation, undefined, false, { error: result.error.message });
        return {
          success: false,
          error: this.handleError(result.error, operation),
        };
      }

      await this.auditOperation(operation, undefined, true);
      return {
        success: true,
        data: result.data as R,
        count: result.count,
      };
    } catch (error) {
      await this.auditOperation(operation, undefined, false, { error: (error as Error).message });
      return {
        success: false,
        error: this.handleError(error, operation),
      };
    }
  }
}