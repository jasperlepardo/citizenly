/**
 * React Query Provider
 * 
 * Provides data caching and synchronization for the entire app with persistent storage
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 30 minutes - longer stale time
            staleTime: 30 * 60 * 1000,
            // Keep in cache for 1 hour - much longer
            gcTime: 60 * 60 * 1000,
            // Retry failed requests 1 time
            retry: 1,
            // Don't refetch automatically to preserve cached data
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            // Use cache-first strategy
            networkMode: 'always',
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  // Create persister for localStorage (only on client side)
  const [persister] = useState(() => {
    if (typeof window !== 'undefined') {
      return createSyncStoragePersister({
        storage: window.localStorage,
        key: 'citizenly-query-cache',
        // Persist for longer time
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      });
    }
    return undefined;
  });

  // If we have a persister, use PersistQueryClientProvider, otherwise use regular provider
  if (persister) {
    return (
      <PersistQueryClientProvider 
        client={queryClient} 
        persistOptions={{ 
          persister,
          // Persist immediately and restore immediately
          maxAge: 60 * 60 * 1000, // 1 hour
          buster: '',
        }}
      >
        {children}
        {/* Only show devtools in development */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}