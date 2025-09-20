import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ 
  variant = 'secondary', 
  className = '', 
  children 
}: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
  };

  const badgeClass = `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`;

  return (
    <span className={badgeClass}>
      {children}
    </span>
  );
}