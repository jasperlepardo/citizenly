/**
 * Repository Types
 * Consolidated repository interfaces and patterns
 */

import type { ResidentRecord } from './database';
import type { QueryOptions, RepositoryResult } from './services';

// =============================================================================
// DOMAIN-SPECIFIC REPOSITORY TYPES
// =============================================================================

/**
 * Resident repository data type
 */
export type ResidentData = ResidentRecord;

/**
 * Household repository data type
 */
export interface HouseholdData {
  id?: string;
  code: string;
  household_head_first_name: string;
  household_head_last_name: string;
  household_head_middle_name?: string;
  household_type: string;
  tenure_status: string;
  barangay_code: string;
  no_of_household_members?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * User repository data type
 */
export interface UserData {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  barangay_code?: string;
  is_active: boolean;
  last_login_at?: string;
  email_verified_at?: string;
  password_changed_at?: string;
  login_attempts?: number;
  locked_until?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Resident search options
 */
export interface ResidentSearchOptions extends QueryOptions {
  name?: string;
  age?: number;
  sex?: string;
  civil_status?: string;
  household_code?: string;
  is_voter?: boolean;
  barangay_code?: string;
}

/**
 * Household search options
 */
export interface HouseholdSearchOptions extends QueryOptions {
  code?: string;
  household_code?: string;
  name?: string;
  barangay_code?: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  street_id?: string;
  household_head_id?: string;
  total_members?: number;
  head_of_family?: string;
}

/**
 * User search options
 */
export interface UserSearchOptions extends QueryOptions {
  email?: string;
  role?: string;
  barangay_code?: string;
  is_active?: boolean;
}

// =============================================================================
// REPOSITORY RESULT TYPES
// =============================================================================

/**
 * Resident repository result
 */
export type ResidentRepositoryResult<T = ResidentData> = RepositoryResult<T>;

/**
 * Household repository result
 */
export type HouseholdRepositoryResult<T = HouseholdData> = RepositoryResult<T>;

/**
 * Batch operation result
 */
export interface BatchOperationResult<T = any> {
  success: boolean;
  processed: number;
  failed: number;
  results: RepositoryResult<T>[];
  errors?: string[];
}

// =============================================================================
// REPOSITORY CONFIGURATION TYPES
// =============================================================================

/**
 * Repository configuration
 */
export interface RepositoryConfig {
  tableName: string;
  primaryKey?: string;
  timestamps?: boolean;
  softDelete?: boolean;
  audit?: boolean;
}

/**
 * Bulk operation options
 */
export interface BulkOperationOptions {
  batchSize?: number;
  skipValidation?: boolean;
  continueOnError?: boolean;
  returnResults?: boolean;
}