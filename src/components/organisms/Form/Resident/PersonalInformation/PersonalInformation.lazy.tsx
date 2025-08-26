/**
 * Lazy-loaded Personal Information Form
 * 
 * @description Lazy version of PersonalInformation for code splitting
 */

import { lazy } from 'react';

import { FormSkeleton } from '@/components/atoms/Loading';
import { withLazyLoading } from '@/lib';

const PersonalInformationLazy = lazy(() =>
  import('./PersonalInformation').then(module => ({
    default: module.PersonalInformationForm,
  }))
);

export const LazyPersonalInformation = withLazyLoading(PersonalInformationLazy, <FormSkeleton />);
export default LazyPersonalInformation;