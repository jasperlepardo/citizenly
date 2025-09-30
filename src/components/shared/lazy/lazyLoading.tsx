/**
 * Lazy Loading Utilities
 *
 * @description Higher-order component for wrapping lazy components with Suspense
 * and loading states. Provides code splitting infrastructure.
 */

import { Suspense, ComponentType, ReactNode } from 'react';

import { LoadingFallback } from '@/components/atoms/Loading/LoadingFallback/LoadingFallback';

/**
 * HOC for wrapping lazy components with Suspense and loading states
 *
 * @param LazyComponent - The lazy-loaded component
 * @param fallback - Optional custom loading fallback
 * @returns Wrapped component with Suspense boundary
 *
 * @example
 * ```tsx
 * const LazyModal = lazy(() => import('./Modal'));
 * const ModalWithLoading = withLazyLoading(LazyModal, <FormSkeleton />);
 * ```
 */
export function withLazyLoading<P extends object>(
  LazyComponent: ComponentType<P>,
  fallback?: ReactNode
) {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload functions registry for better UX
 * Components can be preloaded before they're actually needed
 */
export const preloadComponents = {
  createHouseholdModal: () => import('@/components/organisms/CreateHouseholdModal/CreateHouseholdModal'),
  dataTable: () => import('@/components/organisms/DataTable/DataTable'),
  populationPyramid: () => import('@/components/organisms/PopulationPyramid/PopulationPyramid'),
  userProfile: () => import('@/components/organisms/UserProfile/UserProfile'),
  personalInformation: () =>
    import('@/components/organisms/FormSection/Resident/PersonalInformation/PersonalInformation'),
  sectoralInfo: () => import('@/components/organisms/FormSection/Resident/SectoralInformation/SectoralInformation'),
  errorModal: () => import('@/components/molecules/ErrorModal'),
  successModal: () => import('@/components/molecules/SuccessModal'),
} as const;

/**
 * Type for preload component keys
 */
export type PreloadComponentKey = keyof typeof preloadComponents;