/**
 * Audit Logging System
 * Comprehensive logging for security events and user actions
 */

import { createClient } from '@supabase/supabase-js';
import { RequestContext, ErrorCode } from './api-types';
import { logger } from './secure-logger';

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  PASSWORD_CHANGE = 'password_change',

  // Authorization events
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PERMISSION_ESCALATION = 'permission_escalation',

  // Data operations
  RESIDENT_CREATE = 'resident_create',
  RESIDENT_UPDATE = 'resident_update',
  RESIDENT_DELETE = 'resident_delete',
  RESIDENT_VIEW = 'resident_view',
  HOUSEHOLD_CREATE = 'household_create',
  HOUSEHOLD_UPDATE = 'household_update',
  HOUSEHOLD_DELETE = 'household_delete',

  // User management
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_ACTIVATE = 'user_activate',
  USER_DEACTIVATE = 'user_deactivate',
  ROLE_CHANGE = 'role_change',

  // Security events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  INVALID_TOKEN = 'invalid_token',
  CSRF_VIOLATION = 'csrf_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',

  // System events
  API_ERROR = 'api_error',
  DATABASE_ERROR = 'database_error',
  EXTERNAL_SERVICE_ERROR = 'external_service_error',

  // Data export/import
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  BULK_OPERATION = 'bulk_operation',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AuditEvent {
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userRole?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  outcome: 'success' | 'failure';
  details?: Record<string, any>;
  context: RequestContext;
  errorCode?: ErrorCode;
  errorMessage?: string;
}

interface AuditLogEntry {
  id?: string;
  event_type: string;
  severity: string;
  user_id?: string;
  user_role?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  outcome: string;
  details?: Record<string, any>;
  error_code?: string;
  error_message?: string;
  request_id: string;
  ip_address?: string;
  user_agent?: string;
  path: string;
  method: string;
  timestamp: string;
  barangay_code?: string;
  city_code?: string;
  province_code?: string;
  region_code?: string;
}

/**
 * Mask sensitive data in audit logs
 */
function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'ssn',
    'social_security',
    'credit_card',
    'bank_account',
    'api_key',
    'secret',
    'private_key',
    'access_token',
  ];

  const masked = { ...data };

  Object.keys(masked).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  });

  return masked;
}

/**
 * Get severity level based on event type
 */
function getEventSeverity(eventType: AuditEventType): AuditSeverity {
  const severityMap: Record<AuditEventType, AuditSeverity> = {
    // Critical security events
    [AuditEventType.SQL_INJECTION_ATTEMPT]: AuditSeverity.CRITICAL,
    [AuditEventType.PERMISSION_ESCALATION]: AuditSeverity.CRITICAL,
    [AuditEventType.SUSPICIOUS_ACTIVITY]: AuditSeverity.CRITICAL,

    // High severity events
    [AuditEventType.LOGIN_FAILED]: AuditSeverity.HIGH,
    [AuditEventType.ACCESS_DENIED]: AuditSeverity.HIGH,
    [AuditEventType.RATE_LIMIT_EXCEEDED]: AuditSeverity.HIGH,
    [AuditEventType.USER_DELETE]: AuditSeverity.HIGH,
    [AuditEventType.ROLE_CHANGE]: AuditSeverity.HIGH,
    [AuditEventType.DATA_EXPORT]: AuditSeverity.HIGH,

    // Medium severity events
    [AuditEventType.LOGIN_SUCCESS]: AuditSeverity.MEDIUM,
    [AuditEventType.USER_CREATE]: AuditSeverity.MEDIUM,
    [AuditEventType.USER_UPDATE]: AuditSeverity.MEDIUM,
    [AuditEventType.RESIDENT_DELETE]: AuditSeverity.MEDIUM,
    [AuditEventType.HOUSEHOLD_DELETE]: AuditSeverity.MEDIUM,
    [AuditEventType.DATA_IMPORT]: AuditSeverity.MEDIUM,

    // Low severity events
    [AuditEventType.LOGOUT]: AuditSeverity.LOW,
    [AuditEventType.RESIDENT_VIEW]: AuditSeverity.LOW,
    [AuditEventType.RESIDENT_CREATE]: AuditSeverity.LOW,
    [AuditEventType.RESIDENT_UPDATE]: AuditSeverity.LOW,
    [AuditEventType.HOUSEHOLD_CREATE]: AuditSeverity.LOW,
    [AuditEventType.HOUSEHOLD_UPDATE]: AuditSeverity.LOW,
    [AuditEventType.TOKEN_REFRESH]: AuditSeverity.LOW,
    [AuditEventType.ACCESS_GRANTED]: AuditSeverity.LOW,
    [AuditEventType.PASSWORD_CHANGE]: AuditSeverity.LOW,
    [AuditEventType.USER_ACTIVATE]: AuditSeverity.LOW,
    [AuditEventType.USER_DEACTIVATE]: AuditSeverity.LOW,
    [AuditEventType.API_ERROR]: AuditSeverity.LOW,
    [AuditEventType.DATABASE_ERROR]: AuditSeverity.LOW,
    [AuditEventType.EXTERNAL_SERVICE_ERROR]: AuditSeverity.LOW,
    [AuditEventType.INVALID_TOKEN]: AuditSeverity.LOW,
    [AuditEventType.CSRF_VIOLATION]: AuditSeverity.LOW,
    [AuditEventType.BULK_OPERATION]: AuditSeverity.LOW,
  };

  return severityMap[eventType] || AuditSeverity.LOW;
}

/**
 * Main audit logging function
 */
export async function auditLog(event: Partial<AuditEvent>): Promise<void> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fill in default values
    const auditEvent: AuditEvent = {
      eventType: event.eventType!,
      severity: event.severity || getEventSeverity(event.eventType!),
      userId: event.userId,
      userRole: event.userRole,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      action: event.action!,
      outcome: event.outcome || 'success',
      details: event.details ? maskSensitiveData(event.details) : undefined,
      context: event.context!,
      errorCode: event.errorCode,
      errorMessage: event.errorMessage,
    };

    // Create audit log entry
    const logEntry: AuditLogEntry = {
      event_type: auditEvent.eventType,
      severity: auditEvent.severity,
      user_id: auditEvent.userId,
      user_role: auditEvent.userRole,
      resource_type: auditEvent.resourceType,
      resource_id: auditEvent.resourceId,
      action: auditEvent.action,
      outcome: auditEvent.outcome,
      details: auditEvent.details,
      error_code: auditEvent.errorCode,
      error_message: auditEvent.errorMessage,
      request_id: auditEvent.context.requestId,
      ip_address: auditEvent.context.ip,
      user_agent: auditEvent.context.userAgent,
      path: auditEvent.context.path,
      method: auditEvent.context.method,
      timestamp: auditEvent.context.timestamp,
      barangay_code: auditEvent.context.barangayCode,
      city_code: auditEvent.context.cityCode,
      province_code: auditEvent.context.provinceCode,
      region_code: auditEvent.context.regionCode,
    };

    // Insert into audit_logs table
    const { error } = await supabaseAdmin.from('audit_logs').insert(logEntry);

    if (error) {
      logger.error('Failed to insert audit log', { error, auditEvent });
      // Don't throw error to avoid disrupting main application flow
    }

    // Log critical events to console for immediate attention
    if (auditEvent.severity === AuditSeverity.CRITICAL) {
      logger.error('CRITICAL SECURITY EVENT', {
        eventType: auditEvent.eventType,
        userId: auditEvent.userId,
        ip: auditEvent.context.ip,
        path: auditEvent.context.path,
        details: auditEvent.details,
        critical: true,
      });
    }
  } catch (error) {
    logger.error('Audit logging service error', { error });
    // Don't throw error to avoid disrupting main application flow
  }
}

/**
 * Audit user authentication events
 */
export async function auditAuth(
  eventType: AuditEventType.LOGIN_SUCCESS | AuditEventType.LOGIN_FAILED | AuditEventType.LOGOUT,
  context: RequestContext,
  details?: Record<string, any>
): Promise<void> {
  await auditLog({
    eventType,
    userId: context.userId !== 'anonymous' ? context.userId : undefined,
    action: eventType.replace('_', ' '),
    outcome: eventType.includes('failed') ? 'failure' : 'success',
    details,
    context,
  });
}

/**
 * Audit resource access events
 */
export async function auditResourceAccess(
  resourceType: string,
  resourceId: string,
  action: string,
  outcome: 'success' | 'failure',
  context: RequestContext,
  details?: Record<string, any>
): Promise<void> {
  const eventType =
    outcome === 'success' ? AuditEventType.ACCESS_GRANTED : AuditEventType.ACCESS_DENIED;

  await auditLog({
    eventType,
    userId: context.userId,
    userRole: context.userRole,
    resourceType,
    resourceId,
    action,
    outcome,
    details,
    context,
  });
}

/**
 * Audit data operations
 */
export async function auditDataOperation(
  operation: 'create' | 'update' | 'delete' | 'view',
  resourceType: string,
  resourceId: string,
  context: RequestContext,
  details?: Record<string, any>
): Promise<void> {
  const eventTypeMap: Record<string, AuditEventType> = {
    create_resident: AuditEventType.RESIDENT_CREATE,
    update_resident: AuditEventType.RESIDENT_UPDATE,
    delete_resident: AuditEventType.RESIDENT_DELETE,
    view_resident: AuditEventType.RESIDENT_VIEW,
    create_household: AuditEventType.HOUSEHOLD_CREATE,
    update_household: AuditEventType.HOUSEHOLD_UPDATE,
    delete_household: AuditEventType.HOUSEHOLD_DELETE,
    create_user: AuditEventType.USER_CREATE,
    update_user: AuditEventType.USER_UPDATE,
    delete_user: AuditEventType.USER_DELETE,
  };

  const eventKey = `${operation}_${resourceType}`;
  const eventType = eventTypeMap[eventKey];

  if (eventType) {
    await auditLog({
      eventType,
      userId: context.userId,
      userRole: context.userRole,
      resourceType,
      resourceId,
      action: `${operation} ${resourceType}`,
      outcome: 'success',
      details,
      context,
    });
  }
}

/**
 * Audit security violations
 */
export async function auditSecurityViolation(
  eventType: AuditEventType,
  context: RequestContext,
  details?: Record<string, any>,
  errorCode?: ErrorCode
): Promise<void> {
  await auditLog({
    eventType,
    userId: context.userId !== 'anonymous' ? context.userId : undefined,
    action: 'security_violation',
    outcome: 'failure',
    details,
    context,
    errorCode,
  });
}

/**
 * Audit API errors
 */
export async function auditError(
  error: Error,
  context: RequestContext,
  errorCode?: ErrorCode
): Promise<void> {
  await auditLog({
    eventType: AuditEventType.API_ERROR,
    userId: context.userId !== 'anonymous' ? context.userId : undefined,
    action: 'api_error',
    outcome: 'failure',
    details: {
      errorName: error.name,
      errorStack: error.stack?.split('\n').slice(0, 5), // First 5 lines only
    },
    context,
    errorCode,
    errorMessage: error.message,
  });
}

/**
 * Create audit trail query builder for investigations
 */
export function createAuditQuery(filters: {
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  resourceType?: string;
  outcome?: 'success' | 'failure';
}) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabaseAdmin.from('audit_logs').select('*').order('timestamp', { ascending: false });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType);
  }

  if (filters.severity) {
    query = query.eq('severity', filters.severity);
  }

  if (filters.startDate) {
    query = query.gte('timestamp', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('timestamp', filters.endDate);
  }

  if (filters.ipAddress) {
    query = query.eq('ip_address', filters.ipAddress);
  }

  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }

  if (filters.outcome) {
    query = query.eq('outcome', filters.outcome);
  }

  return query;
}
