'use client';

/**
 * Resident Validation Progress Hook
 *
 * @description Tracks validation progress and provides validation summaries.
 * Extracted from useOptimizedResidentValidation for better maintainability.
 */

import { useMemo, useState, useCallback } from 'react';

import { CRITICAL_VALIDATION_FIELDS } from '@/constants/residentFormDefaults';
import { REQUIRED_FIELDS, getRequiredFieldsForSection } from '@/services/infrastructure/validation/fieldValidators';
import type {
  ValidationSummary,
  SectionValidationStatus,
  UseResidentValidationProgressReturn,
} from '@/types/shared/hooks/utilityHooks';

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
      const validatedFields = totalFields; // All fields have been processed
      const invalidFields = totalErrors;
      const progress = getValidationProgress(errors);

      return {
        totalErrors,
        criticalErrors,
        warnings,
        totalFields,
        validatedFields,
        invalidFields,
        progress,
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
    return (sectionId: string): SectionValidationStatus | undefined => {
      // Type guard to ensure section is valid
      if (!(sectionId in REQUIRED_FIELDS)) {
        return undefined;
      }

      const section = sectionId as keyof typeof REQUIRED_FIELDS;
      const sectionFields = getRequiredFieldsForSection(section);

      // Without errors parameter, we return a default status
      // In practice, this should be called with errors from validation context
      const errorCount = 0; // Default to no errors
      const totalFields = sectionFields.length;
      const isValid = errorCount === 0;
      const progressPercentage =
        totalFields > 0 ? Math.round(((totalFields - errorCount) / totalFields) * 100) : 100;

      return {
        sectionId,
        sectionName: section,
        section,
        isValid,
        errorCount,
        totalFields,
        progressPercentage,
        hasValidated: false,
      };
    };
  }, []);

  // State management for validation progress
  const [currentErrors, setCurrentErrors] = useState<Record<string, string>>({});
  const [sectionStatuses, setSectionStatuses] = useState<SectionValidationStatus[]>([]);

  // Calculate current summary and progress
  const summary = useMemo(() => getValidationSummary(currentErrors), [getValidationSummary, currentErrors]);
  const progress = useMemo(() => getValidationProgress(currentErrors), [getValidationProgress, currentErrors]);

  /**
   * Update section validation status
   */
  const updateSectionStatus = useCallback((sectionId: string, status: Partial<SectionValidationStatus>) => {
    setSectionStatuses(prev => {
      const existingIndex = prev.findIndex(s => s.sectionId === sectionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...status };
        return updated;
      } else {
        const defaultStatus = getSectionValidationStatus(sectionId);
        if (defaultStatus) {
          return [...prev, { ...defaultStatus, ...status }];
        }
        return prev;
      }
    });
  }, [getSectionValidationStatus]);

  /**
   * Reset validation progress
   */
  const resetProgress = useCallback(() => {
    setCurrentErrors({});
    setSectionStatuses([]);
  }, []);

  /**
   * Get all section validation statuses
   */
  const getAllSectionStatuses = useMemo(() => {
    return (): SectionValidationStatus[] => {
      const sections = Object.keys(REQUIRED_FIELDS) as Array<keyof typeof REQUIRED_FIELDS>;
      return sections.map(section => getSectionValidationStatus(section)).filter((status): status is SectionValidationStatus => status !== undefined);
    };
  }, [getSectionValidationStatus]);

  return {
    summary,
    sectionStatuses,
    progress,
    updateSectionStatus,
    resetProgress,
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
