import Link from 'next/link';
import { Button } from '@/components/atoms';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citizenly - Barangay Management System',
  description:
    'Modern barangay management system for efficient resident registration, household management, and community administration in the Philippines.',
  keywords: ['barangay', 'management', 'residents', 'households', 'Philippines', 'PSGC', 'RBI'],
  authors: [{ name: 'Citizenly Development Team' }],
  openGraph: {
    title: 'Citizenly - Barangay Management System',
    description: 'Streamline your barangay operations with our comprehensive management platform',
    type: 'website',
    siteName: 'Citizenly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citizenly - Barangay Management System',
    description: 'Modern barangay management for the digital age',
  },
};

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <header className="bg-default border-b border-default shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="font-display text-xl font-semibold text-gray-600">Citizenly</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-600"
              >
                Sign In
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-600 sm:text-5xl md:text-6xl">
            <span className="block">Citizenly</span>
            <span className="mt-2 block text-2xl text-gray-600 sm:text-3xl md:text-4xl">
              Records of Barangay Inhabitant System
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-gray-600 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Complete digital solution for Philippine barangay resident management, built for local
            government units to efficiently manage their communities.
          </p>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="mb-12 font-display text-3xl font-extrabold text-gray-600">
              Everything you need to manage your barangay
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Resident Management */}
            <div className="bg-default rounded-xl border border-default p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
              <h3 className="mb-2 font-display text-xl font-semibold text-gray-600">
                Resident Management
              </h3>
              <p className="font-body text-gray-600">
                Complete resident registration with demographics, family relationships, and PSOC
                integration for comprehensive household management.
              </p>
            </div>

            {/* Address System */}
            <div className="bg-default rounded-xl border border-default p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
              <h3 className="mb-2 font-display text-xl font-semibold text-gray-600">
                Smart Address System
              </h3>
              <p className="font-body text-gray-600">
                Complete Philippine geographic hierarchy with cascading dropdowns, address
                validation, and PSGC compliance.
              </p>
            </div>

            {/* Analytics */}
            <div className="bg-default rounded-xl border border-default p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
              <h3 className="mb-2 font-display text-xl font-semibold text-gray-600">
                Reports & Analytics
              </h3>
              <p className="font-body text-gray-600">
                Generate comprehensive reports, population analytics, and demographic insights for
                informed decision making.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="bg-default rounded-xl border border-default p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
              <h3 className="mb-2 font-display text-xl font-semibold text-gray-600">
                Advanced Search
              </h3>
              <p className="font-body text-gray-600">
                Powerful search and filtering capabilities to quickly find residents, households,
                and generate targeted lists.
              </p>
            </div>

            {/* Security */}
            <div className="bg-default rounded-xl border border-default p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
              <h3 className="mb-2 font-display text-xl font-semibold text-gray-600">
                Secure & Compliant
              </h3>
              <p className="font-body text-gray-600">
                Built with security best practices, data privacy compliance, and role-based access
                control for safe operations.
              </p>
            </div>

            {/* Digital Forms */}
            <div className="bg-default rounded-xl border border-default p-8 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="bg-rbi-govBlue/10 dark:bg-rbi-govBlue/20 mb-4 flex size-12 items-center justify-center rounded-lg">
                <svg
                  className="text-rbi-govBlue dark:text-rbi-govBlue size-6"
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
              <h3 className="mb-2 font-display text-xl font-semibold text-gray-600">
                Digital Forms
              </h3>
              <p className="font-body text-gray-600">
                Streamlined digital forms for certifications, business permits, and other barangay
                documents with automated processing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-blue-600 shadow-xl dark:bg-blue-700">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="text-center">
              <h2 className="text-inverse font-display text-3xl font-extrabold">
                Ready to modernize your barangay?
              </h2>
              <p className="mt-4 font-body text-lg text-gray-100 dark:text-gray-200">
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
      </main>

      {/* Footer */}
      <footer className="bg-default mt-20 border-t border-default dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <span className="font-display text-xl font-semibold text-gray-600">Citizenly</span>
            </div>
            <p className="font-body text-gray-600">
              © 2024 Citizenly. Built for Philippine Local Government Units.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
