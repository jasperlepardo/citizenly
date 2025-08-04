/**
 * Secure Logging Utility
 * Prevents sensitive data from being logged while maintaining debugging capability
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  sanitizedData?: Record<string, any>
}

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /philsys/i,
  /card.?number/i,
  /ssn/i,
  /email/i,
  /phone/i,
  /mobile/i,
  /address/i,
  /birth/i
]

// Fields that should be completely removed from logs
const RESTRICTED_FIELDS = [
  'password',
  'token',
  'secret',
  'philsys_card_number',
  'philsys_card_number_hash',
  'csrf_token',
  'session_token'
]

/**
 * Sanitize data for logging by removing/masking sensitive information
 */
function sanitizeForLogging(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'string') {
    // Check if the string contains sensitive patterns
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(data))
    return isSensitive ? '[REDACTED]' : data
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item))
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(data)) {
      // Remove completely restricted fields
      if (RESTRICTED_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        continue
      }

      // Mask sensitive fields
      const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => pattern.test(key))
      
      if (isSensitiveKey) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeForLogging(value)
      }
    }
    
    return sanitized
  }

  return data
}

/**
 * Create a secure log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  data?: any,
  context?: string
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    sanitizedData: data ? sanitizeForLogging(data) : undefined
  }
}

/**
 * Check if logging should be enabled based on environment
 */
function shouldLog(level: LogLevel): boolean {
  const isDev = process.env.NODE_ENV === 'development'
  const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'warn')
  
  const levels = ['debug', 'info', 'warn', 'error']
  const currentLevelIndex = levels.indexOf(logLevel)
  const messageLevelIndex = levels.indexOf(level)
  
  return messageLevelIndex >= currentLevelIndex
}

/**
 * Secure logger class
 */
class SecureLogger {
  private context?: string

  constructor(context?: string) {
    this.context = context
  }

  debug(message: string, data?: any): void {
    if (shouldLog('debug')) {
      const entry = createLogEntry('debug', message, data, this.context)
      console.debug('[DEBUG]', entry.message, entry.sanitizedData || '')
    }
  }

  info(message: string, data?: any): void {
    if (shouldLog('info')) {
      const entry = createLogEntry('info', message, data, this.context)
      console.info('[INFO]', entry.message, entry.sanitizedData || '')
    }
  }

  warn(message: string, data?: any): void {
    if (shouldLog('warn')) {
      const entry = createLogEntry('warn', message, data, this.context)
      console.warn('[WARN]', entry.message, entry.sanitizedData || '')
    }
  }

  error(message: string, data?: any): void {
    if (shouldLog('error')) {
      const entry = createLogEntry('error', message, data, this.context)
      console.error('[ERROR]', entry.message, entry.sanitizedData || '')
    }
  }

  /**
   * Log user operations with automatic sanitization
   */
  userOperation(operation: string, userId?: string, data?: any): void {
    this.info(`User operation: ${operation}`, {
      userId: userId || 'anonymous',
      operation,
      data: sanitizeForLogging(data)
    })
  }

  /**
   * Log authentication events
   */
  authEvent(event: string, userId?: string, success: boolean = true): void {
    this.info(`Auth event: ${event}`, {
      userId: userId || 'anonymous',
      event,
      success,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log database operations without exposing sensitive data
   */
  databaseOperation(operation: string, table: string, recordId?: string, success: boolean = true): void {
    this.info(`Database operation: ${operation}`, {
      operation,
      table,
      recordId: recordId || 'unknown',
      success,
      timestamp: new Date().toISOString()
    })
  }
}

// Create default logger instances
export const logger = new SecureLogger()
export const authLogger = new SecureLogger('AUTH')
export const dbLogger = new SecureLogger('DATABASE')
export const apiLogger = new SecureLogger('API')

// Helper function to create contextual loggers
export function createLogger(context: string): SecureLogger {
  return new SecureLogger(context)
}

// Utility functions for common logging patterns
export function logError(error: Error, context?: string): void {
  const contextLogger = context ? createLogger(context) : logger
  contextLogger.error(error.message, {
    name: error.name,
    stack: error.stack,
    context
  })
}

export function logApiRequest(method: string, path: string, userId?: string): void {
  apiLogger.info(`${method} ${path}`, {
    method,
    path,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString()
  })
}

export function logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', details?: any): void {
  const logLevel = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info'
  logger[logLevel](`Security event: ${event}`, {
    event,
    severity,
    details: sanitizeForLogging(details),
    timestamp: new Date().toISOString()
  })
}

// Replace console.log for development debugging
export function debugLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(message, data)
  }
}

// Safe replacement for console.log in production
export function safeLog(message: string, data?: any): void {
  logger.info(message, data)
}