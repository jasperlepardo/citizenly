'use client';

import React from 'react';

interface ChartEmptyStateProps {
  readonly message?: string;
  readonly className?: string;
}

export default function ChartEmptyState({
  message = 'No data available',
  className = '',
}: ChartEmptyStateProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center text-base text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {message}
    </div>
  );
}
