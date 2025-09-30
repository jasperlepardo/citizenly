'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { ThemeToggle } from '@/components/molecules/ThemeToggle/ThemeToggle';
import DevLogin from '@/components/organisms/DevLogin/DevLogin';
import LoginForm from '@/components/organisms/LoginForm/LoginForm';
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block size-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <h2 className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
            Checking authentication...
          </h2>
        </div>
      </div>
    );
  }

  // Show login page only for unauthenticated users
  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-white py-12 sm:px-6 lg:px-8 dark:bg-gray-800">
      {/* Theme Toggle - positioned in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="ghost" size="md" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-600 dark:text-gray-300">Citizenly</h1>
          <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
            Records of Barangay Inhabitant System
          </p>
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
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-medium text-gray-400 dark:text-gray-500">
              Development Mode
            </h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div>If you can&apos;t login, the demo users may not exist yet.</div>
              <button
                onClick={() => setShowDevLogin(!showDevLogin)}
                className="text-gray-400 underline hover:text-gray-300 dark:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
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
