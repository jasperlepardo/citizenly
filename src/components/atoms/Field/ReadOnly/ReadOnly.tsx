'use client';

import React from 'react';

import { cn } from '@/lib';

export interface ReadOnlyProps {
  /** The value to display */
  value?: string;
  /** Custom class name */
  className?: string;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
  /** Input name for forms */
  name?: string;
  /** Input id */
  id?: string;
  /** Enable multiline display */
  multiline?: boolean;
}

export const ReadOnly: React.FC<ReadOnlyProps> = ({
  className = '',
  value,
  leftIcon,
  rightIcon,
  name,
  id,
  multiline = false,
}) => {
  return (
    <div
      className={cn(
        'relative flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900',
        className
      )}
    >
      {/* Left Icon */}
      {leftIcon && (
        <div className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400">
          {leftIcon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <span
          className={cn(
            'text-zinc-900 dark:text-zinc-100',
            multiline ? 'break-words whitespace-pre-wrap' : 'truncate'
          )}
        >
          {value || '—'}
        </span>
      </div>

      {/* Right Icon */}
      {rightIcon && (
        <div className="ml-1.5 flex h-5 w-5 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400">
          {rightIcon}
        </div>
      )}

      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} id={id} value={value || ''} />}
    </div>
  );
};

ReadOnly.displayName = 'ReadOnly';

export default ReadOnly;
