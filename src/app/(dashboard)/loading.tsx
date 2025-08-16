/**
 * Dashboard Loading Skeleton
 * 
 * Displays skeleton loading UI while dashboard pages are loading
 * Automatically shown by Next.js during page transitions
 */

export default function DashboardLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          {/* Subtitle skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
        </div>
        {/* Action button skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-6">
        {/* Navigation/Tabs skeleton */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
        </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large content card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {/* Card header */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              
              {/* Card content */}
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {/* Sidebar header */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              
              {/* Sidebar content */}
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table/List skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
              ))}
            </div>
          </div>
          
          {/* Table rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
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