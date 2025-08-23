'use client';

import React from 'react';
import { cn } from '@/utils';

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
  multiline = false
}) => {
  return (
    <div className={cn(
      'relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5',
      className
    )}>
      {/* Left Icon */}
      {leftIcon && (
        <div className="flex items-center justify-center w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-1.5 shrink-0">
          {leftIcon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <span className={cn(
          'text-zinc-900 dark:text-zinc-100',
          multiline ? 'whitespace-pre-wrap break-words' : 'truncate'
        )}>
          {value || '—'}
        </span>
      </div>

      {/* Right Icon */}
      {rightIcon && (
        <div className="flex items-center justify-center w-5 h-5 text-zinc-500 dark:text-zinc-400 ml-1.5 shrink-0">
          {rightIcon}
        </div>
      )}

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          id={id}
          value={value || ''}
        />
      )}
    </div>
  );
};

ReadOnly.displayName = 'ReadOnly';

export default ReadOnly;