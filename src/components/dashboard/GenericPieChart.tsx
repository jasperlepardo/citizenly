'use client';

import React, { useState } from 'react';

interface ChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface GenericPieChartProps {
  data: ChartData[];
  title: string;
  baseColor?: string;
  className?: string;
}

export default function GenericPieChart({
  data,
  title,
  baseColor: _baseColor = '#3b82f6',
  className = '',
}: GenericPieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Chart.js default color palette - extended for better variety
  const generateColorVariations = (count: number) => {
    // Chart.js default brand colors extended with complementary colors
    const chartJsColors = [
      '#36a2eb', // Blue
      '#ff6384', // Pink/Red
      '#ff9f40', // Orange
      '#ffcd56', // Yellow
      '#4bc0c0', // Cyan/Teal
      '#9966ff', // Purple
      '#c9cbcf', // Light Gray
      '#ff4757', // Bright Red
      '#2ed573', // Green
      '#ffa502', // Dark Orange
      '#3742fa', // Indigo
      '#ff3838', // Coral
      '#70a1ff', // Light Blue
      '#7bed9f', // Light Green
      '#5352ed', // Blue Violet
    ];

    // Return colors cycling through the extended Chart.js palette
    return Array.from({ length: count }, (_, index) => {
      return chartJsColors[index % chartJsColors.length];
    });
  };

  // Generate Chart.js colors for all items
  const colorVariations = generateColorVariations(data.length);
  const dataWithColors = data.map((item, index) => {
    // If item has a valid predefined color, use it; otherwise use generated color
    if (item.color && item.color !== '' && item.color !== '#000000') {
      return item;
    }
    return {
      ...item,
      color: colorVariations[index],
    };
  });

  const total = dataWithColors.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className={`bg-surface rounded-lg border border-default p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-primary mb-4 font-display">{title}</h3>
        <div className="text-center text-secondary">No data available</div>
      </div>
    );
  }

  // Create SVG path for pie slices
  const createPieSlicePath = (startAngle: number, endAngle: number, radius: number) => {
    // Convert angles to radians and adjust for SVG coordinate system (start from top)
    const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
    const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 50 + radius * Math.cos(startAngleRad);
    const y1 = 50 + radius * Math.sin(startAngleRad);
    const x2 = 50 + radius * Math.cos(endAngleRad);
    const y2 = 50 + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', 50, 50, 'L', x1, y1, 'A', radius, radius, 0, largeArcFlag, 1, x2, y2, 'Z'].join(
      ' '
    );
  };

  const radius = 45;

  const handleMouseMove = (event: React.MouseEvent, label: string) => {
    setHoveredSlice(label);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  const getTooltipData = (label: string) => {
    const item = dataWithColors.find(d => d.label === label);
    return item
      ? {
          label: item.label,
          count: item.value,
          percentage: item.percentage,
        }
      : null;
  };

  // Calculate angles for each slice
  let currentAngle = 0;
  const slices = dataWithColors.map(item => {
    const angle = (item.percentage / 100) * 360;
    const slice = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return slice;
  });

  return (
    <div className={`bg-surface rounded-lg border border-default p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-primary mb-4 font-display">{title}</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex justify-center items-center relative">
          <svg width="240" height="240" viewBox="0 0 100 100">
            {/* Handle 100% case with full circle */}
            {dataWithColors.filter(item => item.value > 0).length === 1 ? (
              (() => {
                const singleItem = dataWithColors.find(item => item.value > 0)!;
                return (
                  <circle
                    cx="50"
                    cy="50"
                    r={hoveredSlice === singleItem.label ? '47' : '45'}
                    fill={singleItem.color}
                    className={`transition-all duration-200 cursor-pointer ${
                      hoveredSlice === singleItem.label ? 'drop-shadow-lg' : 'hover:opacity-90'
                    }`}
                    onMouseMove={e => handleMouseMove(e, singleItem.label)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })()
            ) : (
              <>
                {slices.map((slice, index) => {
                  const isHovered = hoveredSlice === slice.label;
                  const isOtherHovered = hoveredSlice && hoveredSlice !== slice.label;

                  return (
                    slice.value > 0 && (
                      <path
                        key={index}
                        d={createPieSlicePath(
                          slice.startAngle,
                          slice.endAngle,
                          isHovered ? radius + 2 : radius
                        )}
                        fill={slice.color}
                        className={`transition-all duration-200 cursor-pointer ${
                          isHovered
                            ? 'drop-shadow-lg'
                            : isOtherHovered
                              ? 'opacity-60'
                              : 'hover:opacity-90'
                        }`}
                        onMouseMove={e => handleMouseMove(e, slice.label)}
                        onMouseLeave={handleMouseLeave}
                      />
                    )
                  );
                })}
              </>
            )}
          </svg>
        </div>

        {/* Legend - show all items including zero values */}
        <div className="flex flex-col justify-center space-y-1">
          {dataWithColors.map((item, index) => {
            const isHovered = hoveredSlice === item.label;
            const isOtherHovered = hoveredSlice && hoveredSlice !== item.label;
            const hasNoData = item.value === 0;

            return (
              <div
                key={index}
                className={`flex items-center justify-between px-2 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                  hasNoData
                    ? 'opacity-50 cursor-default'
                    : isHovered
                      ? 'bg-surface-hover shadow-sm'
                      : isOtherHovered
                        ? 'opacity-60'
                        : 'hover:bg-surface-hover'
                }`}
                onMouseEnter={hasNoData ? undefined : e => handleMouseMove(e, item.label)}
                onMouseLeave={hasNoData ? undefined : handleMouseLeave}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      hasNoData
                        ? ''
                        : isHovered
                          ? 'scale-125 shadow-md ring-2 ring-primary-200'
                          : ''
                    }`}
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span
                    className={`text-sm font-body transition-all duration-200 ${
                      hasNoData
                        ? 'text-gray-400 dark:text-gray-600'
                        : isHovered
                          ? 'text-primary font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <div
                  className={`text-sm font-semibold font-display transition-all duration-200 ${
                    hasNoData
                      ? 'text-gray-400 dark:text-gray-600'
                      : isHovered
                        ? 'text-primary font-bold'
                        : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSlice && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-primary-200 dark:border-primary-700 px-4 py-3 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {(() => {
            const tooltipData = getTooltipData(hoveredSlice);
            if (!tooltipData) return null;

            const item = dataWithColors.find(d => d.label === hoveredSlice);

            return (
              <div className="text-sm">
                <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item?.color }}
                  ></div>
                  {tooltipData.label}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  {tooltipData.count.toLocaleString()} ({tooltipData.percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
