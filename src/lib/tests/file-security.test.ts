/**
 * @jest-environment node
 */

import {
  validateUploadedFile,
  sanitizeFileName,
  generateUniqueFileName,
  scanFileForViruses,
  logFileOperation,
} from '../security/file-security';

// Mock console methods
const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

describe('File Security Utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeFileName', () => {
    it('should sanitize unsafe characters', () => {
      const result = sanitizeFileName('test file@#$%.txt');
      expect(result).toBe('test_file_____.txt');
    });

    it('should replace multiple underscores', () => {
      const result = sanitizeFileName('test___file.txt');
      expect(result).toBe('test_file.txt');
    });

    it('should limit length and convert to lowercase', () => {
      const longName = 'a'.repeat(150) + '.txt';
      const result = sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(100);
      expect(result).toBe(result.toLowerCase());
    });
  });

  describe('generateUniqueFileName', () => {
    it('should generate unique filenames', () => {
      const name1 = generateUniqueFileName('test.txt');
      const name2 = generateUniqueFileName('test.txt');

      expect(name1).not.toBe(name2);
      expect(name1).toMatch(/test_\d+_[a-z0-9]+\.txt/);
      expect(name2).toMatch(/test_\d+_[a-z0-9]+\.txt/);
    });

    it('should preserve file extension', () => {
      const result = generateUniqueFileName('document.pdf');
      expect(result).toMatch(/\.pdf$/);
    });

    it('should handle files without extension', () => {
      const result = generateUniqueFileName('README');
      expect(result).toMatch(/readme_\d+_[a-z0-9]+\.undefined/);
    });
  });

  describe('validateUploadedFile', () => {
    // Create mock File objects for testing
    const createMockFile = (
      name: string,
      type: string,
      size: number,
      content?: ArrayBuffer
    ): File => {
      const mockFile = {
        name,
        type,
        size,
        slice: jest.fn().mockReturnValue({
          arrayBuffer: jest.fn().mockResolvedValue(content || new ArrayBuffer(0)),
        }),
        arrayBuffer: jest.fn().mockResolvedValue(content || new ArrayBuffer(0)),
      } as unknown as File;

      return mockFile;
    };

    it('should validate a good file', async () => {
      const jpegHeader = new ArrayBuffer(4);
      const view = new Uint8Array(jpegHeader);
      view.set([0xff, 0xd8, 0xff, 0xe0]); // JPEG header

      const goodFile = createMockFile('test.jpg', 'image/jpeg', 1000, jpegHeader);
      const result = await validateUploadedFile(goodFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fileInfo).toBeDefined();
    });

    it('should reject oversized files', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024); // 10MB
      const result = await validateUploadedFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('exceeds maximum allowed size'));
    });

    it('should reject empty files', async () => {
      const emptyFile = createMockFile('empty.jpg', 'image/jpeg', 0);
      const result = await validateUploadedFile(emptyFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File is empty');
    });

    it('should reject disallowed file types', async () => {
      const executableFile = createMockFile('virus.exe', 'application/x-executable', 1000);
      const result = await validateUploadedFile(executableFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('File type "application/x-executable" is not allowed')
      );
    });

    it('should reject files with malicious names', async () => {
      const maliciousFile = createMockFile('../../../etc/passwd', 'text/plain', 1000);
      const result = await validateUploadedFile(maliciousFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('directory traversal'));
    });

    it('should reject files with null bytes in name', async () => {
      const nullByteFile = createMockFile('test\0.jpg', 'image/jpeg', 1000);
      const result = await validateUploadedFile(nullByteFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File name contains null bytes');
    });

    it('should reject files with reserved names', async () => {
      const reservedFile = createMockFile('CON.txt', 'text/plain', 1000);
      const result = await validateUploadedFile(reservedFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('reserved and not allowed'));
    });

    it('should detect malicious file signatures', async () => {
      const maliciousContent = new ArrayBuffer(10);
      const view = new Uint8Array(maliciousContent);
      view.set([0x4d, 0x5a, 0x90, 0x00]); // PE executable signature

      const maliciousFile = createMockFile('image.jpg', 'image/jpeg', 1000, maliciousContent);
      const result = await validateUploadedFile(maliciousFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File contains potentially malicious content');
    });

    it('should validate image file headers', async () => {
      const invalidImageContent = new ArrayBuffer(10);
      const view = new Uint8Array(invalidImageContent);
      view.set([0x00, 0x00, 0x00, 0x00]); // Not a valid JPEG header

      const fakeImageFile = createMockFile('fake.jpg', 'image/jpeg', 1000, invalidImageContent);
      const result = await validateUploadedFile(fakeImageFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('does not appear to be a valid image/jpeg image')
      );
    });
  });

  describe('scanFileForViruses', () => {
    it('should mark small, safe files as clean', async () => {
      const safeFile = createMockFile('document.pdf', 'application/pdf', 1000);
      const result = await scanFileForViruses(safeFile);

      expect(result.clean).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] Virus scan requested')
      );
    });

    it('should mark large files as suspicious', async () => {
      const largeFile = createMockFile('large.zip', 'application/zip', 100 * 1024 * 1024);
      const result = await scanFileForViruses(largeFile);

      expect(result.clean).toBe(false);
      expect(result.threats).toContain('Suspicious file characteristics detected');
    });

    it('should mark executable files as suspicious', async () => {
      const executableFile = createMockFile('program.exe', 'application/x-executable', 1000);
      const result = await scanFileForViruses(executableFile);

      expect(result.clean).toBe(false);
      expect(result.threats).toContain('Suspicious file characteristics detected');
    });
  });

  describe('logFileOperation', () => {
    it('should log file operations', () => {
      logFileOperation('upload', 'test.jpg', 'user123', 'success', { size: 1000 });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[FILE_SECURITY_AUDIT]',
        expect.stringContaining('"operation":"FILE_UPLOAD"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FILE_SECURITY_AUDIT]',
        expect.stringContaining('"userId":"user123"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FILE_SECURITY_AUDIT]',
        expect.stringContaining('"result":"success"')
      );
    });

    it('should sanitize file names in logs', () => {
      logFileOperation('upload', 'malicious@#$.exe', 'user123', 'blocked');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[FILE_SECURITY_AUDIT]',
        expect.stringContaining('"fileName":"malicious_____.exe"')
      );
    });
  });

  // Helper function for creating mock files
  function createMockFile(name: string, type: string, size: number, content?: ArrayBuffer): File {
    const mockFile = {
      name,
      type,
      size,
      slice: jest.fn().mockReturnValue({
        arrayBuffer: jest.fn().mockResolvedValue(content || new ArrayBuffer(0)),
      }),
      arrayBuffer: jest.fn().mockResolvedValue(content || new ArrayBuffer(0)),
    } as unknown as File;

    return mockFile;
  }
});
