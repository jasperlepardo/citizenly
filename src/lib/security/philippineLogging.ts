/**
 * Philippine-Compliant Logging System
 *
 * Implements Data Privacy Act of 2012 (RA 10173) compliant logging
 * with BSP Circular 808 requirements for government systems.
 */

import crypto from 'crypto';

import type { PhilippineLogContext, AuditLogContext, NPCLogContext } from '@/types/shared/errors/errors';

// Philippine regulatory compliance constants
const RA_10173_SENSITIVE_FIELDS = new Set([
  'first_name',
  'last_name',
  'middle_name',
  'extension_name',
  'birthdate',
  'mobile_number',
  'telephone_number',
  'email',
  'philsys_card_number',
  'mother_maiden_first',
  'mother_maiden_middle',
  'mother_maiden_last',
  'address',
  'password',
  'token',
  'ssn',
]);

const NPC_CLASSIFICATION = {
  PERSONAL: 'PERSONAL_INFORMATION',
  SENSITIVE: 'SENSITIVE_PERSONAL_INFORMATION',
  PRIVILEGED: 'PRIVILEGED_INFORMATION',
} as const;

/**
 * Hash PII data per BSP Circular 808 requirements
 */
export function hashPII(data: string | undefined): string {
  if (!data) return '';
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16) + '***';
}

/**
 * Mask sensitive data per NPC Circular 16-01
 */
export function maskSensitiveData(
  data: string | undefined,
  type: 'BARANGAY' | 'PHILSYS' | 'MOBILE' | 'EMAIL'
): string {
  if (!data) return '';

  switch (type) {
    case 'BARANGAY':
      return data.length > 3 ? data.substring(0, 3) + '***' : '***';
    case 'PHILSYS':
      return '****-****-****';
    case 'MOBILE':
      return '+639********';
    case 'EMAIL':
      const [local, domain] = data.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    default:
      return '***';
  }
}

/**
 * Generate secure session ID for audit trail
 */
export function generateSecureSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Sanitize context data to remove PII per RA 10173
 */
function sanitizeContext(context?: Record<string, any>): Record<string, any> {
  if (!context) return {};

  const sanitized: Record<string, any> = {};

  Object.entries(context).forEach(([key, value]) => {
    if (RA_10173_SENSITIVE_FIELDS.has(key)) {
      // Don't log sensitive fields at all per NPC guidelines
      return;
    }

    if (typeof value === 'string' && value.length > 100) {
      // Truncate long strings to prevent log bloat
      sanitized[key] = value.substring(0, 100) + '...';
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Philippine Data Privacy Act compliant logger
 */
class PhilippineCompliantLogger {
  private logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

  debug(message: string, context?: PhilippineLogContext): void {
    if (process.env.NODE_ENV === 'development') {
      const sanitizedContext = sanitizeContext(context);
      console.log(`[RA10173-DEBUG] ${message}`, {
        ...sanitizedContext,
        dpCompliance: 'RA_10173_SECTION_12',
        logClassification: NPC_CLASSIFICATION.PERSONAL,
      });
    }
  }

  info(message: string, context?: PhilippineLogContext): void {
    const sanitizedContext = sanitizeContext(context);
    console.log(`[RA10173-INFO] ${message}`, {
      ...sanitizedContext,
      dpCompliance: 'RA_10173_SECTION_12',
      logClassification: NPC_CLASSIFICATION.PERSONAL,
    });
  }

  warn(message: string, context?: PhilippineLogContext): void {
    const sanitizedContext = sanitizeContext(context);
    console.warn(`[RA10173-WARN] ${message}`, {
      ...sanitizedContext,
      dpCompliance: 'RA_10173_SECTION_21',
      logClassification: NPC_CLASSIFICATION.SENSITIVE,
    });
  }

  error(message: string, context?: PhilippineLogContext): void {
    const sanitizedContext = sanitizeContext(context);
    console.error(`[RA10173-ERROR] ${message}`, {
      ...sanitizedContext,
      dpCompliance: 'RA_10173_SECTION_21',
      logClassification: NPC_CLASSIFICATION.SENSITIVE,
      npcNotificationRequired: true,
    });
  }
}

/**
 * BSP Circular 808 compliant audit logger for government systems
 */
class AuditLogger {
  info(message: string, context: AuditLogContext): void {
    console.log(`[BSP808-AUDIT] ${message}`, {
      ...context,
      auditCompliance: 'BSP_CIRCULAR_808',
      governmentSystem: true,
      logIntegrity: this.generateLogHash(context),
      npcRegistered: true,
    });
  }

  private generateLogHash(context: AuditLogContext): string {
    const logString = JSON.stringify(context);
    return crypto.createHash('sha256').update(logString).digest('hex').substring(0, 16);
  }
}

/**
 * NPC-compliant logger for data processing activities
 */
class NPCComplianceLogger {
  info(message: string, context: NPCLogContext): void {
    console.log(`[NPC-COMPLIANCE] ${message}`, {
      ...context,
      npcCompliance: 'NPC_CIRCULAR_16_03',
      dataPrivacyOfficer: process.env.DPO_CONTACT || 'dpo@barangay.gov.ph',
      privacyNotice: 'Available at /privacy-notice',
      dataSubjectRights: 'RA_10173_SECTIONS_16_18',
    });
  }
}

// Export singleton instances
export const philippineCompliantLogger = new PhilippineCompliantLogger();
export const auditLogger = new AuditLogger();
export const npcComplianceLogger = new NPCComplianceLogger();

/**
 * Utility functions for request handling
 */
export function getClientIP(request: any): string {
  return (
    request?.ip ||
    request?.headers?.['x-forwarded-for']?.split(',')[0] ||
    request?.connection?.remoteAddress ||
    'unknown'
  );
}

export function sanitizeUserAgent(userAgent: string | undefined): string {
  if (!userAgent) return 'unknown';
  // Remove potentially sensitive information from user agent
  return userAgent.substring(0, 50).replace(/[<>]/g, '');
}
