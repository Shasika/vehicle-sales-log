'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MobileAwareSelectProps {
  label?: string;
  error?: string;
  required?: boolean;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default function MobileAwareSelect({
  label,
  error,
  required,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}: MobileAwareSelectProps) {
  const isMobile = useIsMobile();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  // Always use native select - it works perfectly on mobile!
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 pr-10 text-sm
            border border-gray-300 rounded-md shadow-sm
            bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${isMobile ? 'text-base' : 'text-sm'} // Prevent zoom on iOS
          `}
          style={{
            fontSize: isMobile ? '16px' : '14px' // Prevent iOS zoom
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow - hidden on mobile since native arrow works better */}
        <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${isMobile ? 'hidden' : 'block'}`}>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}