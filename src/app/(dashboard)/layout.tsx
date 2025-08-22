'use client';

import { DashboardLayout } from '@/components/templates';
import { ProtectedRoute } from '@/components/organisms';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}