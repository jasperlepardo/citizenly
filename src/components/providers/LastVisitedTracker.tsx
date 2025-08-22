'use client';

import { useLastVisitedPage } from '@/hooks/utilities';

/**
 * Component that automatically tracks the last visited page
 * Should be included in the app layout to track navigation
 */
export default function LastVisitedTracker() {
  // This hook automatically tracks the current page
  useLastVisitedPage();
  
  // This component doesn't render anything
  return null;
}