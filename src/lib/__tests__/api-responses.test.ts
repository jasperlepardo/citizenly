/**
 * @jest-environment node
 */

import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
  handleDatabaseError,
  handleUnexpectedError,
} from '../api-responses';
import { ErrorCode, Role } from '.../api-types';

// Mock logger to avoid console output during tests
jest.mock('../logging/secure-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock audit functions
jest.mock('../api-audit', () => ({
  auditError: jest.fn(),
}));

describe('API Response Utilities', () => {
  const mockContext = {
    userId: 'test-user-123',
    userRole: Role.BARANGAY_ADMIN,
    requestId: 'test-request-123',
    path: '/api/test',
    method: 'GET',
    timestamp: new Date().toISOString(),
  };

  describe('createSuccessResponse', () => {
    it('should create a successful response with data', async () => {
      const data = { id: 1, name: 'Test User' };
      const response = createSuccessResponse(data, 'User retrieved successfully', mockContext);

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.data).toEqual(data);
      expect(responseData.message).toBe('User retrieved successfully');
      expect(responseData.metadata).toHaveProperty('timestamp');
      expect(responseData.metadata.requestId).toBe(mockContext.requestId);
    });

    it('should create a response without message', async () => {
      const data = { result: 'success' };
      const response = createSuccessResponse(data);

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.data).toEqual(data);
      expect(responseData.message).toBeUndefined();
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response with all details', async () => {
      const response = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid input data',
        422,
        { field: 'email' },
        'email',
        mockContext
      );

      expect(response.status).toBe(422);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.message).toBe('Invalid input data');
      expect(responseData.error.details).toEqual({ field: 'email' });
      expect(responseData.error.field).toBe('email');
      expect(responseData.path).toBe(mockContext.path);
      expect(responseData.requestId).toBe(mockContext.requestId);
    });

    it('should use default status code', async () => {
      const response = createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Something went wrong');

      expect(response.status).toBe(500);
    });
  });

  describe('createValidationErrorResponse', () => {
    it('should create a validation error response', async () => {
      const details = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 8 characters' },
      ];

      const response = createValidationErrorResponse(details, mockContext);

      expect(response.status).toBe(422);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.message).toBe('Invalid input data');
      expect(responseData.error.details).toEqual(details);
    });
  });

  describe('createUnauthorizedResponse', () => {
    it('should create an unauthorized response', async () => {
      const response = createUnauthorizedResponse('Invalid token', mockContext);

      expect(response.status).toBe(401);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(responseData.error.message).toBe('Invalid token');
    });

    it('should use default message', async () => {
      const response = createUnauthorizedResponse();

      expect(response.status).toBe(401);

      const responseData = await response.json();
      expect(responseData.error.message).toBe('Authentication required');
    });
  });

  describe('createNotFoundResponse', () => {
    it('should create a not found response', async () => {
      const response = createNotFoundResponse('User', mockContext);

      expect(response.status).toBe(404);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.NOT_FOUND);
      expect(responseData.error.message).toBe('User not found');
    });

    it('should use default resource name', async () => {
      const response = createNotFoundResponse();

      expect(response.status).toBe(404);

      const responseData = await response.json();
      expect(responseData.error.message).toBe('Resource not found');
    });
  });

  describe('handleDatabaseError', () => {
    it('should handle unique constraint violation', async () => {
      const dbError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      };

      const response = await handleDatabaseError(dbError, mockContext);

      expect(response.status).toBe(409);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.CONFLICT);
      expect(responseData.error.message).toBe('Resource already exists');
    });

    it('should handle foreign key violation', async () => {
      const dbError = {
        code: '23503',
        message: 'insert or update on table violates foreign key constraint',
      };

      const response = await handleDatabaseError(dbError, mockContext);

      expect(response.status).toBe(400);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.message).toBe('Invalid reference to related resource');
    });

    it('should handle table not found error', async () => {
      const dbError = {
        code: '42P01',
        message: 'relation "nonexistent_table" does not exist',
      };

      const response = await handleDatabaseError(dbError, mockContext);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(responseData.error.message).toBe('Database configuration error');
    });

    it('should handle generic database error', async () => {
      const dbError = {
        code: 'UNKNOWN',
        message: 'Generic database error',
      };

      const response = await handleDatabaseError(dbError, mockContext);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.DATABASE_ERROR);
      expect(responseData.error.message).toBe('Database operation failed');
    });
  });

  describe('handleUnexpectedError', () => {
    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error occurred');
      error.stack = 'Error: Unexpected error\n    at test.js:1:1';

      const response = await handleUnexpectedError(error, mockContext);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(responseData.error.message).toBe('An unexpected error occurred');
    });

    it('should include error details in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });

      const error = new Error('Test error');
      const response = await handleUnexpectedError(error, mockContext);

      const responseData = await response.json();
      expect(responseData.error.details).toBeDefined();

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv });
    });

    it('should not include error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });

      const error = new Error('Test error');
      const response = await handleUnexpectedError(error, mockContext);

      const responseData = await response.json();
      expect(responseData.error.details).toBeUndefined();

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv });
    });
  });
});
