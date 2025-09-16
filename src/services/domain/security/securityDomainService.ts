/**
 * Security Domain Service
 * Pure business logic for security audit operations
 * No infrastructure dependencies - uses interfaces only
 */

import { createLogger } from '@/lib/config/environment';
import type { ISecurityAuditRepository } from '@/types/domain/repositories';
import type { SecurityAuditLog, ThreatDetectionEvent } from '@/types/app/auth/security';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';

const logger = createLogger('SecurityDomainService');

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
 * Security Domain Service
 * Contains pure business logic for security operations
 */
export class SecurityDomainService {
  constructor(private readonly repository: ISecurityAuditRepository) {}

  /**
   * Store security audit log with business validation
   */
  async storeSecurityAuditLog(auditLog: SecurityAuditLog): Promise<RepositoryResult<SecurityAuditLog>> {
    try {
      // Business validation
      const validation = this.validateAuditLog(auditLog);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid audit log: ${validation.errors.join(', ')}`
        };
      }

      // Enrich audit log with business logic
      const enrichedLog = this.enrichAuditLog(auditLog);

      // Store through repository
      const result = await this.repository.storeAuditLog(enrichedLog);

      // For critical security events, trigger additional business logic
      if (result.success && enrichedLog.severity === 'critical') {
        await this.handleCriticalSecurityEvent(enrichedLog);
      }

      return result;

    } catch (error) {
      logger.error('Security audit service error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store threat detection event with business rules
   */
  async storeThreatDetectionEvent(event: ThreatDetectionEvent): Promise<RepositoryResult<ThreatDetectionEvent>> {
    try {
      // Business validation
      const validation = this.validateThreatEvent(event);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid threat event: ${validation.errors.join(', ')}`
        };
      }

      // Enrich with business logic
      const enrichedEvent = this.enrichThreatEvent(event);

      // Store through repository
      const result = await this.repository.storeThreatEvent(enrichedEvent);

      // Auto-escalate high and critical threats
      if (result.success && (enrichedEvent.severity === 'high' || enrichedEvent.severity === 'critical')) {
        await this.escalateThreatEvent(enrichedEvent);
      }

      return result;

    } catch (error) {
      logger.error('Threat detection service error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Audit user authentication events with business logic
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
  ): Promise<RepositoryResult<SecurityAuditLog>> {
    // Build audit log with business rules
    const auditLog: SecurityAuditLog = {
      operation: `auth_${operation}`,
      user_id: userId,
      severity: this.calculateAuthSeverity(operation, success, context?.errorMessage),
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

    return this.storeSecurityAuditLog(auditLog);
  }

  /**
   * Audit data access operations with business context
   */
  async auditDataAccess(
    operation: 'read' | 'create' | 'update' | 'delete',
    resourceType: string,
    resourceId: string,
    userId: string,
    success: boolean,
    context?: Record<string, unknown>
  ): Promise<RepositoryResult<SecurityAuditLog>> {
    // Business rule: delete operations are higher severity
    const severity = this.calculateDataAccessSeverity(operation, resourceType, success);

    const auditLog: SecurityAuditLog = {
      operation: `data_${operation}`,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      severity,
      details: {
        operation,
        resource_type: resourceType,
        resource_id: resourceId,
        ...context,
      },
      timestamp: new Date().toISOString(),
      success,
    };

    return this.storeSecurityAuditLog(auditLog);
  }

  /**
   * Audit security violations with automated classification
   */
  async auditSecurityViolation(
    eventType: AuditEventType,
    context: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<RepositoryResult<ThreatDetectionEvent>> {
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

    return this.storeThreatDetectionEvent(threatEvent);
  }

  /**
   * Query security audit logs with business filters
   */
  async querySecurityAuditLogs(filters: {
    userId?: string;
    operation?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<RepositoryResult<SecurityAuditLog[]>> {
    // Apply business rules to filters
    const validatedFilters = this.validateQueryFilters(filters);
    return this.repository.queryAuditLogs(validatedFilters);
  }

  /**
   * Get security statistics with business context
   */
  async getSecurityStatistics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<RepositoryResult<{
    totalEvents: number;
    criticalEvents: number;
    threatEvents: number;
    failedLogins: number;
    suspiciousActivities: number;
  }>> {
    return this.repository.getSecurityStatistics(timeframe);
  }

  /**
   * Business validation for audit logs
   */
  private validateAuditLog(auditLog: SecurityAuditLog): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!auditLog.operation) errors.push('Operation is required');
    if (!auditLog.severity) errors.push('Severity is required');
    if (!auditLog.timestamp) errors.push('Timestamp is required');
    
    // Validate severity values
    if (auditLog.severity && !['low', 'medium', 'high', 'critical'].includes(auditLog.severity)) {
      errors.push('Invalid severity level');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Business validation for threat events
   */
  private validateThreatEvent(event: ThreatDetectionEvent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.event_type) errors.push('Event type is required');
    if (!event.severity) errors.push('Severity is required');
    if (!event.source_ip) errors.push('Source IP is required');
    if (!event.timestamp) errors.push('Timestamp is required');

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Enrich audit log with business logic
   */
  private enrichAuditLog(auditLog: SecurityAuditLog): SecurityAuditLog {
    return {
      ...auditLog,
      // Add any business-specific enrichment
    };
  }

  /**
   * Enrich threat event with business logic
   */
  private enrichThreatEvent(event: ThreatDetectionEvent): ThreatDetectionEvent {
    return {
      ...event,
      // Add any business-specific enrichment
    };
  }

  /**
   * Calculate severity based on authentication context
   */
  private calculateAuthSeverity(
    operation: string, 
    success: boolean, 
    errorMessage?: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (success) return 'low';
    
    // Failed operations are medium by default
    if (!success) {
      // Check for brute force patterns in error message
      if (errorMessage?.includes('too many attempts') || errorMessage?.includes('rate limit')) {
        return 'high';
      }
      return 'medium';
    }

    return 'low';
  }

  /**
   * Calculate severity based on data access context
   */
  private calculateDataAccessSeverity(
    operation: string,
    resourceType: string,
    success: boolean
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (!success) return 'medium';
    
    // Delete operations are higher risk
    if (operation === 'delete') return 'medium';
    
    // Sensitive resource types get higher severity
    if (['residents', 'households', 'users'].includes(resourceType.toLowerCase())) {
      return operation === 'read' ? 'low' : 'medium';
    }
    
    return 'low';
  }

  /**
   * Handle critical security events
   */
  private async handleCriticalSecurityEvent(auditLog: SecurityAuditLog): Promise<void> {
    logger.error('CRITICAL SECURITY EVENT DETECTED', {
      operation: auditLog.operation,
      userId: auditLog.user_id,
      timestamp: auditLog.timestamp,
      details: auditLog.details,
      alert: 'IMMEDIATE_ATTENTION_REQUIRED',
    });
  }

  /**
   * Escalate threat events
   */
  private async escalateThreatEvent(event: ThreatDetectionEvent): Promise<void> {
    logger.warn('THREAT ESCALATION', {
      eventType: event.event_type,
      severity: event.severity,
      sourceIp: event.source_ip,
      userId: event.user_id,
      escalated: true,
    });
  }

  /**
   * Validate query filters with business rules
   */
  private validateQueryFilters(filters: any): any {
    // Apply business validation and defaults
    const validated = { ...filters };
    
    // Limit max results for performance
    if (validated.limit > 1000) {
      validated.limit = 1000;
    }
    
    return validated;
  }

  /**
   * Get severity level for different event types
   */
  private getSeverityForEventType(
    eventType: AuditEventType
  ): 'low' | 'medium' | 'high' | 'critical' {
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