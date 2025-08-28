/**
 * Authentication and Authorization Types - Database-Aligned Auth System
 *
 * @fileoverview Comprehensive authentication and authorization TypeScript interfaces
 * that provide 100% database schema alignment for the Citizenly RBI authentication system.
 * Built on Supabase Auth with multi-level geographic access control for Philippine LGUs.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 *
 * Database Tables Covered:
 * - auth.users (Supabase managed authentication users)
 * - auth_user_profiles (Extended user profile with geographic access - 21 fields)
 * - auth_roles (Role definitions with JSONB permissions - 6 fields)
 * - auth_barangay_accounts (Multi-barangay access control - 8 fields)
 *
 * Key Features:
 * - 100% Supabase Auth integration with custom profile extensions
 * - Multi-level geographic access control (Region → Province → City → Barangay)
 * - Role-based permission system with JSONB flexibility
 * - Complete authentication flow management (login, signup, session)
 * - Professional error handling and validation
 *
 * @example Basic Authentication Flow
 * ```typescript
 * import { AuthState, LoginRequest, AuthUserProfile } from '@/types/auth';
 *
 * const authState: AuthState = {
 *   user: supabaseUser,
 *   profile: userProfile, // Extended with barangay access
 *   session: supabaseSession,
 *   isAuthenticated: true,
 *   isLoading: false,
 *   error: null
 * };
 * ```
 *
 * @example Role-Based Access Control
 * ```typescript
 * import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';
 *
 * const checkPermission = (userRole: UserRole, permission: string): boolean => {
 *   return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
 * };
 * ```
 */

// =============================================================================
// USER AND SESSION TYPES (Database-Aligned)
// =============================================================================

// Import canonical database records
import type { AuthUserProfileRecord, AuthRoleRecord } from './database';

/**
 * Authenticated user interface - matches Supabase auth.users structure
 * @description Core Supabase user object with authentication metadata
 */
export interface AuthUser {
  id: string; // UUID - matches auth.users(id)
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
 * User profile with extended information - extends canonical database record
 * @description Composition of AuthUserProfileRecord + computed fields for UI/auth operations
 *
 * @example Complete User Profile
 * ```typescript
 * const userProfile: AuthUserProfile = {
 *   // All AuthUserProfileRecord fields inherited from database.ts
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   first_name: 'Maria',
 *   last_name: 'Santos',
 *   email: 'maria.santos@email.com',
 *   role_id: '123e4567-e89b-12d3-a456-426614174000',
 *   barangay_code: '1374000001',
 *   // ... all other database fields
 *
 *   // Computed/joined fields for UI
 *   role: roleRecord,
 *   full_name: 'Maria Santos',
 *   display_location: 'Poblacion, Makati City'
 * };
 * ```
 */
export interface AuthUserProfile extends AuthUserProfileRecord {
  // Computed/joined fields for UI and auth operations
  role?: AuthRoleRecord; // Resolved from role_id
  full_name?: string; // Computed: first_name + middle_name + last_name
  display_location?: string; // Formatted geographic location
  lastActivity?: string; // Last user activity timestamp
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
 * User role definition - extends canonical database record
 * @description Role information with computed display fields
 */
export interface AuthRole extends AuthRoleRecord {
  // Computed fields for UI display
  display_name?: string; // Formatted role name for UI
  permission_count?: number; // Count of permissions in JSONB
  user_count?: number; // Number of users with this role
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
export interface UserRoleAssignment {
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
// ROLE ENUMS AND PERMISSIONS
// =============================================================================

/**
 * User role enumeration
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  REGION_ADMIN = 'region_admin',
  PROVINCE_ADMIN = 'province_admin',
  CITY_ADMIN = 'city_admin',
  BARANGAY_ADMIN = 'barangay_admin',
  BARANGAY_STAFF = 'barangay_staff',
  RESIDENT = 'resident',
}

/**
 * User role types
 */
export type UserRole =
  | 'super_admin'
  | 'region_admin'
  | 'province_admin'
  | 'city_admin'
  | 'barangay_admin'
  | 'barangay_user'
  | 'read_only';

/**
 * User profile interface for auth service compatibility
 * @deprecated Use AuthUserProfile instead - extends AuthUserProfileRecord from database.ts
 */
export type UserProfile = AuthUserProfile;

/**
 * Registration data interface for auth service compatibility
 * @deprecated Use SignupRequest instead for consistent registration handling
 */
export type RegistrationData = SignupRequest;

/**
 * Role-based permission mapping
 */
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

// =============================================================================
// REQUEST CONTEXT AND PARAMETERS
// =============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Sort parameters
 */
export interface SortParams {
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Authenticated user information for API routes
 * Consolidates AuthenticatedUser from households/route.ts and residents/route.ts
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  barangayCode?: string;
  cityCode?: string;
  provinceCode?: string;
  regionCode?: string;
}

/**
 * Request context for authentication
 */
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

// =============================================================================
// VALIDATION DATA TYPES
// =============================================================================

/**
 * User registration validation data
 * @deprecated Use RegistrationData instead (which points to SignupRequest)
 * @deprecated This is a duplicate alias - will be removed in future cleanup
 */
export type UserRegistrationData = RegistrationData;

/**
 * Login validation data
 * @deprecated Use LoginRequest instead for consistent login handling
 */
export type LoginData = LoginRequest;

/**
 * Password change validation data
 * @deprecated Use PasswordUpdateRequest instead for consistent password handling
 */
export type PasswordChangeData = PasswordUpdateRequest;
