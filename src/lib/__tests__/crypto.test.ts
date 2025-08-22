/**
 * @jest-environment node
 */

import {
  encryptPII,
  decryptPII,
  hashData,
  generateSecureToken,
  validateHash,
  secureCompare,
} from '../crypto';

// Mock the secure logger
jest.mock('../secure-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Crypto Utilities', () => {
  const testData = 'sensitive personal information';
  const testPassword = 'secure-password-123';

  describe('encryptPII and decryptPII', () => {
    it('should encrypt and decrypt data successfully', async () => {
      const encrypted = await encryptPII(testData);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testData);
      expect(encrypted.length).toBeGreaterThan(testData.length);

      const decrypted = await decryptPII(encrypted);
      expect(decrypted).toBe(testData);
    });

    it('should produce different encrypted values for same input', async () => {
      const encrypted1 = await encryptPII(testData);
      const encrypted2 = await encryptPII(testData);
      
      expect(encrypted1).not.toBe(encrypted2);

      // Both should decrypt to the same value
      const decrypted1 = await decryptPII(encrypted1);
      const decrypted2 = await decryptPII(encrypted2);
      
      expect(decrypted1).toBe(testData);
      expect(decrypted2).toBe(testData);
    });

    it('should handle empty strings', async () => {
      const encrypted = await encryptPII('');
      const decrypted = await decryptPII(encrypted);
      
      expect(decrypted).toBe('');
    });

    it('should handle unicode characters', async () => {
      const unicodeData = 'José María Ñoño 🇵🇭';
      const encrypted = await encryptPII(unicodeData);
      const decrypted = await decryptPII(encrypted);
      
      expect(decrypted).toBe(unicodeData);
    });

    it('should throw error for invalid encrypted data', async () => {
      await expect(decryptPII('invalid-encrypted-data')).rejects.toThrow();
    });

    it('should throw error for corrupted encrypted data', async () => {
      const encrypted = await encryptPII(testData);
      const corrupted = encrypted.slice(0, -5) + 'xxxxx';
      
      await expect(decryptPII(corrupted)).rejects.toThrow();
    });
  });

  describe('hashData', () => {
    it('should create consistent hashes', async () => {
      const hash1 = await hashData(testData);
      const hash2 = await hashData(testData);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should create different hashes for different inputs', async () => {
      const hash1 = await hashData('input1');
      const hash2 = await hashData('input2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', async () => {
      const hash = await hashData('');
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it('should be deterministic across multiple calls', async () => {
      const input = 'test-consistency';
      const hashes = await Promise.all([
        hashData(input),
        hashData(input),
        hashData(input),
        hashData(input),
        hashData(input),
      ]);
      
      // All hashes should be identical
      expect(new Set(hashes).size).toBe(1);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate tokens of correct length', () => {
      const token16 = generateSecureToken(16);
      const token32 = generateSecureToken(32);
      const token64 = generateSecureToken(64);
      
      expect(token16).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(token32).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token64).toHaveLength(128); // 64 bytes = 128 hex chars
    });

    it('should generate unique tokens', () => {
      const tokens = Array.from({ length: 100 }, () => generateSecureToken(16));
      const uniqueTokens = new Set(tokens);
      
      expect(uniqueTokens.size).toBe(100); // All should be unique
    });

    it('should use default length when not specified', () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars (default)
    });

    it('should only contain hex characters', () => {
      const token = generateSecureToken(16);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('validateHash', () => {
    it('should validate correct data against hash', async () => {
      const hash = await hashData(testData);
      const isValid = await validateHash(testData, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect data against hash', async () => {
      const hash = await hashData(testData);
      const isValid = await validateHash('wrong data', hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject invalid hash format', async () => {
      const isValid = await validateHash(testData, 'invalid-hash');
      
      expect(isValid).toBe(false);
    });

    it('should handle empty data validation', async () => {
      const hash = await hashData('');
      const isValid = await validateHash('', hash);
      
      expect(isValid).toBe(true);
    });
  });

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const result = secureCompare('identical', 'identical');
      expect(result).toBe(true);
    });

    it('should return false for different strings', () => {
      const result = secureCompare('string1', 'string2');
      expect(result).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      const result = secureCompare('short', 'much longer string');
      expect(result).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(secureCompare('', '')).toBe(true);
      expect(secureCompare('', 'non-empty')).toBe(false);
      expect(secureCompare('non-empty', '')).toBe(false);
    });

    it('should be timing-safe (basic test)', () => {
      // This is a basic test - in practice, timing attacks are hard to test reliably
      const string1 = 'a'.repeat(1000);
      const string2 = 'b'.repeat(1000);
      const string3 = 'b' + 'a'.repeat(999); // Different at start
      const string4 = 'a'.repeat(999) + 'b'; // Different at end
      
      expect(secureCompare(string1, string2)).toBe(false);
      expect(secureCompare(string1, string3)).toBe(false);
      expect(secureCompare(string1, string4)).toBe(false);
    });

    it('should handle unicode characters', () => {
      const unicode1 = 'José María Ñoño 🇵🇭';
      const unicode2 = 'José María Ñoño 🇵🇭';
      const unicode3 = 'José María Niño 🇵🇭';
      
      expect(secureCompare(unicode1, unicode2)).toBe(true);
      expect(secureCompare(unicode1, unicode3)).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should work with realistic PII data', async () => {
      const philsysNumber = '1234-5678-9012-3456';
      const socialSecurityNumber = '123-45-6789';
      const creditCardNumber = '4532-1234-5678-9012';
      
      // Encrypt all sensitive data
      const encryptedPhilsys = await encryptPII(philsysNumber);
      const encryptedSSN = await encryptPII(socialSecurityNumber);
      const encryptedCC = await encryptPII(creditCardNumber);
      
      // Verify all encrypted values are different
      expect(encryptedPhilsys).not.toBe(encryptedSSN);
      expect(encryptedSSN).not.toBe(encryptedCC);
      expect(encryptedPhilsys).not.toBe(encryptedCC);
      
      // Decrypt and verify
      expect(await decryptPII(encryptedPhilsys)).toBe(philsysNumber);
      expect(await decryptPII(encryptedSSN)).toBe(socialSecurityNumber);
      expect(await decryptPII(encryptedCC)).toBe(creditCardNumber);
    });

    it('should handle concurrent encryption operations', async () => {
      const data = Array.from({ length: 10 }, (_, i) => `sensitive-data-${i}`);
      
      // Encrypt all data concurrently
      const encryptedData = await Promise.all(
        data.map(item => encryptPII(item))
      );
      
      // Decrypt all data concurrently
      const decryptedData = await Promise.all(
        encryptedData.map(item => decryptPII(item))
      );
      
      // Verify all data matches original
      expect(decryptedData).toEqual(data);
    });
  });
});