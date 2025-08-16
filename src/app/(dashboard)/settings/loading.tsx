/**
 * Settings Page Loading Skeleton
 * 
 * Loading skeleton for settings page with tabs and form fields
 */

export default function SettingsLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="space-y-6">
            {/* Section Header */}
            <div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Theme Selection */}
              <div className="space-y-4">
                <div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="relative flex flex-col items-center rounded border p-4 border-gray-200 dark:border-gray-700">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-sm mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Toggles */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 flex items-center justify-between rounded-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-40 mb-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-56"></div>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-8">
              <div className="flex justify-end">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}