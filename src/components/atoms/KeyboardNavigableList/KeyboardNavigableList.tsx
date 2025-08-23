'use client';

/**
 * KeyboardNavigableList Component
 * List component with keyboard navigation support
 */

import React, { useCallback } from 'react';
import { useArrowKeyNavigation } from '@/lib/ui/accessibility';
import { cn } from '@/lib/utilities/css-utils';

interface ListItem {
  id: string;
  label: string;
  value?: unknown;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface KeyboardNavigableListProps {
  readonly items: ListItem[];
  readonly onSelect: (item: ListItem) => void;
  readonly selectedId?: string;
  readonly className?: string;
  readonly itemClassName?: string;
  readonly role?: 'listbox' | 'menu' | 'tablist';
  readonly orientation?: 'horizontal' | 'vertical';
  readonly wrap?: boolean;
}

export default function KeyboardNavigableList({
  items,
  onSelect,
  selectedId,
  className,
  itemClassName,
  role = 'listbox',
  orientation = 'vertical',
  wrap: _wrap = true,
}: KeyboardNavigableListProps) {
  const handleSelect = useCallback(
    (index: number) => {
      const item = items[index];
      if (item && !item.disabled) {
        onSelect(item);
      }
    },
    [items, onSelect]
  );

  const containerRef = useArrowKeyNavigation(items.length, handleSelect);

  const getItemRole = () => {
    switch (role) {
      case 'listbox':
        return 'option';
      case 'menu':
        return 'menuitem';
      case 'tablist':
        return 'tab';
      default:
        return 'option';
    }
  };

  const itemRole = getItemRole();

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      role={role}
      aria-orientation={orientation}
      className={cn(
        'focus:outline-hidden',
        orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col',
        className
      )}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          role={itemRole}
          aria-selected={selectedId === item.id}
          aria-disabled={item.disabled}
          tabIndex={index === 0 ? 0 : -1}
          onClick={() => !item.disabled && onSelect(item)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-left transition-colors',
            'focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-blue-500',
            selectedId === item.id
              ? 'bg-blue-50 text-gray-700 dark:bg-blue-900/20 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            item.disabled && 'cursor-not-allowed opacity-50',
            itemClassName
          )}
          disabled={item.disabled}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="grow">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// Composable list item component
interface ListItemComponentProps {
  readonly children: React.ReactNode;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function ListItem({
  children,
  selected,
  disabled,
  onClick,
  className,
}: ListItemComponentProps) {
  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={selected ? 0 : -1}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors',
        'focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-blue-500',
        selected
          ? 'bg-blue-50 text-gray-700 dark:bg-blue-900/20 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {children}
    </div>
  );
}

export { KeyboardNavigableList };
