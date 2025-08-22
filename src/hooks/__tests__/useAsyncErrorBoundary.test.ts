/**
 * Test Suite for useAsyncErrorBoundary Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useAsyncErrorBoundary } from '../utilities/useAsyncErrorBoundary';

// Mock console methods to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('useAsyncErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAsyncErrorBoundary());

      expect(result.current.errorState.error).toBeNull();
      expect(result.current.errorState.hasError).toBe(false);
      expect(result.current.canRetry).toBe(false);
    });

    it('should accept custom options', () => {
      const options = {
        maxRetries: 5,
        enableRecovery: true,
        onError: jest.fn(),
      };

      const { result } = renderHook(() => useAsyncErrorBoundary(options));

      expect(result.current.errorState.error).toBeNull();
      expect(result.current.errorState.hasError).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should catch and handle async errors', async () => {
      const { result } = renderHook(() => useAsyncErrorBoundary());

      const failingFunction = jest.fn().mockRejectedValue(new Error('Test error'));

      await act(async () => {
        await result.current.wrapAsync(failingFunction, 'test operation');
      });

      expect(result.current.errorState.error).toBeInstanceOf(Error);
      expect(result.current.errorState.error?.message).toBe('Test error');
    });

    it('should call onError callback when error occurs', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => 
        useAsyncErrorBoundary({ onError })
      );

      const failingFunction = jest.fn().mockRejectedValue(new Error('Test error'));

      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(failingFunction, 'test operation');
        await wrappedFunction();
      });

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          operation: 'test operation',
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed operations when enableRecovery is true', async () => {
      const { result } = renderHook(() => 
        useAsyncErrorBoundary({ 
          maxRetries: 2, 
          enableRecovery: true 
        })
      );

      const failingFunction = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('Success');

      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(failingFunction, 'test operation');
        const result_value = await wrappedFunction();
        expect(result_value).toBe('Success');
      });

      expect(failingFunction).toHaveBeenCalledTimes(3);
      expect(result.current.retryCount).toBe(2);
    });

    it('should not retry when enableRecovery is false', async () => {
      const { result } = renderHook(() => 
        useAsyncErrorBoundary({ 
          maxRetries: 2, 
          enableRecovery: false 
        })
      );

      const failingFunction = jest.fn().mockRejectedValue(new Error('Test error'));

      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(failingFunction, 'test operation');
        await wrappedFunction();
      });

      expect(failingFunction).toHaveBeenCalledTimes(1);
      expect(result.current.retryCount).toBe(0);
    });

    it('should stop retrying after maxRetries', async () => {
      const { result } = renderHook(() => 
        useAsyncErrorBoundary({ 
          maxRetries: 2, 
          enableRecovery: true 
        })
      );

      const failingFunction = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(failingFunction, 'test operation');
        await wrappedFunction();
      });

      expect(failingFunction).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(result.current.retryCount).toBe(2);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('manual retry', () => {
    it('should allow manual retry of last failed operation', async () => {
      const { result } = renderHook(() => 
        useAsyncErrorBoundary({ enableRecovery: true })
      );

      const failingFunction = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('Success on retry');

      // First call fails
      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(failingFunction, 'test operation');
        await wrappedFunction();
      });

      expect(result.current.error).toBeInstanceOf(Error);

      // Manual retry succeeds
      await act(async () => {
        await result.current.retry();
      });

      expect(failingFunction).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
    });

    it('should not retry if no previous operation exists', async () => {
      const { result } = renderHook(() => useAsyncErrorBoundary());

      await act(async () => {
        await result.current.retry();
      });

      // Should not throw or cause issues
      expect(result.current.error).toBeNull();
    });
  });

  describe('error recovery', () => {
    it('should clear error state on successful operation', async () => {
      const { result } = renderHook(() => useAsyncErrorBoundary());

      const failingFunction = jest.fn().mockRejectedValue(new Error('Test error'));
      const successFunction = jest.fn().mockResolvedValue('Success');

      // First operation fails
      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(failingFunction, 'failing operation');
        await wrappedFunction();
      });

      expect(result.current.error).toBeInstanceOf(Error);

      // Second operation succeeds
      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(successFunction, 'success operation');
        const result_value = await wrappedFunction();
        expect(result_value).toBe('Success');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.retryCount).toBe(0);
    });

    it('should clear error state manually', () => {
      const { result } = renderHook(() => useAsyncErrorBoundary());

      // Set an error state
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.retryCount).toBe(0);
    });
  });

  describe('retry state management', () => {
    it('should track retry state correctly', async () => {
      const { result } = renderHook(() => 
        useAsyncErrorBoundary({ 
          maxRetries: 1, 
          enableRecovery: true,
          retryDelay: 10 // Short delay for testing
        })
      );

      const failingFunction = jest.fn().mockRejectedValue(new Error('Test error'));

      await act(async () => {
        const wrappedFunction = result.current.wrapAsync(failingFunction, 'test operation');
        
        // Start the operation
        const promise = wrappedFunction();
        
        // Should be retrying during the operation
        expect(result.current.isRetrying).toBe(true);
        
        await promise;
      });

      // Should not be retrying after completion
      expect(result.current.isRetrying).toBe(false);
    });
  });
});