/**
 * Slow Loading Page
 * 
 * This page simulates slow server-side loading to demonstrate skeleton
 */

import { Suspense } from 'react';

// Simulate slow server component
async function SlowContent() {
  // Simulate slow server response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Slow Loading Demo
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This content took 2 seconds to load on the server
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Action Button
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">
          Server-Side Content
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This content was loaded on the server with an artificial 2-second delay.
          You should have seen the skeleton loading screen while this was loading.
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
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">{i + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-400">Slow Item {i + 1}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Loaded after delay</div>
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

export default function SlowPage() {
  return (
    <Suspense fallback={<div>Fallback loading...</div>}>
      <SlowContent />
    </Suspense>
  );
}