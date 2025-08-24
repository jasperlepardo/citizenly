/**
 * Lazy-loaded Data Table
 * 
 * @description Lazy version of DataTable for code splitting
 */

import { lazy } from 'react';
import { withLazyLoading } from '@/lib/ui/lazy-loading';
import { TableSkeleton } from '@/components/atoms/Loading';

const DataTableLazy = lazy(() =>
  import('./DataTable')
);

export const LazyDataTable = withLazyLoading(DataTableLazy, <TableSkeleton />);
export default LazyDataTable;