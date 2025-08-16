'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import QueryProvider from '@/providers/QueryProvider';
import ErrorBoundary from './ErrorBoundary';

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
