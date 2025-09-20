'use client';

import { forwardRef } from 'react';

interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const ResponsiveTextarea = forwardRef<HTMLTextAreaElement, ResponsiveTextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={`
            block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm
            ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
            focus:ring-2 focus:ring-inset focus:ring-blue-600
            disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200
            text-sm sm:text-base sm:leading-6
            resize-none
            ${error ? 'ring-red-300 focus:ring-red-600' : ''}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

ResponsiveTextarea.displayName = 'ResponsiveTextarea';

export default ResponsiveTextarea;