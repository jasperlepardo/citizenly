/**
 * Dashboard Page Loading Skeleton
 *
 * Specific skeleton for main dashboard with statistics and charts
 */

export default function DashboardPageLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-80 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stats-card-${i}`}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="mt-4">
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Chart 1 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6">
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Chart 2 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6">
            <div className="h-6 w-36 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Items List */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`recent-item-${i}`} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="mb-1 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6">
            <div className="h-6 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`action-${i}`} className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
