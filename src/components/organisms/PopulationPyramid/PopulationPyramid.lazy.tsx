/**
 * Lazy-loaded Population Pyramid
 * 
 * @description Lazy version of PopulationPyramid for code splitting
 */

import { lazy } from 'react';
import { withLazyLoading } from '@/lib';
import { LoadingFallback } from '@/components/atoms/Loading';

const PopulationPyramidLazy = lazy(() =>
  import('./PopulationPyramid')
);

export const LazyPopulationPyramid = withLazyLoading(
  PopulationPyramidLazy, 
  <LoadingFallback height="400px" />
);
export default LazyPopulationPyramid;