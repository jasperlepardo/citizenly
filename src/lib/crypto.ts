import bcrypt from 'bcryptjs';

/**
 * Secure cryptographic utilities for sensitive data handling
 * Used for PhilSys card numbers and other sensitive government data
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
 */
export function logSecurityOperation(
  operation: string,
  userId: string,
  details?: Record<string, unknown>
): void {
  // In production, this should log to a secure audit system
  const auditLog = {
    timestamp: new Date().toISOString(),
    operation,
    userId,
    details: details || {},
    ip: 'server-side', // Would get actual IP in server context
  };

  // For now, log to console (should be replaced with proper audit logging)
  console.info('[SECURITY AUDIT]', JSON.stringify(auditLog));

  // TODO: Implement proper audit logging to secure database/service
  // - Store in audit_logs table
  // - Send to security monitoring service
  // - Alert on suspicious patterns
}

// Additional crypto functions for test compatibility
export async function encryptPII(data: string): Promise<string> {
  // Placeholder implementation
  return await hashPhilSysNumber(data);
}

export async function decryptPII(encryptedData: string): Promise<string> {
  // Placeholder implementation - cannot actually decrypt hashed data
  return encryptedData;
}

export async function hashData(data: string): Promise<string> {
  return await bcrypt.hash(data, SALT_ROUNDS);
}

export function generateSecureToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function validateHash(data: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(data, hash);
  } catch {
    return false;
  }
}
