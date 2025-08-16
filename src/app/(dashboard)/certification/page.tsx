'use client';

import React from 'react';
import { Button } from '@/components/atoms';

export default function CertificationPage() {

  const certificateTypes = [
    {
      name: 'Barangay Certificate',
      description: 'General barangay certification for residents',
      icon: '📄',
      status: 'Available',
    },
    {
      name: 'Certificate of Residency',
      description: 'Proof of residency within the barangay',
      icon: '🏠',
      status: 'Available',
    },
    {
      name: 'Barangay Clearance',
      description: 'Official clearance for various purposes',
      icon: '✅',
      status: 'Available',
    },
    {
      name: 'Certificate of Indigency',
      description: 'Certification for economically disadvantaged residents',
      icon: '🤝',
      status: 'Available',
    },
    {
      name: 'Business Permit Certificate',
      description: 'Certification for business operations',
      icon: '🏢',
      status: 'Coming Soon',
    },
    {
      name: 'Good Moral Certificate',
      description: 'Character certification for residents',
      icon: '⭐',
      status: 'Coming Soon',
    },
  ];

  return (
    <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-gray-600 dark:text-gray-300">
              Certification Services
            </h1>
            <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
              Generate and manage barangay certificates and official documents
            </p>
          </div>
          <Button variant="primary" size="md">
            Request Certificate
          </Button>
        </div>

        {/* Certificate Types Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificateTypes.map((cert, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg border p-6 transition-shadow hover:shadow-md ${
                cert.status === 'Available'
                  ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  : 'border-gray-200 dark:border-gray-700 opacity-75'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="text-2xl">{cert.icon}</div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    cert.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {cert.status}
                </span>
              </div>
              <h3 className="font-montserrat mb-2 text-base font-semibold text-gray-600 dark:text-gray-300">
                {cert.name}
              </h3>
              <p className="font-montserrat mb-4 text-sm text-gray-600 dark:text-gray-400">{cert.description}</p>
              <Button
                variant={cert.status === 'Available' ? 'primary' : 'ghost'}
                size="sm"
                fullWidth
                disabled={cert.status !== 'Available'}
              >
                {cert.status === 'Available' ? 'Request Now' : 'Coming Soon'}
              </Button>
            </div>
          ))}
        </div>

        {/* Recent Requests Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-montserrat text-lg font-semibold text-gray-600 dark:text-gray-300">
              Recent Certificate Requests
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {/* Sample Request Items */}
            <div className="bg-gray-50 dark:bg-gray-700 flex items-center justify-between rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">#001</span>
                </div>
                <div>
                  <h4 className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
                    Barangay Certificate
                  </h4>
                  <p className="font-montserrat text-xs text-gray-600 dark:text-gray-400">
                    Requested by: Juan Dela Cruz
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Ready
                </span>
                <p className="font-montserrat text-gray-500 dark:text-gray-400 mt-1 text-xs">Dec 15, 2024</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 flex items-center justify-between rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">#002</span>
                </div>
                <div>
                  <h4 className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
                    Certificate of Residency
                  </h4>
                  <p className="font-montserrat text-xs text-gray-600 dark:text-gray-400">
                    Requested by: Maria Santos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  Processing
                </span>
                <p className="font-montserrat mt-1 text-xs text-gray-500 dark:text-gray-400">Dec 14, 2024</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 flex items-center justify-between rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">#003</span>
                </div>
                <div>
                  <h4 className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
                    Barangay Clearance
                  </h4>
                  <p className="font-montserrat text-xs text-gray-600 dark:text-gray-400">
                    Requested by: Pedro Garcia
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-700">
                  Pending
                </span>
                <p className="font-montserrat mt-1 text-xs text-gray-500 dark:text-gray-400">Dec 13, 2024</p>
              </div>
            </div>
          </div>

          {/* Empty State (commented out for demo) */}
          {/* 
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-montserrat font-medium text-gray-600 dark:text-gray-300 mb-2">No certificate requests yet</h3>
            <p className="font-montserrat text-sm text-gray-600 dark:text-gray-400">
              Certificate requests will appear here once residents start requesting documents.
            </p>
          </div>
          */}
        </div>
      </div>
  );
}
