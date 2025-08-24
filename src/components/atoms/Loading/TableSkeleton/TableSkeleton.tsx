/**
 * Table Skeleton Component
 * 
 * @description Skeleton loader for table components during lazy loading
 */

interface TableSkeletonProps {
  /** Number of table rows to simulate */
  rowCount?: number;
  /** Number of table columns to simulate */
  columnCount?: number;
  /** Additional CSS classes */
  className?: string;
}

export function TableSkeleton({ 
  rowCount = 5, 
  columnCount = 4,
  className = '' 
}: TableSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="h-8 w-1/3 rounded-sm bg-gray-200"></div>
      <div className="space-y-2">
        {/* Table Header */}
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
          {Array.from({ length: columnCount }).map((_, i) => (
            <div key={`header-${i}`} className="h-6 rounded-sm bg-gray-300"></div>
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={`row-${i}`} className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
            {Array.from({ length: columnCount }).map((_, j) => (
              <div key={`cell-${i}-${j}`} className="h-6 rounded-sm bg-gray-100"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;