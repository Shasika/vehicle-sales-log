'use client';

import React from 'react';
import DatePickerComponent from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  label?: string;
  error?: string;
  required?: boolean;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export default function DatePicker({
  label,
  error,
  required,
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
  dateFormat = "dd/MM/yyyy",
  showTimeSelect = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <DatePickerComponent
          selected={value}
          onChange={onChange}
          dateFormat={dateFormat}
          showTimeSelect={showTimeSelect}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          placeholderText={placeholder}
          className={`
            w-full pl-3 pr-10 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400
            disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${error ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          wrapperClassName="w-full"
          popperClassName="react-datepicker-popper"
          popperPlacement="bottom-start"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <style jsx global>{`
        /* Dark mode styles for react-datepicker */
        .dark .react-datepicker {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #f3f4f6 !important;
        }

        .dark .react-datepicker__header {
          background-color: #4b5563 !important;
          border-bottom-color: #6b7280 !important;
        }

        .dark .react-datepicker__current-month {
          color: #f3f4f6 !important;
        }

        .dark .react-datepicker__day-name {
          color: #9ca3af !important;
        }

        .dark .react-datepicker__day {
          color: #f3f4f6 !important;
        }

        .dark .react-datepicker__day:hover {
          background-color: #1e40af !important;
          background-color: rgba(30, 64, 175, 0.2) !important;
        }

        .dark .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        .dark .react-datepicker__day--today {
          background-color: #1d4ed8 !important;
          color: white !important;
        }

        .dark .react-datepicker__day--disabled {
          color: #6b7280 !important;
        }

        .dark .react-datepicker__navigation {
          border-color: #9ca3af !important;
        }

        .dark .react-datepicker__navigation--previous {
          border-right-color: #9ca3af !important;
        }

        .dark .react-datepicker__navigation--next {
          border-left-color: #9ca3af !important;
        }

        .dark .react-datepicker__time-container {
          border-left-color: #4b5563 !important;
        }

        .dark .react-datepicker__time-container .react-datepicker__time {
          background-color: #374151 !important;
        }

        .dark .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
          background-color: #374151 !important;
        }

        .dark .react-datepicker__time-list-item {
          color: #f3f4f6 !important;
        }

        .dark .react-datepicker__time-list-item:hover {
          background-color: #4b5563 !important;
        }

        .dark .react-datepicker__time-list-item--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        @media (max-width: 768px) {
          .react-datepicker {
            font-size: 0.875rem !important; /* Override Tailwind reset for mobile */
          }

          .react-datepicker__current-month {
            font-size: 0.875rem !important;
          }

          .react-datepicker__navigation {
            top: -0.3rem !important; /* Move prev/next buttons up */
          }
        }
      `}</style>
    </div>
  );
}

// Time picker variant
export function TimePicker({
  label,
  error,
  required,
  value,
  onChange,
  placeholder = "Select time",
  className = "",
  disabled = false,
}: Omit<DatePickerProps, 'dateFormat' | 'showTimeSelect'>) {
  return (
    <DatePicker
      label={label}
      error={error}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      dateFormat="HH:mm"
      showTimeSelect={true}
    />
  );
}

// DateTime picker variant
export function DateTimePicker({
  label,
  error,
  required,
  value,
  onChange,
  placeholder = "Select date and time",
  className = "",
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  return (
    <DatePicker
      label={label}
      error={error}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      dateFormat="dd/MM/yyyy HH:mm"
      showTimeSelect={true}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}