'use client';

import React, { forwardRef } from 'react';

import { cn } from '@/components/shared/utils';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  attached?: boolean;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { className, children, orientation = 'horizontal', attached = false, spacing = 'sm', ...props },
    ref
  ) => {
    const spacingClasses = {
      none: 'gap-0',
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-4',
    };

    const orientationClasses = {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    };

    if (attached) {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex',
            orientation === 'horizontal' ? 'flex-row' : 'flex-col',
            '[&>*:not(:first-child):not(:last-child)]:rounded-none',
            orientation === 'horizontal'
              ? [
                  '[&>*:first-child]:rounded-r-none',
                  '[&>*:last-child]:rounded-l-none',
                  '[&>*:not(:first-child)]:border-l-0',
                ]
              : [
                  '[&>*:first-child]:rounded-b-none',
                  '[&>*:last-child]:rounded-t-none',
                  '[&>*:not(:first-child)]:border-t-0',
                ],
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientationClasses[orientation],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup };
