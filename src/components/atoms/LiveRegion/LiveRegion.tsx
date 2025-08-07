'use client';

/**
 * LiveRegion Component
 * Accessible announcements for screen readers
 */

import React, { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  type?: 'polite' | 'assertive';
  visible?: boolean;
  clearAfter?: number; // milliseconds
}

export default function LiveRegion({
  message,
  type = 'polite',
  visible = false,
  clearAfter = 5000,
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (message && clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className={visible ? 'text-sm text-secondary' : 'sr-only'}
    >
      {currentMessage}
    </div>
  );
}

// Export for use in forms
export { LiveRegion };
