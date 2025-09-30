'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/atoms/Button/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLastVisitedPage } from '@/hooks/utilities';

/**
 * HomePage Component
 *
 * @description Renders the home page interface for the application
 * @returns {JSX.Element} The rendered HomePage component
 *
 * @example
 * ```typescript
 * function App() {
 *   return <HomePage />;
 * }
 * ```
 */
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { getLastVisitedPage } = useLastVisitedPage();

  useEffect(() => {
    document.title = 'Citizenly - Barangay Management System';
  }, []);

  // Handle authentication-based routing
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Authenticated users: go to last visited page or dashboard
        const lastVisited = getLastVisitedPage();
        console.log('User is authenticated, redirecting to:', lastVisited);
        router.push(lastVisited);
      } else {
        // Unauthenticated users: go directly to login for PWA
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [user, loading, router, getLastVisitedPage]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block size-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <h2 className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show landing page only for unauthenticated users
  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="from-primary-50 to-primary-100 min-h-screen bg-linear-to-br dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <header
        className="border-b border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800"
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="font-montserrat text-xl font-semibold text-gray-900 dark:text-gray-100">
                Citizenly
              </h1>
            </div>
            <nav
              className="flex items-center space-x-4"
              role="navigation"
              aria-label="Main navigation"
            >
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:text-gray-900 dark:hover:text-gray-100"
              >
                Sign In
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm" aria-label="Get started with Citizenly">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" role="main">
        <section className="text-center" aria-labelledby="hero-title">
          <h2
            id="hero-title"
            className="font-montserrat text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-gray-100"
          >
            <span className="block">Citizenly</span>
            <span className="mt-2 block text-2xl text-gray-700 sm:text-3xl md:text-4xl dark:text-gray-300">
              Records of Barangay Inhabitant System
            </span>
          </h2>
          <p className="font-montserrat mx-auto mt-3 max-w-md text-base text-gray-700 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl dark:text-gray-300">
            Complete digital solution for Philippine barangay resident management, built for local
            government units to efficiently manage their communities.
          </p>

          {/* Icon Test & Click Test */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <i className="fas fa-home text-xl text-blue-600" title="Home"></i>
            <i className="fas fa-users text-xl text-green-600" title="Users"></i>
            <i className="fas fa-tachometer-alt text-xl text-yellow-600" title="Dashboard"></i>
            <i className="fas fa-cog text-xl text-purple-600" title="Settings"></i>
          </div>

          {/* Click Test Button */}
          <div className="mt-4 text-center">
            <button
              className="debug-click cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={() => toast.success('Button clicked! Interactions are working.')}
              onMouseEnter={() => console.log('Button hovered')}
              style={{ position: 'relative', zIndex: 1000 }}
            >
              Test Click Here
            </button>
          </div>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow-sm">
              <Link href="/login" aria-label="Access the Citizenly barangay management system">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow-sm sm:mt-0 sm:ml-3">
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-20" aria-labelledby="features-title">
          <div className="text-center">
            <h3
              id="features-title"
              className="font-montserrat mb-12 text-3xl font-extrabold text-gray-900 dark:text-gray-100"
            >
              Everything you need to manage your barangay
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Resident Management */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <svg
                  className="size-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="font-montserrat mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                Resident Management
              </h3>
              <p className="font-montserrat text-gray-600 dark:text-gray-400">
                Complete resident registration with demographics, family relationships, and PSOC
                integration for comprehensive household management.
              </p>
            </div>

            {/* Address System */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <svg
                  className="size-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 12.414a2 2 0 10-2.828 2.828l4.243 4.243a2 2 0 002.828-2.828z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="font-montserrat mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                Smart Address System
              </h3>
              <p className="font-montserrat text-gray-600 dark:text-gray-400">
                Complete Philippine geographic hierarchy with cascading dropdowns, address
                validation, and PSGC compliance.
              </p>
            </div>

            {/* Analytics */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <svg
                  className="size-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-montserrat mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                Reports & Analytics
              </h3>
              <p className="font-montserrat text-gray-600 dark:text-gray-400">
                Generate comprehensive reports, population analytics, and demographic insights for
                informed decision making.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <svg
                  className="size-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="font-montserrat mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                Advanced Search
              </h3>
              <p className="font-montserrat text-gray-600 dark:text-gray-400">
                Powerful search and filtering capabilities to quickly find residents, households,
                and generate targeted lists.
              </p>
            </div>

            {/* Security */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <svg
                  className="size-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-montserrat mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                Secure & Compliant
              </h3>
              <p className="font-montserrat text-gray-600 dark:text-gray-400">
                Built with security best practices, data privacy compliance, and role-based access
                control for safe operations.
              </p>
            </div>

            {/* Digital Forms */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <svg
                  className="size-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-montserrat mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                Digital Forms
              </h3>
              <p className="font-montserrat text-gray-600 dark:text-gray-400">
                Streamlined digital forms for certifications, business permits, and other barangay
                documents with automated processing.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20" aria-labelledby="cta-title">
          <div className="mt-20 rounded-2xl bg-blue-600 shadow-xl dark:bg-blue-700">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
              <div className="text-center">
                <h2
                  id="cta-title"
                  className="font-montserrat text-3xl font-extrabold text-white dark:text-black"
                >
                  Ready to modernize your barangay?
                </h2>
                <p className="font-montserrat mt-4 text-lg text-gray-100 dark:text-gray-200">
                  Join local government units across the Philippines in digitizing their resident
                  management systems.
                </p>
                <div className="mt-8">
                  <Link href="/login">
                    <Button variant="secondary" size="lg">
                      Start Your Digital Transformation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="mt-20 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <span className="font-montserrat text-xl font-semibold text-gray-900 dark:text-gray-100">
                Citizenly
              </span>
            </div>
            <p className="font-montserrat text-gray-700 dark:text-gray-300">
              © 2024 Citizenly. Built for Philippine Local Government Units.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
