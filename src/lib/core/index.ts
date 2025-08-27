/**
 * Core Utilities Index
 * @description Essential utility functions used throughout the application
 */

// String utilities
export {
  capitalize,
  toTitleCase,
  truncateText,
  truncate,
  sanitizeString,
  formatPhoneNumber,
} from '@/utils/string-utils';

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
} from '@/utils/data-transformers';

// ID generation utilities
export {
  generateId,
  generateFieldId,
  getFieldId,
  getFieldIds,
  buildAriaDescribedBy,
  buildAriaLabelledBy,
} from '@/utils/id-generators';

// Async utilities
export { debounce, throttle, sleep, retry } from '@/utils/async-utils';

// CSS utilities
export {
  cn,
  // mergeClassNames - REMOVED: Use `cn` instead
} from '@/utils/css-utils';

// Business rules
export {
  calculateAge,
  isOutOfSchoolChildren,
  isOutOfSchoolYouth,
  isSeniorCitizen,
  isEmployed,
  isUnemployed,
  isIndigenousPeople,
  EMPLOYED_STATUSES,
  UNEMPLOYED_STATUSES,
  INDIGENOUS_ETHNICITIES,
} from '../business-rules';
