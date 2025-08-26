'use client';

import { AuthProvider, ThemeProvider } from '@/contexts';
import { ErrorBoundary } from '@/providers/ErrorBoundary';
import QueryProvider from '@/providers/QueryProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
