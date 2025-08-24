/**
 * @file Unit tests for file utility functions
 * @description Comprehensive test coverage for file-utils module
 */

import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  getFileExtension,
  isImageFile,
  exceedsMaxSize,
} from '../file-utils';

describe('formatFileSize', () => {
  it('should format zero bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(formatFileSize(512)).toBe('512 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(2147483648)).toBe('2 GB');
  });

  it('should format terabytes correctly', () => {
    expect(formatFileSize(1099511627776)).toBe('1 TB');
  });

  it('should handle very large files without overflow', () => {
    expect(formatFileSize(Number.MAX_SAFE_INTEGER)).toMatch(/TB$/);
  });

  it('should throw error for negative values', () => {
    expect(() => formatFileSize(-1)).toThrow('File size must be a non-negative finite number');
  });

  it('should throw error for non-finite values', () => {
    expect(() => formatFileSize(Infinity)).toThrow('File size must be a non-negative finite number');
    expect(() => formatFileSize(NaN)).toThrow('File size must be a non-negative finite number');
  });

  it('should round to 2 decimal places', () => {
    expect(formatFileSize(1536.123)).toBe('1.5 KB');
    expect(formatFileSize(1638.4)).toBe('1.6 KB');
  });
});

describe('getFileExtension', () => {
  it('should extract common file extensions', () => {
    expect(getFileExtension('document.pdf')).toBe('pdf');
    expect(getFileExtension('image.jpg')).toBe('jpg');
    expect(getFileExtension('archive.zip')).toBe('zip');
    expect(getFileExtension('script.js')).toBe('js');
  });

  it('should handle uppercase extensions by converting to lowercase', () => {
    expect(getFileExtension('Document.PDF')).toBe('pdf');
    expect(getFileExtension('Image.JPEG')).toBe('jpeg');
    expect(getFileExtension('Archive.TAR.GZ')).toBe('gz');
  });

  it('should handle files with multiple dots', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
    expect(getFileExtension('backup.2023.12.01.sql')).toBe('sql');
    expect(getFileExtension('config.local.json')).toBe('json');
  });

  it('should return empty string for files without extensions', () => {
    expect(getFileExtension('README')).toBe('');
    expect(getFileExtension('Dockerfile')).toBe('');
    expect(getFileExtension('makefile')).toBe('');
  });

  it('should handle hidden files (starting with dot)', () => {
    expect(getFileExtension('.gitignore')).toBe('');
    expect(getFileExtension('.env')).toBe('');
    expect(getFileExtension('.htaccess')).toBe('');
  });

  it('should handle hidden files with extensions', () => {
    expect(getFileExtension('.config.json')).toBe('json');
    expect(getFileExtension('.eslintrc.js')).toBe('js');
  });

  it('should throw error for non-string input', () => {
    expect(() => getFileExtension(null as any)).toThrow('Filename must be a non-empty string');
    expect(() => getFileExtension(undefined as any)).toThrow('Filename must be a non-empty string');
    expect(() => getFileExtension(123 as any)).toThrow('Filename must be a non-empty string');
  });

  it('should throw error for empty string', () => {
    expect(() => getFileExtension('')).toThrow('Filename must be a non-empty string');
  });

  it('should handle edge cases with dots', () => {
    expect(getFileExtension('.')).toBe('');
    expect(getFileExtension('..')).toBe('');
    expect(getFileExtension('...')).toBe('');
  });
});

describe('isImageFile', () => {
  it('should return true for image MIME types', () => {
    expect(isImageFile('image/jpeg')).toBe(true);
    expect(isImageFile('image/jpg')).toBe(true);
    expect(isImageFile('image/png')).toBe(true);
    expect(isImageFile('image/gif')).toBe(true);
    expect(isImageFile('image/webp')).toBe(true);
    expect(isImageFile('image/svg+xml')).toBe(true);
    expect(isImageFile('image/bmp')).toBe(true);
    expect(isImageFile('image/tiff')).toBe(true);
  });

  it('should return false for non-image MIME types', () => {
    expect(isImageFile('application/pdf')).toBe(false);
    expect(isImageFile('text/plain')).toBe(false);
    expect(isImageFile('application/json')).toBe(false);
    expect(isImageFile('video/mp4')).toBe(false);
    expect(isImageFile('audio/mpeg')).toBe(false);
    expect(isImageFile('application/octet-stream')).toBe(false);
  });

  it('should handle case sensitivity correctly', () => {
    expect(isImageFile('IMAGE/JPEG')).toBe(false); // MIME types are case-sensitive
    expect(isImageFile('Image/jpeg')).toBe(false);
  });

  it('should throw error for non-string input', () => {
    expect(() => isImageFile(null as any)).toThrow('MIME type must be a string');
    expect(() => isImageFile(undefined as any)).toThrow('MIME type must be a string');
    expect(() => isImageFile(123 as any)).toThrow('MIME type must be a string');
  });

  it('should handle empty strings', () => {
    expect(isImageFile('')).toBe(false);
  });

  it('should handle malformed MIME types', () => {
    expect(isImageFile('image')).toBe(true); // Still starts with 'image/'
    expect(isImageFile('image/')).toBe(true);
    expect(isImageFile('notimage/jpeg')).toBe(false);
  });
});

describe('exceedsMaxSize', () => {
  it('should return false when file size is within limit', () => {
    expect(exceedsMaxSize(1048576, 1)).toBe(false); // 1MB = 1MB limit
    expect(exceedsMaxSize(524288, 1)).toBe(false);  // 0.5MB < 1MB limit
    expect(exceedsMaxSize(0, 5)).toBe(false);       // 0 bytes < 5MB limit
  });

  it('should return true when file size exceeds limit', () => {
    expect(exceedsMaxSize(2097152, 1)).toBe(true);  // 2MB > 1MB limit
    expect(exceedsMaxSize(1048577, 1)).toBe(true);  // 1MB + 1 byte > 1MB limit
    expect(exceedsMaxSize(10485760, 5)).toBe(true); // 10MB > 5MB limit
  });

  it('should handle edge cases at exact limits', () => {
    expect(exceedsMaxSize(1048576, 1)).toBe(false); // Exactly 1MB
    expect(exceedsMaxSize(5242880, 5)).toBe(false); // Exactly 5MB
  });

  it('should handle zero limits', () => {
    expect(exceedsMaxSize(0, 0)).toBe(false); // 0 bytes = 0MB limit
    expect(exceedsMaxSize(1, 0)).toBe(true);  // Any size > 0MB limit
  });

  it('should handle fractional MB limits', () => {
    expect(exceedsMaxSize(524288, 0.5)).toBe(false); // 0.5MB = 0.5MB limit
    expect(exceedsMaxSize(524289, 0.5)).toBe(true);  // 0.5MB + 1 byte > 0.5MB limit
  });

  it('should throw error for negative file size', () => {
    expect(() => exceedsMaxSize(-1, 1)).toThrow('File size must be a non-negative finite number');
  });

  it('should throw error for negative max size', () => {
    expect(() => exceedsMaxSize(1000, -1)).toThrow('Maximum size must be a non-negative finite number');
  });

  it('should throw error for non-finite values', () => {
    expect(() => exceedsMaxSize(Infinity, 1)).toThrow('File size must be a non-negative finite number');
    expect(() => exceedsMaxSize(NaN, 1)).toThrow('File size must be a non-negative finite number');
    expect(() => exceedsMaxSize(1000, Infinity)).toThrow('Maximum size must be a non-negative finite number');
    expect(() => exceedsMaxSize(1000, NaN)).toThrow('Maximum size must be a non-negative finite number');
  });

  it('should handle large file sizes accurately', () => {
    // Test with GB-sized files
    const oneGB = 1024 * 1024 * 1024;
    expect(exceedsMaxSize(oneGB, 1024)).toBe(false); // 1GB < 1024MB
    expect(exceedsMaxSize(oneGB, 1023)).toBe(true);  // 1GB > 1023MB
  });
});