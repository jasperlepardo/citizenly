/**
 * Residents Page Loading Skeleton
 * 
 * Specific skeleton for residents page with table layout
 */

export default function ResidentsLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-6 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
          </div>
        </div>
        
        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="flex items-center space-x-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
}