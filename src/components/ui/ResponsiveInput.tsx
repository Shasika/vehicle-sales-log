'use client';

import { forwardRef } from 'react';

interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const ResponsiveInput = forwardRef<HTMLInputElement, ResponsiveInputProps>(
  ({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconClick,
    className = '',
    icon,
    iconPosition = 'left',
    ...props
  }, ref) => {
    // Handle the icon prop - convert it to leftIcon or rightIcon based on iconPosition
    const finalLeftIcon = iconPosition === 'left' ? (icon || leftIcon) : leftIcon;
    const finalRightIcon = iconPosition === 'right' ? (icon || rightIcon) : rightIcon;
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {finalLeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <span className="text-gray-400 flex-shrink-0 w-4 h-4">
                {finalLeftIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            className={`
              responsive-input-with-icon
              block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm
              ring-1 ring-inset ring-gray-300
              placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base
              focus:ring-2 focus:ring-inset focus:ring-blue-600
              disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200
              text-base leading-6
              transition-all duration-200
              ${finalLeftIcon ? 'pl-11' : 'pl-3'}
              ${finalRightIcon ? 'pr-11' : 'pr-3'}
              ${error ? 'ring-red-300 focus:ring-red-600' : ''}
              ${className}
            `}
            {...props}
          />

          {finalRightIcon && (
            <div
              className={`absolute inset-y-0 right-0 pr-3 flex items-center z-10 ${
                onRightIconClick ? 'cursor-pointer hover:text-gray-600 transition-colors' : 'pointer-events-none'
              }`}
              onClick={onRightIconClick}
            >
              <span className="text-gray-400 flex-shrink-0 w-4 h-4">
                {finalRightIcon}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';

export default ResponsiveInput;