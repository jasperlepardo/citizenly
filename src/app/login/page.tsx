'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, DevLogin } from '@/components/organisms';
import { ThemeToggle } from '@/components/molecules';
import { useAuth } from '@/contexts/AuthContext';
import { useLastVisitedPage } from '@/hooks/utilities';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [showDevLogin, setShowDevLogin] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { getLastVisitedPage } = useLastVisitedPage();

  // Redirect authenticated users to last visited page or dashboard
  useEffect(() => {
    if (!loading && user) {
      const lastVisited = getLastVisitedPage();
      console.log('User already authenticated, redirecting to:', lastVisited);
      router.push(lastVisited);
    }
  }, [user, loading, router, getLastVisitedPage]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <h2 className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">Checking authentication...</h2>
        </div>
      </div>
    );
  }

  // Show login page only for unauthenticated users
  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="bg-white dark:bg-gray-800 relative flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Theme Toggle - positioned in top right */}
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="ghost" size="md" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-600 dark:text-gray-300">Citizenly</h1>
          <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">Records of Barangay Inhabitant System</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-400 dark:text-gray-500">Development Mode</h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div>If you can&apos;t login, the demo users may not exist yet.</div>
              <button
                onClick={() => setShowDevLogin(!showDevLogin)}
                className="text-gray-400 dark:text-gray-500 underline hover:text-gray-300 dark:hover:text-gray-400 dark:text-gray-600"
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
