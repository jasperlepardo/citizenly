'use client';

import React from 'react';

import { cn } from '@/lib';

interface ChartTitleProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function ChartTitle({ children, className }: ChartTitleProps) {
  return (
    <h3
      className={cn(
        'mb-4 text-lg leading-6 font-semibold text-zinc-900 dark:text-zinc-100',
        className
      )}
    >
      {children}
    </h3>
  );
}
