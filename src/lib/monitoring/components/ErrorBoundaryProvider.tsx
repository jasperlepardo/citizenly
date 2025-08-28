/**
 * Error Boundary Provider Component
 * Global error boundary with monitoring integration
 */

'use client';

import React, { Component, ReactNode } from 'react';

import { clientLogger } from '@/lib/logging/client-logger';
import type { ErrorBoundaryProviderProps, ErrorFallbackProps } from '@/types/components';
import type { ErrorBoundaryState } from '@/types/errors';

import { captureError, addSentryBreadcrumb } from '../sentry-config';





/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorId, resetError }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h2 className="mb-2 text-center text-lg font-semibold text-gray-900">
        Oops! Something went wrong
      </h2>

      <p className="mb-4 text-center text-sm text-gray-600">
        We've encountered an unexpected error. Our team has been notified and is working to fix this
        issue.
      </p>

      <div className="mb-4 rounded bg-gray-50 p-3">
        <p className="mb-1 text-xs text-gray-500">Error ID: {errorId}</p>
        <p className="font-mono text-xs text-red-600">{error.message}</p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={resetError}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Try Again
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        >
          Reload Page
        </button>
      </div>

      <div className="mt-4 text-center">
        <a href="/support" className="text-xs text-blue-600 underline hover:text-blue-800">
          Contact Support
        </a>
      </div>
    </div>
  </div>
);

/**
 * Error Boundary Provider Class Component
 */
export class ErrorBoundaryProvider extends Component<
  ErrorBoundaryProviderProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProviderProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorId: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, enableReporting = true } = this.props;
    const { errorId } = this.state;

    // Log error locally
    clientLogger.error(`React Error Boundary caught error: ${error.message}`, {
      component: 'ErrorBoundary',
      action: 'error_caught',
      error,
      data: {
        errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    // Add breadcrumb for debugging
    addSentryBreadcrumb(`Error boundary caught: ${error.message}`, 'error_boundary', 'error');

    // Report to monitoring service
    if (enableReporting) {
      captureError(error, {
        errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Call custom error handler
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        clientLogger.error('Error in error boundary handler', {
          action: 'error_boundary_handler_error',
          data: {
            error: handlerError instanceof Error ? handlerError.message : String(handlerError),
            originalError: error.message,
          },
        });
      }
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorId: undefined,
    });

    clientLogger.info('Error boundary reset', {
      component: 'ErrorBoundary',
      action: 'error_reset',
    });

    addSentryBreadcrumb('Error boundary reset', 'error_boundary', 'info');
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback: FallbackComponent = DefaultErrorFallback } = this.props;

    if (hasError && error && errorId) {
      return <FallbackComponent error={error} errorId={errorId} resetError={this.resetError} />;
    }

    return children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Partial<ErrorBoundaryProviderProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryProvider {...options}>
      <Component {...props} />
    </ErrorBoundaryProvider>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
