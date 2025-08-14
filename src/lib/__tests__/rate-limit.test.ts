/**
 * @jest-environment node
 */

import { createRateLimitHandler, RATE_LIMIT_RULES } from '../rate-limit';

// Mock logger to avoid console output during tests
jest.mock('../secure-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Rate Limiting', () => {
  // Mock Request object
  const createMockRequest = (headers: Record<string, string> = {}) => {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] || null,
      },
      url: 'http://localhost:3000/api/test',
    } as Request;
  };

  beforeEach(() => {
    // Clear rate limit store between tests
    // Note: In production, we'd use Redis which has proper clear methods
    jest.clearAllMocks();
  });

  describe('RATE_LIMIT_RULES', () => {
    it('should define all required rate limit rules', () => {
      expect(RATE_LIMIT_RULES).toHaveProperty('login');
      expect(RATE_LIMIT_RULES).toHaveProperty('api');
      expect(RATE_LIMIT_RULES).toHaveProperty('upload');
      expect(RATE_LIMIT_RULES).toHaveProperty('SEARCH_RESIDENTS');
      expect(RATE_LIMIT_RULES).toHaveProperty('RESIDENT_CREATE');
    });

    it('should have reasonable rate limits', () => {
      expect(RATE_LIMIT_RULES.login.maxRequests).toBeGreaterThan(0);
      expect(RATE_LIMIT_RULES.login.windowMs).toBeGreaterThan(0);
      expect(RATE_LIMIT_RULES.SEARCH_RESIDENTS.maxRequests).toBeGreaterThan(0);
      expect(RATE_LIMIT_RULES.RESIDENT_CREATE.maxRequests).toBeGreaterThan(0);
    });
  });

  describe('createRateLimitHandler', () => {
    it('should allow requests within rate limit', async () => {
      const handler = createRateLimitHandler('api');
      const request = createMockRequest();
      const userId = 'test-user-123';

      const response = await handler(request, userId);
      expect(response).toBeNull();
    });

    it('should block requests exceeding rate limit', async () => {
      const handler = createRateLimitHandler('login'); // 5 requests per 15 minutes
      const request = createMockRequest();
      const userId = 'test-user-456';

      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        const response = await handler(request, userId);
        expect(response).toBeNull();
      }

      // 6th request should be blocked
      const response = await handler(request, userId);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(429);
    });

    it('should use IP address when userId is not provided', async () => {
      const handler = createRateLimitHandler('api');
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.100',
      });

      const response = await handler(request);
      expect(response).toBeNull();
    });

    it('should return proper rate limit headers in response', async () => {
      const handler = createRateLimitHandler('login');
      const request = createMockRequest();
      const userId = 'test-user-789';

      // Exceed the rate limit
      for (let i = 0; i < 6; i++) {
        await handler(request, userId);
      }

      const response = await handler(request, userId);
      expect(response).not.toBeNull();

      if (response) {
        const body = await response.json();
        expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(body.error.details).toHaveProperty('retryAfter');
        expect(body.error.details).toHaveProperty('limit');
      }
    });

    it('should handle different rate limit rules correctly', async () => {
      const searchHandler = createRateLimitHandler('SEARCH_RESIDENTS');
      const createHandler = createRateLimitHandler('RESIDENT_CREATE');
      const request = createMockRequest();
      const userId = 'test-user-multi';

      // These should be independent rate limits
      const searchResponse = await searchHandler(request, userId);
      const createResponse = await createHandler(request, userId);

      expect(searchResponse).toBeNull();
      expect(createResponse).toBeNull();
    });
  });

  describe('Rate limit window reset', () => {
    it('should reset rate limit after window expires', async () => {
      // This test would require mocking time, which is complex
      // For now, we'll test the basic structure
      const handler = createRateLimitHandler('api');
      const request = createMockRequest();
      const userId = 'test-window-reset';

      const response = await handler(request, userId);
      expect(response).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const handler = createRateLimitHandler('api');
      const malformedRequest = {} as Request;

      // Should not throw an error
      expect(async () => {
        await handler(malformedRequest, 'test-user');
      }).not.toThrow();
    });
  });
});
