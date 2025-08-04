/**
 * Reusable Select Component
 * Base select component for consistent styling across the app
 */

import React from 'react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  error?: string
  className?: string
  name?: string
  required?: boolean
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  loading = false,
  error,
  className = "",
  name,
  required = false
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        required={required}
        className={`
          w-full pl-3 pr-8 py-2 bg-white border rounded-md shadow-sm appearance-none
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${loading ? 'cursor-wait' : 'cursor-pointer'}
        `}
      >
        <option value="" disabled>
          {loading ? 'Loading...' : placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Loading indicator only */}
      {loading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}