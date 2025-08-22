'use client';

import React from 'react';
import { cn } from '@/lib/utilities';

interface TooltipData {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

interface ChartTooltipProps {
  readonly visible: boolean;
  readonly position: { x: number; y: number };
  readonly data: TooltipData | null;
  readonly className?: string;
}

export default function ChartTooltip({ 
  visible, 
  position, 
  data, 
  className 
}: ChartTooltipProps) {
  if (!visible || !data) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-100 rounded-lg p-3 shadow-lg',
        className
      )}
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'tranzinc(-50%, -100%)',
      }}
    >
      <div className="text-sm text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center gap-1.5 mb-0.5 font-medium">
          {data.color && (
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: data.color }}
            />
          )}
          {data.label}
        </div>
        <div className="font-semibold">
          {data.count.toLocaleString()} ({data.percentage.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
}