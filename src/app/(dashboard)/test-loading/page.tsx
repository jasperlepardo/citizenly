/**
 * Test Loading Page
 *
 * Simple page to test skeleton loading with artificial delay
 */

'use client';

import { useEffect, useState } from 'react';

export default function TestLoadingPage() {
  // No loading state - page loads immediately to show the difference

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-600 dark:text-gray-400">
            Test Loading Page
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This page demonstrates the skeleton loading functionality
          </p>
        </div>
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Test Action</button>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-medium text-gray-600 dark:text-gray-400">
          Content Loaded!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page loads immediately - you see the skeleton during page navigation!
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
          To see the skeleton: navigate between pages or use slow network throttling.
        </p>
      </div>

      {/* Sample table */}
      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Sample Data</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">{i + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-400">Item {i + 1}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Sample description</div>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
