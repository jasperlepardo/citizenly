import { lazy, Suspense, ComponentType, ReactNode } from 'react';

/**
 * Lazy-loaded components for code splitting
 * These components are loaded on-demand to reduce initial bundle size
 */

// Loading fallback component
function LoadingFallback({ height = '200px' }: { height?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
      style={{ minHeight: height }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  );
}

// Skeleton loader for forms
function FormSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/4 rounded-sm bg-gray-200"></div>
          <div className="h-10 rounded-sm bg-gray-100"></div>
        </div>
      ))}
      <div className="flex gap-3">
        <div className="h-10 w-24 rounded-sm bg-gray-200"></div>
        <div className="h-10 w-24 rounded-sm bg-gray-200"></div>
      </div>
    </div>
  );
}

// Skeleton loader for tables
function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 rounded-sm bg-gray-200"></div>
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 rounded-sm bg-gray-300"></div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-6 rounded-sm bg-gray-100"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// HOC for wrapping lazy components with suspense
function withLazyLoading<P extends object>(LazyComponent: ComponentType<P>, fallback?: ReactNode) {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy-loaded components
const CreateHouseholdModalLazy = lazy(() =>
  import('@/components/organisms/CreateHouseholdModal').then(module => ({
    default: module.CreateHouseholdModal,
  }))
);

const DataTableLazy = lazy(() =>
  import('@/components/organisms/DataTable').then(module => ({
    default: module.DataTable,
  }))
);

const PopulationPyramidLazy = lazy(() =>
  import('@/components/organisms/PopulationPyramid').then(module => ({
    default: module.PopulationPyramid,
  }))
);

const UserProfileLazy = lazy(() =>
  import('@/components/organisms/UserProfile').then(module => ({
    default: module.UserProfile,
  }))
);


const PersonalInformationLazy = lazy(() =>
  import('@/components/organisms/Form/Resident/PersonalInformation/PersonalInformation').then(module => ({
    default: module.PersonalInformationForm,
  }))
);

const SectoralInfoLazy = lazy(() =>
  import('@/components/organisms/SectoralInfo').then(module => ({
    default: module.SectoralInfo,
  }))
);


const ErrorModalLazy = lazy(() =>
  import('@/components/molecules/ErrorModal').then(module => ({
    default: module.ErrorModal,
  }))
);

const SuccessModalLazy = lazy(() =>
  import('@/components/molecules/SuccessModal').then(module => ({
    default: module.SuccessModal,
  }))
);

// Geographic selector components

const GeographicLocationStepLazy = lazy(() =>
  import('@/components/organisms/GeographicLocationStep').then(module => ({
    default: module.GeographicLocationStep,
  }))
);

// Wrapped components with appropriate loading states
export const CreateHouseholdModal = withLazyLoading(CreateHouseholdModalLazy, <FormSkeleton />);

export const DataTable = withLazyLoading(DataTableLazy, <TableSkeleton />);

export const PopulationPyramid = withLazyLoading(
  PopulationPyramidLazy,
  <LoadingFallback height="400px" />
);

export const UserProfile = withLazyLoading(UserProfileLazy, <FormSkeleton />);

export const PersonalInformation = withLazyLoading(PersonalInformationLazy, <FormSkeleton />);

export const SectoralInfo = withLazyLoading(SectoralInfoLazy, <FormSkeleton />);


export const ErrorModal = withLazyLoading(ErrorModalLazy);

export const SuccessModal = withLazyLoading(SuccessModalLazy);

// Geographic selector components with loading states

export const GeographicLocationStep = withLazyLoading(GeographicLocationStepLazy, <FormSkeleton />);

// Preload functions for better UX
export const preloadComponents = {
  createHouseholdModal: () => import('@/components/organisms/CreateHouseholdModal'),
  dataTable: () => import('@/components/organisms/DataTable'),
  populationPyramid: () => import('@/components/organisms/PopulationPyramid'),
  userProfile: () => import('@/components/organisms/UserProfile'),
  personalInformation: () => import('@/components/organisms/Form/Resident/PersonalInformation/PersonalInformation'),
  sectoralInfo: () => import('@/components/organisms/SectoralInfo'),
  errorModal: () => import('@/components/molecules/ErrorModal'),
  successModal: () => import('@/components/molecules/SuccessModal'),
  geographicLocationStep: () => import('@/components/organisms/GeographicLocationStep'),
};

// Utility to preload component on hover
export function usePreloadOnHover(componentKey: keyof typeof preloadComponents) {
  return {
    onMouseEnter: () => {
      preloadComponents[componentKey]();
    },
  };
}
