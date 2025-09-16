/**
 * Supabase Security Audit Repository
 * Infrastructure implementation for security audit operations
 */

import { createLogger } from '@/lib/config/environment';
import type { SecurityAuditLog, ThreatDetectionEvent } from '@/types/app/auth/security';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';
import { supabase } from '@/lib/data/supabase';

const logger = createLogger('SupabaseSecurityAuditRepository');

/**
 * Supabase Security Audit Repository
 * Uses shared singleton Supabase client to prevent multiple auth instances
 */
export class SupabaseSecurityAuditRepository {
  private readonly supabase = supabase;

  async storeAuditLog(auditLog: SecurityAuditLog): Promise<RepositoryResult<SecurityAuditLog>> {
    try {
      if (!this.supabase) {
        console.info('[SECURITY AUDIT - Console Only]', JSON.stringify({
          operation: auditLog.operation,
          user_id: auditLog.user_id,
          severity: auditLog.severity,
          timestamp: auditLog.timestamp,
          details: auditLog.details,
        }));
        return { success: true, data: auditLog };
      }

      const { data, error } = await this.supabase.from('security_audit_logs').insert({
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
      }).select().single();

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('relation "security_audit_logs" does not exist')) {
          console.info('[SECURITY AUDIT - Table Missing]', JSON.stringify({
            operation: auditLog.operation,
            user_id: auditLog.user_id,
            severity: auditLog.severity,
            timestamp: auditLog.timestamp,
            details: auditLog.details,
          }));
          return { success: true, data: auditLog };
        }
        
        logger.error('Failed to store security audit log', { error, auditLog });
        return { success: false, error: error.message };
      }

      logger.debug('Security audit log stored successfully', { operation: auditLog.operation });
      return { success: true, data: data as SecurityAuditLog };

    } catch (error) {
      logger.error('Security audit storage repository error', { error });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async storeThreatEvent(event: ThreatDetectionEvent): Promise<RepositoryResult<ThreatDetectionEvent>> {
    try {
      if (!this.supabase) {
        console.warn('[THREAT DETECTION - No Database]', JSON.stringify(event));
        return { success: true, data: event };
      }

      const { data, error } = await this.supabase.from('threat_detection_events').insert({
        event_type: event.event_type,
        severity: event.severity,
        source_ip: event.source_ip,
        user_id: event.user_id,
        details: event.details,
        timestamp: event.timestamp,
        mitigated: event.mitigated,
        mitigation_action: event.mitigation_action,
      }).select().single();

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
      logger.error('Threat detection storage repository error', { error });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

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
        logger.warn('Cannot query security logs - no database connection');
        return { success: true, data: [] };
      }

      let query = this.supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.operation) query = query.eq('operation', filters.operation);
      if (filters.severity) query = query.eq('severity', filters.severity);
      if (filters.startDate) query = query.gte('timestamp', filters.startDate);
      if (filters.endDate) query = query.lte('timestamp', filters.endDate);
      if (filters.limit) query = query.limit(filters.limit);

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to query security audit logs', { error, filters });
        return { success: false, error: error.message };
      }

      return { success: true, data: data as SecurityAuditLog[] };

    } catch (error) {
      logger.error('Security audit query repository error', { error });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getSecurityStatistics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<RepositoryResult<{
    totalEvents: number;
    criticalEvents: number;
    threatEvents: number;
    failedLogins: number;
    suspiciousActivities: number;
  }>> {
    try {
      if (!this.supabase) {
        return {
          success: true,
          data: {
            totalEvents: 0,
            criticalEvents: 0,
            threatEvents: 0,
            failedLogins: 0,
            suspiciousActivities: 0,
          }
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
        this.supabase
          .from('security_audit_logs')
          .select('severity, operation, success')
          .gte('timestamp', startDate.toISOString()),
        this.supabase
          .from('threat_detection_events')
          .select('severity, event_type')
          .gte('timestamp', startDate.toISOString()),
      ]);

      if (auditResults.error) {
        return { success: false, error: auditResults.error.message };
      }

      if (threatResults.error) {
        return { success: false, error: threatResults.error.message };
      }

      const auditLogs = auditResults.data || [];
      const threatEvents = threatResults.data || [];

      return {
        success: true,
        data: {
          totalEvents: auditLogs.length,
          criticalEvents: auditLogs.filter((log: any) => log.severity === 'critical').length,
          threatEvents: threatEvents.length,
          failedLogins: auditLogs.filter(
            (log: any) => log.operation.includes('login') && !log.success
          ).length,
          suspiciousActivities: threatEvents.filter((event: any) =>
            ['suspicious_activity', 'brute_force', 'sql_injection'].includes(event.event_type)
          ).length,
        }
      };

    } catch (error) {
      logger.error('Failed to get security statistics', { error });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}