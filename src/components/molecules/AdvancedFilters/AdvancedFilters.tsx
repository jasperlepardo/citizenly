/**
 * Advanced Filters Component
 * Comprehensive filtering interface for resident data
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components';
import { clientLogger } from '@/lib/logging/client-logger';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'text' | 'boolean';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
}

interface FilterValue {
  [key: string]: any;
}

interface AdvancedFiltersProps {
  fields: FilterField[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onApply?: () => void;
  onClear?: () => void;
  loading?: boolean;
  className?: string;
  compact?: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  fields,
  values,
  onChange,
  onApply,
  onClear,
  loading = false,
  className = '',
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [localValues, setLocalValues] = useState<FilterValue>(values);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local values with prop changes
  useEffect(() => {
    setLocalValues(values);
    setHasChanges(false);
  }, [values]);

  // Check if there are any changes
  useEffect(() => {
    const hasAnyChanges = Object.keys(localValues).some(key => {
      const localValue = localValues[key];
      const propValue = values[key];
      
      if (Array.isArray(localValue) && Array.isArray(propValue)) {
        return localValue.length !== propValue.length || 
               localValue.some((val, idx) => val !== propValue[idx]);
      }
      
      return localValue !== propValue;
    });
    
    setHasChanges(hasAnyChanges);
  }, [localValues, values]);

  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setLocalValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
    
    clientLogger.userAction('filter_field_changed', 'AdvancedFilters', {
      field: fieldKey,
      valueType: typeof value
    });
  }, []);

  const handleApply = useCallback(() => {
    onChange(localValues);
    if (onApply) {
      onApply();
    }
    
    clientLogger.userAction('filters_applied', 'AdvancedFilters', {
      filterCount: Object.keys(localValues).filter(key => {
        const value = localValues[key];
        return value !== undefined && value !== null && value !== '' && 
               (!Array.isArray(value) || value.length > 0);
      }).length
    });
  }, [localValues, onChange, onApply]);

  const handleClear = useCallback(() => {
    const clearedValues: FilterValue = {};
    fields.forEach(field => {
      if (field.type === 'multiselect') {
        clearedValues[field.key] = [];
      } else if (field.type === 'boolean') {
        clearedValues[field.key] = undefined;
      } else {
        clearedValues[field.key] = '';
      }
    });
    
    setLocalValues(clearedValues);
    onChange(clearedValues);
    
    if (onClear) {
      onClear();
    }
    
    clientLogger.userAction('filters_cleared', 'AdvancedFilters');
  }, [fields, onChange, onClear]);

  const renderFilterField = (field: FilterField) => {
    const value = localValues[field.key];
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          >
            <option value="">All {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-1">
              {selectedValues.length} selected
            </div>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-2 py-1 hover:bg-gray-100 px-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleFieldChange(field.key, newValues);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      case 'range':
        const rangeValue = value || { min: field.min, max: field.max };
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={rangeValue.min || ''}
                  onChange={(e) => handleFieldChange(field.key, {
                    ...rangeValue,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  min={field.min}
                  max={field.max}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={rangeValue.max || ''}
                  onChange={(e) => handleFieldChange(field.key, {
                    ...rangeValue,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  min={field.min}
                  max={field.max}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case 'date':
        const dateValue = value || { from: '', to: '' };
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateValue.from || ''}
                  onChange={(e) => handleFieldChange(field.key, {
                    ...dateValue,
                    from: e.target.value
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateValue.to || ''}
                  onChange={(e) => handleFieldChange(field.key, {
                    ...dateValue,
                    to: e.target.value
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          />
        );

      case 'boolean':
        return (
          <select
            value={value === undefined ? '' : value.toString()}
            onChange={(e) => {
              const newValue = e.target.value === '' ? undefined : e.target.value === 'true';
              handleFieldChange(field.key, newValue);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return null;
    }
  };

  const activeFilterCount = Object.keys(localValues).filter(key => {
    const value = localValues[key];
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined && v !== null && v !== '');
    }
    return true;
  }).length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <span className="text-xs text-orange-600">Unsaved changes</span>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Fields */}
      {isExpanded && (
        <div className="p-4">
          <div className={`grid gap-4 ${compact ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {fields.map(field => (
              <div key={field.key} className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  {field.label}
                </label>
                {renderFilterField(field)}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={loading || activeFilterCount === 0}
            >
              Clear All
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExpanded(false)}
                disabled={loading}
              >
                Close
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                disabled={loading || !hasChanges}
              >
                {loading ? 'Applying...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;