import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SmartSelectOption {
  value: string;
  label: string;
}

interface SmartSelectProps {
  label?: string;
  error?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  options: SmartSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SmartSelect({
  label,
  error,
  className = '',
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
}: SmartSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (disabled) return;

    setIsOpen(!isOpen);

    // Smart positioning logic with mobile optimization
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Mobile-specific adjustments
      const isMobile = viewportWidth <= 768;
      const mobileBuffer = isMobile ? 16 : 8; // Extra space on mobile

      // Estimate dropdown height (options * 40px + padding)
      const estimatedDropdownHeight = Math.min(options.length * 40 + 16, isMobile ? 280 : 320);

      // On mobile, prefer bottom positioning unless clearly insufficient space
      if (isMobile) {
        if (spaceBelow < estimatedDropdownHeight + mobileBuffer && spaceAbove > estimatedDropdownHeight + mobileBuffer) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      } else {
        if (spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 text-sm text-left
            border border-gray-300 rounded-md bg-white hover:bg-gray-50
            text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            ${className}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop to close dropdown when clicked outside */}
            <div
              className="fixed inset-0 z-[65]"
              onClick={() => setIsOpen(false)}
            />
            <div className={`
              absolute z-[70] w-full bg-white border border-gray-300 rounded-md shadow-lg
              overflow-y-auto overflow-x-hidden
              ${
                dropdownPosition === 'top'
                  ? 'bottom-full mb-1 max-h-72 md:max-h-80'
                  : 'top-full mt-1 max-h-72 md:max-h-80'
              }
            `}
              style={{
                minWidth: '100%',
                maxHeight: window.innerWidth <= 768 ? '18rem' : '20rem'
              }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors
                    ${value === option.value
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-900'
                    }
                    first:rounded-t-md last:rounded-b-md
                    focus:outline-none focus:bg-gray-100
                    min-h-[40px] flex items-center
                  `}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}