'use client';

import React, { useState } from 'react';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

// Dynamically import components that use context to prevent SSR issues
const LoginForm = dynamicImport(() => import('@/components/auth/LoginForm'), {
  ssr: false,
  loading: () => (
    <div className="text-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary-400 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-secondary">Loading...</p>
    </div>
  ),
});

const DevLogin = dynamicImport(() => import('@/components/auth/DevLogin'), {
  ssr: false,
  loading: () => (
    <div className="text-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary-400 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-secondary">Loading...</p>
    </div>
  ),
});

const ThemeToggle = dynamicImport(() => import('@/components/atoms/ThemeToggle').then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => (
    <div className="w-9 h-9 animate-pulse bg-surface-hover rounded-md"></div>
  ),
});

export default function LoginPage() {
  const [showDevLogin, setShowDevLogin] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Theme Toggle - positioned in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="ghost" size="md" />
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Citizenly</h1>
          <p className="text-secondary text-sm mb-8">Records of Barangay Inhabitant System</p>
        </div>

        {showDevLogin ? (
          <DevLogin onSuccess={() => (window.location.href = '/dashboard')} />
        ) : (
          <LoginForm />
        )}

        <div className="mt-8 text-center">
          <div className="bg-surface border border-default rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-400 mb-2">Development Mode</h3>
            <div className="text-xs text-secondary space-y-2">
              <div>If you can&apos;t login, the demo users may not exist yet.</div>
              <button
                onClick={() => setShowDevLogin(!showDevLogin)}
                className="text-primary-400 hover:text-primary-300 underline"
              >
                {showDevLogin ? 'Back to Login Form' : 'Setup Demo Users'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}