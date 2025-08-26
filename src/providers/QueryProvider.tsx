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
import { useState, useEffect } from 'react';

// Custom hook to handle client-side mounting
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();
  
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

  // Create persister for localStorage (only on client side after hydration)
  const [persister] = useState(() => {
    // Always return undefined on server/initial render to avoid hydration mismatch
    return undefined;
  });
  
  // Create client-side persister after hydration
  const [clientPersister, setClientPersister] = useState<ReturnType<typeof createSyncStoragePersister> | undefined>(undefined);
  
  useEffect(() => {
    if (isClient && !clientPersister) {
      setClientPersister(createSyncStoragePersister({
        storage: window.localStorage,
        key: 'citizenly-query-cache',
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      }));
    }
  }, [isClient, clientPersister]);

  // If we have a client-side persister, use PersistQueryClientProvider, otherwise use regular provider
  if (isClient && clientPersister) {
    return (
      <PersistQueryClientProvider 
        client={queryClient} 
        persistOptions={{ 
          persister: clientPersister,
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