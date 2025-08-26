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
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse" />
        {/* Value skeleton */}
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg w-16 animate-pulse" />
      </div>
      {/* Icon skeleton */}
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    </div>
  </div>
);

/**
 * Chart skeleton component
 */
const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="space-y-4">
      {/* Chart title skeleton */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse" />
      {/* Chart content skeleton */}
      <div className="h-64 bg-gray-100 dark:bg-gray-750 rounded-lg animate-pulse flex items-center justify-center">
        <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
      {/* Legend skeleton */}
      <div className="flex justify-center space-x-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
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
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="space-y-4">
      {/* Title skeleton */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-40 animate-pulse" />
      {/* Pyramid skeleton */}
      <div className="h-80 bg-gray-100 dark:bg-gray-750 rounded-lg animate-pulse flex items-center justify-center">
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="flex items-center justify-center space-x-1"
            >
              <div 
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
                style={{ width: `${(8 - i) * 20 + 40}px` }}
              />
              <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              <div 
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
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
export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({
  count = 4,
  className = ''
}) => {
  return (
    <div className={`p-6 space-y-8 ${className}`}>
      {/* Welcome message skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 animate-pulse" />
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