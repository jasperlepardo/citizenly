/**
 * Library Main Index - Clean Architecture
 * @description Centralized, organized exports following domain separation
 * @version 2.0.0 - Refactored from 297-line monolith
 */

// Core utilities (≤50 lines)
export * from './core';

// Validation system (≤30 lines)
export * from './validation';

// Forms system (≤40 lines)
export * from './forms';

// Authentication system (≤20 lines)
export * from './authentication';

// Security system (≤25 lines)
export * from './security';

// Data systems (≤25 lines) - selective exports to avoid conflicts with auth
export {
  // Storage utilities
  syncQueue,
  offlineStorage,
  // Recent items storage
  getStoredRecentItems,
  addRecentItem,
  // Repository pattern
  BaseRepository,
  // Supabase clients
  createAdminSupabaseClient,
  createPublicSupabaseClient,
  createSupabaseClient,
  // Types for compatibility
  type QueryOptions,
  type RepositoryError,
  type RepositoryResult,
} from './data';

// UI systems (≤20 lines)
export * from './ui';

// Command menu system
export * from './command-menu';

// Environment configuration and constants
export * from './config';
export {
  API_ERROR_CODES,
  createErrorResponseObject,
  EDUCATION_LEVEL_OPTIONS,
  ETHNICITY_OPTIONS,
  RELIGION_OPTIONS,
  extractValues,
  getLabelByValue,
  BLOOD_TYPE_OPTIONS,
  CITIZENSHIP_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  SEX_OPTIONS,
} from './constants';

// Export types separately to comply with isolatedModules
export type {
  BloodTypeValue,
  CitizenshipValue,
  CivilStatusValue,
  EmploymentStatusValue,
  SexValue,
} from './constants';

// Legacy compatibility exports (for gradual migration)
export * from './data/supabase'; // For @/lib/supabase imports

// Logging system (for convenience)
export { logger, dbLogger, apiLogger, authLogger, logError, logSecureError } from './logging';
