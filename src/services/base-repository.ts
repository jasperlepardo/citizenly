/**
 * Base Repository Pattern
 * @fileoverview Abstract base class implementing the Repository pattern for data access.
 * Provides standardized CRUD operations, error handling, and audit logging for all data repositories.
 *
 * @example
 * ```typescript
 * // Extend BaseRepository for domain-specific operations
 * class UserRepository extends BaseRepository<UserData> {
 *   constructor(context?: ValidationContext) {
 *     super('users', context);
 *   }
 *
 *   async findByEmail(email: string): Promise<RepositoryResult<UserData>> {
 *     // Implementation
 *   }
 * }
 * ```
 *
 * @since 2.0.0
 * @author Citizenly Development Team
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { logger } from '@/lib';
import { storeSecurityAuditLog } from '@/lib/security/audit-storage';
import type { ValidationContext } from '@/lib/validation/types';

/**
 * Query options for database operations
 * @interface QueryOptions
 * @since 2.0.0
 */
export interface QueryOptions {
  /** Maximum number of records to return */
  limit?: number;
  /** Number of records to skip for pagination */
  offset?: number;
  /** Field name to sort by */
  orderBy?: string;
  /** Sort direction */
  orderDirection?: 'asc' | 'desc';
  /** Additional filters to apply */
  filters?: Record<string, any>;
}

/**
 * Standardized error structure for repository operations
 * @interface RepositoryError
 * @since 2.0.0
 */
export interface RepositoryError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown> | string;
  /** Field name if error is field-specific */
  field?: string;
}

/**
 * Standard result wrapper for repository operations
 * @template T The type of data returned on success
 * @interface RepositoryResult
 * @since 2.0.0
 */
export interface RepositoryResult<T> {
  /** Whether the operation was successful */
  success: boolean;
  /** Data returned on success */
  data?: T;
  /** Error details if operation failed */
  error?: RepositoryError;
  /** Total count for paginated results */
  count?: number;
}

/**
 * Base Repository class implementing the Repository pattern
 * @template T The entity type this repository manages
 * @abstract
 * @class BaseRepository
 * @since 2.0.0
 *
 * @description
 * Provides standardized data access operations with built-in:
 * - Error handling and mapping
 * - Audit logging for security compliance
 * - Consistent result formatting
 * - Type-safe database operations
 */
export abstract class BaseRepository<T extends Record<string, any>> {
  protected supabase: SupabaseClient;
  protected tableName: string;
  protected context?: ValidationContext;

  /**
   * Creates a new repository instance
   * @param tableName - Name of the database table this repository manages
   * @param context - Optional validation context for audit logging
   */
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
   * @param context - Validation context containing user and request information
   * @since 2.0.0
   *
   * @example
   * ```typescript
   * repository.setContext({
   *   userId: 'user-123',
   *   ipAddress: '192.168.1.1',
   *   userAgent: 'Mozilla/5.0...'
   * });
   * ```
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
  protected handleError(error: unknown, operation: string): RepositoryError {
    logger.error(`Repository ${operation} error`, { error, table: this.tableName });

    // Type guard for error-like objects
    const isErrorLike = (
      err: unknown
    ): err is { code?: string; message?: string; details?: unknown } => {
      return typeof err === 'object' && err !== null;
    };

    if (!isErrorLike(error)) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        details: String(error),
      };
    }

    // Map common database errors
    if (error.code === '23505') {
      return {
        code: 'UNIQUE_VIOLATION',
        message: 'A record with this information already exists',
        details: error.details as string | Record<string, unknown> | undefined,
      };
    }

    if (error.code === '23503') {
      return {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced record does not exist',
        details: error.details as string | Record<string, unknown> | undefined,
      };
    }

    if (error.code === '42P01') {
      return {
        code: 'TABLE_NOT_FOUND',
        message: 'Database table not found',
        details: error.details as string | Record<string, unknown> | undefined,
      };
    }

    if (error.code === 'PGRST116') {
      return {
        code: 'NOT_FOUND',
        message: 'Record not found',
        details: error.details as string | Record<string, unknown> | undefined,
      };
    }

    return {
      code: 'DATABASE_ERROR',
      message: error.message || 'Database operation failed',
      details: error.details as string | Record<string, unknown> | undefined,
    };
  }

  /**
   * Find a single record by its ID
   * @param id - The unique identifier of the record
   * @returns Promise resolving to the found record or error
   * @since 2.0.0
   *
   * @example
   * ```typescript
   * const result = await repository.findById('123');
   * if (result.success) {
   *   console.log('Found record:', result.data);
   * } else {
   *   console.error('Error:', result.error?.message);
   * }
   * ```
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
   * @param options - Query options for filtering, sorting, and pagination
   * @returns Promise resolving to an array of records
   * @since 2.0.0
   *
   * @example
   * ```typescript
   * const result = await repository.findAll({
   *   limit: 10,
   *   offset: 0,
   *   orderBy: 'created_at',
   *   orderDirection: 'desc',
   *   filters: { status: 'active' }
   * });
   * ```
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
          ascending: options.orderDirection !== 'desc',
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
  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'created_at'>>
  ): Promise<RepositoryResult<T>> {
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
      const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);

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
      let query = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true });

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
