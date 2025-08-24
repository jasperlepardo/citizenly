'use client';

import React from 'react';
import { cn } from '@/lib';

interface ChartTitleProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function ChartTitle({ 
  children, 
  className 
}: ChartTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-6 mb-4', className)}>
      {children}
    </h3>
  );
}