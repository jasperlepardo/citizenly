/**
 * User Repository
 * Domain-specific repository for user data operations
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { validateUserData } from '@/lib/validation/schemas';
import type { ValidationContext } from '@/lib/validation/types';
// Types moved to src/types/services.ts for consolidation
import type {
  QueryOptions,
  RepositoryResult,
  UserRepositoryData as UserData,
  UserRepositorySearchOptions as UserSearchOptions,
  UserSecurityData,
} from '@/types/services';

import { BaseRepository } from './base-repository';

// Export types for re-export in services/index.ts
export type { UserData, UserSearchOptions, UserSecurityData };

export class UserRepository extends BaseRepository<UserData> {
  constructor(context?: ValidationContext) {
    super('auth_user_profiles', context);
  }

  /**
   * Create a new user with validation
   */
  async createUser(
    data: Omit<UserData, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RepositoryResult<UserData>> {
    try {
      // Validate user data before creation
      const validationResult = await validateUserData(data, this.context);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User data validation failed',
            details: validationResult.errors as Record<string, any>,
          },
        };
      }

      // Check for duplicate email
      const duplicateCheck = await this.findByEmail(data.email);
      if (duplicateCheck.success && duplicateCheck.data) {
        return {
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'A user with this email already exists',
            field: 'email',
          },
        };
      }

      return await this.create(data);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'createUser'),
      };
    }
  }

  /**
   * Update user with validation
   */
  async updateUser(
    id: string,
    data: Partial<Omit<UserData, 'id' | 'created_at'>>
  ): Promise<RepositoryResult<UserData>> {
    try {
      // Get existing user for partial validation
      const existingResult = await this.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return existingResult;
      }

      // If updating email, check for duplicates
      if (data.email && data.email !== existingResult.data.email) {
        const duplicateCheck = await this.findByEmail(data.email);
        if (duplicateCheck.success && duplicateCheck.data) {
          return {
            success: false,
            error: {
              code: 'DUPLICATE_EMAIL',
              message: 'A user with this email already exists',
              field: 'email',
            },
          };
        }
      }

      // Merge with existing data for validation
      const mergedData = { ...existingResult.data, ...data };
      const validationResult = await validateUserData(mergedData, this.context);

      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User data validation failed',
            details: validationResult.errors as Record<string, any>,
          },
        };
      }

      return await this.update(id, data);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'updateUser'),
      };
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<RepositoryResult<UserData>> {
    try {
      const queryBuilder = (supabase: SupabaseClient) => {
        return supabase.from(this.tableName).select('*').eq('email', email.toLowerCase()).single();
      };

      return await this.executeQuery(queryBuilder, 'FIND_BY_EMAIL');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findByEmail'),
      };
    }
  }

  /**
   * Search users with advanced filtering
   */
  async searchUsers(options: UserSearchOptions = {}): Promise<RepositoryResult<UserData[]>> {
    try {
      const queryBuilder = (supabase: SupabaseClient) => {
        let query = supabase.from(this.tableName).select('*', { count: 'exact' });

        // Email search (partial match)
        if (options.email) {
          query = query.ilike('email', `%${options.email}%`);
        }

        // Name search (across first and last names)
        if (options.name) {
          const searchTerm = `%${options.name}%`;
          query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
        }

        // Role filter
        if (options.role) query = query.eq('role', options.role);

        // Barangay filter
        if (options.barangay_code) query = query.eq('barangay_code', options.barangay_code);

        // Active status filter
        if (options.is_active !== undefined) query = query.eq('is_active', options.is_active);

        // Last login date filters
        if (options.last_login_before) {
          query = query.lt('last_login', options.last_login_before);
        }
        if (options.last_login_after) {
          query = query.gt('last_login', options.last_login_after);
        }

        // Apply other filters
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
        } else {
          // Default order by last name, first name
          query = query.order('last_name').order('first_name');
        }

        // Apply pagination
        if (options.limit) {
          query = query.limit(options.limit);
        }

        if (options.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        return query;
      };

      return await this.executeQuery(queryBuilder, 'SEARCH_USERS');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'searchUsers'),
      };
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<RepositoryResult<UserData[]>> {
    try {
      return await this.findAll({
        filters: { role },
        orderBy: 'last_name',
      });
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findByRole'),
      };
    }
  }

  /**
   * Find users by barangay
   */
  async findByBarangay(barangay_code: string): Promise<RepositoryResult<UserData[]>> {
    try {
      return await this.findAll({
        filters: { barangay_code, is_active: true },
        orderBy: 'last_name',
      });
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'findByBarangay'),
      };
    }
  }

  /**
   * Update user security data
   */
  async updateSecurityData(
    userId: string,
    securityData: Partial<UserSecurityData>
  ): Promise<RepositoryResult<UserData>> {
    try {
      return await this.update(userId, securityData);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'updateSecurityData'),
      };
    }
  }

  /**
   * Record login attempt
   */
  async recordLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string
  ): Promise<RepositoryResult<UserData>> {
    try {
      const userResult = await this.findByEmail(email);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      const user = userResult.data;
      const updateData: Partial<UserData> = {};

      if (success) {
        // Reset login attempts on successful login
        updateData.login_attempts = 0;
        updateData.last_login = new Date().toISOString();
        updateData.locked_until = undefined;
      } else {
        // Increment login attempts on failed login
        const attempts = (user.login_attempts || 0) + 1;
        updateData.login_attempts = attempts;

        // Lock account after 5 failed attempts
        if (attempts >= 5) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Lock for 30 minutes
          updateData.locked_until = lockUntil.toISOString();
        }
      }

      return await this.update(user.id!, updateData);
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'recordLoginAttempt'),
      };
    }
  }

  /**
   * Check if user account is locked
   */
  async isAccountLocked(email: string): Promise<RepositoryResult<boolean>> {
    try {
      const userResult = await this.findByEmail(email);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      const user = userResult.data;
      const now = new Date();
      const isLocked = user.locked_until && new Date(user.locked_until) > now;

      return {
        success: true,
        data: Boolean(isLocked),
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'isAccountLocked'),
      };
    }
  }

  /**
   * Get inactive users (haven't logged in for specified days)
   */
  async getInactiveUsers(daysSinceLastLogin: number): Promise<RepositoryResult<UserData[]>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastLogin);

      const queryBuilder = (supabase: SupabaseClient) => {
        return supabase
          .from(this.tableName)
          .select('*')
          .or(`last_login.is.null,last_login.lt.${cutoffDate.toISOString()}`)
          .eq('is_active', true)
          .order('last_login', { ascending: true, nullsFirst: true });
      };

      return await this.executeQuery(queryBuilder, 'GET_INACTIVE_USERS');
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'getInactiveUsers'),
      };
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string, reason?: string): Promise<RepositoryResult<UserData>> {
    try {
      const updateData: Partial<UserData> = {
        is_active: false,
        updated_at: new Date().toISOString(),
      };

      const result = await this.update(userId, updateData);

      if (result.success) {
        await this.auditOperation('DEACTIVATE', userId, true, { reason });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'deactivateUser'),
      };
    }
  }

  /**
   * Activate user account
   */
  async activateUser(userId: string): Promise<RepositoryResult<UserData>> {
    try {
      const updateData: Partial<UserData> = {
        is_active: true,
        login_attempts: 0,
        locked_until: undefined,
        updated_at: new Date().toISOString(),
      };

      const result = await this.update(userId, updateData);

      if (result.success) {
        await this.auditOperation('ACTIVATE', userId, true);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'activateUser'),
      };
    }
  }
}
