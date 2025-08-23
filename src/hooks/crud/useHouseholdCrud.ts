'use client';

/**
 * Household CRUD Operations Hook
 * 
 * @description Focused hook for basic CRUD operations on households.
 * Extracted from useHouseholdOperations to follow single responsibility principle.
 */

import { useState, useCallback } from 'react';
import { householdService, HouseholdFormData } from '@/services/household.service';

/**
 * CRUD operation result
 */
export interface CrudOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Options for CRUD operations
 */
export interface UseHouseholdCrudOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Return type for useHouseholdCrud hook
 */
export interface UseHouseholdCrudReturn {
  /** Whether any operation is in progress */
  isLoading: boolean;
  /** Get household by ID */
  getHousehold: (id: string) => Promise<CrudOperationResult>;
  /** Get household by code */
  getHouseholdByCode: (code: string) => Promise<CrudOperationResult>;
  /** List households with pagination */
  listHouseholds: (page?: number, limit?: number) => Promise<CrudOperationResult>;
  /** Update household */
  updateHousehold: (id: string, updates: Partial<HouseholdFormData>) => Promise<CrudOperationResult>;
  /** Delete household */
  deleteHousehold: (id: string) => Promise<CrudOperationResult>;
}

/**
 * Custom hook for household CRUD operations
 * 
 * @description Provides basic create, read, update, delete operations for households
 * with consistent error handling and loading states.
 */
export function useHouseholdCrud(
  options: UseHouseholdCrudOptions = {}
): UseHouseholdCrudReturn {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generic error handler
   */
  const handleError = useCallback((error: unknown, defaultMessage: string): CrudOperationResult => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    if (onError) {
      onError(errorMessage);
    }
    return { success: false, error: errorMessage };
  }, [onError]);

  /**
   * Generic success handler
   */
  const handleSuccess = useCallback((data: any): CrudOperationResult => {
    if (onSuccess) {
      onSuccess(data);
    }
    return { success: true, data };
  }, [onSuccess]);

  /**
   * Get household by ID
   */
  const getHousehold = useCallback(async (id: string): Promise<CrudOperationResult> => {
    setIsLoading(true);
    try {
      const result = await householdService.getHousehold(id);
      
      if (!result.success) {
        return handleError(new Error(result.error), 'Failed to fetch household');
      }
      
      return handleSuccess(result.data);
    } catch (error) {
      return handleError(error, 'Failed to fetch household');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleSuccess]);

  /**
   * Get household by code
   */
  const getHouseholdByCode = useCallback(async (code: string): Promise<CrudOperationResult> => {
    setIsLoading(true);
    try {
      const result = await householdService.getHouseholdByCode(code);
      
      if (!result.success) {
        return handleError(new Error(result.error), 'Failed to fetch household by code');
      }
      
      return handleSuccess(result.data);
    } catch (error) {
      return handleError(error, 'Failed to fetch household by code');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleSuccess]);

  /**
   * List households with pagination
   */
  const listHouseholds = useCallback(async (
    page = 1, 
    limit = 10
  ): Promise<CrudOperationResult> => {
    setIsLoading(true);
    try {
      const result = await householdService.listHouseholds(page, limit);
      
      if (!result.success) {
        return handleError(new Error(result.error), 'Failed to list households');
      }
      
      return handleSuccess(result.data);
    } catch (error) {
      return handleError(error, 'Failed to list households');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleSuccess]);

  /**
   * Update household
   */
  const updateHousehold = useCallback(async (
    id: string, 
    updates: Partial<HouseholdFormData>
  ): Promise<CrudOperationResult> => {
    setIsLoading(true);
    try {
      const result = await householdService.updateHousehold(id, updates);
      
      if (!result.success) {
        return handleError(new Error(result.error), 'Failed to update household');
      }
      
      return handleSuccess(result.data);
    } catch (error) {
      return handleError(error, 'Failed to update household');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleSuccess]);

  /**
   * Delete household
   */
  const deleteHousehold = useCallback(async (id: string): Promise<CrudOperationResult> => {
    setIsLoading(true);
    try {
      const result = await householdService.deleteHousehold(id);
      
      if (!result.success) {
        return handleError(new Error(result.error), 'Failed to delete household');
      }
      
      return handleSuccess(null);
    } catch (error) {
      return handleError(error, 'Failed to delete household');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleSuccess]);

  return {
    isLoading,
    getHousehold,
    getHouseholdByCode,
    listHouseholds,
    updateHousehold,
    deleteHousehold,
  };
}