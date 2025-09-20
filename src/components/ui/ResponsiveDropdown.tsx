'use client';

import React from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

interface ResponsiveDropdownProps {
  label: string;
  items: DropdownItem[];
  buttonClassName?: string;
  menuClassName?: string;
  position?: 'left' | 'right';
  disabled?: boolean;
}

export default function ResponsiveDropdown({
  label,
  items,
  buttonClassName = '',
  menuClassName = '',
  position = 'right',
  disabled = false,
}: ResponsiveDropdownProps) {
  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => {
        // No scroll intervention needed - dropdown is self-contained and scrollable

        return (
          <>
            <Menu.Button
              disabled={disabled}
              className={`
                inline-flex w-full justify-center items-center gap-x-1.5 rounded-md
                bg-white px-3 py-2 text-sm font-semibold text-gray-900
                shadow-sm ring-1 ring-inset ring-gray-300
                hover:bg-gray-50 focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                ${buttonClassName}
              `}
            >
              {label}
              <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" />
            </Menu.Button>

            <Menu.Items
              className={`
                absolute z-[9999] w-56 rounded-md bg-white shadow-xl
                ring-1 ring-black ring-opacity-5 focus:outline-none
                ${positionClasses[position]}
                top-full mt-2 max-h-[70vh] sm:max-h-60 overflow-auto
                ${menuClassName}
              `}
            >
              <div className="py-1">
                {items.map((item, index) => (
                  <Menu.Item key={item.value || index} disabled={item.disabled}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          if (!item.disabled && item.onClick) {
                            item.onClick();
                          }
                        }}
                        disabled={item.disabled}
                        className={`
                          ${active ? 'bg-gray-100' : ''}
                          ${item.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700'}
                          group flex w-full items-center px-4 py-2 text-sm
                          transition-colors duration-150
                        `}
                      >
                        {item.icon && (
                          <span className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </>
        );
      }}
    </Menu>
  );
}