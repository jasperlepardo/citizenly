/**
 * Dashboard Loading Skeleton
 *
 * Displays skeleton loading UI while dashboard pages are loading
 * Automatically shown by Next.js during page transitions
 */

export default function DashboardLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Page Header Skeleton */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="mb-2 h-7 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          {/* Subtitle skeleton */}
          <div className="h-4 w-80 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        {/* Action button skeleton */}
        <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-6">
        {/* Navigation/Tabs skeleton */}
        <div className="flex space-x-4 border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-8 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Large content card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-4">
              {/* Card header */}
              <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>

              {/* Card content */}
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-4">
              {/* Sidebar header */}
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>

              {/* Sidebar content */}
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table/List skeleton */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {/* Table header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="grid grid-cols-5 items-center gap-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
