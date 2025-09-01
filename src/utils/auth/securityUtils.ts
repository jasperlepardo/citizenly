/**
 * Security Utilities
 * Consolidated security, crypto, and PhilSys utilities aligned with database schema
 */

import crypto from 'crypto';

import bcrypt from 'bcryptjs';

import { validatePhilSysFormat } from './sanitizationUtils';

const SALT_ROUNDS = 12;

/**
 * Securely hash a PhilSys card number
 */
export async function hashPhilSysNumber(philsysNumber: string): Promise<string> {
  if (!philsysNumber) {
    throw new Error('PhilSys card number is required for hashing');
  }

  if (!validatePhilSysFormat(philsysNumber)) {
    throw new Error('Invalid PhilSys card number format');
  }

  try {
    return await bcrypt.hash(philsysNumber, SALT_ROUNDS);
  } catch (error) {
    console.error('Error hashing PhilSys number:', error);
    throw new Error('Failed to securely hash PhilSys card number');
  }
}

/**
 * Verify a PhilSys card number against its hash
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
 * Extract the last 4 digits of PhilSys number for lookup purposes
 */
export function extractPhilSysLast4(philsysNumber: string): string {
  if (!philsysNumber) {
    throw new Error('PhilSys card number is required');
  }

  const digitsOnly = philsysNumber.replace(/\D/g, '');

  if (digitsOnly.length < 4) {
    throw new Error('PhilSys card number must contain at least 4 digits');
  }

  return digitsOnly.slice(-4);
}

/**
 * Mask PhilSys number for display (****-****-****-1234)
 */
export function maskPhilSysNumber(philsysNumber: string): string {
  if (!philsysNumber) {
    return '';
  }

  const last4 = extractPhilSysLast4(philsysNumber);
  return `****-****-****-${last4}`;
}

/**
 * Validate PhilSys card number format (matches database schema constraints)
 */
// validatePhilSysFormat imported from sanitization-utils above - removed duplicate

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash data securely
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Secure comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Log security operation for audit trail
 */
export function logSecurityOperation(
  operation: string,
  userId: string,
  context: Record<string, any> = {}
): void {
  const logEntry = {
    operation,
    userId,
    timestamp: new Date().toISOString(),
    context,
  };

  // In production, this would go to a secure audit log
  console.log('[SECURITY AUDIT]', logEntry);
}
