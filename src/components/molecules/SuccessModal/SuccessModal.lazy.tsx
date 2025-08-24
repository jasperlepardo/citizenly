/**
 * Lazy-loaded Success Modal
 * 
 * @description Lazy version of SuccessModal for code splitting
 */

import { lazy } from 'react';
import { withLazyLoading } from '@/lib/ui/lazy-loading';

const SuccessModalLazy = lazy(() =>
  import('./SuccessModal').then(module => ({
    default: module.SuccessModal,
  }))
);

export const LazySuccessModal = withLazyLoading(SuccessModalLazy);
export default LazySuccessModal;