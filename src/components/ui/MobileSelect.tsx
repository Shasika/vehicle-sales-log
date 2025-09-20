'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MobileSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  children?: React.ReactNode;
}

export default function MobileSelect({
  value,
  onChange,
  options = [],
  className = '',
  children
}: MobileSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // For desktop or when options are provided from props, use custom dropdown
  if (isMobile && options.length > 0) {
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all duration-200 shadow-sm text-left appearance-none cursor-pointer"
        >
          {selectedOption?.label || 'Select option'}
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed bg-black bg-opacity-25"
              style={{
                top: '60px',
                left: '0',
                right: '0',
                bottom: '80px',
                zIndex: 1010
              }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown positioned at bottom of modal area */}
            <div
              className="fixed left-4 right-4 bg-white rounded-xl shadow-2xl flex flex-col"
              style={{
                bottom: '90px', // Above mobile navigation + margin
                maxHeight: '50vh',
                minHeight: '200px',
                zIndex: 1011
              }}
            >
              {/* Header - Fixed */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <h3 className="text-lg font-medium text-center">Select Option</h3>
              </div>

              {/* Scrollable Options Container */}
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{
                WebkitOverflowScrolling: 'touch',
                minHeight: '0'
              }}>
                <div className="py-1">
                  {options.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 active:bg-gray-200 transition-colors text-base border-none ${
                        value === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900'
                      } ${index === 0 ? '' : 'border-t border-gray-100'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Bottom padding for better scrolling */}
                <div style={{ height: 'max(20px, env(safe-area-inset-bottom))' }}></div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // For desktop or when using children (native options), use native select
  return (
    <div className={`relative ${className}`}>
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
        style={{
          fontSize: isMobile ? '16px' : '14px' // Prevent zoom on iOS
        }}
      >
        {children || options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}