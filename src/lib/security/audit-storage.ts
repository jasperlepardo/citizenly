/**
 * Secure Audit Storage Implementation
 * Handles secure storage of audit logs and security events
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../logging/secure-logger';
import { ErrorCode as ApiErrorCode } from '../api/types';

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

/**
 * Store security audit log in secure database
 */
export async function storeSecurityAuditLog(auditLog: SecurityAuditLog): Promise<void> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('security_audit_logs')
      .insert({
        operation: auditLog.operation,
        user_id: auditLog.user_id,
        resource_type: auditLog.resource_type,
        resource_id: auditLog.resource_id,
        severity: auditLog.severity,
        details: auditLog.details,
        ip_address: auditLog.ip_address,
        user_agent: auditLog.user_agent,
        session_id: auditLog.session_id,
        timestamp: auditLog.timestamp,
        success: auditLog.success,
        error_message: auditLog.error_message,
      });

    if (error) {
      logger.error('Failed to store security audit log', { error, auditLog });
      // Don't throw error to avoid disrupting main application flow
    } else {
      logger.debug('Security audit log stored successfully', { operation: auditLog.operation });
    }

    // For critical security events, also send to external monitoring
    if (auditLog.severity === 'critical') {
      await sendCriticalSecurityAlert(auditLog);
    }
  } catch (error) {
    logger.error('Security audit storage service error', { error });
    // Don't throw error to avoid disrupting main application flow
  }
}

/**
 * Store threat detection event
 */
export async function storeThreatDetectionEvent(event: ThreatDetectionEvent): Promise<void> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('threat_detection_events')
      .insert({
        event_type: event.event_type,
        severity: event.severity,
        source_ip: event.source_ip,
        user_id: event.user_id,
        details: event.details,
        timestamp: event.timestamp,
        mitigated: event.mitigated,
        mitigation_action: event.mitigation_action,
      });

    if (error) {
      logger.error('Failed to store threat detection event', { error, event });
    } else {
      logger.info('Threat detection event stored', { 
        eventType: event.event_type,
        severity: event.severity,
        sourceIp: event.source_ip 
      });
    }

    // Auto-escalate high and critical threats
    if (event.severity === 'high' || event.severity === 'critical') {
      await escalateThreatEvent(event);
    }
  } catch (error) {
    logger.error('Threat detection storage service error', { error });
  }
}

/**
 * Send critical security alert to monitoring system
 */
async function sendCriticalSecurityAlert(auditLog: SecurityAuditLog): Promise<void> {
  try {
    // In production, this would integrate with:
    // - Security Information and Event Management (SIEM) system
    // - Slack/Teams notifications
    // - SMS/email alerts
    // - PagerDuty or similar incident management

    logger.error('CRITICAL SECURITY EVENT DETECTED', {
      operation: auditLog.operation,
      userId: auditLog.user_id,
      timestamp: auditLog.timestamp,
      details: auditLog.details,
      alert: 'IMMEDIATE_ATTENTION_REQUIRED',
    });

    // TODO: Integrate with external alerting system
    // await sendSlackAlert(auditLog);
    // await sendSmsAlert(auditLog);
    // await createPagerDutyIncident(auditLog);
  } catch (error) {
    logger.error('Failed to send critical security alert', { error, auditLog });
  }
}

/**
 * Escalate threat event for immediate response
 */
async function escalateThreatEvent(event: ThreatDetectionEvent): Promise<void> {
  try {
    logger.warn('THREAT ESCALATION', {
      eventType: event.event_type,
      severity: event.severity,
      sourceIp: event.source_ip,
      userId: event.user_id,
      escalated: true,
    });

    // In production, this would:
    // - Automatically block suspicious IPs
    // - Disable compromised user accounts
    // - Trigger incident response workflow
    // - Alert security team immediately

    // TODO: Implement automated threat response
    // if (event.severity === 'critical') {
    //   await blockSourceIp(event.source_ip);
    //   if (event.user_id) {
    //     await suspendUserAccount(event.user_id);
    //   }
    // }
  } catch (error) {
    logger.error('Failed to escalate threat event', { error, event });
  }
}

/**
 * Query security audit logs for investigation
 */
export async function querySecurityAuditLogs(filters: {
  userId?: string;
  operation?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<SecurityAuditLog[]> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabaseAdmin
      .from('security_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.operation) {
      query = query.eq('operation', filters.operation);
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

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to query security audit logs', { error, filters });
      return [];
    }

    return data as SecurityAuditLog[];
  } catch (error) {
    logger.error('Security audit query service error', { error });
    return [];
  }
}

/**
 * Get security statistics for dashboard
 */
// Audit event types for security tracking
export enum AuditEventType {
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALICIOUS_FILE_UPLOAD = 'malicious_file_upload',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

// Error codes for audit logging
export enum ErrorCode {
  DATABASE_ERROR = 'database_error',
  INTERNAL_ERROR = 'internal_error',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error'
}

/**
 * Audit error occurrences for security tracking
 */
export async function auditError(
  error: Error, 
  context: any, 
  errorCode: ApiErrorCode
): Promise<void> {
  try {
    const auditLog: SecurityAuditLog = {
      operation: 'error_occurrence',
      user_id: context?.userId || 'anonymous',
      resource_type: context?.resourceType,
      resource_id: context?.resourceId,
      severity: 'medium',
      details: {
        error_code: errorCode,
        error_message: error.message,
        stack_trace: error.stack?.substring(0, 1000), // Limit stack trace
        context
      },
      ip_address: context?.ipAddress,
      user_agent: context?.userAgent,
      session_id: context?.sessionId,
      timestamp: new Date().toISOString(),
      success: false,
      error_message: error.message
    };

    await storeSecurityAuditLog(auditLog);
  } catch (auditError) {
    logger.error('Failed to audit error', { error: auditError });
  }
}

/**
 * Audit security violations for threat detection
 */
export async function auditSecurityViolation(
  eventType: AuditEventType,
  context: any,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const threatEvent: ThreatDetectionEvent = {
      event_type: eventType,
      severity: 'high',
      source_ip: context?.ipAddress || 'unknown',
      user_id: context?.userId,
      details: {
        ...context,
        ...details
      },
      timestamp: new Date().toISOString(),
      mitigated: true,
      mitigation_action: 'Request blocked'
    };

    await storeThreatDetectionEvent(threatEvent);
  } catch (auditError) {
    logger.error('Failed to audit security violation', { error: auditError });
  }
}

export async function getSecurityStatistics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
  totalEvents: number;
  criticalEvents: number;
  threatEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
}> {
  try {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [auditResults, threatResults] = await Promise.all([
      supabaseAdmin
        .from('security_audit_logs')
        .select('severity, operation, success')
        .gte('timestamp', startDate.toISOString()),
      supabaseAdmin
        .from('threat_detection_events')
        .select('severity, event_type')
        .gte('timestamp', startDate.toISOString()),
    ]);

    const auditLogs = auditResults.data || [];
    const threatEvents = threatResults.data || [];

    return {
      totalEvents: auditLogs.length,
      criticalEvents: auditLogs.filter(log => log.severity === 'critical').length,
      threatEvents: threatEvents.length,
      failedLogins: auditLogs.filter(log => 
        log.operation.includes('login') && !log.success
      ).length,
      suspiciousActivities: threatEvents.filter(event => 
        ['suspicious_activity', 'brute_force', 'sql_injection'].includes(event.event_type)
      ).length,
    };
  } catch (error) {
    logger.error('Failed to get security statistics', { error });
    return {
      totalEvents: 0,
      criticalEvents: 0,
      threatEvents: 0,
      failedLogins: 0,
      suspiciousActivities: 0,
    };
  }
}