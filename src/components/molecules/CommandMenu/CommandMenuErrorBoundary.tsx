'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

import { logger } from '@/lib/logging';
import { createWrappedComponent } from '@/lib/hocUtils';

interface CommandMenuErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface CommandMenuErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class CommandMenuErrorBoundary extends Component<
  CommandMenuErrorBoundaryProps,
  CommandMenuErrorBoundaryState
> {
  constructor(props: CommandMenuErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<CommandMenuErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error securely
    logger.error('Command menu error boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In development, also console.error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('CommandMenu Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="relative w-full">
          {/* Fallback search input */}
          <div className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-left text-sm dark:border-red-800 dark:bg-red-900/20">
            <svg
              className="size-4 shrink-0 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="flex-1 text-red-700 dark:text-red-300">
              Search temporarily unavailable
            </span>
            <button
              onClick={() => {
                // Reset error boundary state
                this.setState({
                  hasError: false,
                  error: null,
                  errorInfo: null,
                });
              }}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for functional components
export function withCommandMenuErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return createWrappedComponent(
    Component,
    CommandMenuErrorBoundary,
    'withCommandMenuErrorBoundary',
    { fallback }
  );
}
