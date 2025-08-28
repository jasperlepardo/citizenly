'use client';

/**
 * Resident Cross-Field Validation Hook
 *
 * @description Handles complex validation rules that span multiple fields.
 * Extracted from useOptimizedResidentValidation for better maintainability.
 */

import { useMemo } from 'react';

import type { ResidentFormData } from '@/types';

/**
 * Cross-field validation rule definition
 */
interface CrossFieldValidationRule {
  fields: string[];
  validate: (data: ResidentFormData) => Record<string, string>;
}

/**
 * Cross-field validation rules
 */
const crossFieldValidationRules: CrossFieldValidationRule[] = [
  {
    fields: ['employment_status', 'occupation_code'],
    validate: (data: ResidentFormData) => {
      const errors: Record<string, string> = {};
      if (data.employment_status === 'employed' && !data.occupation_code) {
        errors.occupation_code = 'Occupation code is required when employed';
      }
      return errors;
    },
  },
  {
    fields: ['religion', 'religion_others_specify'],
    validate: (data: ResidentFormData) => {
      const errors: Record<string, string> = {};
      if (data.religion === 'others' && !data.religion_others_specify) {
        errors.religion_others_specify = 'Please specify other religion';
      }
      return errors;
    },
  },
  {
    fields: ['is_senior_citizen', 'is_registered_senior_citizen'],
    validate: (data: ResidentFormData) => {
      const errors: Record<string, string> = {};
      if (!(data as any).is_senior_citizen && (data as any).is_registered_senior_citizen) {
        (errors as any).is_registered_senior_citizen =
          'Cannot be registered senior citizen if not a senior citizen';
      }
      return errors;
    },
  },
  {
    fields: ['isMigrant', 'previousBarangayCode', 'reasonForTransferring'],
    validate: (data: ResidentFormData) => {
      const errors: Record<string, string> = {};
      if ((data as any).isMigrant) {
        if (!(data as any).previous_barangay_code) {
          (errors as any).previous_barangay_code = 'Previous barangay is required for migrants';
        }
        if (!(data as any).reason_for_migration) {
          (errors as any).reason_for_migration = 'Reason for transferring is required for migrants';
        }
      }
      return errors;
    },
  },
];

/**
 * Return type for cross-field validation hook
 */
export interface UseResidentCrossFieldValidationReturn {
  /** Validate all cross-field rules for given data */
  validateCrossFields: (data: ResidentFormData) => Record<string, string>;
  /** Get fields affected by cross-field validation */
  getCrossFieldDependencies: (fieldName: string) => string[];
  /** Check if field has cross-field dependencies */
  hasCrossFieldDependencies: (fieldName: string) => boolean;
}

/**
 * Hook for resident cross-field validation
 *
 * @description Provides validation for complex rules that depend on multiple fields.
 * Optimized with memoization for performance.
 */
export function useResidentCrossFieldValidation(): UseResidentCrossFieldValidationReturn {
  /**
   * Map of field to rules that affect it (memoized for performance)
   */
  const fieldToRulesMap = useMemo(() => {
    const map = new Map<string, CrossFieldValidationRule[]>();

    crossFieldValidationRules.forEach(rule => {
      rule.fields.forEach(field => {
        if (!map.has(field)) {
          map.set(field, []);
        }
        map.get(field)?.push(rule);
      });
    });

    return map;
  }, []);

  /**
   * Validate all cross-field rules for given data
   */
  const validateCrossFields = useMemo(() => {
    return (data: ResidentFormData): Record<string, string> => {
      const allErrors: Record<string, string> = {};

      crossFieldValidationRules.forEach(rule => {
        const ruleErrors = rule.validate(data);
        Object.assign(allErrors, ruleErrors);
      });

      return allErrors;
    };
  }, []);

  /**
   * Get fields affected by cross-field validation for a given field
   */
  const getCrossFieldDependencies = useMemo(() => {
    return (fieldName: string): string[] => {
      const rules = fieldToRulesMap.get(fieldName) || [];
      const dependencies = new Set<string>();

      rules.forEach(rule => {
        rule.fields.forEach(field => {
          if (field !== fieldName) {
            dependencies.add(field);
          }
        });
      });

      return Array.from(dependencies);
    };
  }, [fieldToRulesMap]);

  /**
   * Check if field has cross-field dependencies
   */
  const hasCrossFieldDependencies = useMemo(() => {
    return (fieldName: string): boolean => {
      return fieldToRulesMap.has(fieldName);
    };
  }, [fieldToRulesMap]);

  return {
    validateCrossFields,
    getCrossFieldDependencies,
    hasCrossFieldDependencies,
  };
}

// Export for backward compatibility
export default useResidentCrossFieldValidation;
