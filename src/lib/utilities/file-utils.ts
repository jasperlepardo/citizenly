/**
 * File Utility Functions
 * 
 * @description Production-ready utilities for file operations, formatting,
 * and validation. Provides consistent file handling across the application.
 * 
 * @example
 * ```typescript
 * import { formatFileSize, isImageFile, exceedsMaxSize } from '@/lib/utilities/file-utils';
 * 
 * const size = formatFileSize(1024000); // "1 MB"
 * const isImg = isImageFile('image/jpeg'); // true
 * const tooLarge = exceedsMaxSize(5000000, 2); // true (5MB > 2MB)
 * ```
 * 
 * @since 1.0.0
 */

/**
 * File size units for conversion
 * @internal
 */
const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * Base conversion factor for file sizes (1024 bytes = 1 KB)
 * @internal
 */
const BYTES_PER_UNIT = 1024;

/**
 * Formats file size from bytes to human-readable format with appropriate units
 * 
 * Uses binary units (1024) for accurate file size representation.
 * Rounds to 2 decimal places for readability.
 * 
 * @param bytes - File size in bytes (must be non-negative)
 * @returns Formatted file size string with units
 * 
 * @throws {Error} If bytes is negative or not a finite number
 * 
 * @example
 * ```typescript
 * formatFileSize(0);        // "0 Bytes"
 * formatFileSize(1024);     // "1 KB"
 * formatFileSize(1536);     // "1.5 KB"
 * formatFileSize(1048576);  // "1 MB"
 * formatFileSize(5242880);  // "5 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new Error('File size must be a non-negative finite number');
  }

  if (bytes === 0) return '0 Bytes';

  const unitIndex = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_UNIT));
  const clampedIndex = Math.min(unitIndex, FILE_SIZE_UNITS.length - 1);
  
  const size = bytes / Math.pow(BYTES_PER_UNIT, clampedIndex);
  const formattedSize = parseFloat(size.toFixed(2));
  
  return `${formattedSize} ${FILE_SIZE_UNITS[clampedIndex]}`;
}

/**
 * Extracts file extension from filename
 * 
 * Handles edge cases like files without extensions, hidden files,
 * and multiple dots in filenames.
 * 
 * @param filename - Name of the file including extension
 * @returns File extension in lowercase without the dot, empty string if none
 * 
 * @throws {Error} If filename is not a string or is empty
 * 
 * @example
 * ```typescript
 * getFileExtension('document.pdf');     // "pdf"
 * getFileExtension('image.jpeg');       // "jpeg"
 * getFileExtension('archive.tar.gz');   // "gz"
 * getFileExtension('README');           // ""
 * getFileExtension('.gitignore');       // ""
 * ```
 */
export function getFileExtension(filename: string): string {
  if (typeof filename !== 'string' || filename.length === 0) {
    throw new Error('Filename must be a non-empty string');
  }

  const parts = filename.split('.');
  
  // Handle files without extensions or hidden files starting with dot
  if (parts.length <= 1 || (parts.length === 2 && parts[0] === '')) {
    return '';
  }
  
  return parts.pop()?.toLowerCase() || '';
}

/**
 * Checks if a file type represents an image
 * 
 * Validates against MIME type prefix for reliable image detection.
 * 
 * @param mimeType - MIME type of the file
 * @returns True if file is an image type
 * 
 * @throws {Error} If mimeType is not a string
 * 
 * @example
 * ```typescript
 * isImageFile('image/jpeg');           // true
 * isImageFile('image/png');            // true
 * isImageFile('image/svg+xml');        // true
 * isImageFile('application/pdf');      // false
 * isImageFile('text/plain');           // false
 * ```
 */
export function isImageFile(mimeType: string): boolean {
  if (typeof mimeType !== 'string') {
    throw new Error('MIME type must be a string');
  }
  
  return mimeType.startsWith('image/');
}

/**
 * Validates if file size exceeds maximum allowed size
 * 
 * Compares file size in bytes against maximum size in megabytes.
 * Uses precise byte calculation for accurate validation.
 * 
 * @param fileSize - File size in bytes
 * @param maxSizeMB - Maximum allowed size in megabytes
 * @returns True if file exceeds maximum size
 * 
 * @throws {Error} If fileSize or maxSizeMB are negative or not finite numbers
 * 
 * @example
 * ```typescript
 * exceedsMaxSize(1048576, 1);    // false (1MB <= 1MB)
 * exceedsMaxSize(2097152, 1);    // true (2MB > 1MB)
 * exceedsMaxSize(0, 5);          // false (0 bytes <= 5MB)
 * ```
 */
export function exceedsMaxSize(fileSize: number, maxSizeMB: number): boolean {
  if (!Number.isFinite(fileSize) || fileSize < 0) {
    throw new Error('File size must be a non-negative finite number');
  }
  
  if (!Number.isFinite(maxSizeMB) || maxSizeMB < 0) {
    throw new Error('Maximum size must be a non-negative finite number');
  }
  
  const maxSizeBytes = maxSizeMB * BYTES_PER_UNIT * BYTES_PER_UNIT; // MB to bytes
  return fileSize > maxSizeBytes;
}