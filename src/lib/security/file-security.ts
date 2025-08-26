/**
 * File Upload Security Utilities
 * Provides comprehensive security validation for file uploads
 */

import { createHash } from 'crypto';

// Security configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

// Known malicious file signatures (first few bytes)
const MALICIOUS_SIGNATURES = [
  // PE Executable signatures
  Buffer.from([0x4d, 0x5a]), // MZ header (Windows executables)
  Buffer.from([0x50, 0x4b]), // PK header (could be ZIP with executable)
  // Script signatures
  Buffer.from('<?php', 'utf-8'),
  Buffer.from('<script', 'utf-8'),
  Buffer.from('javascript:', 'utf-8'),
  // Shell script signatures
  Buffer.from('#!/bin/sh', 'utf-8'),
  Buffer.from('#!/bin/bash', 'utf-8'),
];

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    hash: string;
  };
}

/**
 * Validate file size
 */
function validateFileSize(file: File): string[] {
  const errors: string[] = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE / 1024 / 1024}MB)`
    );
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  return errors;
}

/**
 * Validate file type and extension
 */
function validateFileType(file: File): string[] {
  const errors: string[] = [];

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push(
      `File type "${file.type}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push(
      `File extension "${extension}" is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  return errors;
}

/**
 * Validate file name for security issues
 */
function validateFileName(fileName: string): string[] {
  const errors: string[] = [];

  // Check for directory traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    errors.push('File name contains invalid characters (directory traversal)');
  }

  // Check for null bytes
  if (fileName.includes('\0')) {
    errors.push('File name contains null bytes');
  }

  // Check for excessively long names
  if (fileName.length > 255) {
    errors.push('File name is too long (max 255 characters)');
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  const baseName = fileName.split('.')[0].toUpperCase();
  if (reservedNames.includes(baseName)) {
    errors.push(`File name "${baseName}" is reserved and not allowed`);
  }

  return errors;
}

/**
 * Check file content for malicious signatures
 */
async function validateFileContent(file: File): Promise<string[]> {
  const errors: string[] = [];

  try {
    // Read first 1KB of file to check for malicious signatures
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const fileHeader = Buffer.from(buffer);

    // Check against known malicious signatures
    for (const signature of MALICIOUS_SIGNATURES) {
      if (fileHeader.subarray(0, signature.length).equals(signature)) {
        errors.push('File contains potentially malicious content');
        break;
      }
    }

    // Additional content validation for images
    if (file.type.startsWith('image/')) {
      // Basic validation - actual images should start with proper headers
      const imageSignatures = {
        'image/jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
        'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
        'image/gif': [Buffer.from('GIF87a', 'ascii'), Buffer.from('GIF89a', 'ascii')],
        'image/webp': [Buffer.from('WEBP', 'ascii')],
      };

      const signatures = imageSignatures[file.type as keyof typeof imageSignatures];
      if (signatures) {
        const validSignature = signatures.some(
          sig =>
            fileHeader.subarray(0, sig.length).equals(sig) ||
            fileHeader.subarray(8, 8 + sig.length).equals(sig) // For WEBP (RIFF header)
        );

        if (!validSignature) {
          errors.push(`File does not appear to be a valid ${file.type} image`);
        }
      }
    }
  } catch {
    errors.push('Unable to validate file content');
  }

  return errors;
}

/**
 * Generate secure hash of file content
 */
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = createHash('sha256');
  hash.update(Buffer.from(buffer));
  return hash.digest('hex');
}

/**
 * Sanitize file name for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    .substring(0, 100) // Limit length
    .toLowerCase();
}

/**
 * Generate unique file name to prevent conflicts
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = '.' + originalName.split('.').pop()?.toLowerCase();
  const baseName = sanitizeFileName(originalName.replace(/\.[^/.]+$/, ''));

  return `${baseName}_${timestamp}_${random}${extension}`;
}

/**
 * Comprehensive file validation
 */
export async function validateUploadedFile(file: File): Promise<FileValidationResult> {
  const errors: string[] = [];

  // Basic validations
  errors.push(...validateFileSize(file));
  errors.push(...validateFileType(file));
  errors.push(...validateFileName(file.name));

  // Content validation
  const contentErrors = await validateFileContent(file);
  errors.push(...contentErrors);

  // Generate file hash if no critical errors
  let fileHash = '';
  if (errors.length === 0) {
    try {
      fileHash = await generateFileHash(file);
    } catch {
      errors.push('Unable to generate file hash');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo:
      errors.length === 0
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
            hash: fileHash,
          }
        : undefined,
  };
}

/**
 * Virus scanning placeholder (would integrate with actual AV service)
 */
export async function scanFileForViruses(file: File): Promise<{
  clean: boolean;
  threats: string[];
}> {
  // In production, this would integrate with services like:
  // - ClamAV
  // - VirusTotal API
  // - AWS GuardDuty
  // - Microsoft Defender API

  console.log(`[SECURITY] Virus scan requested for file: ${file.name} (${file.size} bytes)`);

  // For now, just check file size and type as a basic heuristic
  const suspicious =
    file.size > 50 * 1024 * 1024 || // > 50MB
    file.name.match(/\.(exe|bat|cmd|scr|pif|com)$/i);

  return {
    clean: !suspicious,
    threats: suspicious ? ['Suspicious file characteristics detected'] : [],
  };
}

/**
 * Security audit log for file operations
 */
export async function logFileOperation(
  operation: 'upload' | 'download' | 'delete',
  fileName: string,
  userId: string,
  result: 'success' | 'failure' | 'blocked',
  details?: Record<string, string | number | boolean>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    // Import here to avoid circular dependencies
    const { storeSecurityAuditLog } = await import('./audit-storage');
    const { recordSecurityEvent } = await import('./threat-detection');
    
    const operationName = `FILE_${operation.toUpperCase()}`;
    const isSuccess = result === 'success';
    const severity = result === 'blocked' ? 'high' : 'low';
    
    const auditLog = {
      operation: operationName,
      user_id: userId,
      resource_type: 'file',
      resource_id: sanitizeFileName(fileName),
      severity: severity as 'low' | 'high',
      details: {
        fileName: sanitizeFileName(fileName),
        result,
        ...details,
      },
      ip_address: ipAddress || 'server-side',
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      success: isSuccess,
      error_message: result === 'failure' ? 'File operation failed' : undefined,
    };

    // Store in secure audit database
    await storeSecurityAuditLog(auditLog);
    
    // Record security event for threat detection
    if (result === 'blocked' || result === 'failure') {
      await recordSecurityEvent('file_security_violation', {
        userId,
        ipAddress: ipAddress || 'unknown',
        userAgent,
        requestPath: `/file/${operation}`,
        timestamp: new Date().toISOString(),
      }, {
        operation,
        fileName: sanitizeFileName(fileName),
        result,
      });
    }
    
    // Console log for immediate visibility
    console.info('[FILE_SECURITY_AUDIT]', JSON.stringify({
      operation: operationName,
      fileName: sanitizeFileName(fileName),
      userId,
      result,
      timestamp: auditLog.timestamp,
    }));

    // Alert on suspicious patterns
    if (result === 'blocked') {
      console.warn('[FILE_SECURITY_ALERT]', {
        message: 'Suspicious file operation blocked',
        operation,
        fileName: sanitizeFileName(fileName),
        userId,
        timestamp: auditLog.timestamp,
      });
    }

  } catch (error) {
    // Fallback to console logging if audit storage fails
    console.error('Failed to store file security audit log', error);
    console.info('[FILE_SECURITY_AUDIT_FALLBACK]', JSON.stringify({
      operation: `FILE_${operation.toUpperCase()}`,
      fileName: sanitizeFileName(fileName),
      userId,
      result,
      timestamp: new Date().toISOString(),
      details,
    }));
  }
}
