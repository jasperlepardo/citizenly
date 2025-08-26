import crypto from 'crypto';

import bcrypt from 'bcryptjs';

/**
 * Cryptographic utilities for government data handling
 * Currently focused on hashing (PhilSys numbers) - no encryption in use
 */

const SALT_ROUNDS = 12; // High security for government data

/**
 * Securely hash a PhilSys card number
 * @param philsysNumber - The PhilSys card number to hash
 * @returns Promise<string> - The hashed PhilSys number
 */
export async function hashPhilSysNumber(philsysNumber: string): Promise<string> {
  if (!philsysNumber) {
    throw new Error('PhilSys card number is required for hashing');
  }

  // Validate PhilSys format (basic validation)
  const philsysPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
  if (!philsysPattern.test(philsysNumber)) {
    throw new Error('Invalid PhilSys card number format');
  }

  try {
    const hashedNumber = await bcrypt.hash(philsysNumber, SALT_ROUNDS);
    return hashedNumber;
  } catch (error) {
    console.error('Error hashing PhilSys number:', error);
    throw new Error('Failed to securely hash PhilSys card number');
  }
}

/**
 * Verify a PhilSys card number against its hash
 * @param philsysNumber - The plain PhilSys card number
 * @param hashedNumber - The hashed PhilSys card number
 * @returns Promise<boolean> - Whether the numbers match
 */
export async function verifyPhilSysNumber(
  philsysNumber: string,
  hashedNumber: string
): Promise<boolean> {
  if (!philsysNumber || !hashedNumber) {
    return false;
  }

  try {
    return await bcrypt.compare(philsysNumber, hashedNumber);
  } catch (error) {
    console.error('Error verifying PhilSys number:', error);
    return false;
  }
}

/**
 * Extract and store the last 4 digits of PhilSys number for lookup purposes
 * @param philsysNumber - The PhilSys card number
 * @returns string - The last 4 digits
 */
export function extractPhilSysLast4(philsysNumber: string): string {
  if (!philsysNumber) {
    throw new Error('PhilSys card number is required');
  }

  // Remove all non-digit characters and get last 4 digits
  const digitsOnly = philsysNumber.replace(/\D/g, '');

  if (digitsOnly.length < 4) {
    throw new Error('PhilSys card number must contain at least 4 digits');
  }

  return digitsOnly.slice(-4);
}

/**
 * Sanitize PhilSys input for display (mask sensitive parts)
 * @param philsysNumber - The PhilSys card number
 * @returns string - Masked PhilSys number (****-****-****-1234)
 */
export function maskPhilSysNumber(philsysNumber: string): string {
  if (!philsysNumber) {
    return '';
  }

  const last4 = extractPhilSysLast4(philsysNumber);
  return `****-****-****-${last4}`;
}

/**
 * Validate PhilSys card number format
 * @param philsysNumber - The PhilSys card number to validate
 * @returns boolean - Whether the format is valid
 */
export function validatePhilSysFormat(philsysNumber: string): boolean {
  if (!philsysNumber) {
    return false;
  }

  // PhilSys format: 1234-5678-9012-3456 (16 digits with dashes)
  const philsysPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
  return philsysPattern.test(philsysNumber);
}

/**
 * Security audit log for sensitive operations
 * @param operation - The operation being performed
 * @param userId - The user performing the operation
 * @param details - Additional operation details
 * @param success - Whether the operation was successful
 * @param ipAddress - IP address of the user
 * @param userAgent - User agent string
 */
export async function logSecurityOperation(
  operation: string,
  userId: string,
  details?: Record<string, unknown>,
  success: boolean = true,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    // Import here to avoid circular dependencies
    const { storeSecurityAuditLog } = await import('./audit-storage');
    
    const auditLog = {
      operation,
      user_id: userId,
      severity: 'medium' as const,
      details: details || {},
      ip_address: ipAddress || 'server-side',
      user_agent: userAgent,
      session_id: undefined,
      timestamp: new Date().toISOString(),
      success,
    };

    // Store in secure audit database
    await storeSecurityAuditLog(auditLog);
    
    // Also log to console for immediate visibility
    console.info('[SECURITY AUDIT]', JSON.stringify({
      operation,
      userId,
      success,
      timestamp: auditLog.timestamp,
    }));

  } catch (error) {
    // Fallback to console logging if audit storage fails
    console.error('Failed to store security audit log', error);
    console.info('[SECURITY AUDIT FALLBACK]', JSON.stringify({
      operation,
      userId,
      success,
      timestamp: new Date().toISOString(),
      details,
    }));
  }
}

// Simple utility functions for tests (not used in actual application)
export async function encryptPII(data: string): Promise<string> {
  // Mock implementation for tests - not actually used
  return `encrypted_${data}`;
}

export async function decryptPII(encryptedData: string): Promise<string> {
  // Mock implementation for tests - not actually used  
  return encryptedData.replace('encrypted_', '');
}

export async function hashData(data: string): Promise<string> {
  return await bcrypt.hash(data, SALT_ROUNDS);
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function validateHash(data: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(data, hash);
}

export function secureCompare(a: string, b: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
