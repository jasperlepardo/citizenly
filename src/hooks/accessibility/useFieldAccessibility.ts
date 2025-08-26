/**
 * Accessibility hook for form field components
 * Standardizes ARIA patterns and ID generation for form elements
 */
import { useMemo } from 'react';

import { generateId } from '@/lib/utilities/id-generators';

export interface FieldAccessibilityOptions {
  /** Base identifier for the field */
  baseId?: string;
  /** Whether the field has an error */
  hasError?: boolean;
  /** Whether the field has helper text */
  hasHelperText?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Custom label */
  label?: string;
}

export interface FieldAccessibilityIds {
  /** ID for the field input element */
  field: string;
  /** ID for the field label */
  label: string;
  /** ID for helper text */
  helper: string;
  /** ID for error message */
  error: string;
}

export interface FieldAccessibilityProps {
  /** Generated IDs for field elements */
  ids: FieldAccessibilityIds;
  /** aria-describedby attribute value */
  ariaDescribedBy?: string;
  /** aria-labelledby attribute value */
  ariaLabelledBy: string;
  /** aria-invalid attribute value */
  ariaInvalid: boolean | 'false' | 'true';
  /** aria-required attribute value */
  ariaRequired: boolean | 'false' | 'true';
}

/**
 * Hook for standardizing field accessibility patterns
 * 
 * @example
 * ```tsx
 * function MyInput({ label, error, helperText, required, ...props }) {
 *   const accessibility = useFieldAccessibility({
 *     baseId: props.id || 'my-input',
 *     hasError: !!error,
 *     hasHelperText: !!helperText,
 *     required,
 *     label
 *   });
 * 
 *   return (
 *     <div>
 *       <label id={accessibility.ids.label}>
 *         {label}
 *       </label>
 *       <input
 *         id={accessibility.ids.field}
 *         aria-labelledby={accessibility.ariaLabelledBy}
 *         aria-describedby={accessibility.ariaDescribedBy}
 *         aria-invalid={accessibility.ariaInvalid}
 *         aria-required={accessibility.ariaRequired}
 *         {...props}
 *       />
 *       {helperText && (
 *         <div id={accessibility.ids.helper}>{helperText}</div>
 *       )}
 *       {error && (
 *         <div id={accessibility.ids.error}>{error}</div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFieldAccessibility({
  baseId,
  hasError = false,
  hasHelperText = false,
  required = false,
  label
}: FieldAccessibilityOptions = {}): FieldAccessibilityProps {
  const ids = useMemo(() => {
    const fieldId = baseId || generateId('field');
    return {
      field: fieldId,
      label: `${fieldId}-label`,
      helper: `${fieldId}-helper`,
      error: `${fieldId}-error`,
    };
  }, [baseId]);

  const ariaDescribedBy = useMemo(() => {
    const describedByIds: string[] = [];
    
    if (hasHelperText) {
      describedByIds.push(ids.helper);
    }
    
    if (hasError) {
      describedByIds.push(ids.error);
    }
    
    return describedByIds.length > 0 ? describedByIds.join(' ') : undefined;
  }, [hasHelperText, hasError, ids.helper, ids.error]);

  return {
    ids,
    ariaDescribedBy,
    ariaLabelledBy: ids.label,
    ariaInvalid: hasError,
    ariaRequired: required,
  };
}

/**
 * Hook for field groups/fieldsets accessibility
 */
export function useFieldGroupAccessibility({
  baseId,
  hasError = false,
  required = false,
}: Pick<FieldAccessibilityOptions, 'baseId' | 'hasError' | 'required'> = {}) {
  const ids = useMemo(() => {
    const groupId = baseId || generateId('fieldgroup');
    return {
      group: groupId,
      legend: `${groupId}-legend`,
      error: `${groupId}-error`,
    };
  }, [baseId]);

  const ariaDescribedBy = useMemo(() => {
    return hasError ? ids.error : undefined;
  }, [hasError, ids.error]);

  return {
    ids,
    ariaDescribedBy,
    ariaInvalid: hasError,
    ariaRequired: required,
    role: 'group' as const,
  };
}