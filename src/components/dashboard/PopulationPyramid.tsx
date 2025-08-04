'use client'

import { useState, useEffect } from 'react'

interface AgeGroup {
  ageRange: string
  male: number
  female: number
  malePercentage: number
  femalePercentage: number
}

interface PopulationPyramidProps {
  data?: AgeGroup[]
  className?: string
  onAgeGroupClick?: (ageGroup: AgeGroup) => void
}

export default function PopulationPyramid({ data, className = "", onAgeGroupClick }: PopulationPyramidProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isAnimated, setIsAnimated] = useState(false)
  
  // Default data based on typical barangay demographics
  const defaultData: AgeGroup[] = [
    { ageRange: '0-4', male: 62, female: 58, malePercentage: 5.1, femalePercentage: 4.7 },
    { ageRange: '5-9', male: 59, female: 56, malePercentage: 4.8, femalePercentage: 4.6 },
    { ageRange: '10-14', male: 61, female: 58, malePercentage: 5.0, femalePercentage: 4.7 },
    { ageRange: '15-19', male: 68, female: 65, malePercentage: 5.5, femalePercentage: 5.3 },
    { ageRange: '20-24', male: 72, female: 70, malePercentage: 5.9, femalePercentage: 5.7 },
    { ageRange: '25-29', male: 75, female: 73, malePercentage: 6.1, femalePercentage: 6.0 },
    { ageRange: '30-34', male: 71, female: 69, malePercentage: 5.8, femalePercentage: 5.7 },
    { ageRange: '35-39', male: 65, female: 63, malePercentage: 5.3, femalePercentage: 5.2 },
    { ageRange: '40-44', male: 58, female: 56, malePercentage: 4.7, femalePercentage: 4.6 },
    { ageRange: '45-49', male: 52, female: 50, malePercentage: 4.2, femalePercentage: 4.1 },
    { ageRange: '50-54', male: 46, female: 44, malePercentage: 3.7, femalePercentage: 3.6 },
    { ageRange: '55-59', male: 38, female: 37, malePercentage: 3.1, femalePercentage: 3.0 },
    { ageRange: '60-64', male: 32, female: 31, malePercentage: 2.6, femalePercentage: 2.5 },
    { ageRange: '65-69', male: 26, female: 28, malePercentage: 2.1, femalePercentage: 2.3 },
    { ageRange: '70-74', male: 20, female: 23, malePercentage: 1.6, femalePercentage: 1.9 },
    { ageRange: '75+', male: 22, female: 28, malePercentage: 1.8, femalePercentage: 2.3 }
  ]

  const pyramidData = data || defaultData
  const maxPercentage = Math.max(...pyramidData.map(d => Math.max(d.malePercentage, d.femalePercentage)))
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])
  
  const handleGroupClick = (group: AgeGroup) => {
    if (selectedGroup === group.ageRange) {
      setSelectedGroup(null)
    } else {
      setSelectedGroup(group.ageRange)
      onAgeGroupClick?.(group)
    }
  }

  const totalMale = pyramidData.reduce((sum, group) => sum + group.male, 0)
  const totalFemale = pyramidData.reduce((sum, group) => sum + group.female, 0)
  const totalPopulation = totalMale + totalFemale

  return (
    <div className={`bg-white rounded border border-neutral-300 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-montserrat font-medium text-neutral-900">Population Pyramid</h3>
        <div className="text-sm font-montserrat text-neutral-600">
          Total: {totalPopulation.toLocaleString()}
        </div>
      </div>
      
      <div className="space-y-1">
        {/* Header */}
        <div className="flex items-center text-xs font-montserrat text-neutral-600 mb-2">
          <div className="w-[45%] text-right pr-2">Male</div>
          <div className="w-[10%] text-center">Age</div>
          <div className="w-[45%] text-left pl-2">Female</div>
        </div>

        {/* Pyramid bars */}
        {pyramidData.map((group, index) => {
          const isHovered = hoveredGroup === group.ageRange
          const isSelected = selectedGroup === group.ageRange
          
          return (
            <div 
              key={index} 
              className={`flex items-center h-6 cursor-pointer transition-all duration-200 rounded ${
                isSelected ? 'bg-blue-50' : isHovered ? 'bg-neutral-50' : ''
              }`}
              onMouseEnter={() => setHoveredGroup(group.ageRange)}
              onMouseLeave={() => setHoveredGroup(null)}
              onClick={() => handleGroupClick(group)}
            >
              {/* Male bar (right aligned) */}
              <div className="w-[45%] flex justify-end pr-2">
                <div className="flex items-center gap-1 w-full relative">
                  <span className={`text-xs font-montserrat min-w-[35px] text-right transition-colors ${
                    isHovered || isSelected ? 'text-neutral-800 font-medium' : 'text-neutral-600'
                  }`}>
                    {group.male}
                  </span>
                  <div className="flex-1 flex justify-end relative">
                    <div 
                      className={`h-4 transition-all rounded-sm ${
                        isSelected ? 'bg-blue-600' : isHovered ? 'bg-blue-500/80' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: isAnimated ? `${(group.malePercentage / maxPercentage) * 100}%` : '0%',
                        minWidth: '2px',
                        opacity: isHovered || isSelected ? 1 : 0.9,
                        transition: `width ${0.5 + index * 0.05}s ease-out, opacity 0.3s ease`
                      }}
                    />
                    {isHovered && (
                      <div className="absolute -top-8 right-0 bg-neutral-900 text-white text-xs rounded px-2 py-1 font-montserrat whitespace-nowrap z-10">
                        Male: {group.male} ({group.malePercentage.toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Age group label */}
              <div className="w-[10%] text-center px-2">
                <span className={`text-xs font-montserrat transition-colors ${
                  isHovered || isSelected ? 'text-neutral-900 font-semibold' : 'font-medium text-neutral-700'
                }`}>
                  {group.ageRange}
                </span>
              </div>

              {/* Female bar (left aligned) */}
              <div className="w-[45%] flex justify-start pl-2">
                <div className="flex items-center gap-1 w-full relative">
                  <div className="flex-1 flex justify-start relative">
                    <div 
                      className={`h-4 transition-all rounded-sm ${
                        isSelected ? 'bg-pink-600' : isHovered ? 'bg-pink-500/80' : 'bg-pink-500'
                      }`}
                      style={{ 
                        width: isAnimated ? `${(group.femalePercentage / maxPercentage) * 100}%` : '0%',
                        minWidth: '2px',
                        opacity: isHovered || isSelected ? 1 : 0.9,
                        transition: `width ${0.5 + index * 0.05}s ease-out, opacity 0.3s ease`
                      }}
                    />
                    {isHovered && (
                      <div className="absolute -top-8 left-0 bg-neutral-900 text-white text-xs rounded px-2 py-1 font-montserrat whitespace-nowrap z-10">
                        Female: {group.female} ({group.femalePercentage.toFixed(1)}%)
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-montserrat min-w-[35px] transition-colors ${
                    isHovered || isSelected ? 'text-neutral-800 font-medium' : 'text-neutral-600'
                  }`}>
                    {group.female}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Legend and Stats */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-xs font-montserrat text-neutral-600">
                Male: {totalMale.toLocaleString()} ({((totalMale / totalPopulation) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded" />
              <span className="text-xs font-montserrat text-neutral-600">
                Female: {totalFemale.toLocaleString()} ({((totalFemale / totalPopulation) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
          
          {selectedGroup && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-center">
              <p className="text-sm font-montserrat text-neutral-700">
                Age group <span className="font-semibold">{selectedGroup}</span> selected
              </p>
              <p className="text-xs font-montserrat text-neutral-600 mt-1">
                Click another group to compare or click outside to deselect
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}