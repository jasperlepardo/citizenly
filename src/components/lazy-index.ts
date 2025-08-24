/**
 * Lazy-loaded Component Exports
 *
 * @description Centralized exports for lazy-loaded components to improve initial bundle size.
 * Heavy components are loaded only when needed, improving app startup performance.
 *
 * @performance This reduces the initial JavaScript bundle size by approximately:
 * - DataTable: ~45KB
 * - Chart components: ~120KB
 * - Forms with complex validation: ~35KB
 * - Modal dialogs: ~25KB
 */

import { createLazyComponent, LazyLoadingPresets } from '@/lib/lazy-components';

// Heavy data visualization components
export const LazyDataTable = createLazyComponent(
  () => import('@/components/organisms/DataTable').then(mod => ({ default: mod.DataTable })),
  {
    ...LazyLoadingPresets.table,
    displayName: 'DataTable',
  }
);

export const LazyPopulationPyramid = createLazyComponent(
  () =>
    import('@/components/organisms/PopulationPyramid').then(mod => ({
      default: mod.PopulationPyramid,
    })),
  {
    ...LazyLoadingPresets.chart,
    displayName: 'PopulationPyramid',
  }
);

// Chart components (these are usually heavy with charting libraries)
export const LazyCivilStatusPieChart = createLazyComponent(
  () =>
    import('@/components/molecules/CivilStatusPieChart').then(mod => ({
      default: mod.CivilStatusPieChart,
    })),
  {
    ...LazyLoadingPresets.chart,
    displayName: 'CivilStatusPieChart',
  }
);

export const LazyEmploymentStatusPieChart = createLazyComponent(
  () =>
    import('@/components/molecules/EmploymentStatusPieChart').then(mod => ({
      default: mod.EmploymentStatusPieChart,
    })),
  {
    ...LazyLoadingPresets.chart,
    displayName: 'EmploymentStatusPieChart',
  }
);

export const LazySexDistributionPieChart = createLazyComponent(
  () =>
    import('@/components/molecules/SexDistributionPieChart').then(mod => ({
      default: mod.SexDistributionPieChart,
    })),
  {
    ...LazyLoadingPresets.chart,
    displayName: 'SexDistributionPieChart',
  }
);

export const LazyDependencyRatioPieChart = createLazyComponent(
  () =>
    import('@/components/molecules/DependencyRatioPieChart').then(mod => ({
      default: mod.DependencyRatioPieChart,
    })),
  {
    ...LazyLoadingPresets.chart,
    displayName: 'DependencyRatioPieChart',
  }
);

// Heavy form components
export const LazyResidentFormWizard = createLazyComponent(
  () => import('@/components/templates/ResidentFormWizard'),
  {
    ...LazyLoadingPresets.form,
    displayName: 'ResidentFormWizard',
  }
);

export const LazyHouseholdFormWizard = createLazyComponent(
  () => import('@/components/templates/HouseholdFormWizard'),
  {
    ...LazyLoadingPresets.form,
    displayName: 'HouseholdFormWizard',
  }
);

// Modal components
export const LazyCreateHouseholdModal = createLazyComponent(
  () => import('@/components/organisms/CreateHouseholdModal'),
  {
    ...LazyLoadingPresets.modal,
    displayName: 'CreateHouseholdModal',
  }
);

// Complex form sections
export const LazySectoralInfo = createLazyComponent(
  () => import('@/components/organisms/Form/Resident/SectoralInformation').then(module => ({
    default: module.SectoralClassifications
  })),
  {
    ...LazyLoadingPresets.form,
    displayName: 'SectoralInfo',
  }
);

// RBI-specific components (heavy and used only in specific flows)
export const LazyPhysicalCharacteristics = createLazyComponent(
  () => import('@/components/organisms/RbiSpecific/PhysicalCharacteristics'),
  {
    ...LazyLoadingPresets.form,
    displayName: 'PhysicalCharacteristics',
  }
);

export const LazyMigrantInformation = createLazyComponent(
  () => import('@/components/organisms/RbiSpecific/MigrantInformation'),
  {
    ...LazyLoadingPresets.form,
    displayName: 'MigrantInformation',
  }
);

export const LazyFamilyRelationshipSelector = createLazyComponent(
  () => import('@/components/organisms/RbiSpecific/FamilyRelationshipSelector'),
  {
    ...LazyLoadingPresets.form,
    displayName: 'FamilyRelationshipSelector',
  }
);

// Address and geographic components (can be heavy with map libraries)

// Advanced search and filtering components

// Components that use heavy third-party libraries
export const LazyPSOCSelector = createLazyComponent(
  () => import('@/components/organisms/PSOCSelector'),
  {
    ...LazyLoadingPresets.form,
    displayName: 'PSOCSelector',
  }
);

/**
 * Preload critical lazy components for better UX
 * Call these functions when you know the user will likely need these components soon
 */
export const preloadComponents = {
  // Preload form components when user navigates to create/edit pages
  forms: () => {
    import('@/components/templates/ResidentFormWizard');
    import('@/components/templates/HouseholdFormWizard');
  },

  // Preload chart components when user navigates to dashboard/reports
  charts: () => {
    import('@/components/molecules/CivilStatusPieChart');
    import('@/components/molecules/EmploymentStatusPieChart');
    import('@/components/molecules/SexDistributionPieChart');
    import('@/components/organisms/PopulationPyramid');
  },

  // Preload data components when user navigates to listing pages
  data: () => {
    import('@/components/organisms/DataTable');
  },

  // Preload modal components on user interaction hints
  modals: () => {
    import('@/components/organisms/CreateHouseholdModal');
  },
};

/**
 * Usage recommendations:
 *
 * 1. Import lazy components instead of regular ones:
 *    import { LazyDataTable } from '@/components/lazy-index';
 *
 * 2. Preload components when user shows intent:
 *    <Link href="/residents/create" onMouseEnter={() => preloadComponents.forms()}>
 *
 * 3. Use intersection observer for below-the-fold components:
 *    const shouldLoad = useLazyLoadOnIntersection(ref, () => import('./HeavyComponent'));
 */
