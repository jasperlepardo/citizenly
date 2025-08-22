/**
 * Utilities Library Module
 * 
 * @description Centralized utility functions for the application.
 * All utility functions are consolidated here to eliminate duplication.
 */

// String utilities
export {
  capitalize,
  toTitleCase,
  truncateText,
  sanitizeString,
  isValidEmail,
  isValidPhilippineMobile,
  formatPhoneNumber,
} from './stringUtils';

// Data transformation utilities
export {
  isEmpty,
  deepClone,
  groupBy,
  removeDuplicates,
  sortBy,
  formatCurrency,
  formatDate,
  parseQueryString,
  buildQueryString,
} from './dataTransformers';

// ID generation utilities
export {
  generateId,
  generateFieldId,
  getFieldId,
  getFieldIds,
  buildAriaDescribedBy,
  buildAriaLabelledBy,
} from './idGenerators';

// Async utilities
export {
  debounce,
  throttle,
  sleep,
  retry,
} from './asyncUtils';

// CSS utilities
export {
  cn,
  mergeClassNames,
} from './cssUtils';

// Resident utilities
export * from './residentDetailHelpers';
export * from './residentHelpers';
export * from './residentListingHelpers';

// Search utilities
export * from './searchUtilities';

// Validation utilities
export * from './validationUtilities';