/**
 * Form Skeleton Component
 *
 * @description Skeleton loader for form components during lazy loading
 */

interface FormSkeletonProps {
  /** Number of form fields to simulate */
  fieldCount?: number;
  /** Additional CSS classes */
  className?: string;
}

export function FormSkeleton({ fieldCount = 5, className = '' }: FormSkeletonProps) {
  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {Array.from({ length: fieldCount }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/4 rounded-sm bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="h-10 rounded-sm bg-gray-100 dark:bg-gray-600 animate-pulse"></div>
        </div>
      ))}
      <div className="flex gap-3">
        <div className="h-10 w-24 rounded-sm bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-10 w-24 rounded-sm bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
    </div>
  );
}

export default FormSkeleton;
