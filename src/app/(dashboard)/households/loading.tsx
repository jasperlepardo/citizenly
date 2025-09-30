/**
 * Households Page Loading Skeleton
 *
 * Specific skeleton for households page with custom table layout
 */

export default function HouseholdsLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 h-7 w-36 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 w-36 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden bg-white dark:bg-gray-800">
        {/* Table Header with Controls */}
        <div className="flex items-center border-b border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800">
          {/* Select All */}
          <div className="flex items-center p-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ml-4 flex items-center gap-1">
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Search */}
          <div className="mr-0 ml-auto">
            <div className="h-10 w-60 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex items-center border-b border-gray-200 bg-gray-100 p-0 dark:border-gray-700 dark:bg-gray-700">
          <div className="w-12 p-2"></div>
          <div className="grid flex-1 grid-cols-5 gap-4 p-2">
            <div className="p-2">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div className="p-2">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div className="p-2">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div className="p-2">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div className="p-2">
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
          <div className="w-12 p-1"></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 6 }, (_, i) => ({ id: `household-row-${Date.now()}-${i}` })).map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white p-0 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {/* Checkbox */}
              <div className="p-2">
                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Content Columns */}
              <div className="grid flex-1 grid-cols-5 gap-4 p-2">
                <div className="p-2">
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="p-2">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>

              {/* Action Menu */}
              <div className="p-1">
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
