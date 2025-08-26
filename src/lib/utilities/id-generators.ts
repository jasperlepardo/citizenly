/**
 * ID Generation Utilities
 * Consolidated ID generation and accessibility utilities
 */

/**
 * Generate a unique ID with customizable prefix
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Secure ID generator for form fields with counter
 */
const generateFieldId = (() => {
  let counter = 0;
  return (prefix: string = 'field'): string => {
    return `${prefix}-${Date.now()}-${++counter}`;
  };
})();

/**
 * Generate a unique field ID with proper fallback handling
 */
export function getFieldId(
  htmlFor?: string,
  componentId?: string,
  prefix: string = 'field'
): string {
  return htmlFor || componentId || generateFieldId(prefix);
}

/**
 * Generate related IDs for field accessibility
 */
export function getFieldIds(fieldId: string) {
  return {
    labelId: `${fieldId}-label`,
    helperTextId: `${fieldId}-helper`,
    errorId: `${fieldId}-error`,
  };
}

/**
 * Build aria-describedby string from available elements
 */
export function buildAriaDescribedBy(helperTextId?: string, errorId?: string): string | undefined {
  const ids = [];
  if (helperTextId) ids.push(helperTextId);
  if (errorId) ids.push(errorId);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Build aria-labelledby string for field labeling
 */
export function buildAriaLabelledBy(labelId?: string): string | undefined {
  return labelId || undefined;
}

// Export the internal generator for backward compatibility
export { generateFieldId };
