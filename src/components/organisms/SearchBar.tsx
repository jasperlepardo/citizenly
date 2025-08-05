import React, { useState, useEffect } from 'react'
import { Button } from '@/components/atoms'
import { InputField, DropdownSelect } from '@/components/molecules'

export interface SearchFilter {
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between'
  value: string | number | [string | number, string | number]
  label: string
}

export interface SearchBarProps {
  placeholder?: string
  onSearch: (searchTerm: string, filters: SearchFilter[]) => void
  onClear?: () => void
  filterOptions?: {
    field: string
    label: string
    type: 'text' | 'select' | 'number' | 'date'
    options?: { value: string; label: string }[]
  }[]
  initialSearchTerm?: string
  initialFilters?: SearchFilter[]
  showAdvancedFilters?: boolean
  className?: string
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  onClear,
  filterOptions = [],
  initialSearchTerm = '',
  initialFilters = [],
  showAdvancedFilters = false,
  className = ""
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [filters, setFilters] = useState<SearchFilter[]>(initialFilters)
  const [showFilters, setShowFilters] = useState(showAdvancedFilters)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Trigger search when debounced term or filters change
  useEffect(() => {
    onSearch(debouncedSearchTerm, filters)
  }, [debouncedSearchTerm, filters])

  const handleAddFilter = () => {
    if (filterOptions.length > 0) {
      const newFilter: SearchFilter = {
        field: filterOptions[0].field,
        operator: 'contains',
        value: '',
        label: filterOptions[0].label
      }
      setFilters([...filters, newFilter])
    }
  }

  const handleUpdateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const updatedFilters = filters.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    )
    setFilters(updatedFilters)
  }

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handleClear = () => {
    setSearchTerm('')
    setFilters([])
    if (onClear) {
      onClear()
    }
  }

  const getOperatorOptions = (fieldType: string) => {
    const baseOptions = [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' }
    ]

    if (fieldType === 'number' || fieldType === 'date') {
      return [
        ...baseOptions,
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
        { value: 'between', label: 'Between' }
      ]
    }

    return baseOptions
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <InputField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            leftIcon={
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            rightIcon={
              searchTerm && (
                <Button
                  onClick={() => setSearchTerm('')}
                  variant="ghost"
                  size="sm"
                  iconOnly
                  className="text-muted hover:text-secondary h-4 w-4 p-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )
            }
          />
        </div>

        {filterOptions.length > 0 && (
          <Button
            variant={showFilters ? "primary" : "secondary-outline"}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            }
          >
            Filters {filters.length > 0 && `(${filters.length})`}
          </Button>
        )}

        {(searchTerm || filters.length > 0) && (
          <Button
            variant="secondary-outline"
            onClick={handleClear}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && filterOptions.length > 0 && (
        <div className="rounded-lg border border-default p-4 bg-surface-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary">Advanced Filters</h3>
            <Button
              size="sm"
              variant="primary-outline"
              onClick={handleAddFilter}
            >
              Add Filter
            </Button>
          </div>

          {filters.length === 0 ? (
            <p className="text-sm text-muted">No filters applied. Click "Add Filter" to add search criteria.</p>
          ) : (
            <div className="space-y-3">
              {filters.map((filter, index) => {
                const fieldOption = filterOptions.find(opt => opt.field === filter.field)
                const operatorOptions = getOperatorOptions(fieldOption?.type || 'text')

                return (
                  <div key={index} className="flex items-center gap-2 p-3 bg-surface rounded border border-default">
                    {/* Field Selection */}
                    <div className="w-40">
                      <DropdownSelect
                        value={filter.field}
                        onChange={(value) => {
                          const selectedOption = filterOptions.find(opt => opt.field === value)
                          handleUpdateFilter(index, {
                            field: value,
                            label: selectedOption?.label || value,
                            value: ''
                          })
                        }}
                        options={filterOptions.map(opt => ({ value: opt.field, label: opt.label }))}
                      />
                    </div>

                    {/* Operator Selection */}
                    <div className="w-32">
                      <DropdownSelect
                        value={filter.operator}
                        onChange={(value) => handleUpdateFilter(index, { 
                          operator: value as SearchFilter['operator'],
                          value: '' 
                        })}
                        options={operatorOptions}
                      />
                    </div>

                    {/* Value Input */}
                    <div className="flex-1">
                      {fieldOption?.type === 'select' ? (
                        <DropdownSelect
                          value={filter.value.toString()}
                          onChange={(value) => handleUpdateFilter(index, { value: value })}
                          options={fieldOption.options || []}
                          placeholder="Select value..."
                        />
                      ) : filter.operator === 'between' ? (
                        <div className="flex items-center gap-2">
                          <InputField
                            type={fieldOption?.type === 'number' ? 'number' : fieldOption?.type === 'date' ? 'date' : 'text'}
                            value={Array.isArray(filter.value) ? filter.value[0]?.toString() || '' : ''}
                            onChange={(e) => {
                              const currentValue = Array.isArray(filter.value) ? filter.value : ['', '']
                              handleUpdateFilter(index, { value: [e.target.value, currentValue[1]] })
                            }}
                            placeholder="From"
                          />
                          <span className="text-muted">to</span>
                          <InputField
                            type={fieldOption?.type === 'number' ? 'number' : fieldOption?.type === 'date' ? 'date' : 'text'}
                            value={Array.isArray(filter.value) ? filter.value[1]?.toString() || '' : ''}
                            onChange={(e) => {
                              const currentValue = Array.isArray(filter.value) ? filter.value : ['', '']
                              handleUpdateFilter(index, { value: [currentValue[0], e.target.value] })
                            }}
                            placeholder="To"
                          />
                        </div>
                      ) : (
                        <InputField
                          type={fieldOption?.type === 'number' ? 'number' : fieldOption?.type === 'date' ? 'date' : 'text'}
                          value={Array.isArray(filter.value) ? '' : filter.value.toString()}
                          onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                          placeholder="Enter value..."
                        />
                      )}
                    </div>

                    {/* Remove Filter Button */}
                    <Button
                      size="sm"
                      variant="danger-outline"
                      onClick={() => handleRemoveFilter(index)}
                      iconOnly
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span className="font-medium">{filter.label}</span>
              <span className="text-blue-600">{filter.operator.replace('_', ' ')}</span>
              <span className="font-medium">
                {Array.isArray(filter.value) 
                  ? `${filter.value[0]} - ${filter.value[1]}`
                  : filter.value
                }
              </span>
              <Button
                onClick={() => handleRemoveFilter(index)}
                variant="ghost"
                size="sm"
                iconOnly
                className="ml-1 text-blue-600 hover:text-blue-800 h-3 w-3 p-0"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}