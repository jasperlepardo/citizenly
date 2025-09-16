/**
 * CRUD Hook Types
 *
 * @fileoverview TypeScript interfaces for CRUD operation React hooks
 * in the Citizenly RBI system.
 */

import type { ValidationResult } from '@/types/shared/validation/validation';

// =============================================================================
// CRUD HOOK TYPES
// =============================================================================

/**
 * CRUD operation result
 * Consolidates from src/hooks/crud/useHouseholdCrud.ts
 */
export interface CrudOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Household CRUD options
 * Consolidates from src/hooks/crud/useHouseholdCrud.ts
 */
export interface UseHouseholdCrudOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Household CRUD return type
 * Consolidates from src/hooks/crud/useHouseholdCrud.ts
 */
export interface UseHouseholdCrudReturn {
  /** Whether any operation is in progress */
  isLoading: boolean;
  /** Get household by ID */
  getHousehold: (id: string) => Promise<CrudOperationResult>;
  /** Get household by code */
  getHouseholdByCode: (code: string) => Promise<CrudOperationResult>;
  /** List households with optional filters */
  listHouseholds: (params?: any) => Promise<CrudOperationResult>;
  /** Update household */
  updateHousehold: (id: string, updates: any) => Promise<CrudOperationResult>;
  /** Delete household */
  deleteHousehold: (id: string) => Promise<CrudOperationResult>;
}

/**
 * Resident operations options
 * Consolidates from src/hooks/crud/useResidentOperations.ts
 */
export interface UseResidentOperationsOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Generic CRUD hook options
 */
export interface UseCrudOptions<T> {
  /** Resource name for API endpoints */
  resource: string;
  /** Transform data before API calls */
  transformData?: (data: T) => T;
  /** Validation function */
  validate?: (data: T) => ValidationResult<T>;
  /** Enable optimistic updates */
  optimistic?: boolean;
}

/**
 * Generic CRUD hook return type
 */
export interface UseCrudReturn<T> {
  /** All items */
  items: T[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Create new item */
  create: (data: T) => Promise<T>;
  /** Update existing item */
  update: (id: string, data: Partial<T>) => Promise<T>;
  /** Delete item */
  remove: (id: string) => Promise<void>;
  /** Refresh items */
  refresh: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Async operation state
 */
export interface AsyncOperationState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Async operation hook return type
 */
export interface UseAsyncReturn<T, Args extends any[] = any[]> extends AsyncOperationState<T> {
  /** Execute the async operation */
  execute: (...args: Args) => Promise<T>;
  /** Reset the state */
  reset: () => void;
}