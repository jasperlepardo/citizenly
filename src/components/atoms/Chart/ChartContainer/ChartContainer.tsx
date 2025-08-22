'use client';

import React from 'react';

interface ChartContainerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function ChartContainer({ 
  children, 
  className = '' 
}: ChartContainerProps) {
  return (
    <div className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}