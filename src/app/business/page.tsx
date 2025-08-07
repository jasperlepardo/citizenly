'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/templates';
import { Button } from '@/components/atoms';
import { ProtectedRoute } from '@/components/organisms';

function BusinessContent() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-primary">
              Business Registration
            </h1>
            <p className="font-montserrat text-sm font-normal text-secondary">
              Manage business permits, licenses, and registrations in your barangay
            </p>
          </div>
          <Button variant="primary" size="md">
            Register New Business
          </Button>
        </div>

        {/* Coming Soon Card */}
        <div className="rounded-lg border p-8 text-center bg-surface border-default">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="size-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3m6 0a2 2 0 100-4 2 2 0 000 4zm0 0a2 2 0 100-4 2 2 0 000 4zm8-4a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-primary">
            Business Management Coming Soon
          </h3>
          <p className="mx-auto mb-6 max-w-md text-secondary">
            We&apos;re working on bringing you comprehensive business registration and permit
            management tools. This feature will allow you to track business licenses, permits, and
            compliance in your barangay.
          </p>

          {/* Feature Preview */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg p-4 bg-surface-hover">
              <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="size-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h4 className="mb-1 text-sm font-medium text-primary">Business Permits</h4>
              <p className="text-xs text-secondary">
                Track and manage business permit applications and renewals
              </p>
            </div>

            <div className="rounded-lg p-4 bg-surface-hover">
              <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="size-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="mb-1 text-sm font-medium text-primary">Tax Records</h4>
              <p className="text-xs text-secondary">
                Monitor business tax compliance and payment history
              </p>
            </div>

            <div className="rounded-lg p-4 bg-surface-hover">
              <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="size-4 text-purple-600"
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
              <h4 className="mb-1 text-sm font-medium text-primary">Analytics</h4>
              <p className="text-xs text-secondary">
                View business registration trends and statistics
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function BusinessPage() {
  return (
    <ProtectedRoute>
      <BusinessContent />
    </ProtectedRoute>
  );
}
