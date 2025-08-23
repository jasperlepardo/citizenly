/**
 * Standardized API Response Types
 * Following API Design Standards for consistent responses
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | string[] | string;
    field?: string;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}

export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Security
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
}

export enum Role {
  SUPER_ADMIN = 'super_admin',
  REGION_ADMIN = 'region_admin',
  PROVINCE_ADMIN = 'province_admin',
  CITY_ADMIN = 'city_admin',
  BARANGAY_ADMIN = 'barangay_admin',
  BARANGAY_STAFF = 'barangay_staff',
  RESIDENT = 'resident',
}

export const ROLE_PERMISSIONS = {
  [Role.SUPER_ADMIN]: [
    'system.manage',
    'users.manage',
    'barangays.manage',
    'residents.manage.all',
    'reports.view.all',
    'admin.access',
  ],
  [Role.REGION_ADMIN]: [
    'residents.manage.region',
    'households.manage.region',
    'reports.view.region',
    'exports.create.region',
  ],
  [Role.PROVINCE_ADMIN]: [
    'residents.manage.province',
    'households.manage.province',
    'reports.view.province',
    'exports.create.province',
  ],
  [Role.CITY_ADMIN]: [
    'residents.manage.city',
    'households.manage.city',
    'reports.view.city',
    'exports.create.city',
  ],
  [Role.BARANGAY_ADMIN]: [
    'residents.manage.barangay',
    'households.manage.barangay',
    'reports.view.barangay',
    'exports.create.barangay',
    'admin.access',
  ],
  [Role.BARANGAY_STAFF]: [
    'residents.manage.barangay',
    'households.manage.barangay',
    'reports.view.barangay',
  ],
  [Role.RESIDENT]: ['profile.view.own', 'profile.update.own', 'household.view.own'],
} as const;

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface SortParams {
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface RequestContext {
  userId: string;
  userRole: Role;
  barangayCode?: string;
  cityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  requestId: string;
  timestamp: string;
  path: string;
  method: string;
  ip?: string;
  userAgent?: string;
}
