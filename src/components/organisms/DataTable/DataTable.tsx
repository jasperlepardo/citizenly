'use client';

import Link from 'next/link';
import React, { useState, useMemo } from 'react';

import { Button } from '@/components';
import type { TableColumn, DataTableProps } from '@/types/app/ui/components';

// Type aliases for union types
type SortOrder = 'asc' | 'desc';
type TableSize = 'small' | 'middle' | 'large';
type TextAlign = 'left' | 'center' | 'right';
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'secondary-outline';

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions = [],
  loading = false,
  pagination,
  selection,
  rowKey = 'id',
  onRow,
  emptyText = 'No data available',
  className = '',
  size = 'middle',
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey]?.toString() || index.toString();
  };

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortField === columnKey) {
      setSortOrder((sortOrder === 'asc' ? 'desc' : 'asc') as SortOrder);
    } else {
      setSortField(columnKey);
      setSortOrder('asc' as SortOrder);
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortField);
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (column?.dataIndex && typeof column.dataIndex === 'function') {
        aValue = column.dataIndex(a);
        bValue = column.dataIndex(b);
      } else if (column?.dataIndex && typeof column.dataIndex === 'string') {
        aValue = a[column.dataIndex];
        bValue = b[column.dataIndex];
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

      // Convert to strings for comparison
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();

      if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortOrder, columns]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!selection) return;

    if (checked) {
      const allKeys = sortedData.map((record, index) => getRowKey(record, index));
      selection.onChange(allKeys, sortedData);
    } else {
      selection.onChange([], []);
    }
  };

  // Handle single row selection
  const handleRowSelect = (record: T, index: number, checked: boolean) => {
    if (!selection) return;

    const rowKeyValue = getRowKey(record, index);
    let newSelectedKeys = [...selection.selectedRowKeys];
    let newSelectedRows = sortedData.filter((item, idx) =>
      selection.selectedRowKeys.includes(getRowKey(item, idx))
    );

    if (checked) {
      newSelectedKeys.push(rowKeyValue);
      newSelectedRows.push(record);
    } else {
      newSelectedKeys = newSelectedKeys.filter(key => key !== rowKeyValue);
      newSelectedRows = newSelectedRows.filter(item => getRowKey(item, 0) !== rowKeyValue);
    }

    selection.onChange(newSelectedKeys, newSelectedRows);
  };

  // Get cell value
  const getCellValue = (record: T, column: TableColumn<T>, index: number): React.ReactNode => {
    let value: unknown;

    if (column.dataIndex) {
      if (typeof column.dataIndex === 'function') {
        value = column.dataIndex(record);
      } else {
        value = record[column.dataIndex];
      }
    } else {
      value = record[column.key];
    }

    if (column.render) {
      return column.render(value, record, index);
    }

    // Convert value to ReactNode
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  const sizeClasses: Record<TableSize, string> = {
    small: 'text-sm',
    middle: 'text-base',
    large: 'text-lg',
  };

  const paddingClasses: Record<TableSize, string> = {
    small: 'px-3 py-2',
    middle: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  if (loading) {
    return (
      <div
        className={`rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 ${className}`}
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="size-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 ${className}`}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y border-gray-300 dark:border-gray-600">
          {/* Header */}
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {/* Selection column */}
              {selection && (
                <th className={`${paddingClasses[size]} w-12`}>
                  <input
                    type="checkbox"
                    className="size-4 rounded-sm border-gray-300 bg-white text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    checked={
                      selection.selectedRowKeys.length === sortedData.length &&
                      sortedData.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`${paddingClasses[size]} text-left ${sizeClasses[size]} font-medium text-gray-600 dark:text-gray-400 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <svg
                          className={`size-3 ${
                            sortField === column.key && sortOrder === 'asc'
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {actions.length > 0 && (
                <th
                  className={`${paddingClasses[size]} text-right ${sizeClasses[size]} font-medium text-gray-600 dark:text-gray-400`}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selection ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-600 dark:text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => {
                const rowKeyValue = getRowKey(record, index);
                const rowProps = onRow?.(record, index) || {};
                const isSelected = selection?.selectedRowKeys.includes(rowKeyValue) || false;

                return (
                  <tr
                    key={rowKeyValue}
                    className={`hover:bg-gray-50 dark:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${rowProps.className || ''}`}
                    onClick={rowProps.onClick}
                    onDoubleClick={rowProps.onDoubleClick}
                  >
                    {/* Selection column */}
                    {selection && (
                      <td className={paddingClasses[size]}>
                        <input
                          type="checkbox"
                          className="size-4 rounded-sm border-gray-300 bg-white text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          checked={isSelected}
                          onChange={e => handleRowSelect(record, index, e.target.checked)}
                          disabled={selection.getCheckboxProps?.(record)?.disabled}
                        />
                      </td>
                    )}

                    {/* Data columns */}
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className={`${paddingClasses[size]} ${sizeClasses[size]} text-gray-600 dark:text-gray-400`}
                        style={{ textAlign: (column.align || 'left') as TextAlign }}
                      >
                        {getCellValue(record, column, index)}
                      </td>
                    ))}

                    {/* Actions column */}
                    {actions.length > 0 && (
                      <td className={`${paddingClasses[size]} text-right`}>
                        <div className="flex items-center justify-end space-x-2">
                          {actions
                            .filter(action => action.visible?.(record) !== false)
                            .map(action => {
                              const isDisabled = action.disabled?.(record) || false;

                              if (action.href) {
                                return (
                                  <Link
                                    key={action.key}
                                    href={action.href(record)}
                                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-200"
                                  >
                                    {action.icon && <span className="mr-1">{action.icon}</span>}
                                    {action.label}
                                  </Link>
                                );
                              }

                              return (
                                <Button
                                  key={action.key}
                                  size="sm"
                                  variant={(action.variant || 'secondary-outline') as ButtonVariant}
                                  onClick={
                                    action.onClick
                                      ? () => action.onClick!(record, index)
                                      : undefined
                                  }
                                  disabled={isDisabled}
                                  leftIcon={action.icon}
                                >
                                  {action.label}
                                </Button>
                              );
                            })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing{' '}
              {Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary-outline"
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>

            <Button
              size="sm"
              variant="secondary-outline"
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
