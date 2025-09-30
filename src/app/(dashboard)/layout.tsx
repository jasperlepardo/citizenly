'use client';

import ProtectedRoute from '@/components/organisms/ProtectedRoute/ProtectedRoute';
import DashboardLayout from '@/components/templates/DashboardLayout/DashboardLayout';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
