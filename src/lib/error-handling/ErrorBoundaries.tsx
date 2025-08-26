/**
 * Error Boundary Utilities
 *
 * @description Utility functions and factories for creating error boundary components.
 * Contains reusable error boundary logic and fallback component generators.
 */

import React from 'react';

import type { ErrorBoundaryState, ErrorFallbackProps, ErrorLogContext } from './error-types';
import { logError, errorUtils, getErrorMessage } from './error-utils';

/**
 * Create error boundary state from error
 */
export function createErrorBoundaryState(error: Error): ErrorBoundaryState {
  return {
    hasError: true,
    error,
    errorId: errorUtils.generateErrorId(),
    retryCount: 0,
  };
}

/**
 * Handle error boundary error logging
 */
export function handleErrorBoundaryError(
  error: Error,
  errorInfo: React.ErrorInfo,
  context: Partial<ErrorLogContext> = {}
): void {
  logError(error, {
    ...context,
    component: 'ErrorBoundary',
    action: 'componentDidCatch',
    errorInfo: {
      componentStack: errorInfo.componentStack || undefined,
    },
  });
}

/**
 * Check if error boundary should retry
 */
export function shouldRetryError(error: Error, retryCount: number, maxRetries: number): boolean {
  return retryCount < maxRetries && errorUtils.isRetryableError(error);
}

/**
 * Create default error fallback component
 */
export function createDefaultErrorFallback() {
  return function DefaultErrorFallback({
    error,
    resetError,
    retryCount = 0,
    maxRetries = 3,
  }: ErrorFallbackProps) {
    const canRetry = shouldRetryError(error, retryCount, maxRetries);
    const userMessage = errorUtils.getUserFriendlyMessage(error);

    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-800">
        <div className="max-w-4 space-y-4 p-8 text-center">
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 text-red-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-foreground text-2xl font-bold">Something went wrong</h1>
            <p className="text-zinc-500 dark:text-zinc-400">{userMessage}</p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-2">
              <details className="bg-muted rounded-lg p-4 text-left">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 text-sm whitespace-pre-wrap text-zinc-500 dark:text-zinc-400">
                  {getErrorMessage(error)}
                </pre>
              </details>
            </div>
          )}

          <div className="flex justify-center gap-2">
            {canRetry && (
              <button
                onClick={resetError}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-600/90 dark:text-black"
              >
                Try Again {retryCount > 0 && `(${maxRetries - retryCount} attempts left)`}
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/')}
              className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-600/90 dark:text-black"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  };
}

/**
 * Create field-specific error fallback component
 */
export function createFieldErrorFallback(fieldName?: string) {
  return function FieldErrorFallback({ error }: { error: Error }) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
        <div className="flex items-center">
          <div className="shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Field Error</h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
              {fieldName ? (
                <>
                  The <strong>{fieldName}</strong> field failed to render properly.
                </>
              ) : (
                'This form field failed to render properly.'
              )}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">{getErrorMessage(error)}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
}

/**
 * Error boundary component factory
 */
export function createErrorBoundaryComponent(
  options: {
    fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
    maxRetries?: number;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    logContext?: Partial<ErrorLogContext>;
  } = {}
) {
  const {
    fallbackComponent = createDefaultErrorFallback(),
    maxRetries = 3,
    onError,
    logContext = {},
  } = options;

  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false, retryCount: 0 };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return createErrorBoundaryState(error);
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      handleErrorBoundaryError(error, errorInfo, logContext);
      onError?.(error, errorInfo);
    }

    resetError = () => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: (prevState.retryCount || 0) + 1,
      }));
    };

    render() {
      if (this.state.hasError && this.state.error) {
        const FallbackComponent = fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
            retryCount={this.state.retryCount}
            maxRetries={maxRetries}
          />
        );
      }

      return this.props.children;
    }
  };
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    componentName?: string;
  } = {}
) {
  const ErrorBoundary = createErrorBoundaryComponent({
    ...options,
    logContext: { component: options.componentName || Component.displayName || Component.name },
  });

  const WrappedComponent = (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Error boundary utilities
 */
export const errorBoundaryUtils = {
  /**
   * Create a retry-enabled error boundary
   */
  createRetryBoundary: (maxRetries: number = 3) => {
    return createErrorBoundaryComponent({
      maxRetries,
      fallbackComponent: createDefaultErrorFallback(),
    });
  },

  /**
   * Create a field-specific error boundary
   */
  createFieldBoundary: (fieldName?: string) => {
    return createErrorBoundaryComponent({
      fallbackComponent: () =>
        createFieldErrorFallback(fieldName)({ error: new Error('Field error') }),
      maxRetries: 1,
      logContext: { component: 'FieldErrorBoundary', field: fieldName },
    });
  },

  /**
   * Create a component-specific error boundary
   */
  createComponentBoundary: (componentName: string) => {
    return createErrorBoundaryComponent({
      logContext: { component: componentName },
    });
  },
};
