'use client';

import React, { useState, useEffect } from 'react';

import { cn } from '@/utils/shared/cssUtils';

import packageJson from '../../../../package.json';

export interface VersionTagProps {
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  showEnvironment?: boolean;
  showVersion?: boolean;
}

export const VersionTag: React.FC<VersionTagProps> = ({
  className,
  position = 'bottom-right',
  showEnvironment = true,
  showVersion = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [environment, setEnvironment] = useState('development');
  const [version, setVersion] = useState('0.2.0');

  useEffect(() => {
    setMounted(true);

    // Get version from package.json directly or fallback to environment
    setVersion(packageJson.version || process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0');

    // Determine environment
    if (process.env.NEXT_PUBLIC_APP_ENV) {
      setEnvironment(process.env.NEXT_PUBLIC_APP_ENV);
    } else if (process.env.NODE_ENV === 'production') {
      setEnvironment('production');
    } else if (process.env.NODE_ENV === 'development') {
      setEnvironment('development');
    } else {
      setEnvironment('unknown');
    }
  }, []);

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) return null;

  // Environment-specific styling
  const getEnvironmentStyles = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'development':
        return 'bg-blue-100 text-gray-800 border-blue-200 dark:bg-blue-900 dark:text-gray-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const positionStyles = {
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'top-right': 'fixed top-4 right-4',
  };

  // Don't show in production unless explicitly enabled
  if (environment === 'production' && !process.env.NEXT_PUBLIC_SHOW_VERSION_TAG) {
    return null;
  }

  return (
    <div
      className={cn(
        'z-50 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-xs',
        positionStyles[position],
        getEnvironmentStyles(environment),
        className
      )}
    >
      {showEnvironment && <span className="capitalize">{environment}</span>}

      {showEnvironment && showVersion && <span className="opacity-60">|</span>}

      {showVersion && <span>v{version}</span>}
    </div>
  );
};

export default VersionTag;
