'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/atoms/Button/Button';
import { useAuth } from '@/contexts/AuthContext';

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

  // Allow content to show immediately while auth is loading, but prevent redirect until auth is resolved
  if (loading || isNavigating) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    // Show content immediately - let pages handle their own loading states
    // Only block redirect until auth is resolved
    return <>{children}</>;
  }

  // Not authenticated - show content while redirect happens in background
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show children immediately, redirect will happen via useEffect
    return <>{children}</>;
  }

  // Show UI even if profile is loading - for better UX
  // Only block if profile is required for permission checks
  if (!userProfile && (requireRole || requirePermission)) {
    // If profile is still loading, show content while loading
    if (profileLoading) {
      return <>{children}</>;
    }

    // If not loading and no profile for permission checks, show error
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-800">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-md dark:border-gray-600 dark:bg-gray-800">
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
            <h1 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
              Profile Loading Error
            </h1>
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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-800">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-md dark:border-gray-600 dark:bg-gray-800">
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
            <h1 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
              Access Denied
            </h1>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              You need the <strong>{requireRole}</strong> role to access this page.
            </p>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-800">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-md dark:border-gray-600 dark:bg-gray-800">
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
            <h1 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
              Insufficient Permissions
            </h1>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              You don&apos;t have permission to access this page.
            </p>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
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
