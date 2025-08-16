'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/secure-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Unified Error Boundary Component
 *
 * Features:
 * - Automatic error logging
 * - Customizable fallback UI
 * - Error recovery with reset keys
 * - Error isolation levels
 * - Development vs production modes
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;

    // Log error with context
    logError(error, `ERROR_BOUNDARY_${level.toUpperCase()}`);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Auto-recover after 3 errors (circuit breaker pattern)
    if (this.state.errorCount >= 3) {
      this.scheduleReset(10000); // Reset after 10 seconds
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset on prop changes if enabled
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }

    // Reset when reset keys change
    if (hasError && resetKeys && this.previousResetKeys !== resetKeys) {
      if (resetKeys.some((key, idx) => key !== this.previousResetKeys[idx])) {
        this.resetErrorBoundary();
      }
    }

    this.previousResetKeys = resetKeys || [];
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  scheduleReset = (delay: number) => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback, isolate = true, level = 'component' } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        return <>{fallback}</>;
      }

      // Development mode - show detailed error
      if (process.env.NODE_ENV === 'development') {
        return (
          <div
            className={`error-boundary error-boundary--${level} rounded-lg border border-red-200 bg-red-50 p-6`}
          >
            <div className="mb-4">
              <h2 className="mb-2 text-xl font-bold text-red-700">
                {level === 'page'
                  ? 'Page Error'
                  : level === 'section'
                    ? 'Section Error'
                    : 'Component Error'}
              </h2>
              <p className="text-red-600">{error.message}</p>
            </div>

            <details className="mb-4">
              <summary className="cursor-pointer text-red-600 hover:text-red-700">
                Error Details
              </summary>
              <pre className="mt-2 overflow-auto rounded-sm bg-red-100 p-3 text-xs">{error.stack}</pre>
            </details>

            {errorInfo && (
              <details className="mb-4">
                <summary className="cursor-pointer text-red-600 hover:text-red-700">
                  Component Stack
                </summary>
                <pre className="mt-2 overflow-auto rounded-sm bg-red-100 p-3 text-xs">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.resetErrorBoundary}
                className="rounded bg-red-600 px-4 py-2 text-white dark:text-black transition-colors hover:bg-red-700"
              >
                Reset Component
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-gray-600 px-4 py-2 text-white dark:text-black dark:text-white transition-colors hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>

            {errorCount > 1 && (
              <p className="mt-3 text-sm text-red-600">
                This error has occurred {errorCount} times
              </p>
            )}
          </div>
        );
      }

      // Production mode - show user-friendly error
      return (
        <div className={`error-boundary error-boundary--${level} p-6 text-center`}>
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {level === 'page'
              ? 'Something went wrong with this page'
              : 'Something went wrong with this component'}
          </h3>

          <p className="mb-6 text-gray-600 dark:text-gray-400">
            We&rsquo;re sorry for the inconvenience. Please try again.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={this.resetErrorBoundary}
              className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black transition-colors hover:bg-blue-700"
            >
              Try Again
            </button>

            {level === 'page' && (
              <button
                onClick={() => (window.location.href = '/')}
                className="rounded bg-gray-200 dark:bg-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Go Home
              </button>
            )}
          </div>
        </div>
      );
    }

    // If isolate is false and there's an error, propagate it up
    if (!isolate && hasError) {
      throw error;
    }

    return children;
  }
}

// Convenience wrapper for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
