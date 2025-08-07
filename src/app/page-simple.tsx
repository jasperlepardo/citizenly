'use client';

import React from 'react';
import Link from 'next/link';

export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Welcome to RBI System</h1>
          <p className="mb-8 text-xl text-gray-600">Records of Barangay Inhabitant System</p>
          <p className="text-lg text-gray-500">
            Complete digital solution for Philippine barangay resident management
          </p>
        </div>

        <div className="mb-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Resident Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                5-step registration with validation, complete demographics, and PSOC integration.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Address System</h3>
              <p className="mt-2 text-sm text-gray-500">
                Complete Philippine geographic hierarchy with cascading dropdowns and validation.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Search & Analytics</h3>
              <p className="mt-2 text-sm text-gray-500">
                Global search, advanced filtering, and comprehensive analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
