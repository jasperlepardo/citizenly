/**
 * Settings Page Loading Skeleton
 *
 * Loading skeleton for settings page with tabs and form fields
 */

export default function SettingsLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 h-7 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-80 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`tab-${i}`}
                className="mb-2 h-6 w-20 rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <div className="space-y-6">
            {/* Section Header */}
            <div>
              <div className="mb-2 h-6 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Theme Selection */}
              <div className="space-y-4">
                <div>
                  <div className="mb-1 h-5 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`theme-${i}`}
                      className="relative flex flex-col items-center rounded border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-2 h-8 w-8 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`form-field-${i}`} className="space-y-2">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Toggles */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`setting-toggle-${i}`}
                  className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700"
                >
                  <div>
                    <div className="mb-1 h-5 w-40 rounded bg-gray-200 dark:bg-gray-600"></div>
                    <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-600"></div>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-300 pt-8 dark:border-gray-600">
              <div className="flex justify-end">
                <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
