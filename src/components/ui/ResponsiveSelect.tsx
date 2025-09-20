'use client';

import React, { Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface ResponsiveSelectProps {
  options: SelectOption[];
  selected: SelectOption | undefined;
  onChange: (option: SelectOption) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function ResponsiveSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className = '',
}: ResponsiveSelectProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Create a special "no selection" option to maintain controlled state
  const noSelectionOption = { value: '', label: '' };
  const listboxValue = selected || noSelectionOption;

  // Handle onChange to prevent passing the empty option to parent
  const handleChange = (option: SelectOption) => {
    if (option.value === '') {
      // Don't call onChange for the empty option
      return;
    }
    onChange(option);
  };

  // Calculate optimal dropdown position based on available space
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return { position: 'bottom', maxHeight: '300px' };

    const buttonRect = buttonRef.current.getBoundingClientRect();

    // Account for navigation bars
    const topNavHeight = 64; // Top nav height (h-14 sm:h-16)
    const bottomNavHeight = window.innerWidth < 640 ? 64 : 0; // Bottom nav only on mobile

    // Calculate available space between navigations
    const availableTop = buttonRect.top - topNavHeight;
    const availableBottom = window.innerHeight - buttonRect.bottom - bottomNavHeight;

    // Estimate dropdown height based on number of options
    const optionHeight = 40;
    const padding = 16;
    const estimatedDropdownHeight = Math.min(options.length * optionHeight + padding, 300);

    // Choose position based on available space
    if (availableBottom < estimatedDropdownHeight && availableTop > availableBottom) {
      return {
        position: 'top' as const,
        maxHeight: `${Math.min(availableTop - 10, 300)}px`
      };
    } else {
      return {
        position: 'bottom' as const,
        maxHeight: `${Math.min(availableBottom - 10, 300)}px`
      };
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <Listbox value={listboxValue} onChange={handleChange} disabled={disabled}>
        {({ open }) => {
          const { position: dropdownPosition, maxHeight } = open ? calculateDropdownPosition() : { position: 'bottom', maxHeight: '300px' };

          return (
            <div className="relative">
              <Listbox.Button
                ref={buttonRef}
                className={`
                  relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10
                  text-left shadow-sm ring-1 ring-inset ring-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                  text-sm sm:text-base text-gray-900
                  ${error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300'}
                `}
              >
                <span className={`block truncate ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selected ? selected.label : placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  className={`
                    absolute z-[9999] w-full overflow-auto rounded-md bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm
                    ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
                  `}
                  style={{ maxHeight: maxHeight }}
                >
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active, selected: isSelected }) => {
                        if (option.disabled) {
                          return 'relative cursor-not-allowed select-none py-2 pl-6 pr-4 opacity-50 text-gray-400 bg-gray-50';
                        }

                        const isCurrentlySelected = selected && selected.value === option.value;

                        if (isCurrentlySelected) {
                          return `relative cursor-pointer select-none py-2 pl-6 pr-4 bg-blue-600 text-white font-medium`;
                        }

                        return `relative cursor-pointer select-none py-2 pl-6 pr-4 ${
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }`;
                      }}
                      value={option}
                      disabled={option.disabled}
                    >
                      {() => {
                        const isCurrentlySelected = selected && selected.value === option.value;
                        return (
                          <>
                            <span
                              className={`block truncate ${
                                isCurrentlySelected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {option.label}
                            </span>
                            {isCurrentlySelected ? (
                              <span className={`absolute inset-y-0 left-0 flex items-center pl-1.5 ${
                                isCurrentlySelected ? 'text-white' : 'text-blue-600'
                              }`}>
                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        );
                      }}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          );
        }}
      </Listbox>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}