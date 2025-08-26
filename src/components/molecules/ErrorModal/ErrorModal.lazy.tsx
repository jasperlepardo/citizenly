/**
 * Lazy-loaded Error Modal
 * 
 * @description Lazy version of ErrorModal for code splitting
 */

import { lazy } from 'react';

import { withLazyLoading } from '@/lib';

const ErrorModalLazy = lazy(() =>
  import('./ErrorModal').then(module => ({
    default: module.ErrorModal,
  }))
);

export const LazyErrorModal = withLazyLoading(ErrorModalLazy);
export default LazyErrorModal;