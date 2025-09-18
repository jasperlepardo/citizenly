/**
 * Skeleton Component
 * Base skeleton loading component with dark mode support
 */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      data-testid="skeleton"
      {...props}
    />
  );
}

export default Skeleton;