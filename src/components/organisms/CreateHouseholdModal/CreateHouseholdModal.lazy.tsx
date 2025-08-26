/**
 * Lazy-loaded Create Household Modal
 *
 * @description Lazy version of CreateHouseholdModal for code splitting
 */

import { lazy } from 'react';

import { FormSkeleton } from '@/components/atoms/Loading';
import { withLazyLoading } from '@/lib';

const CreateHouseholdModalLazy = lazy(() => import('./CreateHouseholdModal'));

export const LazyCreateHouseholdModal = withLazyLoading(CreateHouseholdModalLazy, <FormSkeleton />);
export default LazyCreateHouseholdModal;
