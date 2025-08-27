/**
 * Security Audit Service
 * CONSOLIDATED - Security audit logging and threat detection
 * Consolidates lib/security/audit-storage.ts functionality
 */

import { createClient } from '@supabase/supabase-js';
import { createLogger } from '../lib/config/environment';

const logger = createLogger('SecurityAuditService');

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

// Audit event types for security tracking
export enum AuditEventType {
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALICIOUS_FILE_UPLOAD = 'malicious_file_upload',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
}

/**
 * Security Audit Service Class
 * Centralized security event logging and monitoring
 */
export class SecurityAuditService {
  private adminClient: any;

  constructor() {
    // Initialize admin client only if environment variables are available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }

  /**
   * Store security audit log in secure database
   */
  async storeSecurityAuditLog(auditLog: SecurityAuditLog): Promise<void> {
    try {
      // Fallback to console logging if no database connection
      if (!this.adminClient) {
        console.info(
          '[SECURITY AUDIT - Console Only]',
          JSON.stringify({
            operation: auditLog.operation,
            user_id: auditLog.user_id,
            severity: auditLog.severity,
            timestamp: auditLog.timestamp,
            details: auditLog.details,
          })
        );
        return;
      }

      const { error } = await this.adminClient.from('security_audit_logs').insert({
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
        // If table doesn't exist, fall back to console logging
        if (
          error.code === 'PGRST116' ||
          error.message?.includes('relation "security_audit_logs" does not exist')
        ) {
          console.info(
            '[SECURITY AUDIT - Table Missing]',
            JSON.stringify({
              operation: auditLog.operation,
              user_id: auditLog.user_id,
              severity: auditLog.severity,
              timestamp: auditLog.timestamp,
              details: auditLog.details,
            })
          );
        } else {
          logger.error('Failed to store security audit log', { error, auditLog });
        }
      } else {
        logger.debug('Security audit log stored successfully', { operation: auditLog.operation });
      }

      // For critical security events, also send to external monitoring
      if (auditLog.severity === 'critical') {
        await this.sendCriticalSecurityAlert(auditLog);
      }
    } catch (error) {
      logger.error('Security audit storage service error', { error });
      // Don't throw error to avoid disrupting main application flow
    }
  }

  /**
   * Store threat detection event
   */
  async storeThreatDetectionEvent(event: ThreatDetectionEvent): Promise<void> {
    try {
      if (!this.adminClient) {
        console.warn('[THREAT DETECTION - No Database]', JSON.stringify(event));
        return;
      }

      const { error } = await this.adminClient.from('threat_detection_events').insert({
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
          sourceIp: event.source_ip,
        });
      }

      // Auto-escalate high and critical threats
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.escalateThreatEvent(event);
      }
    } catch (error) {
      logger.error('Threat detection storage service error', { error });
    }
  }

  /**
   * Audit user authentication events
   */
  async auditAuthentication(
    operation: 'login' | 'logout' | 'register' | 'password_change',
    userId: string,
    success: boolean,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    const auditLog: SecurityAuditLog = {
      operation: `auth_${operation}`,
      user_id: userId,
      severity: success ? 'low' : 'medium',
      details: {
        operation,
        success,
        error_message: context?.errorMessage,
      },
      ip_address: context?.ipAddress,
      user_agent: context?.userAgent,
      session_id: context?.sessionId,
      timestamp: new Date().toISOString(),
      success,
      error_message: context?.errorMessage,
    };

    await this.storeSecurityAuditLog(auditLog);
  }

  /**
   * Audit data access operations
   */
  async auditDataAccess(
    operation: 'read' | 'create' | 'update' | 'delete',
    resourceType: string,
    resourceId: string,
    userId: string,
    success: boolean,
    context?: Record<string, unknown>
  ): Promise<void> {
    const auditLog: SecurityAuditLog = {
      operation: `data_${operation}`,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      severity: operation === 'delete' ? 'medium' : 'low',
      details: {
        operation,
        resource_type: resourceType,
        resource_id: resourceId,
        ...context,
      },
      timestamp: new Date().toISOString(),
      success,
    };

    await this.storeSecurityAuditLog(auditLog);
  }

  /**
   * Audit security violations
   */
  async auditSecurityViolation(
    eventType: AuditEventType,
    context: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<void> {
    try {
      const threatEvent: ThreatDetectionEvent = {
        event_type: eventType,
        severity: this.getSeverityForEventType(eventType),
        source_ip: context.ipAddress || 'unknown',
        user_id: context.userId,
        details: {
          ...context.details,
          user_agent: context.userAgent,
        },
        timestamp: new Date().toISOString(),
        mitigated: true,
        mitigation_action: 'Request blocked',
      };

      await this.storeThreatDetectionEvent(threatEvent);
    } catch (error) {
      logger.error('Failed to audit security violation', { error });
    }
  }

  /**
   * Query security audit logs for investigation
   */
  async querySecurityAuditLogs(filters: {
    userId?: string;
    operation?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<SecurityAuditLog[]> {
    try {
      if (!this.adminClient) {
        logger.warn('Cannot query security logs - no database connection');
        return [];
      }

      let query = this.adminClient
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
  async getSecurityStatistics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalEvents: number;
    criticalEvents: number;
    threatEvents: number;
    failedLogins: number;
    suspiciousActivities: number;
  }> {
    try {
      if (!this.adminClient) {
        return {
          totalEvents: 0,
          criticalEvents: 0,
          threatEvents: 0,
          failedLogins: 0,
          suspiciousActivities: 0,
        };
      }

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

      const [auditResults, threatResults] = await Promise.all([
        this.adminClient
          .from('security_audit_logs')
          .select('severity, operation, success')
          .gte('timestamp', startDate.toISOString()),
        this.adminClient
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
        failedLogins: auditLogs.filter(log => log.operation.includes('login') && !log.success).length,
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

  /**
   * Send critical security alert to monitoring system
   */
  private async sendCriticalSecurityAlert(auditLog: SecurityAuditLog): Promise<void> {
    try {
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
  private async escalateThreatEvent(event: ThreatDetectionEvent): Promise<void> {
    try {
      logger.warn('THREAT ESCALATION', {
        eventType: event.event_type,
        severity: event.severity,
        sourceIp: event.source_ip,
        userId: event.user_id,
        escalated: true,
      });

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
   * Get severity level for different event types
   */
  private getSeverityForEventType(eventType: AuditEventType): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<AuditEventType, 'low' | 'medium' | 'high' | 'critical'> = {
      [AuditEventType.SQL_INJECTION_ATTEMPT]: 'critical',
      [AuditEventType.XSS_ATTEMPT]: 'high',
      [AuditEventType.UNAUTHORIZED_ACCESS]: 'high',
      [AuditEventType.RATE_LIMIT_EXCEEDED]: 'medium',
      [AuditEventType.MALICIOUS_FILE_UPLOAD]: 'critical',
      [AuditEventType.SUSPICIOUS_ACTIVITY]: 'medium',
      [AuditEventType.LOGIN_SUCCESS]: 'low',
      [AuditEventType.LOGIN_FAILURE]: 'medium',
      [AuditEventType.DATA_ACCESS]: 'low',
      [AuditEventType.DATA_MODIFICATION]: 'medium',
    };

    return severityMap[eventType] || 'medium';
  }
}

// Export singleton instance
export const securityAuditService = new SecurityAuditService();
