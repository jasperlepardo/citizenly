/**
 * useFieldLoading Hook
 * Manages loading states for individual form fields
 */

import { useState, useCallback, useMemo } from 'react';

interface FieldLoadingState {
  [fieldName: string]: boolean;
}

interface UseFieldLoadingReturn {
  loadingStates: FieldLoadingState;
  setFieldLoading: (field: string, loading: boolean) => void;
  setMultipleFieldsLoading: (fields: string[], loading: boolean) => void;
  isAnyFieldLoading: boolean;
  clearAllLoading: () => void;
  getFieldLoading: (field: string) => boolean;
}

/**
 * Hook for managing field-level loading states
 * @param initialState Initial loading state for fields
 * @returns Object with loading state management functions
 */
export function useFieldLoading(initialState: FieldLoadingState = {}): UseFieldLoadingReturn {
  const [loadingStates, setLoadingStates] = useState<FieldLoadingState>(initialState);

  const setFieldLoading = useCallback((field: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [field]: loading
    }));
  }, []);

  const setMultipleFieldsLoading = useCallback((fields: string[], loading: boolean) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      fields.forEach(field => {
        newState[field] = loading;
      });
      return newState;
    });
  }, []);

  const isAnyFieldLoading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const getFieldLoading = useCallback((field: string) => {
    return Boolean(loadingStates[field]);
  }, [loadingStates]);

  return {
    loadingStates,
    setFieldLoading,
    setMultipleFieldsLoading,
    isAnyFieldLoading,
    clearAllLoading,
    getFieldLoading
  };
}

export default useFieldLoading;