/**
 * Security Module Index
 * Centralized exports for all security-related functionality
 */

// Audit storage
export {
  storeSecurityAuditLog,
  storeThreatDetectionEvent,
  querySecurityAuditLogs,
  getSecurityStatistics,
} from './auditStorage';

export type {
  SecurityAuditLog,
  ThreatDetectionEvent,
} from './auditStorage';

// Threat detection
export {
  recordSecurityEvent,
  getThreatLevel,
  shouldBlockIp,
  getSecurityInsights,
} from './threatDetection';

export type {
  SecurityContext,
  ThreatPattern,
  SecurityEvent,
} from './threatDetection';

// Crypto utilities
export * from './crypto';

// File security utilities
export * from './fileSecurity';

// Rate limiting utilities
export * from './rateLimit';