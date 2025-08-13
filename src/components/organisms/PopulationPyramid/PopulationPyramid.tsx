'use client';

import { useState, useEffect } from 'react';

interface AgeGroup {
  ageRange: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

interface PopulationPyramidProps {
  data?: AgeGroup[];
  className?: string;
  onAgeGroupClick?: (ageGroup: AgeGroup) => void;
}

export default function PopulationPyramid({
  data,
  className = '',
  onAgeGroupClick,
}: PopulationPyramidProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredSide, setHoveredSide] = useState<'male' | 'female' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Random test data to test functionality
  const defaultData: AgeGroup[] = [
    { ageRange: '0-4', male: 124, female: 98, malePercentage: 8.2, femalePercentage: 6.5 },
    { ageRange: '5-9', male: 87, female: 142, malePercentage: 5.8, femalePercentage: 9.4 },
    { ageRange: '10-14', male: 156, female: 134, malePercentage: 10.3, femalePercentage: 8.9 },
    { ageRange: '15-19', male: 43, female: 67, malePercentage: 2.8, femalePercentage: 4.4 },
    { ageRange: '20-24', male: 189, female: 203, malePercentage: 12.5, femalePercentage: 13.4 },
    { ageRange: '25-29', male: 78, female: 45, malePercentage: 5.2, femalePercentage: 3.0 },
    { ageRange: '30-34', male: 167, female: 178, malePercentage: 11.0, femalePercentage: 11.8 },
    { ageRange: '35-39', male: 0, female: 89, malePercentage: 0.0, femalePercentage: 5.9 },
    { ageRange: '40-44', male: 112, female: 0, malePercentage: 7.4, femalePercentage: 0.0 },
    { ageRange: '45-49', male: 94, female: 156, malePercentage: 6.2, femalePercentage: 10.3 },
    { ageRange: '50-54', male: 67, female: 78, malePercentage: 4.4, femalePercentage: 5.2 },
    { ageRange: '55-59', male: 145, female: 123, malePercentage: 9.6, femalePercentage: 8.1 },
    { ageRange: '60-64', male: 23, female: 67, malePercentage: 1.5, femalePercentage: 4.4 },
    { ageRange: '65-69', male: 89, female: 45, malePercentage: 5.9, femalePercentage: 3.0 },
    { ageRange: '70-74', male: 34, female: 78, malePercentage: 2.2, femalePercentage: 5.2 },
    { ageRange: '75-79', male: 56, female: 34, malePercentage: 3.7, femalePercentage: 2.2 },
    { ageRange: '80-84', male: 12, female: 23, malePercentage: 0.8, femalePercentage: 1.5 },
    { ageRange: '85-89', male: 7, female: 15, malePercentage: 0.5, femalePercentage: 1.0 },
    { ageRange: '90-94', male: 3, female: 8, malePercentage: 0.2, femalePercentage: 0.5 },
    { ageRange: '95-99', male: 0, female: 0, malePercentage: 0.0, femalePercentage: 0.0 },
    { ageRange: '100+', male: 1, female: 2, malePercentage: 0.1, femalePercentage: 0.1 },
  ];

  const pyramidData = data || defaultData;
  // Filter out empty rows (where both male and female are 0)
  const filteredData = pyramidData.filter(group => group.male > 0 || group.female > 0);
  const maxPercentage = Math.max(
    ...filteredData.map(d => Math.max(d.malePercentage, d.femalePercentage))
  );

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGroupClick = (group: AgeGroup) => {
    if (selectedGroup === group.ageRange) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(group.ageRange);
      onAgeGroupClick?.(group);
    }
  };

  const totalMale = filteredData.reduce((sum, group) => sum + group.male, 0);
  const totalFemale = filteredData.reduce((sum, group) => sum + group.female, 0);
  const totalPopulation = totalMale + totalFemale;

  const handleMouseMove = (event: React.MouseEvent, ageRange: string, side?: 'male' | 'female') => {
    setHoveredGroup(ageRange);
    setHoveredSide(side || null);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredGroup(null);
    setHoveredSide(null);
  };

  const getTooltipData = () => {
    if (!hoveredGroup) return null;
    const group = filteredData.find(g => g.ageRange === hoveredGroup);
    if (!group) return null;

    // If hovering on a specific side (bar), show only that side
    if (hoveredSide === 'male') {
      return {
        label: `Male ${group.ageRange}`,
        count: group.male,
        percentage: group.malePercentage,
        type: 'single',
      };
    } else if (hoveredSide === 'female') {
      return {
        label: `Female ${group.ageRange}`,
        count: group.female,
        percentage: group.femalePercentage,
        type: 'single',
      };
    } else {
      // If hovering on row (not specific bar), show comparison
      return {
        label: `Age ${group.ageRange}`,
        maleCount: group.male,
        femaleCount: group.female,
        malePercentage: group.malePercentage,
        femalePercentage: group.femalePercentage,
        total: group.male + group.female,
        type: 'comparison',
      };
    }
  };

  return (
    <div className={`bg-surface rounded-lg border border-default p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-primary">Population Pyramid</h3>
        <div className="font-body text-sm text-secondary">
          Total: {totalPopulation.toLocaleString()}
        </div>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="mb-3 flex items-center font-body text-xs text-secondary">
          <div className="w-[45%] pr-3 text-right">Male</div>
          <div className="w-[10%] px-3 text-center">Age</div>
          <div className="w-[45%] pl-3 text-left">Female</div>
        </div>

        {/* Pyramid bars */}
        {filteredData.map((group, index) => {
          const isHovered = hoveredGroup === group.ageRange;
          const isSelected = selectedGroup === group.ageRange;

          return (
            <div
              key={index}
              className={`flex h-6 cursor-pointer items-center rounded-md transition-all duration-200 ${
                isSelected
                  ? 'bg-primary-50 shadow-sm dark:bg-primary-900/20'
                  : isHovered
                    ? 'bg-surface-hover shadow-sm'
                    : hoveredGroup && hoveredGroup !== group.ageRange
                      ? 'opacity-60'
                      : 'hover:bg-surface-hover'
              }`}
              onMouseMove={e => handleMouseMove(e, group.ageRange)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleGroupClick(group)}
            >
              {/* Male bar (right aligned) */}
              <div className="flex w-[45%] justify-end pr-3">
                <div className="relative flex w-full items-center gap-4">
                  <span
                    className={`min-w-[35px] text-right font-body text-xs transition-all duration-200 ${
                      isHovered || isSelected ? 'font-medium text-primary' : 'text-secondary'
                    }`}
                  >
                    {group.male}
                  </span>
                  <div className="relative flex flex-1 justify-end">
                    {group.male > 0 && (
                      <div
                        className={`h-4 cursor-pointer rounded-sm transition-all ${
                          isSelected
                            ? 'scale-y-110 bg-primary-600 shadow-md ring-2 ring-white'
                            : isHovered && hoveredSide === 'male'
                              ? 'scale-y-110 bg-primary-500/80 shadow-md ring-2 ring-white'
                              : isHovered
                                ? 'bg-primary-500 shadow-md ring-2 ring-white'
                                : 'bg-primary-500'
                        }`}
                        style={{
                          width: isAnimated
                            ? `${(group.malePercentage / maxPercentage) * 100}%`
                            : '0%',
                          opacity: isHovered || isSelected ? 1 : 0.9,
                          transition: `width ${0.5 + index * 0.05}s ease-out, opacity 0.3s ease`,
                        }}
                        onMouseMove={e => handleMouseMove(e, group.ageRange, 'male')}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Age group label */}
              <div className="w-[10%] px-3 text-center">
                <span
                  className={`font-body text-xs transition-all duration-200 ${
                    isHovered || isSelected
                      ? 'font-bold text-primary'
                      : 'font-medium text-secondary'
                  }`}
                >
                  {group.ageRange}
                </span>
              </div>

              {/* Female bar (left aligned) */}
              <div className="flex w-[45%] justify-start pl-3">
                <div className="relative flex w-full items-center gap-4">
                  <div className="relative flex flex-1 justify-start">
                    {group.female > 0 && (
                      <div
                        className={`h-4 cursor-pointer rounded-sm transition-all ${
                          isSelected
                            ? 'scale-y-110 bg-secondary-600 shadow-md ring-2 ring-white'
                            : isHovered && hoveredSide === 'female'
                              ? 'scale-y-110 bg-secondary-500/80 shadow-md ring-2 ring-white'
                              : isHovered
                                ? 'bg-secondary-500 shadow-md ring-2 ring-white'
                                : 'bg-secondary-500'
                        }`}
                        style={{
                          width: isAnimated
                            ? `${(group.femalePercentage / maxPercentage) * 100}%`
                            : '0%',
                          opacity: isHovered || isSelected ? 1 : 0.9,
                          transition: `width ${0.5 + index * 0.05}s ease-out, opacity 0.3s ease`,
                        }}
                        onMouseMove={e => handleMouseMove(e, group.ageRange, 'female')}
                      />
                    )}
                  </div>
                  <span
                    className={`min-w-[35px] font-body text-xs transition-all duration-200 ${
                      isHovered || isSelected ? 'font-medium text-primary' : 'text-secondary'
                    }`}
                  >
                    {group.female}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend and Stats */}
        <div className="mt-6 border-t border-default pt-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-primary-500" />
              <span className="font-body text-xs text-secondary">
                Male: {totalMale.toLocaleString()} (
                {((totalMale / totalPopulation) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-secondary-500" />
              <span className="font-body text-xs text-secondary">
                Female: {totalFemale.toLocaleString()} (
                {((totalFemale / totalPopulation) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {selectedGroup && (
            <div className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-3 text-center dark:border-primary-800 dark:bg-primary-900/20">
              <p className="font-body text-sm text-primary">
                Age group <span className="font-semibold">{selectedGroup}</span> selected
              </p>
              <p className="mt-1 font-body text-xs text-secondary">
                Click another group to compare or click outside to deselect
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredGroup && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border-2 border-primary-200 bg-white px-4 py-3 shadow-2xl dark:border-primary-700 dark:bg-gray-900"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {(() => {
            const tooltipData = getTooltipData();
            if (!tooltipData) return null;

            if (tooltipData.type === 'single') {
              const isMale = hoveredSide === 'male';
              return (
                <div className="text-sm">
                  <div className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                    <div
                      className={`size-3 rounded-full ${isMale ? 'bg-primary-500' : 'bg-secondary-500'}`}
                    ></div>
                    {tooltipData.label}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    {tooltipData.count?.toLocaleString()} ({tooltipData.percentage?.toFixed(1)}%)
                  </div>
                </div>
              );
            } else {
              return (
                <div className="text-sm">
                  <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    {tooltipData.label}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-primary-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Male:</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tooltipData.maleCount?.toLocaleString()} (
                        {tooltipData.malePercentage?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-secondary-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Female:</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tooltipData.femaleCount?.toLocaleString()} (
                        {tooltipData.femalePercentage?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                      <div className="flex justify-between gap-4 font-semibold">
                        <span className="text-gray-900 dark:text-gray-100">Total:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {tooltipData.total?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
}
