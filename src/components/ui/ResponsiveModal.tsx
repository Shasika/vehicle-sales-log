'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl';
  showCloseButton?: boolean;
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
}: ResponsiveModalProps) {

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-7xl',
  };

  // No body scroll lock - let's see if this fixes the issue

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative h-full flex items-end sm:items-center sm:justify-center">
        <div
          className={`
            relative bg-white dark:bg-gray-800 shadow-xl flex flex-col
            sm:${sizeClasses[size]} sm:mx-4 sm:rounded-2xl
            rounded-t-2xl
          `}
          style={{
            width: '100vw',
            maxWidth: '100vw'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-t-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {showCloseButton && (
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
          </div>

          {/* Scrollable Content - Mobile friendly */}
          <div
            className={`p-4 sm:p-6 bg-white dark:bg-gray-800 overflow-y-scroll custom-scrollbar ${footer ? '' : 'rounded-b-2xl sm:rounded-b-2xl'}`}
            style={{
              height: footer ? 'calc(100vh - 180px)' : 'calc(100vh - 120px)', // Adjust for footer space
              maxHeight: footer ? '60vh' : '70vh', // Limit on desktop
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {children}
          </div>

          {/* Footer - Fixed */}
          {footer && (
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl sm:rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}