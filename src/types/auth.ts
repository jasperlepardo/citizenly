/**
 * Authentication and Authorization Types
 * Comprehensive TypeScript interfaces for user authentication, roles, and permissions
 */

// =============================================================================
// USER AND SESSION TYPES
// =============================================================================

/**
 * Authenticated user interface
 */
export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}

/**
 * User profile with extended information
 */
export interface AuthUserProfile {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  phone?: string | null;
  barangay_code: string;
  city_municipality_code?: string | null;
  province_code?: string | null;
  region_code?: string | null;
  role_id: string;
  email_verified: boolean;
  email_verified_at?: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at?: string | null;
  welcome_email_sent: boolean;
  welcome_email_sent_at?: string | null;
  last_login?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication session
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: AuthUser;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: AuthUser | null;
  profile: AuthUserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// =============================================================================
// ROLES AND PERMISSIONS
// =============================================================================

/**
 * User role definition
 */
export interface AuthRole {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: AuthPermission[];
}

/**
 * Permission definition
 */
export interface AuthPermission {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  resource: string;
  action: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Role-permission relationship
 */
export interface RolePermission {
  role_id: string;
  permission_id: string;
  granted_at: string;
  granted_by: string;
}

/**
 * User role assignment
 */
export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string;
  is_active: boolean;
}

// =============================================================================
// AUTHENTICATION REQUESTS AND RESPONSES
// =============================================================================

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Signup request
 */
export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  barangay_code: string;
  confirm_password: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update request
 */
export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Profile update request
 */
export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  barangay_code?: string;
}

/**
 * Authentication response from Supabase
 */
export interface SupabaseAuthResponse {
  data: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
  error: {
    message: string;
    status?: number;
  } | null;
}

/**
 * Profile query result (with role information)
 */
export interface UserProfileQueryResult {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  barangay_code: string;
  auth_roles: {
    name: string;
    display_name: string;
  };
}

// =============================================================================
// AUTHORIZATION AND ACCESS CONTROL
// =============================================================================

/**
 * Resource access levels
 */
export type AccessLevel = 'read' | 'write' | 'admin' | 'owner';

/**
 * Permission check context
 */
export interface PermissionContext {
  resource: string;
  action: string;
  resource_id?: string;
  user_role?: string;
  barangay_code?: string;
}

/**
 * Access control result
 */
export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: string;
  requiredPermission?: string;
}

// =============================================================================
// WEBHOOK AND NOTIFICATION TYPES
// =============================================================================

/**
 * User webhook record for new user events
 */
export interface WebhookUserRecord {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

/**
 * User notification record
 */
export interface UserNotificationRecord {
  id?: string;
  user_id: string;
  notification_type: string;
  metadata: Record<string, unknown>;
  status?: 'pending' | 'sent' | 'failed';
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// AUTHENTICATION PROVIDERS
// =============================================================================

/**
 * Available authentication providers
 */
export type AuthProvider = 'email' | 'google' | 'facebook' | 'github';

/**
 * OAuth provider configuration
 */
export interface OAuthConfig {
  provider: AuthProvider;
  clientId: string;
  clientSecret?: string;
  scopes?: string[];
  redirectUrl?: string;
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Session storage options
 */
export interface SessionStorageOptions {
  key: string;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean;
  expired: boolean;
  user: AuthUser | null;
  error?: string;
}

// =============================================================================
// AUTHENTICATION GUARDS AND MIDDLEWARE
// =============================================================================

/**
 * Route protection configuration
 */
export interface RouteProtection {
  requireAuth: boolean;
  requiredRole?: string;
  requiredPermission?: string;
  redirectTo?: string;
  allowedBarangays?: string[];
}

/**
 * Authentication middleware context
 */
export interface AuthMiddlewareContext {
  user: AuthUser | null;
  profile: AuthUserProfile | null;
  session: AuthSession | null;
  route: string;
  method: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Authentication error types
 */
export type AuthErrorType =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_CONFIRMED'
  | 'ACCOUNT_LOCKED'
  | 'PASSWORD_EXPIRED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'RATE_LIMIT_EXCEEDED';

/**
 * Authentication error
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// FORM TYPES
// =============================================================================

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Signup form data
 */
export interface SignupFormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone: string;
  barangay_code: string;
  agree_to_terms: boolean;
}

/**
 * Profile form data
 */
export interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  barangay_code: string;
}

// =============================================================================
// CONSTANTS AND ENUMS
// =============================================================================

/**
 * Default role names
 */
export const DEFAULT_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

/**
 * Common permission actions
 */
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  EXPORT: 'export',
  IMPORT: 'import',
} as const;

/**
 * Resource types
 */
export const RESOURCE_TYPES = {
  RESIDENTS: 'residents',
  HOUSEHOLDS: 'households',
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;
