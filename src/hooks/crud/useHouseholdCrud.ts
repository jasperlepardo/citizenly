/**
 * @deprecated Legacy household CRUD hook - minimal stub for TypeScript compliance
 */

import { useState } from 'react';

// Minimal types for legacy compatibility
type HouseholdFormData = any;
type CrudOperationResult = { success: boolean; error?: string; data?: any };
export type UseHouseholdCrudOptions = { onSuccess?: () => void; onError?: (error: string) => void };
export type UseHouseholdCrudReturn = {
  createHousehold: (data: HouseholdFormData) => Promise<CrudOperationResult>;
  updateHousehold: (id: string, data: HouseholdFormData) => Promise<CrudOperationResult>;
  deleteHousehold: (id: string) => Promise<CrudOperationResult>;
  getHousehold: (id: string) => Promise<CrudOperationResult>;
  listHouseholds: () => Promise<CrudOperationResult>;
  isLoading: boolean;
};

/**
 * @deprecated Legacy hook for household CRUD operations
 * This is a minimal stub implementation for TypeScript compliance
 */
export function useHouseholdCrud(options: UseHouseholdCrudOptions = {}): UseHouseholdCrudReturn {
  const [isLoading] = useState(false);

  // Stub implementations
  const createHousehold = async (): Promise<CrudOperationResult> => ({ success: false, error: 'Not implemented' });
  const updateHousehold = async (): Promise<CrudOperationResult> => ({ success: false, error: 'Not implemented' });
  const deleteHousehold = async (): Promise<CrudOperationResult> => ({ success: false, error: 'Not implemented' });
  const getHousehold = async (): Promise<CrudOperationResult> => ({ success: false, error: 'Not implemented' });
  const listHouseholds = async (): Promise<CrudOperationResult> => ({ success: false, error: 'Not implemented' });

  return {
    createHousehold,
    updateHousehold,
    deleteHousehold,
    getHousehold,
    listHouseholds,
    isLoading,
  };
}