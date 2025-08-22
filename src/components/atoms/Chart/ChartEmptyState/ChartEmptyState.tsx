'use client';

import React from 'react';

interface ChartEmptyStateProps {
  readonly message?: string;
  readonly className?: string;
}

export default function ChartEmptyState({ 
  message = 'No data available',
  className = '' 
}: ChartEmptyStateProps) {
  return (
    <div className={`flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 text-base text-center ${className}`}>
      {message}
    </div>
  );
}