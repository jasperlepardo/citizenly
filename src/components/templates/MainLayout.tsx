/**
 * Main Layout Component
 * Wrapper layout with header and main content area
 */

import React from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
