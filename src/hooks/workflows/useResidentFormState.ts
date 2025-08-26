'use client';

/**
 * Resident Form State Management Hook
 * 
 * @description Focused hook for managing resident form state and data persistence.
 * Extracted from useResidentEditForm to follow single responsibility principle.
 */

import { useState, useCallback, useEffect } from 'react';

import type { ResidentFormData as ResidentEditFormData } from '@/types';

/**
 * Default form data with proper typing
 */
const DEFAULT_FORM_DATA: Partial<ResidentEditFormData> = {
  first_name: '',
  last_name: '',
  birthdate: '',
  sex: 'male'
};
/**
 * Form state options
 */
export interface UseResidentFormStateOptions {
  initialData?: Partial<ResidentEditFormData>;
  autoSave?: boolean;
  autoSaveKey?: string;
}

/**
 * Return type for useResidentFormState hook
 */
export interface UseResidentFormStateReturn {
  /** Current form data */
  formData: Partial<ResidentEditFormData>;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Update a single field */
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  /** Update multiple fields at once */
  updateFields: (fields: Partial<ResidentEditFormData>) => void;
  /** Reset form to initial state */
  resetForm: () => void;
  /** Set form data programmatically */
  setFormData: (data: Partial<ResidentEditFormData>) => void;
  /** Clear auto-saved data */
  clearAutoSave: () => void;
}

/**
 * Custom hook for resident form state management
 * 
 * @description Manages form data state, auto-save functionality, and data persistence.
 * Provides clean separation between state management and validation/submission logic.
 */
export function useResidentFormState(
  options: UseResidentFormStateOptions = {}
): UseResidentFormStateReturn {
  const {
    initialData = {},
    autoSave = false,
    autoSaveKey = 'resident-form-draft',
  } = options;

  /**
   * Initialize form data with auto-save recovery
   */
  const [formData, setFormDataState] = useState<Partial<ResidentEditFormData>>(() => {
    const merged = { ...DEFAULT_FORM_DATA, ...initialData };

    // Load from localStorage if autoSave is enabled and no initial data
    if (autoSave && Object.keys(initialData).length === 0) {
      try {
        const saved = localStorage.getItem(autoSaveKey);
        if (saved) {
          const parsedData = JSON.parse(saved);
          return { ...merged, ...parsedData };
        }
      } catch (error) {
        // Silently handle localStorage errors
      }
    }

    return merged;
  });

  const [isDirty, setIsDirty] = useState(false);

  /**
   * Auto-save to localStorage when form changes
   */
  useEffect(() => {
    if (autoSave && isDirty) {
      try {
        localStorage.setItem(autoSaveKey, JSON.stringify(formData));
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }, [formData, autoSave, autoSaveKey, isDirty]);

  /**
   * Update a single field
   */
  const updateField = useCallback(<K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => {
    setFormDataState(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((fields: Partial<ResidentEditFormData>) => {
    setFormDataState(prev => ({
      ...prev,
      ...fields,
    }));
    setIsDirty(true);
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    const resetData = { ...DEFAULT_FORM_DATA, ...initialData };
    setFormDataState(resetData);
    setIsDirty(false);
    
    // Clear auto-save
    if (autoSave) {
      try {
        localStorage.removeItem(autoSaveKey);
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }, [initialData, autoSave, autoSaveKey]);

  /**
   * Set form data programmatically
   */
  const setFormData = useCallback((data: Partial<ResidentEditFormData>) => {
    setFormDataState(data);
    setIsDirty(true);
  }, []);

  /**
   * Clear auto-saved data
   */
  const clearAutoSave = useCallback(() => {
    if (autoSave) {
      try {
        localStorage.removeItem(autoSaveKey);
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }, [autoSave, autoSaveKey]);

  return {
    formData,
    isDirty,
    updateField,
    updateFields,
    resetForm,
    setFormData,
    clearAutoSave,
  };
}