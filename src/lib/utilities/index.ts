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
  // isValidEmail, - REMOVED: Use @/lib/validation/utilities instead
  // isValidPhilippineMobile, - REMOVED: Use @/lib/validation/utilities instead
  formatPhoneNumber,
} from './string-utils';

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
} from './data-transformers';

// ID generation utilities
export {
  generateId,
  generateFieldId,
  getFieldId,
  getFieldIds,
  buildAriaDescribedBy,
  buildAriaLabelledBy,
} from './id-generators';

// Async utilities
export {
  debounce,
  throttle,
  sleep,
  retry,
} from './async-utils';

// CSS utilities
export {
  cn,
  // mergeClassNames - REMOVED: Use `cn` instead
} from './css-utils';

// Resident utilities (moved to @/lib/business-rules)
// export * from './resident-detail-helpers';  // MOVED to business-rules/
// export * from './resident-helpers';         // MOVED to business-rules/ 
// export * from './resident-listing-helpers'; // MOVED to business-rules/

// Search utilities
export * from './search-utilities';

// Validation utilities (moved to @/lib/validation)
// Use: import from '@/lib/validation/utilities' instead