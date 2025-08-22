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
} from './audit-storage';

export type {
  SecurityAuditLog,
  ThreatDetectionEvent,
} from './audit-storage';

// Threat detection
export {
  recordSecurityEvent,
  getThreatLevel,
  shouldBlockIp,
  getSecurityInsights,
} from './threat-detection';

export type {
  SecurityContext,
  ThreatPattern,
  SecurityEvent,
} from './threat-detection';

// Crypto utilities
export * from './crypto';

// File security utilities
export * from './file-security';

// Rate limiting utilities
export * from './rate-limit';