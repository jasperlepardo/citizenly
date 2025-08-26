'use client';

/**
 * AccessibleModal Component
 * Fully accessible modal with focus trap and keyboard navigation
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib';
import { useFocusTrap, announceToScreenReader } from '@/lib/ui/accessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

export default function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnEscape = true,
  closeOnBackdropClick = true,
  className,
  showCloseButton = true,
  footer,
}: AccessibleModalProps) {
  const focusTrapRef = useFocusTrap(isOpen);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Announce modal opening to screen readers
  useEffect(() => {
    if (isOpen) {
      announceToScreenReader(`${title} dialog opened`, 'assertive');
    }
  }, [isOpen, title]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const modalContent = (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={focusTrapRef}
        className={cn(
          'relative w-full rounded-lg bg-white shadow-xl dark:bg-gray-800',
          'transform transition-all duration-200',
          'animate-in fade-in-0 zoom-in-95',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white dark:text-black">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-4 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:text-gray-800"
              aria-label="Close dialog"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Portal to render modal at root level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

// Export for use in forms
export { AccessibleModal };
