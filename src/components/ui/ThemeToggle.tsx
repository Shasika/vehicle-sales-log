'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ThemeToggle({ variant = 'button', size = 'md', className = '' }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
      }}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        transition-all duration-200 ease-in-out
        ${className}
      `}
      title={`Current: ${theme} (${actualTheme}). Click to cycle themes.`}
    >
      {theme === 'light' && <Sun className={iconSizeClasses[size]} />}
      {theme === 'dark' && <Moon className={iconSizeClasses[size]} />}
      {theme === 'system' && <Monitor className={iconSizeClasses[size]} />}
    </button>
  );
}

// Simple toggle between light and dark only
export function SimpleThemeToggle({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const { actualTheme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={() => setTheme(actualTheme === 'light' ? 'dark' : 'light')}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        transition-all duration-200 ease-in-out
        ${className}
      `}
      title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {actualTheme === 'light' ? (
        <Moon className={iconSizeClasses[size]} />
      ) : (
        <Sun className={iconSizeClasses[size]} />
      )}
    </button>
  );
}