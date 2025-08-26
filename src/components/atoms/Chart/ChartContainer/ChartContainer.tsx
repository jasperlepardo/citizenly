'use client';

import React from 'react';

interface ChartContainerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function ChartContainer({ children, className = '' }: ChartContainerProps) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      {children}
    </div>
  );
}
