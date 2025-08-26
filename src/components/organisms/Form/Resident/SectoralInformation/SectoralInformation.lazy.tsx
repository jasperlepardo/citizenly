/**
 * Lazy-loaded Sectoral Information Form
 * 
 * @description Lazy version of SectoralInformation for code splitting
 */

import { lazy } from 'react';

import { FormSkeleton } from '@/components/atoms/Loading';
import { withLazyLoading } from '@/lib';

const SectoralInfoLazy = lazy(() =>
  import('./SectoralInformation')
);

export const LazySectoralInfo = withLazyLoading(SectoralInfoLazy, <FormSkeleton />);
export default LazySectoralInfo;