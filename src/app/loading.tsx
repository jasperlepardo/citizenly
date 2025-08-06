import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>

        {/* Loading text */}
        <p className="text-secondary font-medium">Loading...</p>

        {/* App name */}
        <p className="text-sm text-muted">RBI System</p>
      </div>
    </div>
  );
}
