'use client';

import React from 'react';

interface LegendItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface ChartLegendProps {
  readonly items: LegendItem[];
  readonly onItemHover?: (item: LegendItem | null, event?: React.MouseEvent) => void;
  readonly onItemMove?: (item: LegendItem, event: React.MouseEvent) => void;
  readonly hoveredItem?: string | null;
  readonly className?: string;
}

// Extract style calculation functions
const getItemContainerClasses = (
  hasNoData: boolean,
  isHovered: boolean,
  isOtherHovered: boolean
): string => {
  const baseClasses =
    'flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md transition-all duration-200 w-full';

  if (hasNoData) {
    return `${baseClasses} cursor-not-allowed opacity-50`;
  } else if (isOtherHovered) {
    return `${baseClasses} cursor-pointer opacity-40`;
  }

  return `${baseClasses} cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800`;
};

const getColorIndicatorClasses = (hasNoData: boolean, isHovered: boolean): string => {
  const baseClasses = 'w-4 h-4 rounded-sm transition-all duration-200';
  return isHovered ? `${baseClasses} scale-110 shadow-md` : baseClasses;
};

const getLabelClasses = (hasNoData: boolean, isHovered: boolean): string => {
  const baseClasses = 'text-sm font-medium transition-all duration-200';
  if (hasNoData) {
    return `${baseClasses} text-zinc-400 dark:text-zinc-600`;
  }
  return isHovered
    ? `${baseClasses} font-semibold text-zinc-950 dark:text-white`
    : `${baseClasses} text-zinc-900 dark:text-zinc-100`;
};

const getValueClasses = (hasNoData: boolean, isHovered: boolean): string => {
  const baseClasses = 'text-sm font-medium transition-all duration-200';
  if (hasNoData) {
    return `${baseClasses} text-zinc-400 dark:text-zinc-600`;
  }
  return isHovered
    ? `${baseClasses} font-semibold text-zinc-950 dark:text-white`
    : `${baseClasses} text-zinc-600 dark:text-zinc-400`;
};

// Legend item component
interface LegendItemComponentProps {
  readonly item: LegendItem;
  readonly isHovered: boolean;
  readonly isOtherHovered: boolean;
  readonly onMouseEnter: (item: LegendItem, event: React.MouseEvent) => void;
  readonly onMouseMove: (item: LegendItem, event: React.MouseEvent) => void;
  readonly onMouseLeave: () => void;
}

function LegendItemComponent({
  item,
  isHovered,
  isOtherHovered,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}: LegendItemComponentProps) {
  const hasNoData = item.value === 0;

  return (
    <div
      className={getItemContainerClasses(hasNoData, isHovered, isOtherHovered)}
      onMouseEnter={hasNoData ? undefined : e => onMouseEnter(item, e)}
      onMouseMove={hasNoData ? undefined : e => onMouseMove(item, e)}
      onMouseLeave={hasNoData ? undefined : onMouseLeave}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={getColorIndicatorClasses(hasNoData, isHovered)}
          style={{ backgroundColor: item.color }}
        />
        <span className={getLabelClasses(hasNoData, isHovered)}>{item.label}</span>
      </div>
      <div className={getValueClasses(hasNoData, isHovered)}>
        {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
      </div>
    </div>
  );
}

export default function ChartLegend({
  items,
  onItemHover,
  onItemMove,
  hoveredItem,
  className = '',
}: ChartLegendProps) {
  const handleMouseEnter = (item: LegendItem, event: React.MouseEvent) => {
    if (item.value === 0) return;
    onItemHover?.(item, event);
  };

  const handleMouseMove = (item: LegendItem, event: React.MouseEvent) => {
    if (item.value === 0) return;
    onItemMove?.(item, event);
  };

  const handleMouseLeave = () => {
    onItemHover?.(null);
  };

  return (
    <div className={`flex w-full flex-col justify-center gap-3 ${className}`}>
      {items.map(item => {
        const isHovered = hoveredItem === item.label;
        const isOtherHovered = hoveredItem !== null && hoveredItem !== item.label;

        return (
          <LegendItemComponent
            key={item.label}
            item={item}
            isHovered={isHovered}
            isOtherHovered={isOtherHovered}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
}
