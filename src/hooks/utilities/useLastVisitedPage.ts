'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LAST_VISITED_KEY = 'citizenly-last-visited-page';

// Routes that should not be saved as "last visited"
const EXCLUDED_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/logout',
  '/loading',
  '/error',
  '/offline'
];

export function useLastVisitedPage() {
  const pathname = usePathname();

  // Save current page as last visited (if it's a valid dashboard page)
  useEffect(() => {
    if (pathname && !EXCLUDED_ROUTES.includes(pathname)) {
      // Only save dashboard routes and other authenticated pages
      if (pathname.startsWith('/dashboard') || 
          pathname.startsWith('/residents') || 
          pathname.startsWith('/households') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/settings') ||
          pathname.startsWith('/admin') ||
          pathname.startsWith('/certification') ||
          pathname.startsWith('/business') ||
          pathname.startsWith('/judiciary')) {
        localStorage.setItem(LAST_VISITED_KEY, pathname);
      }
    }
  }, [pathname]);

  // Get last visited page
  const getLastVisitedPage = (): string => {
    if (typeof window === 'undefined') return '/dashboard';
    
    const lastVisited = localStorage.getItem(LAST_VISITED_KEY);
    return lastVisited && !EXCLUDED_ROUTES.includes(lastVisited) 
      ? lastVisited 
      : '/dashboard';
  };

  // Clear last visited page
  const clearLastVisitedPage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LAST_VISITED_KEY);
    }
  };

  return {
    getLastVisitedPage,
    clearLastVisitedPage,
    currentPage: pathname
  };
}