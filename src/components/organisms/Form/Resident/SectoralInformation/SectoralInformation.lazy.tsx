/**
 * Lazy-loaded Sectoral Information Form
 * 
 * @description Lazy version of SectoralInformation for code splitting
 */

import { lazy } from 'react';
import { withLazyLoading } from '@/lib/ui/lazy-loading';
import { FormSkeleton } from '@/components/atoms/Loading';

const SectoralInfoLazy = lazy(() =>
  import('./SectoralInformation')
);

export const LazySectoralInfo = withLazyLoading(SectoralInfoLazy, <FormSkeleton />);
export default LazySectoralInfo;