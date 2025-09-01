/**
 * Lazy-loaded User Profile
 *
 * @description Lazy version of UserProfile for code splitting
 */

import { lazy } from 'react';

import { FormSkeleton } from '@/components/atoms/Loading';
// REMOVED: @/lib barrel import - replace with specific module;

const UserProfileLazy = lazy(() => import('./UserProfile'));

export const LazyUserProfile = withLazyLoading(UserProfileLazy, <FormSkeleton />);
export default LazyUserProfile;
