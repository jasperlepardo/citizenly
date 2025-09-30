/**
 * Loading Fallback Component
 *
 * @description Generic loading spinner with customizable height for lazy-loaded components
 */

interface LoadingFallbackProps {
  /** Height of the loading container */
  height?: string;
  /** Additional CSS classes */
  className?: string;
}

export function LoadingFallback({ height = '200px', className = '' }: LoadingFallbackProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 ${className}`}
      style={{ minHeight: height }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingFallback;
