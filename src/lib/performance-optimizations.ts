/**
 * Performance Optimization Utilities
 * Enhanced performance helpers for React components and data operations
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { logInfo } from '@/lib/client-logger';

/**
 * Enhanced debounce hook with cleanup
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const debounceRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
    };
  }, []);

  return debouncedCallback;
}

/**
 * Memoized search filter for large datasets
 */
export function useSearchFilter<T extends Record<string, unknown>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  return useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowercaseSearch = searchTerm.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && 
               typeof value === 'string' && 
               value.toLowerCase().includes(lowercaseSearch);
      })
    );
  }, [data, searchTerm, searchFields]);
}

/**
 * Memoized pagination for large datasets
 */
export function usePagination<T>(
  data: T[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  const totalPages = useMemo(() => 
    Math.ceil(data.length / pageSize), 
    [data.length, pageSize]
  );

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) setCurrentPage(prev => prev + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setCurrentPage(prev => prev - 1);
  }, [hasPrevPage]);

  return {
    currentPage,
    totalPages,
    pageSize,
    data: paginatedData,
    totalItems: data.length,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage
  };
}

/**
 * Virtual scrolling hook for very large lists
 */
export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(itemCount - 1, endIndex + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleRange,
    totalHeight,
    offsetY,
    setScrollTop
  };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - (renderStartTime.current || endTime);
    
    if (renderTime > 16) { // > 16ms is concerning for 60fps
      logInfo(`Performance warning: ${componentName} render took ${renderTime.toFixed(2)}ms`, {
        component: componentName,
        action: 'performance_warning',
        data: { renderTime, renderCount: renderCount.current }
      });
    }
  });

  return {
    renderCount: renderCount.current
  };
}

/**
 * Memoized sort function for tables
 */
export function useSortedData<T extends Record<string, unknown>>(
  data: T[],
  sortKey: keyof T | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): T[] {
  return useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? result : -result;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue;
        return sortDirection === 'asc' ? result : -result;
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        const result = aValue.getTime() - bValue.getTime();
        return sortDirection === 'asc' ? result : -result;
      }

      // Fallback to string comparison
      const result = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortKey, sortDirection]);
}

/**
 * Optimized data fetching with caching
 */
export function useOptimizedFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
  cacheKey?: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetch = useCallback(async () => {
    const key = cacheKey || JSON.stringify(deps);
    const cached = cache.current.get(key);
    
    // Return cached data if valid
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      
      // Cache the result
      cache.current.set(key, { data: result, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cacheKey, ...deps]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [node, setNode] = useState<Element | null>(null);

  const observer = useMemo(() => {
    return new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
  }, [options]);

  useEffect(() => {
    if (node) {
      observer.observe(node);
      return () => observer.unobserve(node);
    }
  }, [observer, node]);

  const ref = useCallback((node: Element | null) => {
    setNode(node);
  }, []);

  return [ref, isIntersecting];
}

