/**
 * Application Constants
 * Consolidated constants from across the application
 */

// =============================================================================
// API CONFIGURATION CONSTANTS
// =============================================================================

/**
 * API rate limiting constants
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts, please try again later.',
  },
  SIGNUP: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many signup attempts, please try again later.',
  },
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset attempts, please try again later.',
  },

  // Data endpoints
  RESIDENTS_CREATE: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many create requests, please slow down.',
  },
  RESIDENTS_UPDATE: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many update requests, please slow down.',
  },
  SEARCH: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many search requests, please slow down.',
  },

  // General API
  DEFAULT: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests, please try again later.',
  },
} as const;

/**
 * Cache TTL configurations in seconds
 */
export const CACHE_TTL = {
  // Static reference data
  PSGC_DATA: 24 * 60 * 60, // 24 hours
  PSOC_DATA: 24 * 60 * 60, // 24 hours
  ENUM_OPTIONS: 12 * 60 * 60, // 12 hours

  // Dynamic data
  USER_PROFILE: 5 * 60, // 5 minutes
  DASHBOARD_STATS: 2 * 60, // 2 minutes
  SEARCH_RESULTS: 1 * 60, // 1 minute

  // Short-lived cache
  FORM_OPTIONS: 30, // 30 seconds
  VALIDATION_RESULTS: 10, // 10 seconds

  // Long-lived cache
  GEOGRAPHIC_HIERARCHY: 7 * 24 * 60 * 60, // 7 days
  SYSTEM_CONFIG: 30 * 60, // 30 minutes
} as const;

/**
 * Cache size limits (number of entries)
 */
export const CACHE_LIMITS = {
  SEARCH_CACHE: 1000,
  USER_CACHE: 500,
  FORM_CACHE: 100,
  VALIDATION_CACHE: 200,
  GEOGRAPHIC_CACHE: 10000,
} as const;

/**
 * Timeout configurations for different types of requests
 */
export const API_TIMEOUTS = {
  // Fast operations
  VALIDATION: 2000, // 2 seconds
  SEARCH: 5000, // 5 seconds
  CACHE_LOOKUP: 1000, // 1 second

  // Standard operations
  CRUD_OPERATIONS: 10000, // 10 seconds
  FORM_SUBMISSION: 15000, // 15 seconds
  FILE_UPLOAD: 30000, // 30 seconds

  // Slow operations
  BULK_OPERATIONS: 60000, // 60 seconds
  REPORT_GENERATION: 120000, // 2 minutes
  DATA_EXPORT: 300000, // 5 minutes
} as const;

// =============================================================================
// REQUEST SIZE LIMITS
// =============================================================================

/**
 * Request size limits in bytes
 */
export const REQUEST_SIZE_LIMITS = {
  JSON_PAYLOAD: 1024 * 1024, // 1MB
  FILE_UPLOAD: 10 * 1024 * 1024, // 10MB
  IMAGE_UPLOAD: 5 * 1024 * 1024, // 5MB
  BULK_DATA: 50 * 1024 * 1024, // 50MB
} as const;

// =============================================================================
// RETRY CONFIGURATIONS
// =============================================================================

/**
 * Retry configurations for failed requests
 */
export const RETRY_CONFIG = {
  DEFAULT: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 10000,
  },
  CRITICAL: {
    maxAttempts: 5,
    delayMs: 500,
    backoffMultiplier: 1.5,
    maxDelayMs: 5000,
  },
  NON_CRITICAL: {
    maxAttempts: 2,
    delayMs: 2000,
    backoffMultiplier: 2,
    maxDelayMs: 8000,
  },
} as const;

// =============================================================================
// API RESPONSE LIMITS
// =============================================================================

/**
 * Limits for API responses
 */
export const RESPONSE_LIMITS = {
  // Pagination limits
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MIN_PAGE_SIZE: 1,

  // Search limits
  MAX_SEARCH_RESULTS: 500,
  DEFAULT_SEARCH_RESULTS: 50,

  // Export limits
  MAX_EXPORT_RECORDS: 10000,
  MAX_EXPORT_SIZE: 100 * 1024 * 1024, // 100MB
} as const;

// =============================================================================
// SECURITY CONFIGURATIONS
// =============================================================================

/**
 * Security-related API configurations
 */
export const SECURITY_CONFIG = {
  // Session configurations
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes

  // Token configurations
  ACCESS_TOKEN_TTL: 15 * 60, // 15 minutes
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60, // 7 days

  // Password configurations
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,

  // Account lockout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

// =============================================================================
// FORM CONSTANTS
// =============================================================================

/**
 * Form validation constants
 */
export const FORM_VALIDATION = {
  // Field lengths
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,

  // Philippine specific
  PHILSYS_ID_LENGTH: 12,
  VOTER_ID_LENGTH: 18,

  // Regex patterns
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^(\+63|0)?\d{10,11}$/,
  PHILSYS_PATTERN: /^\d{4}-\d{4}-\d{4}$/,

  // Age limits
  MIN_AGE: 0,
  MAX_AGE: 150,
  LEGAL_AGE: 18,
} as const;

/**
 * Form field requirements
 */
export const FORM_FIELDS = {
  REQUIRED: {
    PERSONAL_INFO: [
      'first_name',
      'last_name',
      'sex',
      'date_of_birth',
      'civil_status',
      'citizenship',
    ],
    CONTACT_INFO: ['barangay_code'],
    HOUSEHOLD_INFO: [
      'household_head_first_name',
      'household_head_last_name',
      'household_type',
      'family_position',
    ],
  },

  OPTIONAL: {
    PERSONAL_INFO: ['middle_name', 'name_suffix', 'religion', 'ethnicity', 'philsys_id'],
    CONTACT_INFO: ['phone', 'email', 'street_address'],
  },
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MOBILE_PAGE_SIZE: 10,

  // Specific contexts
  SEARCH_RESULTS: 15,
  TABLE_ROWS: 25,
  DASHBOARD_ITEMS: 10,
} as const;

/**
 * Loading and debounce delays (in milliseconds)
 */
export const UI_DELAYS = {
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,
  LOADING_SPINNER_MIN: 200,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION: 200,

  // Progressive loading
  SKELETON_MIN_TIME: 300,
  LAZY_LOAD_DELAY: 100,
} as const;

/**
 * Modal and dialog sizes
 */
export const MODAL_SIZES = {
  SMALL: { width: '400px', maxWidth: '90vw' },
  MEDIUM: { width: '600px', maxWidth: '90vw' },
  LARGE: { width: '800px', maxWidth: '95vw' },
  XLARGE: { width: '1200px', maxWidth: '95vw' },
  FULLSCREEN: { width: '100vw', maxWidth: '100vw' },
} as const;

// =============================================================================
// FILE AND MEDIA CONSTANTS
// =============================================================================

/**
 * File upload constants
 */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 25 * 1024 * 1024, // 25MB

  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],

  // File name constraints
  MAX_FILENAME_LENGTH: 255,
  ALLOWED_FILENAME_CHARS: /^[a-zA-Z0-9._-]+$/,
} as const;

// =============================================================================
// GEOGRAPHIC CONSTANTS
// =============================================================================

/**
 * Philippine geographic constants
 */
export const PHILIPPINES = {
  COUNTRY_CODE: 'PH',
  CURRENCY: 'PHP',
  TIMEZONE: 'Asia/Manila',

  // Region codes
  REGIONS: [
    'NCR',
    'CAR',
    'I',
    'II',
    'III',
    'IV-A',
    'IV-B',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
    'XIII',
    'ARMM',
  ],

  // Administrative levels
  ADMIN_LEVELS: {
    REGION: 1,
    PROVINCE: 2,
    CITY_MUNICIPALITY: 3,
    BARANGAY: 4,
  },
} as const;

// =============================================================================
// DATA VALIDATION CONSTANTS
// =============================================================================

/**
 * Data validation rules
 */
export const VALIDATION_RULES = {
  // Required field indicators
  REQUIRED_MARKER: '*',
  ERROR_CLASS: 'error',
  SUCCESS_CLASS: 'success',
  WARNING_CLASS: 'warning',

  // Date constraints
  MIN_BIRTH_YEAR: 1900,
  MAX_BIRTH_YEAR: new Date().getFullYear(),
  DATE_FORMAT: 'YYYY-MM-DD',
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',

  // Name validation
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  NAME_PATTERN: /^[a-zA-ZñÑ\s\-.']+$/,

  // Address validation
  ADDRESS_MAX_LENGTH: 500,
  STREET_MAX_LENGTH: 200,

  // Philippine specific validation
  BARANGAY_CODE_LENGTH: 9,
  CITY_CODE_LENGTH: 6,
  PROVINCE_CODE_LENGTH: 4,
  REGION_CODE_LENGTH: 2,
} as const;

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

/**
 * Security configuration constants
 */
export const SECURITY = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: false,

  // Session management
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days

  // CSRF protection
  CSRF_TOKEN_LENGTH: 32,
  CSRF_HEADER_NAME: 'X-CSRF-Token',

  // Content Security Policy
  CSP_REPORT_URI: '/api/security/csp-report',

  // Rate limiting keys
  RATE_LIMIT_HEADERS: {
    LIMIT: 'X-RateLimit-Limit',
    REMAINING: 'X-RateLimit-Remaining',
    RESET: 'X-RateLimit-Reset',
  },
} as const;

// =============================================================================
// NOTIFICATION CONSTANTS
// =============================================================================

/**
 * Notification and messaging constants
 */
export const NOTIFICATIONS = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },

  DURATIONS: {
    SHORT: 3000, // 3 seconds
    MEDIUM: 5000, // 5 seconds
    LONG: 8000, // 8 seconds
    PERSISTENT: 0, // Manual dismiss only
  },

  POSITIONS: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    TOP_CENTER: 'top-center',
    BOTTOM_CENTER: 'bottom-center',
  },

  MAX_VISIBLE: 5,
  ANIMATION_DURATION: 300,
} as const;
