/**
 * Lazy Components Index - Atomic Design Organization
 * 
 * @description Centralized exports for all lazy-loaded components following atomic design.
 * Components are organized by their atomic level and lazy-loaded for performance.
 * 
 * @performance Reduces initial bundle size:
 * - DataTable: ~45KB
 * - Chart components: ~120KB  
 * - Forms with complex validation: ~35KB
 * - Modal dialogs: ~25KB
 */

// Atoms - Loading components
export { 
  LoadingFallback, 
  FormSkeleton, 
  TableSkeleton 
} from './atoms/Loading';

// Molecules - Lazy modals
export { LazyErrorModal as ErrorModal } from './molecules/ErrorModal/ErrorModal.lazy';
export { LazySuccessModal as SuccessModal } from './molecules/SuccessModal/SuccessModal.lazy';

// Organisms - Lazy complex components
export { LazyCreateHouseholdModal as CreateHouseholdModal } from './organisms/CreateHouseholdModal/CreateHouseholdModal.lazy';
export { LazyDataTable as DataTable } from './organisms/DataTable/DataTable.lazy';
export { LazyPopulationPyramid as PopulationPyramid } from './organisms/PopulationPyramid/PopulationPyramid.lazy';
export { LazyUserProfile as UserProfile } from './organisms/UserProfile/UserProfile.lazy';
export { LazyPersonalInformation as PersonalInformation } from './organisms/Form/Resident/PersonalInformation/PersonalInformation.lazy';
export { LazySectoralInfo as SectoralInfo } from './organisms/Form/Resident/SectoralInformation/SectoralInformation.lazy';

// Utilities - Re-export from lib
export { withLazyLoading, preloadComponents } from '@/lib';
export type { PreloadComponentKey } from '@/lib';

/**
 * Atomic Design Organization Benefits:
 * 
 * 1. **Clear Separation**: Components are organized by complexity level
 * 2. **Predictable Imports**: Easy to find lazy components at their atomic level
 * 3. **Proper Architecture**: Loading atoms, lazy molecules/organisms
 * 4. **Maintainable**: Each component has its own lazy file
 * 5. **Consistent**: Follows the same pattern across all lazy components
 * 
 * Usage:
 * ```tsx
 * import { DataTable } from '@/components/lazy-index';
 * import { FormSkeleton } from '@/components/lazy-index';
 * ```
 */