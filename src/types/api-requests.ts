/**
 * API Request Types
 * Consolidated request interfaces from API routes
 */

// =============================================================================
// HEALTH CHECK TYPES
// =============================================================================

/**
 * Health check response structure
 * Consolidates from src/app/api/health/route.ts
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message: string;
      responseTime?: number;
    };
  };
  system?: {
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
    node?: {
      version: string;
      platform: string;
    };
  };
}

// =============================================================================
// LOGGING TYPES
// =============================================================================

/**
 * Log entry structure
 * Consolidates from src/app/api/logging/route.ts
 */
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | string;
  message: string;
  timestamp: string;
  context?: {
    component?: string;
    action?: string;
    data?: Record<string, unknown>;
    error?: Error;
    userId?: string;
    sessionId?: string;
  } | string;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
  url?: string;
  userAgent?: string;
  environment?: string;
}

/**
 * Client log request
 */
export interface ClientLogRequest {
  entries: LogEntry[];
  source: 'client' | 'server';
  sessionId?: string;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

/**
 * Authentication webhook payload
 * Consolidates from src/app/api/auth/webhook/route.ts
 */
export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown>;
  schema: string;
}

/**
 * Webhook verification data
 */
export interface WebhookVerification {
  signature: string;
  timestamp: number;
  payload: string;
}

// =============================================================================
// PROFILE CREATION TYPES
// =============================================================================

/**
 * Profile creation request
 * Consolidates from src/app/api/auth/create-profile/route.ts
 */
export interface CreateProfileRequest {
  id?: string; // Optional ID for backward compatibility
  userId: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  barangay_code: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  role_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Profile creation response
 */
export interface CreateProfileResponse {
  profile: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    barangay_code: string;
    role_id: string;
    created_at: string;
  };
  onboarding_required: boolean;
  welcome_email_sent: boolean;
}

// =============================================================================
// TEST AND DEBUGGING TYPES
// =============================================================================

/**
 * Test results structure
 * Consolidates from src/app/api/auth/test-profile/route.ts
 */
export interface TestResults {
  test_name: string;
  status: 'pass' | 'fail' | 'skip';
  duration_ms: number;
  message?: string;
  details?: Record<string, unknown>;
  assertions?: Array<{
    description: string;
    passed: boolean;
    expected?: unknown;
    actual?: unknown;
  }>;
}

/**
 * Test suite results
 */
export interface TestSuiteResults {
  suite_name: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  tests: TestResults[];
}

/**
 * Profile test results structure
 * Consolidates from src/app/api/auth/test-profile/route.ts
 */
export interface ProfileTestResults {
  timestamp: string;
  userId: string;
  tests: {
    adminUserLookup?: {
      success: boolean;
      hasData?: boolean;
      hasUser?: boolean;
      error: string | null;
      confirmed?: boolean;
    };
    userInList?: {
      success: boolean;
      totalUsers?: number;
      userFound?: boolean;
      error: string | null;
    };
    existingProfile?: {
      success: boolean;
      profileExists?: boolean;
      error: string | null;
    };
    profileCreation?: {
      success: boolean;
      profileCreated?: boolean;
      error: string | null;
      errorCode?: string | null;
    };
  };
}

/**
 * Notification record structure
 * Consolidates from src/app/api/auth/process-notifications/route.ts
 */
export interface NotificationRecord {
  id: string;
  user_id: string;
  notification_type: string;
  metadata: Record<string, unknown>;
  retry_count: number;
}

// =============================================================================
// ADMIN USER TYPES
// =============================================================================

/**
 * Create user request for admin endpoints
 * Consolidates from src/app/api/admin/users/route.ts
 * Note: Uses camelCase to match frontend API usage
 */
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  mobileNumber?: string;
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  roleId: string;
  isActive?: boolean;
  emailVerified?: boolean;
  sendWelcomeEmail?: boolean;
}

/**
 * User management request
 */
export interface UserManagementRequest {
  action: 'activate' | 'deactivate' | 'reset_password' | 'change_role' | 'delete';
  user_ids: string[];
  reason?: string;
  new_role_id?: string;
  notify_user?: boolean;
}

/**
 * Bulk user operation response
 */
export interface BulkUserOperationResponse {
  successful: string[];
  failed: Array<{
    user_id: string;
    error: string;
    code?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// =============================================================================
// IMPORT/EXPORT TYPES
// =============================================================================

/**
 * Data export request
 */
export interface DataExportRequest {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  resource: 'residents' | 'households' | 'users';
  filters?: Record<string, unknown>;
  fields?: string[];
  include_related?: boolean;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

/**
 * Data import request
 */
export interface DataImportRequest {
  format: 'csv' | 'xlsx' | 'json';
  resource: 'residents' | 'households';
  file_url: string;
  mapping?: Record<string, string>;
  validation_options?: {
    skip_duplicates?: boolean;
    validate_references?: boolean;
    strict_mode?: boolean;
  };
}

/**
 * Import/export job status
 */
export interface ImportExportJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  resource: string;
  format: string;
  progress?: {
    total_records: number;
    processed_records: number;
    successful_records: number;
    failed_records: number;
  };
  file_url?: string;
  error_details?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}