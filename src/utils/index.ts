/**
 * Utilities Library Module
 *
 * @description Centralized utility functions for the application.
 * All utility functions are consolidated here to eliminate duplication.
 */

// String utilities - consolidated to lib/utilities
export {
  capitalize,
  toTitleCase,
  truncateText,
  sanitizeString,
  // isValidEmail, - REMOVED: Use @/lib/validation/utilities instead
  // isValidPhilippineMobile, - REMOVED: Use @/lib/validation/utilities instead
  formatPhoneNumber,
} from '../lib/utilities/string-utils';

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
} from '../lib/utilities/data-transformers';

// ID generation utilities - consolidated to lib/utilities
export {
  generateId,
  generateFieldId,
  getFieldId,
  getFieldIds,
  buildAriaDescribedBy,
  buildAriaLabelledBy,
} from '../lib/utilities/id-generators';

// Async utilities - consolidated to lib/utilities
export { debounce, throttle, sleep, retry } from '../lib/utilities/async-utils';

// CSS utilities - consolidated to lib/utilities
export {
  cn,
  // mergeClassNames - REMOVED: Use `cn` instead
} from '../lib/utilities/css-utils';

// Resident utilities - now in lib/utilities
// export * from './resident-detail-helpers';  // REMOVED - duplicate
// export * from './resident-helpers';        // REMOVED - duplicate
// export * from './resident-listing-helpers'; // REMOVED - duplicate

// Search utilities - consolidated to lib/utilities
export * from '../lib/utilities/search-utilities';

// Validation utilities
export * from './validation-utilities';
