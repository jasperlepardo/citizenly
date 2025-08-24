'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utilities/css-utils';
import type { CommandMenuItem as CommandMenuItemType } from '@/types/components/command-menu';

const commandMenuItemVariants = cva(
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
  {
    variants: {
      variant: {
        default: 'hover:bg-gray-50 dark:hover:bg-gray-800',
        selected: 'bg-gray-100 dark:bg-gray-700',
        disabled: 'opacity-50 cursor-not-allowed',
      },
      size: {
        sm: 'px-2 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface CommandMenuItemProps 
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    VariantProps<typeof commandMenuItemVariants> {
  item: CommandMenuItemType;
  isSelected?: boolean;
  showShortcuts?: boolean;
  onClick?: (item: CommandMenuItemType) => void;
}

const CommandMenuItem = React.forwardRef<HTMLButtonElement, CommandMenuItemProps>(
  ({ 
    item, 
    isSelected = false, 
    showShortcuts = true, 
    onClick, 
    variant,
    size,
    className,
    ...props 
  }, ref) => {
    const handleClick = () => {
      if (!item.disabled && onClick) {
        onClick(item);
      }
    };

    const getVariant = () => {
      if (item.disabled) return 'disabled';
      if (isSelected) return 'selected';
      return variant || 'default';
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(commandMenuItemVariants({ variant: getVariant(), size }), className)}
        onClick={handleClick}
        disabled={item.disabled}
        {...props}
      >
        {/* Icon or Avatar */}
        <div className="flex size-5 shrink-0 items-center justify-center">
          {item.avatar ? (
            <div className="size-5 overflow-hidden rounded-full">
              <img
                src={item.avatar.src}
                alt={item.avatar.alt}
                className="size-full object-cover"
                onError={(e) => {
                  // Fallback to initials
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="flex size-full items-center justify-center bg-gray-200 dark:bg-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300">${
                      item.avatar?.fallback || item.label.charAt(0).toUpperCase()
                    }</div>`;
                  }
                }}
              />
            </div>
          ) : item.icon ? (
            <item.icon className="size-4 text-gray-500 dark:text-gray-400" />
          ) : null}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.label}
          </div>
        </div>

        {/* Shortcut */}
        {showShortcuts && item.shortcut && item.shortcut.length > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            {item.shortcut.map((key, index) => (
              <kbd
                key={index}
                className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-1 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {key}
              </kbd>
            ))}
          </div>
        )}

        {/* Recent indicator */}
        {item.recent && (
          <div className="flex shrink-0 items-center">
            <div className="size-1.5 rounded-full bg-blue-500" />
          </div>
        )}
      </button>
    );
  }
);

CommandMenuItem.displayName = 'CommandMenuItem';

export { CommandMenuItem, commandMenuItemVariants };
export type { CommandMenuItemProps };