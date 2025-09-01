/**
 * Lazy-loaded Data Table
 *
 * @description Lazy version of DataTable for code splitting
 */

import { lazy } from 'react';

import { TableSkeleton } from '@/components/atoms/Loading';
// REMOVED: @/lib barrel import - replace with specific module;

const DataTableLazy = lazy(() => import('./DataTable'));

export const LazyDataTable = withLazyLoading(DataTableLazy, <TableSkeleton />);
export default LazyDataTable;
