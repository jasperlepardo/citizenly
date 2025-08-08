'use client';

import React, { useState } from 'react';
import { LoginForm, DevLogin } from '@/components/organisms';
import { ThemeToggle } from '@/components/molecules';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [showDevLogin, setShowDevLogin] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col justify-center py-12 bg-background sm:px-6 lg:px-8">
      {/* Theme Toggle - positioned in top right */}
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="ghost" size="md" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-primary">Citizenly</h1>
          <p className="mb-8 text-sm text-secondary">Records of Barangay Inhabitant System</p>
        </div>

        {showDevLogin ? (
          <DevLogin
            onSuccess={() => {
              window.location.href = '/dashboard';
            }}
          />
        ) : (
          <LoginForm />
        )}

        <div className="mt-8 text-center">
          <div className="rounded-lg border p-4 bg-surface border-default">
            <h3 className="mb-2 text-sm font-medium text-primary-400">Development Mode</h3>
            <div className="space-y-2 text-xs text-secondary">
              <div>If you can&apos;t login, the demo users may not exist yet.</div>
              <button
                onClick={() => setShowDevLogin(!showDevLogin)}
                className="text-primary-400 underline hover:text-primary-300"
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
