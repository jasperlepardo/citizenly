/**
 * Admin Section Loading Skeleton
 * 
 * Loading skeleton for admin pages
 */

export default function AdminLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-44 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
      </div>

      {/* Admin Content */}
      <div className="space-y-6">
        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
              <div className="mt-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Table/List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}