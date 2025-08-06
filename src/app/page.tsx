import Link from 'next/link';
import { Button } from '@/components/atoms';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-primary font-display">Citizenly</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-secondary hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-primary sm:text-5xl md:text-6xl font-display">
            <span className="block">Citizenly</span>
            <span className="block text-primary-600 text-2xl sm:text-3xl md:text-4xl mt-2">Records of Barangay Inhabitant System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-secondary sm:text-lg md:mt-5 md:text-xl md:max-w-3xl font-body">
            Complete digital solution for Philippine barangay resident management, built for local government units to efficiently manage their communities.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
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
            <h2 className="text-3xl font-extrabold text-primary mb-12 font-display">
              Everything you need to manage your barangay
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Resident Management */}
            <div className="bg-surface dark:bg-neutral-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-default dark:border-neutral-700">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 font-display">Resident Management</h3>
              <p className="text-secondary font-body">
                Complete resident registration with demographics, family relationships, and PSOC integration for comprehensive household management.
              </p>
            </div>

            {/* Address System */}
            <div className="bg-surface dark:bg-neutral-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-default dark:border-neutral-700">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 10-2.828 2.828l4.243 4.243a2 2 0 002.828-2.828z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 font-display">Smart Address System</h3>
              <p className="text-secondary font-body">
                Complete Philippine geographic hierarchy with cascading dropdowns, address validation, and PSGC compliance.
              </p>
            </div>

            {/* Analytics */}
            <div className="bg-surface dark:bg-neutral-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-default dark:border-neutral-700">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 font-display">Reports & Analytics</h3>
              <p className="text-secondary font-body">
                Generate comprehensive reports, population analytics, and demographic insights for informed decision making.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="bg-surface dark:bg-neutral-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-default dark:border-neutral-700">
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 font-display">Advanced Search</h3>
              <p className="text-secondary font-body">
                Powerful search and filtering capabilities to quickly find residents, households, and generate targeted lists.
              </p>
            </div>

            {/* Security */}
            <div className="bg-surface dark:bg-neutral-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-default dark:border-neutral-700">
              <div className="w-12 h-12 bg-danger-100 dark:bg-danger-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-danger-600 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 font-display">Secure & Compliant</h3>
              <p className="text-secondary font-body">
                Built with security best practices, data privacy compliance, and role-based access control for safe operations.
              </p>
            </div>

            {/* Digital Forms */}
            <div className="bg-surface dark:bg-neutral-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border border-default dark:border-neutral-700">
              <div className="w-12 h-12 bg-rbi-govBlue/10 dark:bg-rbi-govBlue/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-rbi-govBlue dark:text-rbi-govBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 font-display">Digital Forms</h3>
              <p className="text-secondary font-body">
                Streamlined digital forms for certifications, business permits, and other barangay documents with automated processing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary-600 dark:bg-primary-700 rounded-2xl shadow-xl">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-inverse font-display">
                Ready to modernize your barangay?
              </h2>
              <p className="mt-4 text-lg text-primary-100 dark:text-primary-200 font-body">
                Join local government units across the Philippines in digitizing their resident management systems.
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
      <footer className="bg-surface dark:bg-neutral-900 border-t border-default dark:border-neutral-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-xl font-semibold text-primary font-display">Citizenly</span>
            </div>
            <p className="text-secondary font-body">
              © 2024 Citizenly. Built for Philippine Local Government Units.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
