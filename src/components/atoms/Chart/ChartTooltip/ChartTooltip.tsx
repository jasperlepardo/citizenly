'use client';

import React from 'react';

import { cn } from '@/lib';

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

export default function ChartTooltip({ visible, position, data, className }: ChartTooltipProps) {
  if (!visible || !data) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 rounded-lg border-2 border-zinc-900 bg-white p-3 shadow-lg dark:border-zinc-100 dark:bg-zinc-950',
        className
      )}
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'tranzinc(-50%, -100%)',
      }}
    >
      <div className="text-sm text-zinc-900 dark:text-zinc-100">
        <div className="mb-0.5 flex items-center gap-1.5 font-medium">
          {data.color && (
            <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: data.color }} />
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
