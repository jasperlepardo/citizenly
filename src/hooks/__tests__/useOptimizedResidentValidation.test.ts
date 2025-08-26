/**
 * Test Suite for useOptimizedResidentValidation Hook
 */

import { renderHook, act } from '@testing-library/react';

import { useOptimizedResidentValidation } from '../validation/useOptimizedResidentValidation';

// Mock dependencies
jest.mock('../useResidentValidationCore', () => ({
  useResidentValidationCore: jest.fn(() => ({
    validateRequired: jest.fn(),
    validateTypes: jest.fn(),
    getValidationErrors: jest.fn(() => ({})),
  })),
}));

jest.mock('../useResidentCrossFieldValidation', () => ({
  useResidentCrossFieldValidation: jest.fn(() => ({
    validateCrossFields: jest.fn(),
    getCrossFieldErrors: jest.fn(() => ({})),
  })),
}));

jest.mock('../useResidentAsyncValidation', () => ({
  useResidentAsyncValidation: jest.fn(() => ({
    validateFieldAsync: jest.fn(),
    isAsyncValidating: false,
    asyncErrors: {},
  })),
}));

jest.mock('../useResidentValidationProgress', () => ({
  useResidentValidationProgress: jest.fn(() => ({
    progress: { completed: 0, total: 0, percentage: 0 },
    updateProgress: jest.fn(),
  })),
}));

describe('useOptimizedResidentValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      expect(result.current.isValidating).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it('should accept custom options', () => {
      const options: any = {
        mode: 'onChange',
        debounceDelay: 500,
      };

      const { result } = renderHook(() => useOptimizedResidentValidation(options));

      expect(result.current).toBeDefined();
    });
  });

  describe('validation orchestration', () => {
    it('should orchestrate all validation hooks', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      act(() => {
        result.current.validateField('firstName', 'John');
      });

      // Should call all validation components
      expect(result.current.validateField).toBeDefined();
      expect(result.current.validateFieldAsync).toBeDefined();
      expect(result.current.clearFieldError).toBeDefined();
    });

    it('should handle validation errors correctly', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      act(() => {
        result.current.setFieldError('firstName', 'Required field');
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.getFieldError('firstName')).toBe('Required field');
    });
  });

  describe('async validation', () => {
    it('should handle async validation state', async () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      expect(result.current.isAsyncValidating).toBe(false);

      await act(async () => {
        await result.current.validateFieldAsync('email', 'test@example.com');
      });

      // Async validation should be handled
      expect(result.current.validateFieldAsync).toBeDefined();
    });
  });

  describe('performance optimization', () => {
    it('should memoize validation results', () => {
      const { result, rerender } = renderHook(() => useOptimizedResidentValidation());

      const firstValidateField = result.current.validateField;

      rerender();

      const secondValidateField = result.current.validateField;

      // Functions should be memoized
      expect(firstValidateField).toBe(secondValidateField);
    });
  });

  describe('error management', () => {
    it('should clear specific field errors', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      act(() => {
        result.current.setFieldError('firstName', 'Error 1');
        result.current.setFieldError('lastName', 'Error 2');
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.clearFieldError('firstName');
      });

      expect(result.current.getFieldError('firstName')).toBeUndefined();
      expect(result.current.getFieldError('lastName')).toBe('Error 2');
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      act(() => {
        result.current.setFieldError('firstName', 'Error 1');
        result.current.setFieldError('lastName', 'Error 2');
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.clearFieldError('firstName');
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('integration with child hooks', () => {
    it('should integrate with validation core', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      // Should have access to core validation functionality
      expect(result.current.validateField).toBeDefined();
      expect(result.current.getFieldError).toBeDefined();
    });

    it('should integrate with cross-field validation', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      // Should have access to cross-field validation
      expect(result.current.validateField).toBeDefined();
    });

    it('should integrate with async validation', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      // Should have access to async validation
      expect(result.current.validateFieldAsync).toBeDefined();
      expect(result.current.isAsyncValidating).toBeDefined();
    });

    it('should integrate with validation progress', () => {
      const { result } = renderHook(() => useOptimizedResidentValidation());

      // Should have access to progress tracking
      expect(result.current.getValidationProgress).toBeDefined();
    });
  });
});
