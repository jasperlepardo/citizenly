/**
 * Residents Page Loading Skeleton
 *
 * Specific skeleton for residents page with table layout
 */

export default function ResidentsLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 h-7 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {/* Table Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
          <div className="grid grid-cols-6 gap-4">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`resident-row-${i}`} className="px-6 py-4">
              <div className="grid grid-cols-6 items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
}
