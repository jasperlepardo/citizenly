'use client';

import React, { Component, ReactNode } from 'react';

import { createWrappedComponent } from '@/utils/react/hocUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fieldName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically designed for form field components
 * Provides graceful fallback when field components fail to render
 */
export class FieldErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error in development or to monitoring service in production
    console.error('FieldSet component error:', error, errorInfo);

    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // monitoringService.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback or default fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="field-error-boundary">
          <div className="field-error-content">
            <div className="field-error-icon-container">
              <svg
                className="field-error-icon"
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
            <div className="field-error-text-container">
              <h3 className="field-error-title">Field Error</h3>
              <div className="field-error-message">
                {this.props.fieldName ? (
                  <>
                    The <strong>{this.props.fieldName}</strong> field failed to render properly.
                  </>
                ) : (
                  'This form field failed to render properly.'
                )}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="field-error-details">
                    <summary className="field-error-details-summary">Error Details</summary>
                    <pre className="field-error-details-content">{this.state.error.message}</pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap FieldSet components with error boundary
 */
export function withFieldErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fieldName?: string
) {
  return createWrappedComponent(Component, FieldErrorBoundary, 'withFieldErrorBoundary', {
    fieldName,
  });
}

// Hook moved to src/hooks/useFieldErrorHandler.ts
export { useFieldErrorHandler } from '@/hooks/utilities/useFieldErrorHandler';

export default FieldErrorBoundary;
