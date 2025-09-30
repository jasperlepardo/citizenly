/**
 * Error Recovery Component
 * Enhanced error display with recovery actions
 */

'use client';

import React from 'react';

import { Button } from '@/components/atoms/Button/Button';
import { clientLogger } from '@/lib/logging/client-logger';

interface ErrorRecoveryProps {
  error: Error | null;
  errorDetails?: {
    hasError: boolean;
    canRetry: boolean;
    isAuthError: boolean;
    isNetworkError: boolean;
  };
  onRetry?: () => void;
  onClearError?: () => void;
  title?: string;
  showDetails?: boolean;
  className?: string;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  errorDetails,
  onRetry,
  onClearError,
  title = 'Something went wrong',
  showDetails = false,
  className = '',
}) => {
  if (!error && !errorDetails?.hasError) return null;

  const handleRetry = () => {
    clientLogger.userAction('error_recovery_retry', 'ErrorRecovery');
    if (onRetry) {
      onRetry();
    }
  };

  const handleClearError = () => {
    clientLogger.userAction('error_recovery_clear', 'ErrorRecovery');
    if (onClearError) {
      onClearError();
    }
  };

  const handleReload = () => {
    clientLogger.userAction('error_recovery_reload', 'ErrorRecovery');
    window.location.reload();
  };

  const getErrorMessage = () => {
    if (errorDetails?.isAuthError) {
      return 'Please log in again to continue.';
    }
    if (errorDetails?.isNetworkError) {
      return 'Network error - please check your connection and try again.';
    }
    return error?.message || 'An unexpected error occurred.';
  };

  const getErrorIcon = () => {
    if (errorDetails?.isAuthError) {
      return (
        <svg
          className="h-8 w-8 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      );
    }
    if (errorDetails?.isNetworkError) {
      return (
        <svg
          className="h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      );
    }
    return (
      <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    );
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{getErrorIcon()}</div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>

          <p className="mb-4 text-sm text-gray-600">{getErrorMessage()}</p>

          {showDetails && error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical Details
              </summary>
              <div className="mt-2 rounded bg-gray-50 p-3 font-mono text-xs break-words text-gray-700">
                <div>
                  <strong>Error:</strong> {error.name}
                </div>
                <div>
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-wrap gap-2">
            {errorDetails?.canRetry && onRetry && (
              <Button variant="primary" size="sm" onClick={handleRetry}>
                Try Again
              </Button>
            )}

            {onClearError && (
              <Button variant="secondary" size="sm" onClick={handleClearError}>
                Dismiss
              </Button>
            )}

            {errorDetails?.isAuthError && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => (window.location.href = '/login')}
              >
                Log In
              </Button>
            )}

            {errorDetails?.isNetworkError && (
              <Button variant="secondary" size="sm" onClick={handleReload}>
                Reload Page
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorRecovery;
