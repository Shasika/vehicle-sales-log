'use client';

import DatePickerComponent from './DatePicker';

interface ResponsiveDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export default function ResponsiveDatePicker({
  selected,
  onChange,
  placeholderText = 'Select date',
  dateFormat = 'dd/MM/yyyy',
  showTimeSelect = false,
  timeFormat = 'HH:mm',
  minDate,
  maxDate,
  disabled = false,
  className = '',
  label,
  error,
}: ResponsiveDatePickerProps) {
  return (
    <DatePickerComponent
      value={selected}
      onChange={onChange}
      placeholder={placeholderText}
      dateFormat={dateFormat}
      showTimeSelect={showTimeSelect}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      className={className}
      label={label}
      error={error}
    />
  );
}