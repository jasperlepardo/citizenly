/**
 * Utility Types
 * Common utility types and type helpers used across the application
 */

// =============================================================================
// COMMON UTILITY TYPES
// =============================================================================

/**
 * Recent item interface for command menu and recent items functionality
 */
export interface RecentItem {
  id: string;
  title: string;
  description: string;
  type: 'resident' | 'household' | 'search' | 'action';
  href?: string;
  action?: () => void;
  timestamp: number;
  searchQuery?: string;
}

/**
 * Quick statistics for barangay data
 */
export interface QuickStats {
  barangay_code: string;
  total_residents: number;
  senior_citizens: number;
  pwd_count: number;
  registered_voters: number;
  ofw_count: number;
  avg_age: number;
}

/**
 * Standard error response format
 */
export interface StandardErrorResponse {
  error: string;
  message: string;
  code: string;
  timestamp: string;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  environment: 'development' | 'ci' | 'staging' | 'production';
  isCI: boolean;
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  qualityTier: 1 | 2 | 3 | 4;
}

/**
 * Response cache configuration
 */
export interface ResponseCacheConfig {
  ttl: number;
  tags?: string[];
  varyBy?: string[];
  conditions?: {
    methods?: string[];
    statusCodes?: number[];
    contentTypes?: string[];
  };
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Command menu analytics event
 */
export interface CommandMenuAnalyticsEvent {
  type: 'search' | 'navigation' | 'action' | 'error' | 'performance';
  timestamp: number;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

// =============================================================================
// PSGC (Philippine Standard Geographic Code) TYPES
// =============================================================================

/**
 * PSGC query configuration
 */
export interface PSGCQueryConfig {
  /** Database table name */
  table: string;
  /** Fields to select from the table */
  selectFields: string;
  /** Field to filter by (optional) */
  filterField?: string;
  /** Query parameter name for filtering (optional) */
  filterParam?: string;
  /** Context name for error messages */
  errorContext: string;
  /** Order field (defaults to 'name') */
  orderField?: string;
}

/**
 * PSGC option for select components
 */
export interface PSGCOption {
  value: string;
  label: string;
  [key: string]: string | number | boolean | null; // Additional fields from the database
}

/**
 * Make all properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequireBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Omit multiple properties
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;

/**
 * Pick multiple properties
 */
export type PickMultiple<T, K extends keyof T> = Pick<T, K>;

/**
 * Make properties nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Deep partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// =============================================================================
// FUNCTION UTILITY TYPES
// =============================================================================

/**
 * Extract function return type
 */
export type ReturnTypeOf<T extends (...args: any[]) => any> = ReturnType<T>;

/**
 * Extract async function return type
 */
export type AsyncReturnType<T extends (...args: any[]) => Promise<any>> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : any;

/**
 * Extract parameters type from function
 */
export type ParametersOf<T extends (...args: any[]) => any> = Parameters<T>;

/**
 * Make function parameters optional
 */
export type OptionalParameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => infer R
  ? (...args: Partial<P>) => R
  : never;

// =============================================================================
// ARRAY AND OBJECT UTILITY TYPES
// =============================================================================

/**
 * Get array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Get object values type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Get object keys as union type
 */
export type KeysOf<T> = keyof T;

/**
 * Make object keys literal strings
 */
export type StringKeys<T> = Extract<keyof T, string>;

/**
 * Create object type from array of strings
 */
export type ObjectFromKeys<T extends readonly string[]> = {
  [K in T[number]]: any;
};

// =============================================================================
// CONDITIONAL UTILITY TYPES
// =============================================================================

/**
 * Check if type extends another type
 */
export type Extends<T, U> = T extends U ? true : false;

/**
 * If condition, return T, else return F
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;

/**
 * Check if type is any
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Check if type is never
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Check if type is unknown
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

// =============================================================================
// BRAND TYPES
// =============================================================================

/**
 * Create a branded type
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Common branded types
 */
export type UserId = Brand<string, 'UserId'>;
export type ResidentId = Brand<string, 'ResidentId'>;
export type HouseholdId = Brand<string, 'HouseholdId'>;
export type BarangayCode = Brand<string, 'BarangayCode'>;
export type Email = Brand<string, 'Email'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;

// =============================================================================
// FORM AND INPUT UTILITY TYPES
// =============================================================================

/**
 * Extract form data type from form schema
 */
export type FormDataOf<T> = {
  [K in keyof T]: T[K] extends { value: infer V } ? V : T[K];
};

/**
 * Make form fields optional
 */
export type OptionalFormFields<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Form field state
 */
export type FieldState<T = any> = {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
};

/**
 * Form state for all fields
 */
export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FieldState<T[K]>;
};

// =============================================================================
// API UTILITY TYPES
// =============================================================================

/**
 * Extract data type from API response
 */
export type ApiResponseData<T> = T extends { data: infer D } ? D : never;

/**
 * Extract error type from API response
 */
export type ApiResponseError<T> = T extends { error: infer E } ? E : never;

/**
 * Paginated data type
 */
export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
};

// =============================================================================
// CONFIGURATION UTILITY TYPES
// =============================================================================

/**
 * Environment variable type
 */
export type EnvVar = string | undefined;

/**
 * Configuration object with validation
 */
export type Config<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends EnvVar ? string | undefined : T[K];
};

// =============================================================================
// EVENT UTILITY TYPES
// =============================================================================

/**
 * Event handler type
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Async event handler type
 */
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

/**
 * Change event handler type
 */
export type ChangeHandler<T = any> = (value: T) => void;

/**
 * Click event handler type
 */
export type ClickHandler = () => void;

/**
 * Form submit handler type
 */
export type SubmitHandler<T = any> = (data: T) => Promise<void> | void;

// =============================================================================
// PROMISE UTILITY TYPES
// =============================================================================

/**
 * Unwrap promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Promise or value type
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Promise result type
 */
export type PromiseResult<T> = { success: true; data: T } | { success: false; error: Error };

// =============================================================================
// GENERIC UTILITY FUNCTIONS TYPES
// =============================================================================

/**
 * Identity function type
 */
export type Identity<T> = (value: T) => T;

/**
 * Predicate function type
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Mapper function type
 */
export type Mapper<T, U> = (value: T) => U;

/**
 * Reducer function type
 */
export type Reducer<T, U> = (accumulator: U, current: T, index: number) => U;

/**
 * Compare function type
 */
export type Comparator<T> = (a: T, b: T) => number;

// =============================================================================
// SCATTERED UTILITY INTERFACES CONSOLIDATION
// =============================================================================

/**
 * Name parts for form processing
 * Consolidates from src/utils/resident-form-utils.ts
 */
export interface NameParts {
  first_name: string;
  middleName: string;
  last_name: string;
}

/**
 * Unknown form data type
 * Consolidates from src/utils/resident-form-utils.ts
 */
export type UnknownFormData = Record<string, unknown>;

/**
 * Form processing stage types
 * Consolidates from src/utils/resident-form-utils.ts
 */
export type FormProcessingStage = 'transform' | 'security' | 'audit' | 'full';

/**
 * Form processing options
 * Consolidates from src/utils/resident-form-utils.ts
 */
export interface FormProcessingOptions {
  stage?: FormProcessingStage;
  userId?: string;
  sessionId?: string;
  barangayCode?: string;
}

/**
 * Processed form result
 * Consolidates from src/utils/resident-form-utils.ts
 */
export interface ProcessedFormResult {
  transformedData: any; // ResidentFormData type
  auditInfo?: {
    userId: string;
    sessionId: string;
    barangayCode: string;
    timestamp: string;
    fieldCount: number;
    hasPhilSys: boolean;
  };
  securityValidation?: {
    sanitized: boolean;
    flaggedFields: string[];
    riskScore: number;
  };
}

/**
 * Validation state for utilities
 * Consolidates from src/utils/validation-utilities.ts
 */
export interface UtilityValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  hasValidated: boolean;
}

/**
 * Sanitization types for input processing
 * Consolidates from src/utils/input-sanitizer.ts
 */
export type SanitizationType =
  | 'text'
  | 'name'
  | 'email'
  | 'mobile'
  | 'philsys'
  | 'psgc'
  | 'numeric'
  | 'none';

/**
 * Sanitization options
 * Consolidates from src/utils/input-sanitizer.ts
 */
export interface SanitizationOptions {
  maxLength?: number;
  allowEmpty?: boolean;
  customPattern?: RegExp;
  replacement?: string;
  normalizeUnicode?: boolean;
  trim?: boolean;
  trimWhitespace?: boolean;
  removeHtml?: boolean;
  stripHtml?: boolean;
  escapeHtml?: boolean;
  removeScripts?: boolean;
  allowedChars?: RegExp;
}

// =============================================================================
// PWA PERFORMANCE TYPES
// =============================================================================

/**
 * PWA metrics tracking
 * Consolidates from src/lib/performance/pwaPerformanceUtils.ts
 */
export interface PWAMetrics {
  installPromptShown: number;
  installAccepted: number;
  installDismissed: number;
  offlineUsage: number;
  cacheHits: number;
  cacheMisses: number;
  syncOperations: number;
  syncFailures: number;
}

/**
 * PWA performance entry
 * Consolidates from src/lib/performance/pwaPerformanceUtils.ts
 */
export interface PWAPerformanceEntry {
  name: string;
  type: 'cache' | 'sync' | 'install' | 'offline' | 'navigation';
  timestamp: number;
  duration?: number;
  success?: boolean;
  details?: any;
  metadata?: Record<string, any>;
}

// =============================================================================
// OFFLINE DATA TYPES
// =============================================================================

/**
 * Offline stored data entry
 * Consolidates from src/lib/data/offline-storage.ts
 */
export interface OfflineStoredData {
  id: string;
  data: any;
  timestamp: number;
  expiry?: number;
}

/**
 * Pending sync item for offline mode
 * Consolidates from src/lib/data/offline-storage.ts
 */
export interface PendingSyncItem {
  id?: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  type: 'resident' | 'household' | 'user';
  data: any;
  timestamp: number;
  synced: boolean;
  retryCount: number;
}

/**
 * Sync operation result
 * Consolidates from src/lib/data/sync-queue.ts
 */
export interface SyncResult {
  success: boolean;
  error?: string;
  data?: any;
}

// =============================================================================
// GENERAL PERFORMANCE TYPES
// =============================================================================

/**
 * Generic performance metric
 * Consolidates from src/lib/performance/performanceUtils.ts
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Web vitals performance metric
 * Consolidates from src/lib/performance/performanceMonitor.ts
 */
export interface WebVitalsPerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent?: string;
}

/**
 * Component performance tracking data
 * Consolidates from src/lib/performance/performanceUtils.ts
 */
export interface ComponentPerformanceData {
  componentName: string;
  renderTime: number;
  propsSize?: number;
  rerenderCount: number;
  timestamp: number;
}

/**
 * Resource timing information
 * Consolidates from src/lib/performance/performanceMonitor.ts
 */
export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

/**
 * Layout shift entry for performance monitoring
 * Consolidates from src/lib/performance/performanceUtils.ts
 */
export interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources?: Array<{
    node?: {
      tagName: string;
    };
  }>;
}

// =============================================================================
// SEARCH UTILITY TYPES
// =============================================================================

/**
 * Base search configuration
 * Consolidated from src/utils/search-utilities.ts
 */
export interface BaseSearchConfig {
  debounceMs?: number;
  minQueryLength?: number;
  initialQuery?: string;
  onError?: (error: Error) => void;
}

/**
 * Paginated search configuration
 * Consolidated from src/utils/search-utilities.ts
 */
export interface PaginatedSearchConfig extends BaseSearchConfig {
  initialPageSize?: number;
}

/**
 * Search result with pagination
 * Consolidated from src/utils/search-utilities.ts
 */
export interface PaginatedSearchResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/**
 * Search state
 * Consolidated from src/utils/search-utilities.ts
 */
export interface SearchState<T> {
  query: string;
  results: T[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Paginated search state
 * Consolidated from src/utils/search-utilities.ts
 */
export interface PaginatedSearchState<T> extends SearchState<T> {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Search function types
 * Consolidated from src/utils/search-utilities.ts
 */
export type SearchFunction<T> = (query: string) => Promise<T[]>;

export type PaginatedSearchFunction<T, F = Record<string, unknown>> = (params: {
  query: string;
  page: number;
  pageSize: number;
  filters?: F;
}) => Promise<PaginatedSearchResult<T>>;
