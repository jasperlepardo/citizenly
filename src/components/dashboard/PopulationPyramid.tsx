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
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-primary text-lg">Population Pyramid</h3>
        <div className="text-sm font-body text-secondary">
          Total: {totalPopulation.toLocaleString()}
        </div>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="flex items-center text-xs font-body text-secondary mb-3">
          <div className="w-[45%] text-right pr-3">Male</div>
          <div className="w-[10%] text-center px-3">Age</div>
          <div className="w-[45%] text-left pl-3">Female</div>
        </div>

        {/* Pyramid bars */}
        {filteredData.map((group, index) => {
          const isHovered = hoveredGroup === group.ageRange;
          const isSelected = selectedGroup === group.ageRange;

          return (
            <div
              key={index}
              className={`flex items-center h-6 cursor-pointer transition-all duration-200 rounded-md ${
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-900/20 shadow-sm'
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
              <div className="w-[45%] flex justify-end pr-3">
                <div className="flex items-center gap-4 w-full relative">
                  <span
                    className={`text-xs font-body min-w-[35px] text-right transition-all duration-200 ${
                      isHovered || isSelected ? 'text-primary font-medium' : 'text-secondary'
                    }`}
                  >
                    {group.male}
                  </span>
                  <div className="flex-1 flex justify-end relative">
                    {group.male > 0 && (
                      <div
                        className={`h-4 transition-all rounded-sm cursor-pointer ${
                          isSelected
                            ? 'bg-primary-600 transform scale-y-110 ring-2 ring-white shadow-md'
                            : isHovered && hoveredSide === 'male'
                              ? 'bg-primary-500/80 transform scale-y-110 ring-2 ring-white shadow-md'
                              : isHovered
                                ? 'bg-primary-500 ring-2 ring-white shadow-md'
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
              <div className="w-[10%] text-center px-3">
                <span
                  className={`text-xs font-body transition-all duration-200 ${
                    isHovered || isSelected
                      ? 'text-primary font-bold'
                      : 'font-medium text-secondary'
                  }`}
                >
                  {group.ageRange}
                </span>
              </div>

              {/* Female bar (left aligned) */}
              <div className="w-[45%] flex justify-start pl-3">
                <div className="flex items-center gap-4 w-full relative">
                  <div className="flex-1 flex justify-start relative">
                    {group.female > 0 && (
                      <div
                        className={`h-4 transition-all rounded-sm cursor-pointer ${
                          isSelected
                            ? 'bg-secondary-600 transform scale-y-110 ring-2 ring-white shadow-md'
                            : isHovered && hoveredSide === 'female'
                              ? 'bg-secondary-500/80 transform scale-y-110 ring-2 ring-white shadow-md'
                              : isHovered
                                ? 'bg-secondary-500 ring-2 ring-white shadow-md'
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
                    className={`text-xs font-body min-w-[35px] transition-all duration-200 ${
                      isHovered || isSelected ? 'text-primary font-medium' : 'text-secondary'
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
        <div className="mt-6 pt-4 border-t border-default">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded" />
              <span className="text-xs font-body text-secondary">
                Male: {totalMale.toLocaleString()} (
                {((totalMale / totalPopulation) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary-500 rounded" />
              <span className="text-xs font-body text-secondary">
                Female: {totalFemale.toLocaleString()} (
                {((totalFemale / totalPopulation) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {selectedGroup && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center border border-primary-200 dark:border-primary-800">
              <p className="text-sm font-body text-primary">
                Age group <span className="font-semibold">{selectedGroup}</span> selected
              </p>
              <p className="text-xs font-body text-secondary mt-1">
                Click another group to compare or click outside to deselect
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredGroup && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-primary-200 dark:border-primary-700 px-4 py-3 pointer-events-none"
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
                  <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    <div
                      className={`w-3 h-3 rounded-full ${isMale ? 'bg-primary-500' : 'bg-secondary-500'}`}
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
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {tooltipData.label}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Male:</span>
                      </div>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {tooltipData.maleCount?.toLocaleString()} (
                        {tooltipData.malePercentage?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-secondary-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Female:</span>
                      </div>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {tooltipData.femaleCount?.toLocaleString()} (
                        {tooltipData.femalePercentage?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
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
