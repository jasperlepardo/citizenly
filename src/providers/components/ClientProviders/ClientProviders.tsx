'use client';

import { AuthProvider } from '@/contexts';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
