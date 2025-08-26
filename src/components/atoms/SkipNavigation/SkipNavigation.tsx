'use client';

/**
 * SkipNavigation Component
 * Allows keyboard users to skip to main content
 */

import React from 'react';

interface SkipNavigationProps {
  skipTo?: string;
  children?: React.ReactNode;
}

export default function SkipNavigation({
  skipTo = '#main-content',
  children = 'Skip to main content',
}: SkipNavigationProps) {
  return (
    <a
      href={skipTo}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden dark:text-black"
    >
      {children}
    </a>
  );
}

// Multiple skip links for complex layouts
interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

export function SkipLinks({
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
  ],
}: SkipLinksProps) {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50">
      <nav aria-label="Skip links">
        <ul className="focus-within:flex focus-within:flex-col focus-within:gap-2">
          {links.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus:inline-block focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden dark:text-black"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export { SkipNavigation };
