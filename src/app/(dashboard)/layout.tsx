'use client';

import { DashboardLayout } from '@/components/templates';
import { ProtectedRoute } from '@/components/organisms';
import { useState } from 'react';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <ProtectedRoute>
      <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}