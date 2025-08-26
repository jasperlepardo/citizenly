'use client';

import React, { ReactNode } from 'react';

import { AppProvider } from './AppProvider';
import { ErrorBoundary } from './ErrorBoundary';

interface User {
  id: string;
  email: string;
  role: string;
  barangay_code?: string;
}

interface RootProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

/**
 * Root Provider Component
 *
 * Wraps the entire application with all necessary providers
 * in the correct order with proper error boundaries
 */
export function RootProvider({ children, initialUser }: RootProviderProps) {
  return (
    <ErrorBoundary level="page" resetOnPropsChange>
      <AppProvider initialUser={initialUser}>
        <ErrorBoundary level="section">{children}</ErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
}

// Re-export all hooks and utilities
export * from './AppProvider';
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Example usage in app/layout.tsx:
// import { RootProvider } from '@/providers';
//
// export default function RootLayout({ children }) {
//   return (
//     <html>
//       <body>
//         <RootProvider>
//           {children}
//         </RootProvider>
//       </body>
//     </html>
//   );
// }
