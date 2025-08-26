'use client';

import React from 'react';

import { cn } from '@/lib';
import type { CommandMenuItem as CommandMenuItemType } from '@/types/components/command-menu';

import { CommandMenuItem } from './CommandMenuItem';

interface CommandMenuGroupProps {
  label: string;
  items: CommandMenuItemType[];
  selectedIndex: number;
  globalIndex: number;
  showShortcuts?: boolean;
  onItemClick?: (item: CommandMenuItemType) => void;
  onClearGroup?: () => void;
  className?: string;
}

export function CommandMenuGroup({
  label,
  items,
  selectedIndex,
  globalIndex,
  showShortcuts = true,
  onItemClick,
  onClearGroup,
  className,
}: CommandMenuGroupProps) {
  if (items.length === 0) return null;

  const showClearButton = label === 'Recent' && onClearGroup && items.length > 0;

  return (
    <div className={cn('py-2', className)}>
      {/* Group Label */}
      <div className="px-3 pb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </h3>
        {showClearButton && (
          <button
            type="button"
            onClick={onClearGroup}
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Group Items */}
      <div className="space-y-0.5">
        {items.map((item, index) => {
          const itemIndex = globalIndex + index;
          return (
            <CommandMenuItem
              key={item.id}
              item={item}
              isSelected={selectedIndex === itemIndex}
              showShortcuts={showShortcuts}
              onClick={onItemClick}
              data-command-item-index={itemIndex}
            />
          );
        })}
      </div>
    </div>
  );
}