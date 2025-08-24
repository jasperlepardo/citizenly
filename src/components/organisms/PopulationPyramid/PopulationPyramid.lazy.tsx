/**
 * Lazy-loaded Population Pyramid
 * 
 * @description Lazy version of PopulationPyramid for code splitting
 */

import { lazy } from 'react';
import { withLazyLoading } from '@/lib/ui/lazy-loading';
import { LoadingFallback } from '@/components/atoms/Loading';

const PopulationPyramidLazy = lazy(() =>
  import('./PopulationPyramid').then(module => ({
    default: module.PopulationPyramid,
  }))
);

export const LazyPopulationPyramid = withLazyLoading(
  PopulationPyramidLazy, 
  <LoadingFallback height="400px" />
);
export default LazyPopulationPyramid;