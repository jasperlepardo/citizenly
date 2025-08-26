'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components';
import { useAuth } from '@/contexts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
  requirePermission?: string;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requireRole,
  requirePermission,
  fallback,
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, userProfile, role, loading, profileLoading, hasPermission, isInRole } = useAuth();

  // Show loading state - give extra time during navigation
  const [isNavigating, setIsNavigating] = React.useState(false);

  React.useEffect(() => {
    if (loading || profileLoading) {
      setIsNavigating(true);
      const timer = setTimeout(() => setIsNavigating(false), 1000);
      return () => clearTimeout(timer);
    } else {
      // Reset navigating state when loading is complete
      setIsNavigating(false);
    }
  }, [loading, profileLoading]);

  // Auto-redirect to login when not authenticated
  React.useEffect(() => {
    if (!loading && !profileLoading && !user && !fallback) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, profileLoading, user, fallback, router]);

  // Only show loading screen for initial auth, not profile loading
  if (loading || isNavigating) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="bg-white dark:bg-gray-800 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto size-12 animate-spin text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-white dark:bg-gray-800 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto size-12 animate-spin text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show UI even if profile is loading - for better UX
  // Only block if profile is required for permission checks
  if (!userProfile && (requireRole || requirePermission)) {
    // If profile is still loading, show loading state
    if (profileLoading) {
      return (
        <div className="bg-white dark:bg-gray-800 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto size-12 animate-spin text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      );
    }

    // If not loading and no profile for permission checks, show error
    return (
      <div className="bg-white dark:bg-gray-800 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 shadow-md">
            <div className="mb-4 text-yellow-600">
              <svg
                className="mx-auto size-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">Profile Loading Error</h1>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Unable to load your profile. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()} variant="primary" size="sm" fullWidth>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requireRole && !isInRole(requireRole)) {
    return (
      <div className="bg-white dark:bg-gray-800 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 shadow-md">
            <div className="mb-4 text-yellow-600">
              <svg
                className="mx-auto size-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">Access Denied</h1>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              You need the <strong>{requireRole}</strong> role to access this page.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-xs">
              Your current role: <strong>{role?.name}</strong>
            </p>
            <Button
              onClick={() => window.history.back()}
              variant="neutral-outline"
              size="sm"
              fullWidth
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="bg-white dark:bg-gray-800 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 shadow-md">
            <div className="mb-4 text-red-600">
              <svg
                className="mx-auto size-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">Insufficient Permissions</h1>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-xs">
              Required permission: <strong>{requirePermission}</strong>
            </p>
            <Button
              onClick={() => window.history.back()}
              variant="neutral-outline"
              size="sm"
              fullWidth
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}
