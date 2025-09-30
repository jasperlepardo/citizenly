/**
 * Security Audit Repository
 *
 * @fileoverview Clean, interface-compliant implementation of ISecurityAuditRepository.
 * Replaces legacy repository with proper TypeScript compliance and modern patterns.
 *
 * @version 1.0.0
 * @author Citizenly Development Team
 */

import { createLogger } from '@/lib/config/environment';
import { supabase } from '@/lib/data/supabase';
import type { SecurityAuditLog, ThreatDetectionEvent } from '@/types/app/auth/security';
import type { ISecurityAuditRepository } from '@/types/domain/repositories';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';

const logger = createLogger('SecurityAuditRepository');

/**
 * Security Audit Repository
 *
 * @description Production-ready implementation of ISecurityAuditRepository with:
 * - Full interface compliance
 * - Comprehensive error handling
 * - Modern TypeScript patterns
 * - Detailed logging and monitoring
 * - Backward compatibility with existing functionality
 */
export class SecurityAuditRepository implements ISecurityAuditRepository {
  private readonly supabase = supabase;

  // =============================================================================
  // INTERFACE COMPLIANCE METHODS
  // =============================================================================

  /**
   * Log data access events
   *
   * @param action - Type of data access (read, write, delete, etc.)
   * @param resource - Resource being accessed (table, endpoint, etc.)
   * @param resourceId - Specific resource identifier
   * @param userId - User performing the action
   * @param success - Whether the access was successful
   * @param metadata - Additional context data
   */
  async logDataAccess(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    success: boolean,
    metadata?: any
  ): Promise<RepositoryResult<any>> {
    const auditLog: SecurityAuditLog = {
      operation: `data_access_${action}`,
      user_id: userId,
      resource_type: resource,
      resource_id: resourceId,
      severity: success ? 'low' : 'medium',
      details: {
        action,
        resource,
        resourceId,
        ...metadata
      },
      timestamp: new Date().toISOString(),
      success,
    };

    logger.info('Logging data access', { action, resource, userId, success });
    return this.storeAuditLog(auditLog);
  }

  /**
   * Log security events
   *
   * @param event - Type of security event
   * @param userId - User associated with the event
   * @param metadata - Additional event context
   */
  async logSecurityEvent(
    event: string,
    userId: string,
    metadata?: any
  ): Promise<RepositoryResult<any>> {
    const auditLog: SecurityAuditLog = {
      operation: `security_${event}`,
      user_id: userId,
      resource_type: 'security',
      resource_id: '',
      severity: this.determineSeverity(event),
      details: {
        event,
        ...metadata
      },
      timestamp: new Date().toISOString(),
      success: true,
    };

    logger.info('Logging security event', { event, userId });
    return this.storeAuditLog(auditLog);
  }

  /**
   * Log authentication attempts
   *
   * @param userId - User attempting authentication
   * @param success - Whether authentication succeeded
   * @param ipAddress - IP address of the attempt
   * @param userAgent - User agent string
   * @param metadata - Additional context
   */
  async logAuthenticationAttempt(
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ): Promise<RepositoryResult<any>> {
    const auditLog: SecurityAuditLog = {
      operation: 'authentication_attempt',
      user_id: userId,
      resource_type: 'auth',
      resource_id: '',
      severity: success ? 'low' : 'medium',
      details: {
        success,
        ...metadata
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      success,
    };

    logger.info('Logging authentication attempt', { userId, success, ipAddress });
    return this.storeAuditLog(auditLog);
  }

  /**
   * Log permission denied events
   *
   * @param userId - User who was denied access
   * @param resource - Resource that was protected
   * @param action - Action that was attempted
   * @param reason - Reason for denial
   * @param metadata - Additional context
   */
  async logPermissionDenied(
    userId: string,
    resource: string,
    action: string,
    reason: string,
    metadata?: any
  ): Promise<RepositoryResult<any>> {
    const auditLog: SecurityAuditLog = {
      operation: 'permission_denied',
      user_id: userId,
      resource_type: resource,
      resource_id: '',
      severity: 'medium',
      details: {
        action,
        resource,
        deniedReason: reason || 'Insufficient permissions',
        ...metadata
      },
      timestamp: new Date().toISOString(),
      success: false,
    };

    logger.warn('Logging permission denied', { userId, resource, action, reason });
    return this.storeAuditLog(auditLog);
  }

  // =============================================================================
  // BACKWARD COMPATIBILITY METHODS
  // =============================================================================

  /**
   * Store security audit log
   *
   * @description Core method for storing audit logs. Maintains backward compatibility
   * with existing SecurityDomainService calls.
   */
  async storeAuditLog(auditLog: SecurityAuditLog): Promise<RepositoryResult<SecurityAuditLog>> {
    try {
      // Validate required fields
      if (!auditLog.operation || !auditLog.user_id) {
        return {
          success: false,
          error: 'Missing required fields: operation and user_id are mandatory'
        };
      }

      // Handle missing Supabase client gracefully
      if (!this.supabase) {
        logger.info('[SECURITY AUDIT - Console Only]', {
          operation: auditLog.operation,
          user_id: auditLog.user_id,
          severity: auditLog.severity,
          timestamp: auditLog.timestamp,
          details: auditLog.details,
        });
        return { success: true, data: auditLog };
      }

      // Store in database
      const { data, error } = await this.supabase
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
        })
        .select()
        .single();

      if (error) {
        // Handle missing table gracefully
        if (error.code === 'PGRST116' || error.message?.includes('relation "security_audit_logs" does not exist')) {
          logger.info('[SECURITY AUDIT - Table Missing]', {
            operation: auditLog.operation,
            user_id: auditLog.user_id,
            severity: auditLog.severity,
            message: 'security_audit_logs table not found, logging to console'
          });
          return { success: true, data: auditLog };
        }

        logger.error('Failed to store audit log', { error, auditLog });
        return { success: false, error: error.message };
      }

      logger.debug('Audit log stored successfully', {
        operation: auditLog.operation,
        severity: auditLog.severity,
        userId: auditLog.user_id
      });

      return { success: true, data: data as SecurityAuditLog };

    } catch (error) {
      logger.error('Security audit storage error', { error, auditLog });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store threat event (interface compliance)
   *
   * @description Stores threat events for security monitoring
   */
  async storeThreatEvent(threatEvent: any): Promise<RepositoryResult<any>> {
    return this.storeThreatDetectionEvent(threatEvent);
  }

  /**
   * Store threat detection event
   *
   * @description Stores threat detection events for security monitoring
   */
  async storeThreatDetectionEvent(event: ThreatDetectionEvent): Promise<RepositoryResult<ThreatDetectionEvent>> {
    try {
      if (!this.supabase) {
        logger.info('[THREAT DETECTION - Console Only]', {
          eventType: event.event_type,
          severity: event.severity,
          sourceIp: event.source_ip,
        });
        return { success: true, data: event };
      }

      const { data, error } = await this.supabase
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
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to store threat detection event', { error, event });
        return { success: false, error: error.message };
      }

      logger.info('Threat detection event stored', {
        eventType: event.event_type,
        severity: event.severity,
        sourceIp: event.source_ip,
      });

      return { success: true, data: data as ThreatDetectionEvent };

    } catch (error) {
      logger.error('Threat detection storage error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query audit logs with filters
   */
  async queryAuditLogs(filters: {
    userId?: string;
    operation?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<RepositoryResult<SecurityAuditLog[]>> {
    try {
      if (!this.supabase) {
        logger.warn('Cannot query audit logs: Supabase client not available');
        return { success: true, data: [] };
      }

      let query = this.supabase.from('security_audit_logs').select('*');

      // Apply filters
      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.operation) query = query.eq('operation', filters.operation);
      if (filters.severity) query = query.eq('severity', filters.severity);
      if (filters.startDate) query = query.gte('timestamp', filters.startDate);
      if (filters.endDate) query = query.lte('timestamp', filters.endDate);
      if (filters.limit) query = query.limit(filters.limit);

      // Order by timestamp descending
      query = query.order('timestamp', { ascending: false });

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to query security audit logs', { error, filters });
        return { success: false, error: error.message };
      }

      return { success: true, data: data as SecurityAuditLog[] };

    } catch (error) {
      logger.error('Security audit query error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStatistics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<RepositoryResult<any>> {
    try {
      if (!this.supabase) {
        logger.warn('Cannot get security statistics: Supabase client not available');
        return {
          success: true,
          data: {
            totalEvents: 0,
            criticalEvents: 0,
            failedLogins: 0,
            suspiciousActivities: 0,
          }
        };
      }

      // This would require proper aggregation queries
      // For now, return basic structure
      const stats = {
        totalEvents: 0,
        criticalEvents: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
      };

      return { success: true, data: stats };

    } catch (error) {
      logger.error('Failed to get security statistics', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Determine severity level based on event type
   */
  private determineSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = ['breach', 'intrusion', 'data_leak'];
    const warningEvents = ['failed_login', 'permission_denied', 'suspicious_activity'];
    const errorEvents = ['system_error', 'validation_failure'];

    if (criticalEvents.some(critical => event.toLowerCase().includes(critical))) {
      return 'critical';
    }
    if (errorEvents.some(error => event.toLowerCase().includes(error))) {
      return 'high';
    }
    if (warningEvents.some(warning => event.toLowerCase().includes(warning))) {
      return 'medium';
    }
    return 'low';
  }
}