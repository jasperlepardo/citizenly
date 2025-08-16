/**
 * Lazy Component Loading Utilities
 *
 * @description Centralized lazy loading configuration for performance optimization.
 * Provides standardized loading states and error boundaries for dynamically imported components.
 *
 * @performance Benefits:
 * - Reduces initial bundle size
 * - Faster page load times
 * - Better Core Web Vitals scores
 * - Improved user experience on slower connections
 */

import React, { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from '@/providers/ErrorBoundary';

/**
 * Loading component for lazy-loaded components
 */
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
    <span className="text-gray-600 dark:text-gray-400">{message}</span>
  </div>
);

/**
 * Error fallback for lazy-loaded components
 */
const LazyErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-8 text-center">
    <div className="mb-4 text-red-600">
      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Component Failed to Load</h3>
    <p className="mb-4 text-gray-600 dark:text-gray-400">
      There was an error loading this component. Please try refreshing the page.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700"
    >
      Refresh Page
    </button>
  </div>
);

/**
 * Create a lazy-loaded component with standardized loading and error handling
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: ReactNode;
    errorFallback?: ReactNode;
    displayName?: string;
  } = {}
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);

  const WrappedComponent = (props: React.ComponentProps<T>) => (
    <ErrorBoundary
      fallback={
        options.errorFallback || <LazyErrorFallback error={new Error('Component loading failed')} />
      }
    >
      <Suspense fallback={options.fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  if (options.displayName) {
    WrappedComponent.displayName = `Lazy(${options.displayName})`;
  }

  return WrappedComponent;
}

/**
 * Preload a lazy component for better user experience
 */
export function preloadLazyComponent(importFn: () => Promise<any>) {
  // Preload the component when function is called
  const modulePromise = importFn();

  // Return a function to check if preload is complete
  return {
    preload: () => modulePromise,
    isPreloaded: () => {
      // Check if the module is already in the module cache
      return modulePromise !== undefined;
    },
  };
}

/**
 * Higher-order component for route-based lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  loadingMessage?: string
) {
  return function LazyWrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={<LazyErrorFallback error={new Error('Component loading failed')} />}>
        <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Pre-configured lazy loading for common component types
export const LazyLoadingPresets = {
  /**
   * For heavy data visualization components
   */
  chart: {
    fallback: <LoadingSpinner message="Loading chart..." />,
    errorFallback: <LazyErrorFallback error={new Error('Component loading failed')} />,
  },

  /**
   * For form components with complex validation
   */
  form: {
    fallback: <LoadingSpinner message="Loading form..." />,
    errorFallback: <LazyErrorFallback error={new Error('Component loading failed')} />,
  },

  /**
   * For modal dialogs
   */
  modal: {
    fallback: (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <LoadingSpinner message="Loading modal..." />
      </div>
    ),
    errorFallback: <LazyErrorFallback error={new Error('Component loading failed')} />,
  },

  /**
   * For table/data grid components
   */
  table: {
    fallback: (
      <div className="animate-pulse">
        <div className="mb-2 h-4 w-full rounded-sm bg-gray-200"></div>
        <div className="mb-2 h-4 w-full rounded-sm bg-gray-200"></div>
        <div className="h-4 w-3/4 rounded-sm bg-gray-200"></div>
      </div>
    ),
    errorFallback: <LazyErrorFallback error={new Error('Component loading failed')} />,
  },
};

/**
 * Lazy load components based on intersection observer
 */
export function useLazyLoadOnIntersection(
  ref: React.RefObject<Element>,
  importFn: () => Promise<any>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isIntersecting) {
          setIsIntersecting(true);
          importFn(); // Start loading the component
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, importFn, isIntersecting, options]);

  return isIntersecting;
}
