/**
 * Lazy-loaded User Profile
 * 
 * @description Lazy version of UserProfile for code splitting
 */

import { lazy } from 'react';
import { withLazyLoading } from '@/lib/ui/lazy-loading';
import { FormSkeleton } from '@/components/atoms/Loading';

const UserProfileLazy = lazy(() =>
  import('./UserProfile')
);

export const LazyUserProfile = withLazyLoading(UserProfileLazy, <FormSkeleton />);
export default LazyUserProfile;