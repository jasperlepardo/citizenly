/**
 * Dashboard Page Loading Skeleton
 * 
 * Specific skeleton for main dashboard with statistics and charts
 */

export default function DashboardPageLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Page Header */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="mt-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Items List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}