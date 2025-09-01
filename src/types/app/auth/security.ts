/**
 * Security Types - Centralized Security Interface Collection
 *
 * @fileoverview Comprehensive security-related TypeScript interfaces
 * for the Citizenly RBI system. Provides type-safe security audit logging,
 * threat detection, and security monitoring structures.
 *
 * @version 1.0.0
 * @since 2025-08-30
 * @author Citizenly Development Team
 */


// =============================================================================
// SECURITY AUDIT TYPES
// =============================================================================

/**
 * Security audit log entry for tracking system operations
 */
export interface SecurityAuditLog {
  id?: string;
  operation: string;
  user_id: string;
  resource_type?: string;
  resource_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}

/**
 * Threat detection event for security monitoring
 */
export interface ThreatDetectionEvent {
  id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  user_id?: string;
  details: Record<string, unknown>;
  timestamp: string;
  mitigated: boolean;
  mitigation_action?: string;
}

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

/**
 * Security severity levels
 */
export const SECURITY_SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type SecuritySeverity = typeof SECURITY_SEVERITY_LEVELS[number];

/**
 * Common security operations
 */
export const SECURITY_OPERATIONS = {
  LOGIN: 'user_login',
  LOGOUT: 'user_logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',
  PERMISSION_DENIED: 'permission_denied',
  DATA_ACCESS: 'data_access',
  DATA_EXPORT: 'data_export',
  API_REQUEST: 'api_request',
  SYSTEM_ERROR: 'system_error',
} as const;

/**
 * Threat event types
 */
export const THREAT_EVENT_TYPES = {
  BRUTE_FORCE: 'brute_force_attempt',
  SQL_INJECTION: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  CSRF_ATTEMPT: 'csrf_attempt',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  MALWARE_DETECTED: 'malware_detected',
  DATA_BREACH: 'data_breach_attempt',
} as const;

// =============================================================================
// THREAT DETECTION TYPES
// =============================================================================

/**
 * Security context for threat detection
 */
export interface SecurityContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  timestamp: string;
}

/**
 * Threat pattern definition
 */
export interface ThreatPattern {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detector: (context: SecurityContext, history: SecurityEvent[]) => boolean;
  mitigation?: (context: SecurityContext) => Promise<void>;
}

/**
 * Security event for threat analysis
 */
export interface SecurityEvent {
  type: string;
  context: SecurityContext;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// SECURITY AUDIT TYPES
// =============================================================================

/**
 * Security issue found during audit
 */
export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category:
    | 'authentication'
    | 'authorization'
    | 'input_validation'
    | 'information_disclosure'
    | 'crypto'
    | 'configuration';
  description: string;
  file?: string;
  recommendation: string;
}

/**
 * Security audit result
 */
export interface SecurityAuditResult {
  passed: boolean;
  issues: SecurityIssue[];
  score: number; // 0-100
}

/**
 * File validation result for security checks
 */
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    hash: string;
  };
}

/**
 * Comprehensive security audit result with detailed categories
 */
export interface ComprehensiveAuditResult {
  overallScore: number;
  passed: boolean;
  categories: {
    authentication: { score: number; issues: string[] };
    authorization: { score: number; issues: string[] };
    inputValidation: { score: number; issues: string[] };
    cryptography: { score: number; issues: string[] };
    configuration: { score: number; issues: string[] };
    informationDisclosure: { score: number; issues: string[] };
    performance: { score: number; issues: string[] };
  };
  summary: string;
}

// =============================================================================
// RATE LIMITING TYPES
// =============================================================================

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

