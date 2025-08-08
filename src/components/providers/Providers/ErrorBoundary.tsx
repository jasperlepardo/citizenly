'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md rounded-lg bg-red-50 p-6 text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-900">
              Something went wrong
            </h1>
            <p className="mb-4 text-red-700">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}