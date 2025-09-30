'use client';

import { useState, useEffect } from 'react';

/**
 * Hook for persisting state in localStorage
 * Useful for form data, preferences, and other user data that should survive app restarts
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or default
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (error) {
      // Silently handle localStorage errors
    }

    return defaultValue;
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * Hook specifically for form data persistence
 * Automatically saves and restores form state
 */
export function usePersistedFormState<T extends Record<string, any>>(
  formId: string,
  initialValues: T
) {
  const [formData, setFormData] = usePersistedState(`form-${formId}`, initialValues);

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialValues);
  };

  const clearPersistedData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`form-${formId}`);
    }
    setFormData(initialValues);
  };

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    clearPersistedData,
  };
}
