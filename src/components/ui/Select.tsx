import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Hook to detect if we're inside a modal
const useInModal = () => {
  const [inModal, setInModal] = useState(false);

  useEffect(() => {
    // Check if any parent has modal-related z-index
    const element = document.activeElement;
    if (element) {
      let parent = element.closest('[class*="z-["]');
      if (parent && parent.className.includes('z-[60]')) {
        setInModal(true);
      }
    }
  }, []);

  return inModal;
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children?: React.ReactNode;
  options?: SelectOption[];
  smartDropdown?: boolean; // Flag to enable smart dropdown behavior
  placeholder?: string; // Add placeholder for smart dropdown
}

export default function Select({
  label,
  error,
  className = '',
  children,
  options,
  smartDropdown = false,
  ...props
}: SelectProps) {
  // Always initialize hooks - React hooks must be called unconditionally
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [useMobileSheet, setUseMobileSheet] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inModal = useInModal();

  // Extract options from children or use provided options (always do this for consistency)
  const selectOptions = options || (children ?
    React.Children.toArray(children)
      .filter((child): child is React.ReactElement => React.isValidElement(child))
      .map((child) => ({
        value: child.props.value || '',
        label: child.props.children || ''
      })) : []
  );

  const selectedOption = selectOptions.find(option => option.value === props.value);

  // Check if we should use mobile sheet (small screen + inside modal)
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 640; // sm breakpoint
      setUseMobileSheet(isMobile && (inModal || smartDropdown));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [inModal, smartDropdown]);

  // Always set up useEffect hooks - they'll just be unused if not in smart dropdown mode
  useEffect(() => {
    if (!smartDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [smartDropdown]);

  // Default to native select behavior for backward compatibility
  if (!smartDropdown) {
    const selectClass = `w-full pl-3 pr-3 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm cursor-pointer ${
      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
    } ${className}`;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            className={selectClass}
            {...props}
          >
            {children}
          </select>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Smart dropdown behavior when explicitly enabled

  const handleToggle = () => {
    if (props.disabled) return;

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
      const estimatedDropdownHeight = Math.min(selectOptions.length * 40 + 16, isMobile ? 280 : 320);

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
    if (props.onChange) {
      // Create synthetic event for backward compatibility
      const syntheticEvent = {
        target: { value: optionValue },
        currentTarget: { value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      props.onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 smart-dropdown-container">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative smart-dropdown-container" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={props.disabled}
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
            {selectedOption ? selectedOption.label : (props.placeholder || 'Select an option')}
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
              className={useMobileSheet ? "fixed inset-0 z-[110] bg-black/25" : "fixed inset-0 z-[65]"}
              onClick={() => setIsOpen(false)}
            />
{useMobileSheet ? (
              /* Mobile Bottom Sheet */
              <div className="fixed bottom-0 left-0 right-0 z-[120] bg-white rounded-t-xl shadow-2xl max-h-[70vh] flex flex-col">
                {/* Sheet Handle */}
                <div className="p-4 border-b border-gray-200">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
                  <h3 className="text-lg font-medium text-center text-gray-900">
                    {label || 'Select Option'}
                  </h3>
                </div>

                {/* Options */}
                <div className="flex-1 overflow-y-auto py-2">
                  {selectOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full px-6 py-4 text-left text-base transition-colors
                        ${props.value === option.value
                          ? 'bg-blue-50 text-blue-600 font-medium border-r-4 border-blue-600'
                          : 'text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Desktop Dropdown */
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
                {selectOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors
                      ${props.value === option.value
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-900'
                      }
                      first:rounded-t-md last:rounded-b-md
                      focus:outline-none focus:bg-gray-100
                      min-h-[40px] flex items-center
                    `}
                    role="option"
                    aria-selected={props.value === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}