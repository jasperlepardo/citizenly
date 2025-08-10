import { supabase } from '@/lib/supabase';
import { logger, logError } from '@/lib/secure-logger';

export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
  loading?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface SearchOptions extends PaginationOptions {
  searchTerm?: string;
  filters?: Record<string, unknown>;
}

/**
 * Base service class for all data services
 * Provides common functionality for API calls, error handling, and logging
 */
export abstract class ServiceBase {
  protected tableName: string;
  protected logPrefix: string;

  constructor(tableName: string, logPrefix?: string) {
    this.tableName = tableName;
    this.logPrefix = logPrefix || tableName.toUpperCase();
  }

  /**
   * Generic fetch method with error handling
   */
  protected async fetch<T>(
    queryBuilder: () => any
  ): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await queryBuilder();

      if (error) {
        logger.error(`${this.logPrefix}_FETCH_ERROR`, { error });
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError(error as Error, `${this.logPrefix}_FETCH_EXCEPTION`);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Generic create method
   */
  protected async create<T>(
    data: Partial<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        logger.error(`${this.logPrefix}_CREATE_ERROR`, { error, data });
        return { data: null, error };
      }

      logger.info(`${this.logPrefix}_CREATED`, { id: (created as any)?.id });
      return { data: created, error: null };
    } catch (error) {
      logError(error as Error, `${this.logPrefix}_CREATE_EXCEPTION`);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Generic update method
   */
  protected async update<T>(
    id: string | number,
    data: Partial<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const { data: updated, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error(`${this.logPrefix}_UPDATE_ERROR`, { error, id, data });
        return { data: null, error };
      }

      logger.info(`${this.logPrefix}_UPDATED`, { id });
      return { data: updated, error: null };
    } catch (error) {
      logError(error as Error, `${this.logPrefix}_UPDATE_EXCEPTION`);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Generic delete method
   */
  protected async delete(id: string | number): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        logger.error(`${this.logPrefix}_DELETE_ERROR`, { error, id });
        return { data: false, error };
      }

      logger.info(`${this.logPrefix}_DELETED`, { id });
      return { data: true, error: null };
    } catch (error) {
      logError(error as Error, `${this.logPrefix}_DELETE_EXCEPTION`);
      return { data: false, error: error as Error };
    }
  }

  /**
   * Get single record by ID
   */
  protected async getById<T>(id: string | number): Promise<ServiceResponse<T>> {
    return this.fetch<T>(() =>
      supabase
        .from(this.tableName)
        .select()
        .eq('id', id)
        .single()
    );
  }

  /**
   * Get all records with optional pagination
   */
  protected async getAll<T>(
    options: PaginationOptions = {}
  ): Promise<ServiceResponse<T[]>> {
    const {
      page = 1,
      limit = 50,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return this.fetch<T[]>(() => {
      let query = supabase
        .from(this.tableName)
        .select()
        .range(from, to)
        .order(orderBy, { ascending: orderDirection === 'asc' });

      return query;
    });
  }

  /**
   * Search records
   */
  protected async search<T>(
    searchColumn: string,
    options: SearchOptions = {}
  ): Promise<ServiceResponse<T[]>> {
    const {
      searchTerm = '',
      filters = {},
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return this.fetch<T[]>(() => {
      let query = supabase
        .from(this.tableName)
        .select()
        .range(from, to)
        .order(orderBy, { ascending: orderDirection === 'asc' });

      if (searchTerm) {
        query = query.ilike(searchColumn, `%${searchTerm}%`);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      return query;
    });
  }

  /**
   * Count records
   */
  protected async count(filters: Record<string, unknown> = {}): Promise<ServiceResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) {
        logger.error(`${this.logPrefix}_COUNT_ERROR`, { error, filters });
        return { data: 0, error };
      }

      return { data: count || 0, error: null };
    } catch (error) {
      logError(error as Error, `${this.logPrefix}_COUNT_EXCEPTION`);
      return { data: 0, error: error as Error };
    }
  }
}