/**
 * Households Page Loading Skeleton
 * 
 * Specific skeleton for households page with custom table layout
 */

export default function HouseholdsLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden">
        {/* Table Header with Controls */}
        <div className="bg-white dark:bg-gray-800 flex items-center border-b border-gray-200 dark:border-gray-700 p-0">
          {/* Select All */}
          <div className="flex items-center p-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ml-4 flex items-center gap-1">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
          </div>

          {/* Search */}
          <div className="ml-auto mr-0">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-60"></div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="bg-gray-100 dark:bg-gray-700 flex items-center border-b border-gray-200 dark:border-gray-700 p-0">
          <div className="w-12 p-2"></div>
          <div className="grid flex-1 grid-cols-5 gap-4 p-2">
            <div className="p-2"><div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div></div>
            <div className="p-2"><div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div></div>
            <div className="p-2"><div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div></div>
            <div className="p-2"><div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div></div>
            <div className="p-2"><div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div></div>
          </div>
          <div className="w-12 p-1"></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center p-0 transition-colors">
              {/* Checkbox */}
              <div className="p-2">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Content Columns */}
              <div className="grid flex-1 grid-cols-5 gap-4 p-2">
                <div className="p-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>

              {/* Action Menu */}
              <div className="p-1">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}