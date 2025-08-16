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
          <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Test Loading Page
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This page demonstrates the skeleton loading functionality
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Test Action
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">
          Content Loaded!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page loads immediately - you see the skeleton during page navigation!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          To see the skeleton: navigate between pages or use slow network throttling.
        </p>
      </div>

      {/* Sample table */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Sample Data</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">{i + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-400">Item {i + 1}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Sample description</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}