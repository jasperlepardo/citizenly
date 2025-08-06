'use client';

import React from 'react';
import { Button } from '@/components/atoms/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-danger mb-2">Something went wrong</h1>
          <p className="text-secondary">An unexpected error occurred. Please try again.</p>
        </div>

        <div className="space-y-4">
          <Button onClick={reset} variant="primary" size="md" className="w-full">
            Try again
          </Button>

          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="secondary"
            size="md"
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-secondary">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 p-4 bg-background-muted rounded text-xs overflow-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
