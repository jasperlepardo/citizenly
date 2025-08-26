'use client';

/**
 * Resident Validation Progress Hook
 *
 * @description Tracks validation progress and provides validation summaries.
 * Extracted from useOptimizedResidentValidation for better maintainability.
 */

import { useMemo } from 'react';

import { CRITICAL_VALIDATION_FIELDS } from '@/lib/constants/resident-form-defaults';
import { REQUIRED_FIELDS, getRequiredFieldsForSection } from '@/lib/validation/fieldLevelSchemas';

/**
 * Validation summary
 */
export interface ValidationSummary {
  totalErrors: number;
  criticalErrors: number;
  warnings: number;
  totalFields: number;
  validFields: number;
  progressPercentage: number;
}

/**
 * Section validation status
 */
export interface SectionValidationStatus {
  section: keyof typeof REQUIRED_FIELDS;
  isValid: boolean;
  errorCount: number;
  totalFields: number;
  progressPercentage: number;
}

/**
 * Return type for validation progress hook
 */
export interface UseResidentValidationProgressReturn {
  /** Get comprehensive validation summary */
  getValidationSummary: (errors: Record<string, string>) => ValidationSummary;
  /** Get validation progress percentage */
  getValidationProgress: (errors: Record<string, string>) => number;
  /** Check if form has critical errors */
  hasCriticalErrors: (errors: Record<string, string>) => boolean;
  /** Get section validation status */
  getSectionValidationStatus: (
    section: keyof typeof REQUIRED_FIELDS,
    errors: Record<string, string>
  ) => SectionValidationStatus;
  /** Get all section validation statuses */
  getAllSectionStatuses: (errors: Record<string, string>) => SectionValidationStatus[];
  /** Check if field is critical */
  isFieldCritical: (fieldName: string) => boolean;
  /** Get all required fields */
  getAllRequiredFields: () => string[];
  /** Check if field is required */
  isFieldRequired: (fieldName: string) => boolean;
}

/**
 * Hook for resident validation progress tracking
 *
 * @description Provides comprehensive validation progress tracking and summaries.
 * Optimized with memoization for performance.
 */
export function useResidentValidationProgress(): UseResidentValidationProgressReturn {
  /**
   * Get all required fields across all sections (memoized)
   */
  const getAllRequiredFields = useMemo((): string[] => {
    const sections = Object.keys(REQUIRED_FIELDS) as Array<keyof typeof REQUIRED_FIELDS>;
    const allFields = new Set<string>();

    sections.forEach(section => {
      const sectionFields = getRequiredFieldsForSection(section);
      sectionFields.forEach(field => allFields.add(field));
    });

    // Add critical validation fields that might not be in REQUIRED_FIELDS
    CRITICAL_VALIDATION_FIELDS.forEach(field => allFields.add(field));

    return Array.from(allFields);
  }, []);

  /**
   * Check if field is required (memoized with Set for performance)
   */
  const isFieldRequired = useMemo(() => {
    const fieldCache = new Set(getAllRequiredFields);
    return (fieldName: string): boolean => fieldCache.has(fieldName);
  }, [getAllRequiredFields]);

  /**
   * Check if field is critical (memoized)
   */
  const isFieldCritical = useMemo(() => {
    return (fieldName: string): boolean => {
      return CRITICAL_VALIDATION_FIELDS.includes(
        fieldName as (typeof CRITICAL_VALIDATION_FIELDS)[number]
      );
    };
  }, []);

  /**
   * Get validation progress percentage
   */
  const getValidationProgress = useMemo(() => {
    return (errors: Record<string, string>): number => {
      const allRequiredFields = getAllRequiredFields;
      const totalRequired = allRequiredFields.length;

      if (totalRequired === 0) return 100;

      const errorCount = allRequiredFields.filter(field => errors[field]).length;
      const validCount = totalRequired - errorCount;

      return Math.round((validCount / totalRequired) * 100);
    };
  }, [getAllRequiredFields]);

  /**
   * Get comprehensive validation summary
   */
  const getValidationSummary = useMemo(() => {
    return (errors: Record<string, string>): ValidationSummary => {
      const allRequiredFields = getAllRequiredFields;
      const errorFields = Object.keys(errors);

      const criticalErrors = errorFields.filter(field =>
        CRITICAL_VALIDATION_FIELDS.includes(field as (typeof CRITICAL_VALIDATION_FIELDS)[number])
      ).length;

      const totalErrors = errorFields.length;
      const warnings = 0; // Could be extended to track warnings
      const totalFields = allRequiredFields.length;
      const validFields = totalFields - totalErrors;
      const progressPercentage = getValidationProgress(errors);

      return {
        totalErrors,
        criticalErrors,
        warnings,
        totalFields,
        validFields,
        progressPercentage,
      };
    };
  }, [getAllRequiredFields, getValidationProgress]);

  /**
   * Check if form has critical errors
   */
  const hasCriticalErrors = useMemo(() => {
    return (errors: Record<string, string>): boolean => {
      return Object.keys(errors).some(field =>
        CRITICAL_VALIDATION_FIELDS.includes(field as (typeof CRITICAL_VALIDATION_FIELDS)[number])
      );
    };
  }, []);

  /**
   * Get section validation status
   */
  const getSectionValidationStatus = useMemo(() => {
    return (
      section: keyof typeof REQUIRED_FIELDS,
      errors: Record<string, string>
    ): SectionValidationStatus => {
      const sectionFields = getRequiredFieldsForSection(section);
      const sectionErrors = sectionFields.filter(field => errors[field]);
      const errorCount = sectionErrors.length;
      const totalFields = sectionFields.length;
      const isValid = errorCount === 0;
      const progressPercentage =
        totalFields > 0 ? Math.round(((totalFields - errorCount) / totalFields) * 100) : 100;

      return {
        section,
        isValid,
        errorCount,
        totalFields,
        progressPercentage,
      };
    };
  }, []);

  /**
   * Get all section validation statuses
   */
  const getAllSectionStatuses = useMemo(() => {
    return (errors: Record<string, string>): SectionValidationStatus[] => {
      const sections = Object.keys(REQUIRED_FIELDS) as Array<keyof typeof REQUIRED_FIELDS>;
      return sections.map(section => getSectionValidationStatus(section, errors));
    };
  }, [getSectionValidationStatus]);

  return {
    getValidationSummary,
    getValidationProgress,
    hasCriticalErrors,
    getSectionValidationStatus,
    getAllSectionStatuses,
    isFieldCritical,
    getAllRequiredFields: () => getAllRequiredFields,
    isFieldRequired,
  };
}

// Export for backward compatibility
export default useResidentValidationProgress;
