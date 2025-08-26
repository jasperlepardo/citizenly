/**
 * Statistics Card Component
 * Displays key metrics in dashboard cards
 *
 * Design System Usage (matching chart components):
 * - Background: bg-white dark:bg-gray-800 (semantic surface color)
 * - Border: border-gray-300 dark:border-gray-600 (semantic border color)
 * - Text: text-gray-600 (main value), text-gray-600 (labels)
 * - Typography: font-display (value), font-body (title)
 * - Spacing: p-6 (24px) for card padding
 * - Border Radius: rounded-lg (8px)
 * - No shadow to match chart components
 */

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  color?: 'primary' | 'success' | 'secondary' | 'warning' | 'danger';
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
  color = 'primary',
}: StatsCardProps) {
  // Map design system colors to Tailwind classes
  const colorClasses = {
    primary: `bg-blue-50 dark:bg-primary-950/30 text-gray-600 dark:text-gray-400 border-blue-200 dark:border-blue-800`,
    success: `bg-green-50 dark:bg-success-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800`,
    secondary: `bg-purple-50 dark:bg-secondary-950/30 text-gray-600 dark:text-gray-400 border-purple-200 dark:border-purple-800`,
    warning: `bg-orange-50 dark:bg-warning-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800`,
    danger: `bg-red-50 dark:bg-danger-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800`,
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-body text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="font-display mt-1 text-2xl font-semibold text-gray-600 dark:text-gray-400">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600">
              {description}
            </p>
          )}

          {trend && (
            <div
              className={`mt-2 flex items-center text-sm ${
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              <svg
                className={`mr-1 size-4 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {trend.value}%
            </div>
          )}
        </div>

        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
