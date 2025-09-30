/**
 * Admin Section Loading Skeleton
 *
 * Loading skeleton for admin pages
 */

export default function AdminLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 h-7 w-44 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="h-10 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Admin Content */}
      <div className="space-y-6">
        {/* Admin Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="mt-4">
                <div className="h-8 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Table/List */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="space-y-1">
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
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
