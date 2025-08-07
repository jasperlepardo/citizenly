/**
 * Statistics Card Component
 * Displays key metrics in dashboard cards
 *
 * Design System Usage (matching chart components):
 * - Background: bg-surface (semantic surface color)
 * - Border: border-default (semantic border color)
 * - Text: text-primary (main value), text-secondary (labels)
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
    primary: `bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800`,
    success: `bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400 border-success-200 dark:border-success-800`,
    secondary: `bg-secondary-50 dark:bg-secondary-950/30 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800`,
    warning: `bg-warning-50 dark:bg-warning-950/30 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800`,
    danger: `bg-danger-50 dark:bg-danger-950/30 text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800`,
  };

  return (
    <div className="rounded-lg border p-6 bg-surface border-default">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium font-body text-secondary">{title}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-primary">{value}</p>

          {description && <p className="mt-1 text-sm text-secondary">{description}</p>}

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
