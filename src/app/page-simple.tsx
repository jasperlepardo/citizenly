'use client';

import React from 'react';
import Link from 'next/link';

export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to RBI System</h1>
          <p className="text-xl text-gray-600 mb-8">Records of Barangay Inhabitant System</p>
          <p className="text-lg text-gray-500">
            Complete digital solution for Philippine barangay resident management
          </p>
        </div>

        <div className="text-center mb-8">
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Resident Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                5-step registration with validation, complete demographics, and PSOC integration.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Address System</h3>
              <p className="mt-2 text-sm text-gray-500">
                Complete Philippine geographic hierarchy with cascading dropdowns and validation.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
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
