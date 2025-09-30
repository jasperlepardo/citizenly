'use client';

import DashboardLayout from '@/components/templates/DashboardLayout/DashboardLayout';
import ProtectedRoute from '@/components/organisms/ProtectedRoute/ProtectedRoute';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
