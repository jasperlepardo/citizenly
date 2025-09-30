/**
 * Resident Table Types
 * 
 * @fileoverview Table and UI-related types for resident data display.
 * These types should be used in components, not in core data types.
 */

import type { ResidentRecord } from '@/types/infrastructure/database/database';

/**
 * Table action configuration for resident rows
 */
export interface ResidentTableAction {
  key: string;
  label: string;
  href?: (record: ResidentRecord) => string;
  onClick?: (record: ResidentRecord) => void;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: string;
  disabled?: (record: ResidentRecord) => boolean;
  hidden?: (record: ResidentRecord) => boolean;
}

/**
 * Table column configuration
 * Note: The render function returns any to avoid coupling with React
 * Components using this should cast to ReactNode
 */
export interface ResidentTableColumn {
  key: string;
  title: string;
  dataIndex: string | ((record: ResidentRecord) => string | number | boolean);
  render?: (value: string | number | boolean, record: ResidentRecord) => any;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

/**
 * Table filter configuration
 */
export interface ResidentTableFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  placeholder?: string;
}

/**
 * Table state management
 */
export interface ResidentTableState {
  selectedRowKeys: string[];
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters: Record<string, any>;
  searchQuery?: string;
}

/**
 * Table props interface for component usage
 */
export interface ResidentTableProps {
  columns: ResidentTableColumn[];
  actions?: ResidentTableAction[];
  filters?: ResidentTableFilter[];
  selectable?: boolean;
  pagination?: boolean;
  exportable?: boolean;
  onRowClick?: (record: ResidentRecord) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}