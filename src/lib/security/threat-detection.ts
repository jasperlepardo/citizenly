/**
 * Real-time Threat Detection System
 * Monitors and detects security threats in real-time
 */

import { logger } from '@/lib/logging';

import { storeThreatDetectionEvent, ThreatDetectionEvent } from './audit-storage';

export interface SecurityContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  timestamp: string;
}

export interface ThreatPattern {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detector: (context: SecurityContext, history: SecurityEvent[]) => boolean;
  mitigation?: (context: SecurityContext) => Promise<void>;
}

export interface SecurityEvent {
  type: string;
  context: SecurityContext;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// In-memory cache for recent security events (in production, use Redis)
const eventCache = new Map<string, SecurityEvent[]>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_EVENTS_PER_IP = 1000;

/**
 * Record a security event for analysis
 */
export async function recordSecurityEvent(
  eventType: string,
  context: SecurityContext,
  metadata?: Record<string, unknown>
): Promise<void> {
  const event: SecurityEvent = {
    type: eventType,
    context,
    timestamp: context.timestamp,
    metadata,
  };

  // Store in cache for pattern analysis
  const cacheKey = context.ipAddress || 'unknown';
  const events = eventCache.get(cacheKey) || [];

  // Add new event and maintain cache size
  events.push(event);
  if (events.length > MAX_EVENTS_PER_IP) {
    events.shift(); // Remove oldest event
  }

  eventCache.set(cacheKey, events);

  // Clean old events periodically
  cleanupOldEvents();

  // Analyze for threats
  await analyzeThreatPatterns(context, events);

  logger.debug('Security event recorded', {
    eventType,
    userId: context.userId,
    ipAddress: context.ipAddress,
  });
}

/**
 * Analyze security events for threat patterns
 */
async function analyzeThreatPatterns(
  context: SecurityContext,
  history: SecurityEvent[]
): Promise<void> {
  const threatPatterns: ThreatPattern[] = [
    bruteForceDetector,
    sqlInjectionDetector,
    xssAttemptDetector,
    suspiciousNavigationDetector,
    rapidRequestDetector,
    privilegeEscalationDetector,
    dataExfiltrationDetector,
  ];

  for (const pattern of threatPatterns) {
    try {
      if (pattern.detector(context, history)) {
        await handleThreatDetection(pattern, context);
      }
    } catch (error) {
      logger.error('Error in threat pattern analysis', {
        pattern: pattern.name,
        error,
      });
    }
  }
}

/**
 * Handle detected threat
 */
async function handleThreatDetection(
  pattern: ThreatPattern,
  context: SecurityContext
): Promise<void> {
  const threatEvent: ThreatDetectionEvent = {
    event_type: pattern.name,
    severity: pattern.severity,
    source_ip: context.ipAddress || 'unknown',
    user_id: context.userId,
    details: {
      description: pattern.description,
      context,
      detectedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    mitigated: false,
  };

  // Store threat event
  await storeThreatDetectionEvent(threatEvent);

  // Apply mitigation if available
  if (pattern.mitigation) {
    try {
      await pattern.mitigation(context);
      threatEvent.mitigated = true;
      threatEvent.mitigation_action = `Applied ${pattern.name} mitigation`;
    } catch (error) {
      logger.error('Failed to apply threat mitigation', {
        pattern: pattern.name,
        error,
      });
    }
  }

  logger.warn('THREAT DETECTED', {
    threat: pattern.name,
    severity: pattern.severity,
    userId: context.userId,
    ipAddress: context.ipAddress,
    mitigated: threatEvent.mitigated,
  });
}

/**
 * Brute force attack detector
 */
const bruteForceDetector: ThreatPattern = {
  name: 'brute_force_attack',
  description: 'Multiple failed login attempts detected',
  severity: 'high',
  detector: (context, history) => {
    const recentFailedLogins = history.filter(
      event =>
        event.type === 'login_failed' &&
        Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    return recentFailedLogins.length >= 5;
  },
  mitigation: async context => {
    // TODO: Implement IP blocking or account lockout
    logger.warn('Brute force mitigation triggered', { ipAddress: context.ipAddress });
  },
};

/**
 * SQL injection attempt detector
 */
const sqlInjectionDetector: ThreatPattern = {
  name: 'sql_injection_attempt',
  description: 'Potential SQL injection attack detected',
  severity: 'critical',
  detector: (context, history) => {
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /update\s+.*\s+set/i,
      /'.*or.*'.*='.*'/i,
      /exec\s*\(/i,
    ];

    const requestPath = context.requestPath || '';
    return sqlPatterns.some(pattern => pattern.test(requestPath));
  },
};

/**
 * XSS attempt detector
 */
const xssAttemptDetector: ThreatPattern = {
  name: 'xss_attempt',
  description: 'Cross-site scripting attempt detected',
  severity: 'high',
  detector: (context, history) => {
    const xssPatterns = [
      /<script[^>]*>.*<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /eval\s*\(/i,
    ];

    const requestPath = context.requestPath || '';
    return xssPatterns.some(pattern => pattern.test(requestPath));
  },
};

/**
 * Suspicious navigation detector
 */
const suspiciousNavigationDetector: ThreatPattern = {
  name: 'suspicious_navigation',
  description: 'Unusual navigation patterns detected',
  severity: 'medium',
  detector: (context, history) => {
    const recentRequests = history.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 1 * 60 * 1000 // Last 1 minute
    );

    // Check for directory traversal attempts
    const traversalAttempts = recentRequests.filter(
      event =>
        event.context.requestPath?.includes('../') || event.context.requestPath?.includes('..\\')
    );

    return traversalAttempts.length > 0;
  },
};

/**
 * Rapid request detector (potential DDoS)
 */
const rapidRequestDetector: ThreatPattern = {
  name: 'rapid_requests',
  description: 'Unusually high request rate detected',
  severity: 'medium',
  detector: (context, history) => {
    const recentRequests = history.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 1 * 60 * 1000 // Last 1 minute
    );

    return recentRequests.length > 100; // More than 100 requests per minute
  },
  mitigation: async context => {
    // TODO: Implement rate limiting
    logger.warn('Rate limiting triggered', { ipAddress: context.ipAddress });
  },
};

/**
 * Privilege escalation detector
 */
const privilegeEscalationDetector: ThreatPattern = {
  name: 'privilege_escalation',
  description: 'Potential privilege escalation attempt detected',
  severity: 'critical',
  detector: (context, history) => {
    const adminAttempts = history.filter(
      event =>
        event.type === 'access_denied' &&
        event.context.requestPath?.includes('/admin') &&
        Date.now() - new Date(event.timestamp).getTime() < 10 * 60 * 1000 // Last 10 minutes
    );

    return adminAttempts.length >= 3;
  },
};

/**
 * Data exfiltration detector
 */
const dataExfiltrationDetector: ThreatPattern = {
  name: 'data_exfiltration',
  description: 'Potential data exfiltration detected',
  severity: 'critical',
  detector: (context, history) => {
    const dataRequests = history.filter(
      event =>
        event.type === 'data_access' &&
        Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    // Check for unusual data access patterns
    const uniqueResources = new Set(dataRequests.map(event => event.context.requestPath));

    return dataRequests.length > 50 && uniqueResources.size > 20;
  },
};

/**
 * Clean up old events from cache
 */
function cleanupOldEvents(): void {
  const now = Date.now();

  for (const [key, events] of Array.from(eventCache.entries())) {
    const filteredEvents = events.filter(
      event => now - new Date(event.timestamp).getTime() < CACHE_TTL
    );

    if (filteredEvents.length === 0) {
      eventCache.delete(key);
    } else {
      eventCache.set(key, filteredEvents);
    }
  }
}

/**
 * Get current threat level for an IP address
 */
export function getThreatLevel(ipAddress: string): 'low' | 'medium' | 'high' | 'critical' {
  const events = eventCache.get(ipAddress) || [];
  const recentEvents = events.filter(
    event => Date.now() - new Date(event.timestamp).getTime() < 10 * 60 * 1000 // Last 10 minutes
  );

  const failedLogins = recentEvents.filter(event => event.type === 'login_failed').length;
  const accessDenied = recentEvents.filter(event => event.type === 'access_denied').length;
  const totalEvents = recentEvents.length;

  if (failedLogins >= 10 || accessDenied >= 5) {
    return 'critical';
  } else if (failedLogins >= 5 || accessDenied >= 3 || totalEvents > 200) {
    return 'high';
  } else if (failedLogins >= 2 || totalEvents > 100) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Check if IP address should be blocked
 */
export function shouldBlockIp(ipAddress: string): boolean {
  const threatLevel = getThreatLevel(ipAddress);
  return threatLevel === 'critical';
}

/**
 * Get security insights for monitoring dashboard
 */
export function getSecurityInsights(): {
  activeThreats: number;
  blockedIps: number;
  monitoredIps: number;
  avgThreatLevel: string;
} {
  const allIps = Array.from(eventCache.keys());
  const threatLevels = allIps.map(ip => getThreatLevel(ip));

  const blockedIps = allIps.filter(ip => shouldBlockIp(ip)).length;
  const activeThreats = threatLevels.filter(
    level => level === 'high' || level === 'critical'
  ).length;

  // Calculate average threat level (simplified)
  const levelValues = { low: 1, medium: 2, high: 3, critical: 4 };
  const avgValue =
    threatLevels.reduce((sum, level) => sum + levelValues[level], 0) / threatLevels.length || 1;

  const avgThreatLevel =
    Object.keys(levelValues).find(
      level => levelValues[level as keyof typeof levelValues] >= Math.round(avgValue)
    ) || 'low';

  return {
    activeThreats,
    blockedIps,
    monitoredIps: allIps.length,
    avgThreatLevel,
  };
}
