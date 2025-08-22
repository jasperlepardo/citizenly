/**
 * User Repository
 * Domain-specific repository for user data operations
 */

import { BaseRepository, type QueryOptions, type RepositoryResult } from './base-repository';
import { validateUserData } from '../validation/schemas';
import type { ValidationContext } from '../validation/types';

export interface UserData {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  barangayCode?: string;
  isActive: boolean;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  passwordChangedAt?: string;
  loginAttempts?: number;
  lockedUntil?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSearchOptions extends QueryOptions {
  email?: string;
  name?: string;
  role?: string;
  barangayCode?: string;
  isActive?: boolean;
  lastLoginBefore?: string;
  lastLoginAfter?: string;
}

export interface UserSecurityData {
  loginAttempts: number;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lockedUntil?: string;
  passwordChangedAt?: string;
  emailVerifiedAt?: string;
}

export class UserRepository extends BaseRepository<UserData> {
  constructor(context?: ValidationContext) {
    super('users', context);
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
            details: validationResult.errors,
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

      return await this.create(validationResult.data || data);
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
            details: validationResult.errors,
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
      const queryBuilder = (supabase: any) => {
        return supabase
          .from(this.tableName)
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
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
      const queryBuilder = (supabase: any) => {
        let query = supabase
          .from(this.tableName)
          .select('*', { count: 'exact' });

        // Email search (partial match)
        if (options.email) {
          query = query.ilike('email', `%${options.email}%`);
        }

        // Name search (across first and last names)
        if (options.name) {
          const searchTerm = `%${options.name}%`;
          query = query.or(
            `firstName.ilike.${searchTerm},lastName.ilike.${searchTerm}`
          );
        }

        // Role filter
        if (options.role) query = query.eq('role', options.role);

        // Barangay filter
        if (options.barangayCode) query = query.eq('barangayCode', options.barangayCode);

        // Active status filter
        if (options.isActive !== undefined) query = query.eq('isActive', options.isActive);

        // Last login date filters
        if (options.lastLoginBefore) {
          query = query.lt('lastLoginAt', options.lastLoginBefore);
        }
        if (options.lastLoginAfter) {
          query = query.gt('lastLoginAt', options.lastLoginAfter);
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
            ascending: options.orderDirection !== 'desc' 
          });
        } else {
          // Default order by last name, first name
          query = query.order('lastName').order('firstName');
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
        orderBy: 'lastName',
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
  async findByBarangay(barangayCode: string): Promise<RepositoryResult<UserData[]>> {
    try {
      return await this.findAll({
        filters: { barangayCode, isActive: true },
        orderBy: 'lastName',
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
      return await this.update(userId, securityData as any);
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
        updateData.loginAttempts = 0;
        updateData.lastLoginAt = new Date().toISOString();
        updateData.lockedUntil = undefined;
      } else {
        // Increment login attempts on failed login
        const attempts = (user.loginAttempts || 0) + 1;
        updateData.loginAttempts = attempts;

        // Lock account after 5 failed attempts
        if (attempts >= 5) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Lock for 30 minutes
          updateData.lockedUntil = lockUntil.toISOString();
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
      const isLocked = user.lockedUntil && new Date(user.lockedUntil) > now;

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

      const queryBuilder = (supabase: any) => {
        return supabase
          .from(this.tableName)
          .select('*')
          .or(`lastLoginAt.is.null,lastLoginAt.lt.${cutoffDate.toISOString()}`)
          .eq('isActive', true)
          .order('lastLoginAt', { ascending: true, nullsFirst: true });
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
        isActive: false,
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
        isActive: true,
        loginAttempts: 0,
        lockedUntil: undefined,
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