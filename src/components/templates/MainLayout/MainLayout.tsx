/**
 * Main Layout Component
 * Wrapper layout with header and main content area
 */

import React from 'react';

import { Header } from '../Header';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
