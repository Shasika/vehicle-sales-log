'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  value: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface MobileDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  menuClassName?: string;
  placement?: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-left' | 'top-right' | 'top-center';
}

export default function MobileDropdown({
  trigger,
  items,
  className = '',
  menuClassName = '',
  placement = 'bottom-left'
}: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Reset any previous inline styles
        menu.style.removeProperty('right');
        menu.style.removeProperty('left');
        menu.style.removeProperty('top');
        menu.style.removeProperty('bottom');

        // On mobile, ensure dropdown stays within viewport
        if (rect.right > viewport.width - 16) {
          menu.style.right = '1rem';
          menu.style.left = 'auto';
          menu.style.width = 'calc(100vw - 2rem)';
        }
        if (rect.left < 16) {
          menu.style.left = '1rem';
          menu.style.right = 'auto';
          menu.style.width = 'calc(100vw - 2rem)';
        }
        if (rect.bottom > viewport.height - 16) {
          menu.style.top = 'auto';
          menu.style.bottom = '1rem';
          menu.style.maxHeight = '60vh';
        }
      }
    }
  }, [isOpen, placement]);

  const getMenuPositionClasses = () => {
    const baseClasses = 'dropdown-menu';
    const placementClasses = {
      'bottom-left': 'top-full left-0 mt-2',
      'bottom-right': 'top-full right-0 mt-2',
      'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2',
      'top-left': 'bottom-full left-0 mb-2',
      'top-right': 'bottom-full right-0 mb-2',
      'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    };

    const mobileClasses = 'md:absolute md:max-w-none md:max-h-none';

    return `${baseClasses} ${placementClasses[placement]} ${mobileClasses} ${menuClassName}`;
  };

  return (
    <div ref={dropdownRef} className={`dropdown-container ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown menu */}
          <div
            ref={menuRef}
            className={getMenuPositionClasses()}
            role="menu"
            aria-orientation="vertical"
          >
            {items.map((item, index) => (
              <button
                key={item.value || index}
                onClick={() => {
                  if (item.onClick && !item.disabled) {
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg ${item.className || ''}`}
                role="menuitem"
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Simple select-style dropdown
interface MobileSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; disabled?: boolean }[];
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
}

export function MobileSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  label,
  error
}: MobileSelectProps) {
  const selectedOption = options.find(opt => opt.value === value);

  const trigger = (
    <div className={`w-full flex items-center justify-between px-3 py-2.5 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}>
      <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
        {selectedOption?.label || placeholder}
      </span>
      <ChevronDown className="h-4 w-4 text-gray-400" />
    </div>
  );

  const items = options.map(option => ({
    label: option.label,
    value: option.value,
    onClick: () => onChange(option.value),
    disabled: option.disabled,
    className: value === option.value ? 'bg-blue-50 text-blue-700' : ''
  }));

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <MobileDropdown
        trigger={trigger}
        items={items}
        placement="bottom-left"
        className="w-full"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}