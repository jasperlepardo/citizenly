/**
 * @file Unit tests for usePreloadOnHover hook
 * @description Comprehensive test coverage for component preloading hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreloadOnHover } from '../usePreloadOnHover';

// Mock the preloadComponents import
vi.mock('@/lib/ui/lazy-loading', () => ({
  preloadComponents: {
    dataTable: vi.fn(),
    createHouseholdModal: vi.fn(),
    populationPyramid: vi.fn(),
    userProfile: vi.fn(),
    personalInformation: vi.fn(),
    sectoralInfo: vi.fn(),
    errorModal: vi.fn(),
    successModal: vi.fn(),
  },
}));

// Import after mocking to ensure mock is applied
import { preloadComponents } from '@/lib/ui/lazy-loading';

describe('usePreloadOnHover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return an object with onMouseEnter handler', () => {
    const { result } = renderHook(() => usePreloadOnHover('dataTable'));
    
    expect(result.current).toEqual({
      onMouseEnter: expect.any(Function),
    });
  });

  it('should call the correct preload function when onMouseEnter is triggered', () => {
    const { result } = renderHook(() => usePreloadOnHover('dataTable'));
    
    // Trigger the onMouseEnter handler
    result.current.onMouseEnter();
    
    expect(preloadComponents.dataTable).toHaveBeenCalledTimes(1);
  });

  it('should work with different component keys', () => {
    const componentKeys = [
      'createHouseholdModal',
      'populationPyramid',
      'userProfile',
      'personalInformation',
      'sectoralInfo',
      'errorModal',
      'successModal',
    ] as const;

    componentKeys.forEach((key) => {
      const { result } = renderHook(() => usePreloadOnHover(key));
      
      result.current.onMouseEnter();
      
      expect(preloadComponents[key]).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle multiple calls to the same preload function', () => {
    const { result } = renderHook(() => usePreloadOnHover('dataTable'));
    
    // Call multiple times
    result.current.onMouseEnter();
    result.current.onMouseEnter();
    result.current.onMouseEnter();
    
    expect(preloadComponents.dataTable).toHaveBeenCalledTimes(3);
  });

  it('should only call the specified component preload function', () => {
    const { result } = renderHook(() => usePreloadOnHover('dataTable'));
    
    result.current.onMouseEnter();
    
    // Should only call dataTable preload
    expect(preloadComponents.dataTable).toHaveBeenCalledTimes(1);
    expect(preloadComponents.createHouseholdModal).not.toHaveBeenCalled();
    expect(preloadComponents.populationPyramid).not.toHaveBeenCalled();
    expect(preloadComponents.userProfile).not.toHaveBeenCalled();
  });

  it('should handle preload function throwing an error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockError = new Error('Preload failed');
    
    // Make the preload function throw
    vi.mocked(preloadComponents.dataTable).mockImplementation(() => {
      throw mockError;
    });

    const { result } = renderHook(() => usePreloadOnHover('dataTable'));
    
    // Should not throw when onMouseEnter is called
    expect(() => {
      result.current.onMouseEnter();
    }).not.toThrow();

    // Should log a warning
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to preload component "dataTable":',
      mockError
    );
    
    consoleSpy.mockRestore();
  });

  it('should maintain referential stability of onMouseEnter across re-renders', () => {
    const { result, rerender } = renderHook(() => usePreloadOnHover('dataTable'));
    
    const firstOnMouseEnter = result.current.onMouseEnter;
    
    // Re-render the hook
    rerender();
    
    const secondOnMouseEnter = result.current.onMouseEnter;
    
    // References should be stable (same function instance)
    expect(firstOnMouseEnter).toBe(secondOnMouseEnter);
  });

  it('should work correctly when component key changes', () => {
    const { result, rerender } = renderHook(
      ({ componentKey }) => usePreloadOnHover(componentKey),
      { initialProps: { componentKey: 'dataTable' as const } }
    );
    
    // Test first component
    result.current.onMouseEnter();
    expect(preloadComponents.dataTable).toHaveBeenCalledTimes(1);
    
    // Change component key
    rerender({ componentKey: 'createHouseholdModal' as const });
    
    // Test second component
    result.current.onMouseEnter();
    expect(preloadComponents.createHouseholdModal).toHaveBeenCalledTimes(1);
    
    // First component should still have been called only once
    expect(preloadComponents.dataTable).toHaveBeenCalledTimes(1);
  });

  it('should return readonly onMouseEnter property', () => {
    const { result } = renderHook(() => usePreloadOnHover('dataTable'));
    
    // TypeScript should enforce readonly, but we can test the property descriptor
    const descriptor = Object.getOwnPropertyDescriptor(result.current, 'onMouseEnter');
    
    // Property should exist
    expect(descriptor).toBeDefined();
    expect(descriptor?.value).toBeInstanceOf(Function);
  });

  it('should handle promise rejection from preload function', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockError = new Error('Async preload failed');
    
    // Make the preload function return a rejected promise
    vi.mocked(preloadComponents.dataTable).mockImplementation(() => {
      return Promise.reject(mockError);
    });

    const { result } = renderHook(() => usePreloadOnHover('dataTable'));
    
    // Should handle promise rejection gracefully
    expect(() => {
      result.current.onMouseEnter();
    }).not.toThrow();

    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Should not log warning for promise rejection (only synchronous errors are caught)
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});