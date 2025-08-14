'use client';

import React from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string[];
}

export function ErrorModal({ isOpen, onClose, title, message, details }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="mb-4 text-gray-700">{message}</p>

          {details && details.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-gray-900">Details:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-red-500">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end rounded-b-lg bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
