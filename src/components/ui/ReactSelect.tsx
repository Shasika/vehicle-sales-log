'use client';

import React, { useState, useEffect } from 'react';
import Select, { components, Props as SelectProps } from 'react-select';

interface Option {
  value: string;
  label: string;
  isDisabled?: boolean;
}

interface ReactSelectProps extends Omit<SelectProps<Option, false>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  required?: boolean;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Hook to detect mobile
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

// Custom styles with mobile optimization
const getCustomStyles = (isMobile: boolean) => ({
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '42px',
    border: state.hasValue || state.isFocused ? '1px solid #3B82F6' : '1px solid #D1D5DB',
    borderRadius: '0.375rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      border: state.isFocused ? '1px solid #3B82F6' : '1px solid #9CA3AF'
    }
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
    borderRadius: '0.375rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB',
    ...(isMobile && {
      // Force fixed positioning on mobile
      position: 'fixed',
      width: 'calc(100vw - 2rem)',
      maxWidth: '400px',
      left: '1rem',
      right: '1rem',
      maxHeight: '60vh',
      overflowY: 'auto'
    })
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#3B82F6'
      : state.isFocused
        ? '#EFF6FF'
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    padding: isMobile ? '14px 16px' : '12px 16px', // Larger touch targets on mobile
    fontSize: '14px',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3B82F6' : '#EFF6FF',
      color: state.isSelected ? 'white' : '#374151'
    }
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#374151',
    fontSize: '14px'
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9CA3AF',
    fontSize: '14px'
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#374151',
    fontSize: '14px'
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: '6px 12px'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: (provided: any, state: any) => ({
    ...provided,
    color: '#9CA3AF',
    padding: '8px',
    '&:hover': {
      color: '#6B7280'
    },
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s'
  })
});

// Custom dropdown indicator
const CustomDropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </components.DropdownIndicator>
  );
};

// Custom menu component for mobile optimization
const CustomMenu = (props: any) => {
  return <components.Menu {...props} />;
};

export default function ReactSelect({
  label,
  error,
  required,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  ...props
}: ReactSelectProps) {
  const isMobile = useIsMobile();
  const selectedOption = options.find(option => option.value === value) || null;

  const handleChange = (selectedOption: Option | null) => {
    onChange(selectedOption?.value || '');
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        {...props}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        styles={getCustomStyles(isMobile)}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
          Menu: CustomMenu,
        }}
        // Mobile-specific props
        menuPortalTarget={isMobile && typeof document !== 'undefined' ? document.body : undefined}
        menuPosition={isMobile ? 'fixed' : 'absolute'}
        menuShouldBlockScroll={isMobile}
        isSearchable={false}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Mobile-specific styles */}
      {isMobile && (
        <style jsx global>{`
          .react-select__menu {
            position: fixed !important;
            width: calc(100vw - 2rem) !important;
            max-width: 400px !important;
            left: 1rem !important;
            right: 1rem !important;
            z-index: 9999 !important;
          }

          .react-select__menu-portal {
            z-index: 9999 !important;
          }

          .react-select__option {
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            padding: 14px 16px !important;
          }
        `}</style>
      )}
    </div>
  );
}

// Searchable version for large option lists
export function ReactSelectSearchable({
  label,
  error,
  required,
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  className = "",
  ...props
}: ReactSelectProps) {
  const isMobile = useIsMobile();
  const selectedOption = options.find(option => option.value === value) || null;

  const handleChange = (selectedOption: Option | null) => {
    onChange(selectedOption?.value || '');
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        {...props}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        styles={getCustomStyles(isMobile)}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
          Menu: CustomMenu,
        }}
        menuPortalTarget={isMobile && typeof document !== 'undefined' ? document.body : undefined}
        menuPosition={isMobile ? 'fixed' : 'absolute'}
        menuShouldBlockScroll={isMobile}
        isSearchable={true}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Mobile-specific styles */}
      {isMobile && (
        <style jsx global>{`
          .react-select__menu {
            position: fixed !important;
            width: calc(100vw - 2rem) !important;
            max-width: 400px !important;
            left: 1rem !important;
            right: 1rem !important;
            z-index: 9999 !important;
          }

          .react-select__menu-portal {
            z-index: 9999 !important;
          }

          .react-select__option {
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            padding: 14px 16px !important;
          }
        `}</style>
      )}
    </div>
  );
}