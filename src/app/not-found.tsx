import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
          <p className="text-secondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button variant="primary" size="md" className="w-full">
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/">
            <Button variant="secondary" size="md" className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          <p className="text-sm text-secondary">
            Need help?{' '}
            <Link href="/help" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
