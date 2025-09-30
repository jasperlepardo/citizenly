'use client';

import React from 'react';

/**
 * Skeleton loader for statistics cards
 */
export interface StatsSkeletonProps {
  /** Number of stats cards to display */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Single stats card skeleton
 */
const StatsCardSkeleton: React.FC = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        {/* Value skeleton */}
        <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600" />
      </div>
      {/* Icon skeleton */}
      <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

/**
 * Chart skeleton component
 */
const ChartSkeleton: React.FC = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="space-y-4">
      {/* Chart title skeleton */}
      <div className="h-5 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      {/* Chart content skeleton */}
      <div className="dark:bg-gray-750 flex h-64 animate-pulse items-center justify-center rounded-lg bg-gray-100">
        <div className="h-32 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* Legend skeleton */}
      <div className="flex justify-center space-x-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-3 w-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Population pyramid skeleton
 */
const PopulationPyramidSkeleton: React.FC = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="space-y-4">
      {/* Title skeleton */}
      <div className="h-5 w-40 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      {/* Pyramid skeleton */}
      <div className="dark:bg-gray-750 flex h-80 animate-pulse items-center justify-center rounded-lg bg-gray-100">
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-center space-x-1">
              <div
                className={`h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700`}
                style={{ width: `${(8 - i) * 20 + 40}px` }}
              />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              <div
                className={`h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700`}
                style={{ width: `${(8 - i) * 20 + 40}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Complete dashboard skeleton loader
 */
export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ count = 4, className = '' }) => {
  return (
    <div className={`space-y-8 p-6 ${className}`}>
      {/* Welcome message skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(count)].map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Charts skeleton - row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Charts skeleton - row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Population pyramid skeleton */}
      <PopulationPyramidSkeleton />
    </div>
  );
};

export default StatsSkeleton;
