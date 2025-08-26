/**
 * Lazy-loaded Data Table
 *
 * @description Lazy version of DataTable for code splitting
 */

import { lazy } from 'react';

import { TableSkeleton } from '@/components/atoms/Loading';
import { withLazyLoading } from '@/lib';

const DataTableLazy = lazy(() => import('./DataTable'));

export const LazyDataTable = withLazyLoading(DataTableLazy, <TableSkeleton />);
export default LazyDataTable;
